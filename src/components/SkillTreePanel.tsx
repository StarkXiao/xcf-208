import { useState } from 'react';
import { useGameStore } from '../game/store';
import { SKILL_TREE_BRANCHES, SKILL_TREE_NODES, PROFESSION_SPECS, SKILL_TREE_COMPANION_SYNERGIES } from '../game/data';
import { SKILL_NODE_RARITY_COLORS, SKILL_NODE_RARITY_NAMES } from '../game/types';
import type { SkillTreeNode, SkillTreeBranchId, SkillNodeEffect, ProfessionSpec } from '../game/types';

function getEffectText(effect: SkillNodeEffect, level: number): string {
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
    case 'critRate':
      return `${sign}${(value * 100).toFixed(1)}% 暴击率`;
    case 'critDamage':
      return `${sign}${(value * 100).toFixed(0)}% 暴击伤害`;
    case 'dodge':
      return `${sign}${(value * 100).toFixed(1)}% 闪避率`;
    case 'exp':
      return `${sign}${(value * 100).toFixed(0)}% 经验`;
    case 'gold':
      return `${sign}${(value * 100).toFixed(0)}% 金币`;
    case 'soulOrbs':
      return `${sign}${(value * 100).toFixed(0)}% 魂珠`;
    case 'skillDamage':
      return `${sign}${(value * 100).toFixed(0)}% 技能伤害`;
    case 'companionAttack':
      return `${sign}${(value * 100).toFixed(0)}% 伙伴攻击`;
    case 'companionDefense':
      return `${sign}${(value * 100).toFixed(0)}% 伙伴防御`;
    case 'companionHp':
      return `${sign}${(value * 100).toFixed(0)}% 伙伴生命`;
    default:
      return '';
  }
}

function SkillNodeCard({ node }: { node: SkillTreeNode }) {
  const {
    getSkillNodeLevel,
    canUpgradeSkillNode,
    isSkillNodeUnlocked,
    upgradeSkillNode,
    player,
  } = useGameStore();

  const currentLevel = getSkillNodeLevel(node.id);
  const isMaxed = currentLevel >= node.maxLevel;
  const unlocked = isSkillNodeUnlocked(node);
  const canUpgrade = canUpgradeSkillNode(node.id);

  const rarityColor = SKILL_NODE_RARITY_COLORS[node.rarity];
  const rarityName = SKILL_NODE_RARITY_NAMES[node.rarity];

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeSkillNode(node.id);
    }
  };

  if (!unlocked) {
    let lockReason = '';
    if (node.minPlayerLevel && player.stats.level < node.minPlayerLevel) {
      lockReason = `需要 ${node.minPlayerLevel} 级`;
    } else if (node.classRestriction && node.classRestriction.length > 0 && player.class) {
      if (!node.classRestriction.includes(player.class)) {
        lockReason = `${node.classRestriction.join('/')} 专属`;
      }
    } else if (node.branch === 'special' && player.rebirthCount < 1) {
      lockReason = '需要至少1次转生';
    } else if (node.prerequisiteIds && node.prerequisiteIds.length > 0) {
      const prereqNames = node.prerequisiteIds
        .map((id) => SKILL_TREE_NODES.find((n) => n.id === id)?.name)
        .filter(Boolean)
        .join('、');
      lockReason = `需要前置技能满级：${prereqNames}`;
    }

    return (
      <div className="skill-node-card locked" style={{ borderColor: rarityColor }}>
        <div className="skill-node-header">
          <span className="skill-node-icon">{node.icon}</span>
          <div className="skill-node-title">
            <span className="skill-node-name">{node.name}</span>
            <span className="skill-node-rarity" style={{ color: rarityColor }}>{rarityName}</span>
          </div>
        </div>
        <p className="skill-node-desc">{node.description}</p>
        <div className="skill-node-lock-reason">🔒 {lockReason}</div>
      </div>
    );
  }

  return (
    <div className={`skill-node-card ${isMaxed ? 'maxed' : ''}`} style={{ borderColor: rarityColor }}>
      <div className="skill-node-header">
        <span className="skill-node-icon">{node.icon}</span>
        <div className="skill-node-title">
          <span className="skill-node-name">{node.name}</span>
          <span className="skill-node-rarity" style={{ color: rarityColor }}>{rarityName}</span>
        </div>
        <span className="skill-node-level">{currentLevel}/{node.maxLevel}</span>
      </div>
      <p className="skill-node-desc">{node.description}</p>
      {currentLevel > 0 && (
        <div className="skill-node-effects">
          {node.effects.map((effect, idx) => (
            <span key={idx} className="skill-node-effect positive">
              {getEffectText(effect, currentLevel)}
            </span>
          ))}
        </div>
      )}
      {!isMaxed && (
        <div className="skill-node-next-level">
          <span className="next-label">下级:</span>
          {node.effects.map((effect, idx) => (
            <span key={idx} className="skill-node-effect next">
              {getEffectText(effect, currentLevel + 1)}
            </span>
          ))}
        </div>
      )}
      <button
        className={`skill-node-upgrade-btn ${isMaxed ? 'maxed' : ''} ${!canUpgrade && !isMaxed ? 'disabled' : ''}`}
        onClick={handleUpgrade}
        disabled={isMaxed || !canUpgrade}
      >
        {isMaxed ? '已满级' : `🔵 ${node.pointCostPerLevel} 点 升级`}
      </button>
    </div>
  );
}

