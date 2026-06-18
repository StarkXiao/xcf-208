import { useState } from 'react';
import { useGameStore } from '../game/store';
import { ALCHEMY_RECIPES, POTIONS, ALCHEMY_LEVEL_CONFIGS, RARE_MATERIALS, ALCHEMY_RARITY_COLORS, ALCHEMY_RARITY_NAMES, POTION_TYPE_NAMES, POTION_TYPE_ICONS, BUFF_DURATION_NAMES } from '../game/data';
import type { AlchemyTab, AlchemyRecipe, Potion, AlchemyPotionEffect } from '../game/types';

function EffectText({ effect, multiplier = 1 }: { effect: AlchemyPotionEffect; multiplier?: number }) {
  const value = effect.isPercent ? effect.value * multiplier : Math.floor(effect.value * multiplier);
  const sign = value >= 0 ? '+' : '';
  const pct = effect.isPercent ? '%' : '';

  const nameMap: Record<string, string> = {
    hp: '❤️生命', mp: '💙魔力', attack: '⚔️攻击', defense: '🛡️防御',
    speed: '👟速度', luck: '🍀幸运', critRate: '💥暴击率', critDamage: '💥暴击伤害',
    dodge: '💨闪避', expBonus: '⭐经验加成', goldBonus: '💰金币加成',
    soulOrbBonus: '💎魂珠加成', maxHp: '❤️最大生命', maxMp: '💙最大魔力',
    damageReduction: '🔰减伤',
  };

  return <span className={`effect-tag ${value >= 0 ? 'positive' : 'negative'}`}>{sign}{value}{pct} {nameMap[effect.type] || effect.type}</span>;
}

