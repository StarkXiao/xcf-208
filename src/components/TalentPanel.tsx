import { useState } from 'react';
import { useGameStore } from '../game/store';
import { TALENT_TREES, TALENTS, TALENT_RARITY_COLORS, TALENT_RARITY_NAMES, TALENT_SYNERGIES } from '../game/data';
import type { Talent, TalentCategory, TalentEffect } from '../game/types';

function getEffectText(effect: TalentEffect, level: number): string {
  const value = effect.value * level;
  const sign = value >= 0 ? '+' : '';
  switch (effect.type) {
    case 'attack':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 攻击` : `${sign}${value} 攻击`;
    case 'defense':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 防御` : `${sign}${value} 防御`;
    case 'hp':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 生命` : `${sign}${value} 生命`;
    case 'mp':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 魔力` : `${sign}${value} 魔力`;
    case 'speed':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 速度` : `${sign}${value} 速度`;
    case 'luck':
      return effect.isPercent ? `${sign}${(value * 100).toFixed(0)}% 幸运` : `${sign}${value} 幸运`;
    case 'exp':
      return `${sign}${(value * 100).toFixed(0)}% 经验`;
    case 'gold':
      return `${sign}${(value * 100).toFixed(0)}% 金币`;
    case 'soulOrbs':
      return `${sign}${(value * 100).toFixed(0)}% 魂珠获取`;
    case 'critRate':
      return `${sign}${(value * 100).toFixed(1)}% 暴击率`;
    case 'critDamage':
      return `${sign}${(value * 100).toFixed(0)}% 暴击伤害`;
    case 'dodge':
      return `${sign}${(value * 100).toFixed(1)}% 闪避率`;
    default:
      return '';
  }
}

function TalentCard({ talent }: { talent: Talent }) {
  const { player, getTalentLevel, getTalentCost, upgradeTalent, canUpgradeTalent, isTalentUnlocked } = useGameStore();
  const currentLevel = getTalentLevel(talent.id);
  const isMaxed = currentLevel >= talent.maxLevel;
  const unlocked = isTalentUnlocked(talent);
  const canUpgrade = canUpgradeTalent(talent);
  const cost = isMaxed ? 0 : getTalentCost(talent, currentLevel);

  const rarityColor = TALENT_RARITY_COLORS[talent.rarity];
  const rarityName = TALENT_RARITY_NAMES[talent.rarity];

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeTalent(talent.id);
    }
  };

  if (!unlocked) {
    let lockReason = '';
    if (talent.requiredRebirthCount && player.rebirthCount < talent.requiredRebirthCount) {
      lockReason = `需要 ${talent.requiredRebirthCount} 次转生`;
    } else if (talent.classRestriction && talent.classRestriction.length > 0 && player.class) {
      if (!talent.classRestriction.includes(player.class)) {
        lockReason = `${talent.classRestriction.join('/')} 专属`;
      }
    } else if (talent.raceRestriction && talent.raceRestriction.length > 0 && player.race) {
      if (!talent.raceRestriction.includes(player.race)) {
        lockReason = `${talent.raceRestriction.join('/')} 专属`;
      }
    } else if (talent.prerequisiteTalentIds && talent.prerequisiteTalentIds.length > 0) {
      const prereqNames = talent.prerequisiteTalentIds
        .map((id) => TALENTS.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join('、');
      lockReason = `需要前置天赋满级：${prereqNames}`;
    }

    return (
      <div className="talent-card locked" style={{ borderColor: rarityColor }}>
        <div className="talent-card-header">
          <span className="talent-icon">{talent.icon}</span>
          <div className="talent-title">
            <span className="talent-name">{talent.name}</span>
            <span className="talent-rarity" style={{ color: rarityColor }}>{rarityName}</span>
          </div>
        </div>
        <p className="talent-desc">{talent.description}</p>
        <div className="talent-lock-reason">🔒 {lockReason}</div>
      </div>
    );
  }

  return (
    <div className={`talent-card ${isMaxed ? 'maxed' : ''}`} style={{ borderColor: rarityColor }}>
      <div className="talent-card-header">
        <span className="talent-icon">{talent.icon}</span>
        <div className="talent-title">
          <span className="talent-name">{talent.name}</span>
          <span className="talent-rarity" style={{ color: rarityColor }}>{rarityName}</span>
        </div>
        <span className="talent-level">{currentLevel}/{talent.maxLevel}</span>
      </div>
      <p className="talent-desc">{talent.description}</p>
      {currentLevel > 0 && (
        <div className="talent-effects">
          {talent.effects.map((effect, idx) => (
            <span key={idx} className="talent-effect positive">
              {getEffectText(effect, currentLevel)}
            </span>
          ))}
        </div>
      )}
      {!isMaxed && (
        <div className="talent-next-level">
          <span className="next-label">下级效果:</span>
          {talent.effects.map((effect, idx) => (
            <span key={idx} className="talent-effect next">
              {getEffectText(effect, currentLevel + 1)}
            </span>
          ))}
        </div>
      )}
      <button
        className={`talent-upgrade-btn ${isMaxed ? 'maxed' : ''} ${!canUpgrade && !isMaxed ? 'disabled' : ''}`}
        onClick={handleUpgrade}
        disabled={isMaxed || !canUpgrade}
      >
        {isMaxed ? '已满级' : `💎 ${cost} 升级`}
      </button>
    </div>
  );
}

export default function TalentPanel() {
  const [selectedCategory, setSelectedCategory] = useState<TalentCategory>('combat');
  const { player, getActiveSynergies, resetTalents, getTotalTalentBonus } = useGameStore();

  const activeSynergies = getActiveSynergies();
  const filteredTalents = TALENTS.filter((t) => t.category === selectedCategory);

  const statBonuses = [
    { label: '⚔️ 攻击', type: 'attack' as const },
    { label: '🛡️ 防御', type: 'defense' as const },
    { label: '❤️ 生命', type: 'hp' as const },
    { label: '💙 魔力', type: 'mp' as const },
    { label: '👟 速度', type: 'speed' as const },
    { label: '🍀 幸运', type: 'luck' as const },
    { label: '⭐ 经验', type: 'exp' as const },
    { label: '💰 金币', type: 'gold' as const },
    { label: '💎 魂珠', type: 'soulOrbs' as const },
    { label: '🎯 暴击率', type: 'critRate' as const },
    { label: '💥 暴击伤害', type: 'critDamage' as const },
    { label: '💨 闪避率', type: 'dodge' as const },
  ];

  const totalTalentLevels = player.inheritedTalents.reduce((sum, t) => sum + t.currentLevel, 0);

  return (
    <div className="talent-panel">
      <div className="talent-header">
        <h3>🌟 天赋继承系统</h3>
        <p className="talent-desc">
          消耗魂珠激活和升级天赋，天赋将永久传承至下一次转生
        </p>
      </div>

      <div className="talent-overview">
        <div className="talent-overview-item">
          <span>💎 当前魂珠</span>
          <span className="value soul">{player.stats.soulOrbs}</span>
        </div>
        <div className="talent-overview-item">
          <span>🔄 转生次数</span>
          <span className="value">{player.rebirthCount}</span>
        </div>
        <div className="talent-overview-item">
          <span>🌟 天赋总等级</span>
          <span className="value">{totalTalentLevels}</span>
        </div>
        <div className="talent-overview-item">
          <span>📚 已激活天赋</span>
          <span className="value">{player.inheritedTalents.filter((t) => t.currentLevel > 0).length}</span>
        </div>
      </div>

      {activeSynergies.length > 0 && (
        <div className="talent-synergies">
          <h4>🔗 激活的天赋协同</h4>
          <div className="synergy-list">
            {activeSynergies.map((id) => {
              const synergy = TALENT_SYNERGIES.find((s) => s.id === id);
              if (!synergy) return null;
              return (
                <div key={id} className="synergy-card">
                  <div className="synergy-header">
                    <span className="synergy-icon">{synergy.icon}</span>
                    <span className="synergy-name">{synergy.name}</span>
                  </div>
                  <p className="synergy-desc">{synergy.description}</p>
                  <div className="synergy-effects">
                    {synergy.effects.map((eff, idx) => (
                      <span key={idx} className="synergy-effect">
                        {getEffectText(eff, 1)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="talent-stats-summary">
        <h4>📊 当前天赋加成</h4>
        <div className="talent-stats-grid">
          {statBonuses.map((stat) => {
            const bonus = getTotalTalentBonus(stat.type);
            const hasBonus = bonus.percent > 0 || bonus.flat > 0;
            return (
              <div key={stat.type} className={`talent-stat-item ${hasBonus ? 'active' : ''}`}>
                <span>{stat.label}</span>
                <span>
                  {bonus.percent > 0 && `+${(bonus.percent * 100).toFixed(bonus.percent < 0.05 ? 1 : 0)}%`}
                  {bonus.flat > 0 && ` +${bonus.flat}`}
                  {!hasBonus && '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="talent-tree-tabs">
        {TALENT_TREES.map((tree) => (
          <button
            key={tree.id}
            className={`talent-tree-tab ${selectedCategory === tree.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(tree.id)}
          >
            <span className="tab-icon">{tree.icon}</span>
            <span className="tab-label">{tree.name}</span>
          </button>
        ))}
      </div>

      <div className="talent-tree-description">
        {TALENT_TREES.find((t) => t.id === selectedCategory)?.description}
      </div>

      <div className="talent-grid">
        {filteredTalents.map((talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))}
      </div>

      {player.inheritedTalents.length > 0 && (
        <div className="talent-reset-section">
          <button className="talent-reset-btn" onClick={() => {
            if (confirm('确定要重置所有天赋吗？将返还 70% 消耗的魂珠。')) {
              resetTalents();
            }
          }}>
            🔄 重置天赋（返还70%魂珠）
          </button>
        </div>
      )}
    </div>
  );
}