function ProfessionSpecCard({ spec }: { spec: ProfessionSpec }) {
  const {
    canActivateProfessionSpec,
    activateProfessionSpec,
    deactivateProfessionSpec,
    getActiveSpec,
    player,
    getBranchPoints,
  } = useGameStore();

  const isActive = getActiveSpec()?.id === spec.id;
  const canActivate = canActivateProfessionSpec(spec.id);
  const branchPoints = getBranchPoints(spec.requiredBranchId);

  const handleActivate = () => {
    if (isActive) {
      deactivateProfessionSpec();
    } else if (canActivate) {
      activateProfessionSpec(spec.id);
    }
  };

  const isCorrectClass = spec.baseClass === player.class;

  return (
    <div className={`profession-spec-card ${isActive ? 'active' : ''}`} style={{ borderColor: spec.color }}>
      <div className="spec-header">
        <span className="spec-icon">{spec.icon}</span>
        <div className="spec-title">
          <span className="spec-name" style={{ color: spec.color }}>{spec.name}</span>
          <span className="spec-base-class">由 {spec.baseClass} 进阶</span>
        </div>
        {isActive && <span className="spec-active-badge">✓ 已激活</span>}
      </div>
      <p className="spec-desc">{spec.description}</p>

      <div className="spec-requirements">
        <span className={`spec-req ${isCorrectClass ? 'met' : 'unmet'}`}>
          {isCorrectClass ? '✓' : '✕'} 职业: {spec.baseClass}
        </span>
        <span className={`spec-req ${player.stats.level >= spec.minLevel ? 'met' : 'unmet'}`}>
          {player.stats.level >= spec.minLevel ? '✓' : '✕'} 等级: {spec.minLevel}+
        </span>
        <span className={`spec-req ${player.rebirthCount >= spec.minRebirthCount ? 'met' : 'unmet'}`}>
          {player.rebirthCount >= spec.minRebirthCount ? '✓' : '✕'} 转生: {spec.minRebirthCount}+
        </span>
        <span className={`spec-req ${branchPoints >= spec.requiredBranchPoints ? 'met' : 'unmet'}`}>
          {branchPoints >= spec.requiredBranchPoints ? '✓' : '✕'} {SKILL_TREE_BRANCHES.find(b => b.id === spec.requiredBranchId)?.name}分支: {branchPoints}/{spec.requiredBranchPoints}点
        </span>
      </div>

      <div className="spec-effects">
        <h5>被动效果</h5>
        {spec.passiveEffects.map((effect, idx) => (
          <span key={idx} className={`spec-effect ${effect.value >= 0 ? 'positive' : 'negative'}`}>
            {getEffectText(effect, 1)}
          </span>
        ))}
      </div>

      <div className="spec-combat-bonus">
        <h5>战斗加成</h5>
        <span className="spec-combat-stat">伤害 ×{spec.combatBonus.damageMultiplier}</span>
        <span className="spec-combat-stat">防御 ×{spec.combatBonus.defenseMultiplier}</span>
        <span className="spec-combat-stat">速度 ×{spec.combatBonus.speedMultiplier}</span>
      </div>

      <div className="spec-synergy">
        <h5>伙伴协同</h5>
        <p className="spec-synergy-desc">{spec.companionSynergy.description}</p>
        <span className="spec-synergy-classes">偏好职业: {spec.companionSynergy.preferredClasses.join('、')}</span>
      </div>

      <div className="spec-rebirth-inherit">
        <span>🔄 转生继承率: {(spec.rebirthInheritRate * 100).toFixed(0)}%</span>
      </div>

      <button
        className={`spec-activate-btn ${isActive ? 'deactivate' : ''} ${!canActivate && !isActive ? 'disabled' : ''}`}
        onClick={handleActivate}
        disabled={!canActivate && !isActive}
      >
        {isActive ? '❌ 取消激活' : canActivate ? '✨ 激活专精' : '条件未满足'}
      </button>
    </div>
  );
}