function RecipeCard({ recipe, onCraft }: { recipe: AlchemyRecipe; onCraft: () => void }) {
  const { canCraftPotion, getAlchemySuccessRate, getMaterialCount, player, alchemyLevel } = useGameStore();
  const canCraft = canCraftPotion(recipe.id);
  const successRate = getAlchemySuccessRate(recipe);
  const levelOk = alchemyLevel >= recipe.requiredAlchemyLevel;
  const goldOk = player.stats.gold >= recipe.goldCost;

  const potion = POTIONS.find(p => p.id === recipe.outputPotionId);

  return (
    <div className="alchemy-recipe-card" style={{ borderColor: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>
      <div className="recipe-header">
        <span className="recipe-icon">{potion?.icon || '🧪'}</span>
        <div className="recipe-info">
          <h5 style={{ color: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>{recipe.name}</h5>
          <span className="recipe-category">{recipe.category}</span>
        </div>
        <span className="recipe-rarity" style={{ color: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>
          {ALCHEMY_RARITY_NAMES[recipe.rarity]}
        </span>
      </div>

      <p className="recipe-desc">{recipe.description}</p>

      <div className="recipe-output">
        <span className="recipe-label">产物：</span>
        {potion && <span>{potion.icon} {potion.name} ×{recipe.outputCount}</span>}
      </div>

      <div className="recipe-inputs">
        <span className="recipe-label">材料：</span>
        {recipe.inputs.map((input) => {
          const mat = RARE_MATERIALS.find(m => m.id === input.materialId);
          const owned = getMaterialCount(input.materialId);
          const enough = owned >= input.count;
          return (
            <span key={input.materialId} className={`recipe-material ${enough ? '' : 'insufficient'}`}>
              {mat?.icon || '📦'} {mat?.name || input.materialId} ×{input.count} ({owned})
            </span>
          );
        })}
      </div>

      <div className="recipe-cost">
        <span className={`recipe-gold ${goldOk ? '' : 'insufficient'}`}>💰 {recipe.goldCost}</span>
        {!levelOk && <span className="level-req">需炼金Lv.{recipe.requiredAlchemyLevel}</span>}
        <span className="success-rate">成功率: {(successRate * 100).toFixed(0)}%</span>
      </div>

      <button className={`craft-btn ${canCraft ? '' : 'disabled'}`} onClick={onCraft} disabled={!canCraft}>
        ⚗️ 炼制
      </button>
    </div>
  );
}

function PotionCard({ potionId, count, onUse, onSell, onCombatUse }: {
  potionId: string; count: number;
  onUse: () => void; onSell: () => void; onCombatUse?: () => void;
}) {
  const potion = POTIONS.find(p => p.id === potionId);
  if (!potion) return null;
  const { getAlchemyEffectMultiplier } = useGameStore();
  const multiplier = getAlchemyEffectMultiplier();

  return (
    <div className="alchemy-potion-card" style={{ borderColor: ALCHEMY_RARITY_COLORS[potion.rarity] }}>
      <div className="potion-header">
        <span className="potion-icon">{potion.icon}</span>
        <div className="potion-info">
          <h5 style={{ color: ALCHEMY_RARITY_COLORS[potion.rarity] }}>{potion.name}</h5>
          <span className="potion-meta">
            {POTION_TYPE_ICONS[potion.type]} {POTION_TYPE_NAMES[potion.type]} · {BUFF_DURATION_NAMES[potion.duration]} · ×{count}/{potion.stackLimit}
          </span>
        </div>
        <span className="potion-rarity" style={{ color: ALCHEMY_RARITY_COLORS[potion.rarity] }}>
          {ALCHEMY_RARITY_NAMES[potion.rarity]}
        </span>
      </div>

      <p className="potion-desc">{potion.description}</p>

      <div className="potion-effects">
        {potion.effects.map((effect, idx) => (
          <EffectText key={idx} effect={effect} multiplier={multiplier} />
        ))}
      </div>

      <div className="potion-actions">
        {potion.duration === 'instant' && !potion.combatUsable && (
          <button className="potion-use-btn" onClick={onUse}>使用</button>
        )}
        {potion.duration !== 'instant' && !potion.combatUsable && (
          <button className="potion-use-btn" onClick={onUse}>激活增益</button>
        )}
        {potion.combatUsable && onCombatUse && (
          <button className="potion-combat-btn" onClick={onCombatUse}>战斗使用</button>
        )}
        <button className="potion-sell-btn" onClick={onSell}>出售 (💰{potion.sellPrice})</button>
      </div>
    </div>
  );
}

function BuffCard({ buff }: { buff: { potionId: string; potionName: string; icon: string; effects: AlchemyPotionEffect[]; duration: string; expiresAt: number | null; remainingBattles?: number } }) {
  const { getAlchemyEffectMultiplier } = useGameStore();
  const multiplier = getAlchemyEffectMultiplier();
  const now = Date.now();
  let timeText = '';

  if (buff.duration === 'battle' && buff.remainingBattles !== undefined) {
    timeText = `剩余 ${buff.remainingBattles} 场战斗`;
  } else if (buff.duration === 'timed' && buff.expiresAt !== null) {
    const remaining = Math.max(0, buff.expiresAt - now);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timeText = `剩余 ${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="alchemy-buff-card">
      <div className="buff-header">
        <span className="buff-icon">{buff.icon}</span>
        <span className="buff-name">{buff.potionName}</span>
        <span className="buff-time">{timeText}</span>
      </div>
      <div className="buff-effects">
        {buff.effects.map((effect, idx) => (
          <EffectText key={idx} effect={effect} multiplier={multiplier} />
        ))}
      </div>
    </div>
  );
}

export default function AlchemyWorkshopPanel() {
  const {
    alchemyLevel, alchemyExp, ownedPotions, activeAlchemyBuffs,
    unlockedRecipeIds, alchemyActiveTab, setAlchemyActiveTab,
    getAlchemyLevelConfig, getAlchemyExpToNext,
    craftPotion, usePotion, usePotionInCombat, sellPotion,
    tickAlchemyBuffs, materialInventory, getMaterialCount,
  } = useGameStore();

  const [craftResult, setCraftResult] = useState<{ success: boolean; name: string; count: number } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useState(() => {
    const interval = setInterval(() => tickAlchemyBuffs(), 1000);
    return () => clearInterval(interval);
  });

  const levelConfig = getAlchemyLevelConfig();
  const expToNext = getAlchemyExpToNext();
  const expPercent = expToNext > 0 ? (alchemyExp / expToNext) * 100 : 100;

  const tabs: { id: AlchemyTab; label: string; icon: string }[] = [
    { id: 'cauldron', label: '炼金炉', icon: '⚗️' },
    { id: 'recipes', label: '配方', icon: '📜' },
    { id: 'inventory', label: '材料', icon: '📦' },
    { id: 'potions', label: '药剂', icon: '🧪' },
    { id: 'buffs', label: '增益', icon: '✨' },
  ];

  const availableRecipes = ALCHEMY_RECIPES.filter(r => unlockedRecipeIds.includes(r.id));
  const lockedRecipes = ALCHEMY_RECIPES.filter(r => !unlockedRecipeIds.includes(r.id));

  const categories = ['all', ...new Set(availableRecipes.map(r => r.category))];
  const filteredRecipes = filterCategory === 'all' ? availableRecipes : availableRecipes.filter(r => r.category === filterCategory);

  const handleCraft = (recipeId: string) => {
    const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
    const potion = recipe ? POTIONS.find(p => p.id === recipe.outputPotionId) : null;
    const result = craftPotion(recipeId);
    setCraftResult({
      success: result.success,
      name: potion?.name || '',
      count: result.count,
    });
    setTimeout(() => setCraftResult(null), 3000);
  };

  const renderCauldron = () => (
    <div className="alchemy-cauldron">
      <div className="cauldron-level-card">
        <div className="level-display">
          <span className="level-icon">⚗️</span>
          <div className="level-info">
            <h4>Lv.{alchemyLevel} {levelConfig.title}</h4>
            <div className="exp-bar">
              <div className="exp-fill" style={{ width: `${expPercent}%` }} />
            </div>
            <span className="exp-text">{alchemyExp} / {expToNext} EXP</span>
          </div>
        </div>
        <div className="level-bonuses">
          <span>成功率 +{(levelConfig.successRateBonus * 100).toFixed(0)}%</span>
          <span>效果 ×{levelConfig.bonusEffectMultiplier.toFixed(2)}</span>
          <span>炼制位 {levelConfig.unlockSlotCount}</span>
        </div>
      </div>

      {craftResult && (
        <div className={`craft-result ${craftResult.success ? 'success' : 'fail'}`}>
          {craftResult.success
            ? `✅ 炼制成功！获得 ${craftResult.name} ×${craftResult.count}`
            : '❌ 炼制失败...部分材料已消耗'}
        </div>
      )}

      <div className="quick-craft-list">
        <h4>快速炼制</h4>
        {availableRecipes.length === 0 ? (
          <p className="empty-text">暂无可用配方</p>
        ) : (
          availableRecipes.slice(0, 6).map(recipe => {
            const potion = POTIONS.find(p => p.id === recipe.outputPotionId);
            const canCraft = useGameStore.getState().canCraftPotion(recipe.id);
            return (
              <div key={recipe.id} className="quick-craft-item" style={{ borderColor: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>
                <span className="quick-icon">{potion?.icon || '🧪'}</span>
                <span className="quick-name">{potion?.name || recipe.name}</span>
                <button className={`quick-craft-btn ${canCraft ? '' : 'disabled'}`} onClick={() => handleCraft(recipe.id)} disabled={!canCraft}>
                  ⚗️ 炼制
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderRecipes = () => (
    <div className="alchemy-recipes">
      <div className="recipe-filters">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      <div className="recipe-grid">
        {filteredRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onCraft={() => handleCraft(recipe.id)} />
        ))}
      </div>

      {lockedRecipes.length > 0 && (
        <div className="locked-recipes">
          <h4>🔒 未解锁配方</h4>
          <div className="locked-recipe-list">
            {lockedRecipes.map(recipe => {
              const potion = POTIONS.find(p => p.id === recipe.outputPotionId);
              return (
                <div key={recipe.id} className="locked-recipe-item" style={{ borderColor: '#555' }}>
                  <span>🔒 {potion?.icon || '🧪'} {recipe.name}</span>
                  <span className="level-req">需炼金Lv.{recipe.requiredAlchemyLevel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="alchemy-inventory">
      <h4>📦 材料库存</h4>
      {materialInventory.length === 0 ? (
        <p className="empty-text">暂无材料，通过战斗、委托、交易获取</p>
      ) : (
        <div className="material-grid">
          {materialInventory.map(item => {
            const mat = RARE_MATERIALS.find(m => m.id === item.materialId);
            if (!mat) return null;
            return (
              <div key={item.materialId} className="material-card" style={{ borderColor: ALCHEMY_RARITY_COLORS[mat.rarity] }}>
                <span className="material-icon">{mat.icon}</span>
                <div className="material-info">
                  <span className="material-name" style={{ color: ALCHEMY_RARITY_COLORS[mat.rarity] }}>{mat.name}</span>
                  <span className="material-count">×{item.count}</span>
                </div>
                <span className="material-rarity" style={{ color: ALCHEMY_RARITY_COLORS[mat.rarity] }}>{ALCHEMY_RARITY_NAMES[mat.rarity]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPotions = () => (
    <div className="alchemy-potions">
      <h4>🧪 药剂背包</h4>
      {ownedPotions.length === 0 ? (
        <p className="empty-text">暂无药剂，通过炼制或交易获取</p>
      ) : (
        <div className="potion-grid">
          {ownedPotions.map(op => (
            <PotionCard
              key={op.potionId}
              potionId={op.potionId}
              count={op.count}
              onUse={() => usePotion(op.potionId)}
              onSell={() => sellPotion(op.potionId, 1)}
              onCombatUse={() => usePotionInCombat(op.potionId)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderBuffs = () => (
    <div className="alchemy-buffs">
      <h4>✨ 活跃增益</h4>
      {activeAlchemyBuffs.length === 0 ? (
        <p className="empty-text">暂无活跃增益，使用药剂获得增益效果</p>
      ) : (
        <div className="buff-list">
          {activeAlchemyBuffs.map(buff => (
            <BuffCard key={buff.potionId} buff={buff} />
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (alchemyActiveTab) {
      case 'cauldron': return renderCauldron();
      case 'recipes': return renderRecipes();
      case 'inventory': return renderInventory();
      case 'potions': return renderPotions();
      case 'buffs': return renderBuffs();
      default: return renderCauldron();
    }
  };

  return (
    <div className="alchemy-workshop">
      <div className="alchemy-header">
        <h3>⚗️ 炼金工坊</h3>
        <div className="alchemy-level-badge">
          <span>Lv.{alchemyLevel}</span>
          <span className="level-title">{levelConfig.title}</span>
        </div>
      </div>

      <div className="alchemy-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`alchemy-tab ${alchemyActiveTab === tab.id ? 'active' : ''}`} onClick={() => setAlchemyActiveTab(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="alchemy-content">
        {renderContent()}
      </div>
    </div>
  );
}
