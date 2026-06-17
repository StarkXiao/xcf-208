import { useState } from 'react';
import { useGameStore } from '../game/store';
import { EQUIPMENT_SLOT_CONFIG, EQUIPMENT_RARITY_NAMES, EQUIPMENT_RARITY_COLORS, EQUIPMENT_SLOT_NAMES, FORGE_RECIPES, getEquipmentRarityConfig } from '../game/data';
import type { Equipment, EquipmentRarity } from '../game/types';

const AFFIX_STAT_NAMES: Record<string, string> = {
  attack: '⚔️攻击',
  defense: '🛡️防御',
  hp: '❤️生命',
  mp: '💙魔力',
  speed: '👟速度',
  luck: '🍀幸运',
  critRate: '💥暴击率',
  critDamage: '🔥暴击伤害',
  dodge: '💨闪避',
  goldBonus: '💰金币加成',
  expBonus: '⭐经验加成',
};

export default function EquipmentPanel() {
  const {
    equipmentInventory,
    ownedCompanions,
    companionEquipments,
    player,
    equipItem,
    unequipItem,
    recycleEquipment,
    forgeEquipments,
    canForge,
    getEquippedItems,
    getEquipmentStatBonus,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'equip' | 'forge' | 'recycle'>('inventory');
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [selectedEquipUid, setSelectedEquipUid] = useState<string | null>(null);
  const [forgeRecipeId, setForgeRecipeId] = useState<string>('basic_forge');
  const [forgeInputUids, setForgeInputUids] = useState<string[]>([]);
  const [recycleUids, setRecycleUids] = useState<string[]>([]);

  const unequippedItems = equipmentInventory.filter((e) => !e.equippedBy);
  const selectedCompanion = ownedCompanions.find((c) => c.id === selectedCompanionId);

  const renderStatLine = (stat: string, value: number, isPercent: boolean) => {
    const name = AFFIX_STAT_NAMES[stat] || stat;
    return `${name} +${value}${isPercent ? '%' : ''}`;
  };

  const renderEquipmentCard = (eq: Equipment, showActions = true) => {
    const rarityColor = EQUIPMENT_RARITY_COLORS[eq.rarity];
    const isEquipped = !!eq.equippedBy;
    const companionName = isEquipped ? ownedCompanions.find((c) => c.id === eq.equippedBy)?.name : null;

    return (
      <div
        key={eq.uid}
        className={`eq-card ${selectedEquipUid === eq.uid ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}`}
        style={{ borderColor: rarityColor }}
        onClick={() => setSelectedEquipUid(eq.uid === selectedEquipUid ? null : eq.uid)}
      >
        <div className="eq-card-header">
          <span className="eq-icon">{eq.icon}</span>
          <div className="eq-card-title">
            <span className="eq-name" style={{ color: rarityColor }}>{eq.name}</span>
            <span className="eq-rarity" style={{ color: rarityColor }}>{EQUIPMENT_RARITY_NAMES[eq.rarity]}</span>
          </div>
          <span className="eq-level">Lv.{eq.level}</span>
        </div>
        <div className="eq-card-slot">
          <span className="eq-slot-tag">{EQUIPMENT_SLOT_NAMES[eq.slot]}</span>
          {isEquipped && <span className="eq-equipped-badge">👤 {companionName}</span>}
        </div>
        <div className="eq-card-stats">
          {eq.baseStats.map((s, i) => (
            <span key={i} className="eq-stat-line base">{renderStatLine(s.stat, s.value, s.isPercent)}</span>
          ))}
          {eq.affixes.map((affix, i) => (
            <div key={i} className="eq-affix-group">
              {affix.stats.map((s, j) => (
                <span key={j} className="eq-stat-line affix">{renderStatLine(s.stat, s.value, s.isPercent)}</span>
              ))}
            </div>
          ))}
        </div>
        {showActions && selectedEquipUid === eq.uid && (
          <div className="eq-card-actions">
            {activeSubTab === 'inventory' && !isEquipped && selectedCompanionId && (
              <button
                className="eq-action-btn equip"
                onClick={(e) => { e.stopPropagation(); equipItem(eq.uid, selectedCompanionId); }}
              >
                装备给 {selectedCompanion?.name || '伙伴'}
              </button>
            )}
            {activeSubTab === 'equip' && isEquipped && (
              <button
                className="eq-action-btn unequip"
                onClick={(e) => { e.stopPropagation(); unequipItem(eq.uid); }}
              >
                卸下
              </button>
            )}
            {activeSubTab === 'recycle' && !isEquipped && (
              <button
                className={`eq-action-btn recycle ${recycleUids.includes(eq.uid) ? 'in-list' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setRecycleUids(
                    recycleUids.includes(eq.uid)
                      ? recycleUids.filter((u) => u !== eq.uid)
                      : [...recycleUids, eq.uid]
                  );
                }}
              >
                {recycleUids.includes(eq.uid) ? '✓ 已选' : '选择回收'}
              </button>
            )}
            {activeSubTab === 'forge' && !isEquipped && (
              <button
                className={`eq-action-btn forge-input ${forgeInputUids.includes(eq.uid) ? 'in-list' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setForgeInputUids(
                    forgeInputUids.includes(eq.uid)
                      ? forgeInputUids.filter((u) => u !== eq.uid)
                      : [...forgeInputUids, eq.uid]
                  );
                }}
              >
                {forgeInputUids.includes(eq.uid) ? '✓ 已选' : '选择材料'}
              </button>
            )}
          </div>
        )}
        {eq.level < 10 && (
          <div className="eq-forge-exp-bar">
            <div className="eq-forge-exp-fill" style={{ width: `${(eq.forgeExp / eq.forgeExpToNext) * 100}%` }} />
          </div>
        )}
      </div>
    );
  };

  const renderCompanionEquipSlots = (companionId: string) => {
    const equipped = companionEquipments[companionId] || {};
    const eqItems = getEquippedItems(companionId);

    return (
      <div className="eq-companion-slots">
        {EQUIPMENT_SLOT_CONFIG.map((slotCfg) => {
          const uid = equipped[slotCfg.slot];
          const item = uid ? equipmentInventory.find((e) => e.uid === uid) : null;

          return (
            <div key={slotCfg.slot} className={`eq-slot-card ${item ? 'filled' : 'empty'}`}>
              <div className="eq-slot-header">
                <span className="eq-slot-icon">{slotCfg.icon}</span>
                <span className="eq-slot-name">{slotCfg.name}</span>
              </div>
              {item ? (
                <div className="eq-slot-item" style={{ borderColor: EQUIPMENT_RARITY_COLORS[item.rarity] }}>
                  <span className="eq-slot-item-name" style={{ color: EQUIPMENT_RARITY_COLORS[item.rarity] }}>
                    {item.name}
                  </span>
                  <div className="eq-slot-item-stats">
                    {item.baseStats.map((s, i) => (
                      <span key={i} className="eq-stat-line small">{renderStatLine(s.stat, s.value, s.isPercent)}</span>
                    ))}
                  </div>
                  <button
                    className="eq-slot-unequip-btn"
                    onClick={() => unequipItem(item.uid)}
                  >
                    卸下
                  </button>
                </div>
              ) : (
                <div className="eq-slot-empty">
                  <span>空</span>
                </div>
              )}
            </div>
          );
        })}
        {eqItems.length > 0 && (
          <div className="eq-companion-bonus-summary">
            <h5>装备加成总计</h5>
            {(['attack', 'defense', 'hp', 'speed', 'luck', 'critRate', 'dodge', 'goldBonus', 'expBonus'] as const).map((stat) => {
              const bonus = getEquipmentStatBonus(companionId, stat);
              if (bonus.flat === 0 && bonus.percent === 0) return null;
              return (
                <span key={stat} className="eq-bonus-tag">
                  {AFFIX_STAT_NAMES[stat]} +{bonus.flat}{bonus.percent > 0 ? ` (+${bonus.percent}%)` : ''}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => (
    <div className="eq-inventory-section">
      <h4>🎒 装备背包 ({unequippedItems.length})</h4>
      <div className="eq-companion-select">
        <span>选择装备对象:</span>
        <div className="eq-companion-btns">
          {ownedCompanions.map((c) => (
            <button
              key={c.id}
              className={`eq-comp-btn ${selectedCompanionId === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCompanionId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {unequippedItems.length === 0 ? (
        <div className="eq-empty">暂无装备，击败怪物有几率掉落！</div>
      ) : (
        <div className="eq-grid">
          {unequippedItems.map((eq) => renderEquipmentCard(eq))}
        </div>
      )}
    </div>
  );

  const renderEquip = () => (
    <div className="eq-equip-section">
      <h4>👤 伙伴装备</h4>
      <div className="eq-companion-btns">
        {ownedCompanions.map((c) => (
          <button
            key={c.id}
            className={`eq-comp-btn ${selectedCompanionId === c.id ? 'active' : ''}`}
            onClick={() => setSelectedCompanionId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      {selectedCompanionId ? (
        renderCompanionEquipSlots(selectedCompanionId)
      ) : (
        <div className="eq-empty">选择一个伙伴查看装备</div>
      )}
    </div>
  );

  const renderForge = () => {
    const recipe = FORGE_RECIPES.find((r) => r.id === forgeRecipeId);
    const canDo = recipe ? canForge(forgeRecipeId, forgeInputUids) : false;
    const costText = recipe
      ? recipe.currency === 'gold'
        ? `💰 ${recipe.cost}`
        : `💎 ${recipe.cost}`
      : '';

    return (
      <div className="eq-forge-section">
        <h4>🔨 装备锻造</h4>
        <div className="eq-forge-recipes">
          {FORGE_RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              className={`eq-recipe-btn ${forgeRecipeId === recipe.id ? 'active' : ''}`}
              onClick={() => { setForgeRecipeId(recipe.id); setForgeInputUids([]); }}
            >
              <span className="eq-recipe-name">{recipe.name}</span>
              <span className="eq-recipe-desc">{recipe.description}</span>
              <span className="eq-recipe-cost">{costText}</span>
            </button>
          ))}
        </div>
        <div className="eq-forge-input">
          <h5>选择材料装备 ({forgeInputUids.length}/{recipe?.inputSlots || 0})</h5>
          <p className="eq-forge-hint">
            {recipe
              ? `需要 ${recipe.inputSlots} 件${EQUIPMENT_RARITY_NAMES[recipe.minRarity as EquipmentRarity] || ''}以上品质的未装备物品`
              : ''}
          </p>
          <div className="eq-grid">
            {unequippedItems.map((eq) => renderEquipmentCard(eq))}
          </div>
        </div>
        <button
          className={`eq-forge-execute-btn ${!canDo ? 'disabled' : ''}`}
          disabled={!canDo}
          onClick={() => {
            if (canDo) {
              forgeEquipments(forgeRecipeId, forgeInputUids);
              setForgeInputUids([]);
            }
          }}
        >
          🔨 开始锻造 ({costText})
        </button>
      </div>
    );
  };

  const renderRecycle = () => {
    const totalGold = recycleUids.reduce((sum, uid) => {
      const eq = equipmentInventory.find((e) => e.uid === uid);
      if (!eq || eq.equippedBy) return sum;
      const config = getEquipmentRarityConfig(eq.rarity);
      return sum + config.recycleGoldBase + config.recycleGoldPerLevel * eq.level;
    }, 0);

    return (
      <div className="eq-recycle-section">
        <h4>♻️ 商店回收</h4>
        <p className="eq-recycle-hint">选择未装备的物品回收为金币</p>
        <div className="eq-grid">
          {unequippedItems.map((eq) => renderEquipmentCard(eq))}
        </div>
        {recycleUids.length > 0 && (
          <div className="eq-recycle-summary">
            <span>已选 {recycleUids.length} 件，回收可得 💰 {totalGold.toLocaleString()}</span>
            <button
              className="eq-recycle-execute-btn"
              onClick={() => {
                recycleUids.forEach((uid) => recycleEquipment(uid));
                setRecycleUids([]);
              }}
            >
              ♻️ 确认回收
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="equipment-panel">
      <div className="eq-header">
        <h3>⚒️ 装备锻造</h3>
        <p className="eq-gold">💰 {player.stats.gold.toLocaleString()}</p>
      </div>

      <div className="eq-subtabs">
        <button className={`subtab-btn ${activeSubTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSubTab('inventory')}>
          🎒 背包
        </button>
        <button className={`subtab-btn ${activeSubTab === 'equip' ? 'active' : ''}`} onClick={() => setActiveSubTab('equip')}>
          👤 穿戴
        </button>
        <button className={`subtab-btn ${activeSubTab === 'forge' ? 'active' : ''}`} onClick={() => setActiveSubTab('forge')}>
          🔨 锻造
        </button>
        <button className={`subtab-btn ${activeSubTab === 'recycle' ? 'active' : ''}`} onClick={() => setActiveSubTab('recycle')}>
          ♻️ 回收
        </button>
      </div>

      {activeSubTab === 'inventory' && renderInventory()}
      {activeSubTab === 'equip' && renderEquip()}
      {activeSubTab === 'forge' && renderForge()}
      {activeSubTab === 'recycle' && renderRecycle()}
    </div>
  );
}