export default function SkillTreePanel() {
  const [selectedBranch, setSelectedBranch] = useState<SkillTreeBranchId>('offense');
  const [showSpecs, setShowSpecs] = useState(false);
  const {
    player,
    getAvailableSkillPoints,
    getTotalAllocatedPoints,
    getBranchPoints,
    getSkillTreeTotalBonus,
    resetSkillTree,
    getActiveSpec,
    getSpecCombatMultiplier,
    getSpecRebirthInheritRate,
  } = useGameStore();

  const availablePoints = getAvailableSkillPoints();
  const totalAllocated = getTotalAllocatedPoints();
  const activeSpec = getActiveSpec();
  const combatMulti = getSpecCombatMultiplier();
  const inheritRate = getSpecRebirthInheritRate();

  const filteredNodes = SKILL_TREE_NODES.filter((n) => n.branch === selectedBranch);
  const availableSpecs = PROFESSION_SPECS.filter((s) => s.baseClass === player.class);

  const statBonuses = [
    { label: '⚔️ 攻击', type: 'attack' as const },
    { label: '🛡️ 防御', type: 'defense' as const },
    { label: '❤️ 生命', type: 'hp' as const },
    { label: '💙 魔力', type: 'mp' as const },
    { label: '👟 速度', type: 'speed' as const },
    { label: '🍀 幸运', type: 'luck' as const },
    { label: '🎯 暴击率', type: 'critRate' as const },
    { label: '💥 暴击伤害', type: 'critDamage' as const },
    { label: '💨 闪避率', type: 'dodge' as const },
    { label: '🔥 技能伤害', type: 'skillDamage' as const },
    { label: '⭐ 经验', type: 'exp' as const },
    { label: '💰 金币', type: 'gold' as const },
  ];

  return (
    <div className="skilltree-panel">
      <div className="skilltree-header">
        <h3>🌳 技能树与职业专精</h3>
        <p className="skilltree-desc">
          消耗技能点升级技能节点，激活职业专精获得强力加成
        </p>
      </div>

      <div className="skilltree-overview">
        <div className="skilltree-overview-item">
          <span>🔵 可用技能点</span>
          <span className="value skill-points">{availablePoints}</span>
        </div>
        <div className="skilltree-overview-item">
          <span>📊 已分配点数</span>
          <span className="value">{totalAllocated}</span>
        </div>
        <div className="skilltree-overview-item">
          <span>📈 当前等级</span>
          <span className="value">Lv.{player.stats.level}</span>
        </div>
        <div className="skilltree-overview-item">
          <span>🔄 转生次数</span>
          <span className="value">{player.rebirthCount}</span>
        </div>
      </div>

      {activeSpec && (
        <div className="active-spec-banner" style={{ borderColor: activeSpec.color }}>
          <div className="active-spec-info">
            <span className="active-spec-icon">{activeSpec.icon}</span>
            <span className="active-spec-name" style={{ color: activeSpec.color }}>{activeSpec.name}</span>
            <span className="active-spec-tag">已激活</span>
          </div>
          <div className="active-spec-bonuses">
            <span>伤害 ×{combatMulti.damage}</span>
            <span>防御 ×{combatMulti.defense}</span>
            <span>速度 ×{combatMulti.speed}</span>
            <span>继承率 {(inheritRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <div className="skilltree-branch-tabs">
        {SKILL_TREE_BRANCHES.map((branch) => {
          const points = getBranchPoints(branch.id);
          return (
            <button
              key={branch.id}
              className={`skilltree-branch-tab ${selectedBranch === branch.id ? 'active' : ''}`}
              style={selectedBranch === branch.id ? { borderColor: branch.color, color: branch.color } : {}}
              onClick={() => { setSelectedBranch(branch.id); setShowSpecs(false); }}
            >
              <span className="tab-icon">{branch.icon}</span>
              <span className="tab-label">{branch.name}</span>
              <span className="tab-points">{points}</span>
            </button>
          );
        })}
        {availableSpecs.length > 0 && (
          <button
            className={`skilltree-branch-tab spec-tab ${showSpecs ? 'active' : ''}`}
            onClick={() => setShowSpecs(true)}
          >
            <span className="tab-icon">🌟</span>
            <span className="tab-label">专精</span>
          </button>
        )}
      </div>

      {showSpecs ? (
        <div className="profession-specs-section">
          <div className="spec-section-desc">
            选择职业专精以获得强力被动与战斗加成。激活专精后，技能树在转生时可按比例继承。
          </div>
          <div className="profession-specs-grid">
            {availableSpecs.map((spec) => (
              <ProfessionSpecCard key={spec.id} spec={spec} />
            ))}
          </div>
          {availableSpecs.length === 0 && (
            <div className="empty-state">
              <p>当前职业暂无可用专精</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="skilltree-branch-description">
            {SKILL_TREE_BRANCHES.find((b) => b.id === selectedBranch)?.description}
          </div>

          <div className="skilltree-nodes-grid">
            {filteredNodes.map((node) => (
              <SkillNodeCard key={node.id} node={node} />
            ))}
          </div>
        </>
      )}

      <div className="skilltree-stats-summary">
        <h4>📊 技能树总加成</h4>
        <div className="skilltree-stats-grid">
          {statBonuses.map((stat) => {
            const bonus = getSkillTreeTotalBonus(stat.type);
            const hasBonus = bonus > 0;
            return (
              <div key={stat.type} className={`skilltree-stat-item ${hasBonus ? 'active' : ''}`}>
                <span>{stat.label}</span>
                <span>
                  {hasBonus ? (bonus < 1 ? `+${(bonus * 100).toFixed(bonus < 0.05 ? 1 : 0)}%` : `+${bonus.toFixed(0)}`) : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="skilltree-companion-synergies">
        <h4>🤝 伙伴协同加成</h4>
        <p className="synergy-desc">编队中伙伴按职业和星级提供额外加成</p>
        <div className="synergy-list">
          {SKILL_TREE_COMPANION_SYNERGIES.map((synergy) => (
            <div key={synergy.companionClass} className="synergy-item">
              <span className="synergy-class">{synergy.companionClass}</span>
              <span className="synergy-detail">
                {synergy.bonusPerStar.map((e) => getEffectText(e, 1)).join(', ')} / 每星
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalAllocated > 0 && (
        <div className="skilltree-reset-section">
          <button className="skilltree-reset-btn" onClick={() => {
            if (confirm('确定要重置技能树吗？将返还 70% 消耗的技能点，同时取消职业专精。')) {
              resetSkillTree();
            }
          }}>
            🔄 重置技能树（返还70%技能点）
          </button>
        </div>
      )}
    </div>
  );
}
