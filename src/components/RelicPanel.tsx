import { useState, useMemo } from 'react';
import { useGameStore } from '../game/store';
import {
  RELIC_RARITY_NAMES,
  RELIC_RARITY_COLORS,
  RELIC_ELEMENT_NAMES,
  RELIC_ELEMENT_COLORS,
  RELIC_CATEGORY_NAMES,
  RELICS,
  RELIC_SETS,
  RELIC_MAX_LEVEL,
} from '../game/data';
import type { Relic, OwnedRelic, RelicStatBonus } from '../game/types';

const STAT_NAMES: Record<string, string> = {
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

const RELIC_FILTER_OPTIONS = [
  { id: 'all', label: '全部', icon: '📜' },
  { id: 'weapon', label: '武器', icon: '🗡️' },
  { id: 'armor', label: '防具', icon: '🛡️' },
  { id: 'accessory', label: '饰品', icon: '💍' },
  { id: 'treasure', label: '宝物', icon: '🏺' },
  { id: 'rune', label: '符文', icon: '🔮' },
];

export default function RelicPanel() {
  const {
    ownedRelics,
    relicCodex,
    ownedCompanions,
    player,
    getRelic,
    getOwnedRelic,
    getRelicCodexEntry,
    getRelicCodexProgress,
    getRelicStatBonus,
    getRelicTotalStats,
    getRelicSetBonus,
    getActiveRelicSets,
    getEquippedRelics,
    isRelicCompatible,
    getCompatibleBonusMultiplier,
    equipRelic,
    unequipRelic,
    upgradeRelic,
    awakenRelic,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<'owned' | 'codex' | 'sets'>('owned');
  const [selectedRelicId, setSelectedRelicId] = useState<string | null>(null);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const codexProgress = useMemo(() => getRelicCodexProgress(), [getRelicCodexProgress, relicCodex]);

  const filteredOwnedRelics = useMemo(() => {
    if (categoryFilter === 'all') return ownedRelics;
    return ownedRelics.filter((r) => {
      const relicData = getRelic(r.relicId);
      return relicData?.category === categoryFilter;
    });
  }, [ownedRelics, categoryFilter, getRelic]);

  const filteredCodexRelics = useMemo(() => {
    if (categoryFilter === 'all') return RELICS;
    return RELICS.filter((r) => r.category === categoryFilter);
  }, [categoryFilter]);

  const renderStatLine = (stat: RelicStatBonus) => {
    const name = STAT_NAMES[stat.stat] || stat.stat;
    const val = stat.isPercent ? (stat.value * 100).toFixed(1) : Math.floor(stat.value).toString();
    return `${name} +${val}${stat.isPercent ? '%' : ''}`;
  };

  const renderRelicCardOwned = (owned: OwnedRelic) => {
    const relic = getRelic(owned.relicId);
    if (!relic) return null;
    const codexEntry = getRelicCodexEntry(owned.relicId);
    const stats = getRelicStatBonus(owned.relicId, true);
    const baseStats = getRelicStatBonus(owned.relicId, false);
    const equippedCompanion = owned.equippedBy ? ownedCompanions.find((c) => c.id === owned.equippedBy) : null;
    const isCompatible = selectedCompanionId ? isRelicCompatible(owned.relicId, selectedCompanionId) : true;
    const compatMultiplier = getCompatibleBonusMultiplier(owned.relicId, selectedCompanionId);

    const canAwaken = owned.level >= RELIC_MAX_LEVEL && owned.shards >= relic.awakenCost.shards && player.stats.soulOrbs >= relic.awakenCost.soulOrbs && !owned.awakened;

    return (
      <div
        key={owned.relicId}
        className={`relic-card ${selectedRelicId === owned.relicId ? 'selected' : ''} ${owned.equippedBy ? 'equipped' : ''} ${owned.awakened ? 'awakened' : ''}`}
        style={{ borderColor: RELIC_RARITY_COLORS[relic.rarity] }}
        onClick={() => setSelectedRelicId(owned.relicId === selectedRelicId ? null : owned.relicId)}
      >
        <div className="relic-card-header">
          <span className="relic-icon">{relic.icon}</span>
          <div className="relic-card-title">
            <span className="relic-name" style={{ color: RELIC_RARITY_COLORS[relic.rarity] }}>
              {relic.name}
              {owned.awakened && <span className="relic-awakened-badge">✨觉醒</span>}
            </span>
            <div className="relic-tags">
              <span className="relic-tag" style={{ color: RELIC_RARITY_COLORS[relic.rarity] }}>
                {RELIC_RARITY_NAMES[relic.rarity]}
              </span>
              <span className="relic-tag" style={{ color: RELIC_ELEMENT_COLORS[relic.element] }}>
                {RELIC_ELEMENT_NAMES[relic.element]}
              </span>
              <span className="relic-tag">{RELIC_CATEGORY_NAMES[relic.category]}</span>
            </div>
          </div>
          <span className="relic-level">Lv.{owned.level}/{RELIC_MAX_LEVEL}</span>
        </div>

        {owned.level < RELIC_MAX_LEVEL && (
          <div className="relic-exp-bar">
            <div className="relic-exp-fill" style={{ width: `${(owned.level / RELIC_MAX_LEVEL) * 100}%` }} />
          </div>
        )}

        <div className="relic-card-stats">
          {baseStats.map((s, i) => (
            <span key={i} className="relic-stat-line base">{renderStatLine(s)}</span>
          ))}
          {owned.awakened && stats.slice(baseStats.length).map((s, i) => (
            <span key={`aw-${i}`} className="relic-stat-line awakened">✨ {renderStatLine(s)}</span>
          ))}
        </div>

        <div className="relic-card-shards">
          <span>💎 碎片: {owned.shards}/{relic.awakenCost.shards}</span>
        </div>

        {owned.equippedBy && (
          <div className="relic-equipped-info">
            <span>👤 装备于: {equippedCompanion?.name || '未知'}</span>
          </div>
        )}

        {selectedCompanionId && !owned.equippedBy && (
          <div className="relic-compat-info">
            <span className={isCompatible ? 'compat-good' : 'compat-bad'}>
              {isCompatible ? `✅ 适配（属性+${((compatMultiplier - 1) * 100).toFixed(0)}%）` : '❌ 不适配'}
            </span>
          </div>
        )}

        {selectedRelicId === owned.relicId && (
          <div className="relic-card-actions">
            {!owned.equippedBy && selectedCompanionId && (
              <button
                className="relic-action-btn equip"
                onClick={(e) => { e.stopPropagation(); equipRelic(owned.relicId, selectedCompanionId); }}
              >
                装备给 {ownedCompanions.find((c) => c.id === selectedCompanionId)?.name || '伙伴'}
              </button>
            )}
            {owned.equippedBy && (
              <button
                className="relic-action-btn unequip"
                onClick={(e) => { e.stopPropagation(); unequipRelic(owned.relicId); }}
              >
                卸下
              </button>
            )}
            {owned.level < RELIC_MAX_LEVEL && (
              <button
                className="relic-action-btn upgrade"
                onClick={(e) => { e.stopPropagation(); upgradeRelic(owned.relicId, 100); }}
              >
                升级（+100经验）
              </button>
            )}
            {canAwaken && (
              <button
                className="relic-action-btn awaken"
                onClick={(e) => { e.stopPropagation(); awakenRelic(owned.relicId); }}
              >
                🌟 觉醒（消耗 {relic.awakenCost.shards} 碎片 + {relic.awakenCost.soulOrbs} 魂珠）
              </button>
            )}
          </div>
        )}

        {codexEntry.unlockedAt && (
          <div className="relic-codex-info">
            📜 图鉴：Lv.{codexEntry.levelReached} {codexEntry.awakened && '| 已觉醒'}
          </div>
        )}
      </div>
    );
  };

  const renderRelicCardCodex = (relic: Relic) => {
    const codexEntry = getRelicCodexEntry(relic.id);
    const owned = getOwnedRelic(relic.id);
    const isUnlocked = codexEntry.unlocked;

    return (
      <div
        key={relic.id}
        className={`relic-card codex ${isUnlocked ? 'unlocked' : 'locked'} ${selectedRelicId === relic.id ? 'selected' : ''}`}
        style={{ borderColor: isUnlocked ? RELIC_RARITY_COLORS[relic.rarity] : '#444' }}
        onClick={() => setSelectedRelicId(relic.id === selectedRelicId ? null : relic.id)}
      >
        <div className="relic-card-header">
          <span className="relic-icon">{isUnlocked ? relic.icon : '❓'}</span>
          <div className="relic-card-title">
            <span className="relic-name" style={{ color: isUnlocked ? RELIC_RARITY_COLORS[relic.rarity] : '#666' }}>
              {isUnlocked ? relic.name : '未解锁'}
            </span>
            <div className="relic-tags">
              <span className="relic-tag" style={{ color: isUnlocked ? RELIC_RARITY_COLORS[relic.rarity] : '#666' }}>
                {RELIC_RARITY_NAMES[relic.rarity]}
              </span>
              <span className="relic-tag" style={{ color: isUnlocked ? RELIC_ELEMENT_COLORS[relic.element] : '#666' }}>
                {RELIC_ELEMENT_NAMES[relic.element]}
              </span>
            </div>
          </div>
          {isUnlocked && codexEntry.levelReached > 0 && (
            <span className="relic-level">Lv.{codexEntry.levelReached}</span>
          )}
        </div>

        {isUnlocked ? (
          <>
            <div className="relic-card-description">{relic.description}</div>
            <div className="relic-card-lore">📖 {relic.lore}</div>
            <div className="relic-card-stats">
              {relic.baseStats.map((s, i) => (
                <span key={i} className="relic-stat-line base">{renderStatLine(s)}</span>
              ))}
              {codexEntry.awakened && relic.awakenedStats.map((s, i) => (
                <span key={`aw-${i}`} className="relic-stat-line awakened">✨ {renderStatLine(s)}</span>
              ))}
            </div>
            <div className="relic-card-drop-info">
              <span>📍 掉落: {relic.dropAreas.join('、')}</span>
              <span>⚔️ 怪物等级: {relic.dropMonsterTiers.map((t) => t === 'normal' ? '普通' : t === 'elite' ? '精英' : 'BOSS').join('、')}</span>
              <span>📊 等级要求: Lv.{relic.requiredPlayerLevel}</span>
            </div>
          </>
        ) : (
          <div className="relic-card-locked">
            <span>击败怪物解锁此神器信息</span>
            <span className="relic-drop-hint">可能掉落于：{relic.dropAreas.join('、')}</span>
          </div>
        )}

        {!owned && isUnlocked && (
          <div className="relic-synthesize-info">
            <span>💎 合成需要: {relic.awakenCost.shards * 2} 碎片</span>
          </div>
        )}
      </div>
    );
  };

  const renderRelicSetCard = (set: typeof RELIC_SETS[0]) => {
    const ownedRelicIds = ownedRelics.map((r) => r.relicId);
    const equippedIds = ownedRelics.filter((r) => r.equippedBy !== null).map((r) => r.relicId);
    const ownedCount = set.relicIds.filter((id) => ownedRelicIds.includes(id)).length;
    const equippedCount = set.relicIds.filter((id) => equippedIds.includes(id)).length;

    return (
      <div
        key={set.id}
        className={`relic-set-card ${selectedSetId === set.id ? 'selected' : ''} ${equippedCount > 0 ? 'active' : ''}`}
        onClick={() => setSelectedSetId(set.id === selectedSetId ? null : set.id)}
      >
        <div className="relic-set-header">
          <span className="relic-set-icon">{set.icon}</span>
          <div className="relic-set-title">
            <span className="relic-set-name">{set.name}</span>
            <span className="relic-set-progress">
              收集进度: {ownedCount}/{set.relicIds.length} | 已装备: {equippedCount}/{set.relicIds.length}
            </span>
          </div>
        </div>
        <div className="relic-set-description">{set.description}</div>
        <div className="relic-set-items">
          {set.relicIds.map((relicId) => {
            const relic = getRelic(relicId);
            const owned = getOwnedRelic(relicId);
            return (
              <div key={relicId} className={`relic-set-item ${owned ? 'owned' : 'not-owned'} ${owned?.equippedBy ? 'equipped' : ''}`}>
                <span>{relic?.icon || '❓'}</span>
                <span>{relic?.name || '未知'}</span>
                {owned?.equippedBy && <span className="eq-badge">✔</span>}
              </div>
            );
          })}
        </div>
        <div className="relic-set-bonuses">
          {set.setBonuses.map((bonus, i) => (
            <div key={i} className={`relic-set-bonus ${equippedCount >= bonus.count ? 'active' : ''}`}>
              <span className="relic-set-bonus-count">{bonus.count}件套:</span>
              <div className="relic-set-bonus-effects">
                {bonus.effects.map((e, j) => (
                  <span key={j} className="relic-stat-line">{renderStatLine(e)}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompanionSelector = () => (
    <div className="relic-companion-selector">
      <h4>选择伙伴装备神器</h4>
      <div className="relic-companion-list">
        <button
          className={`relic-companion-btn ${selectedCompanionId === null ? 'selected' : ''}`}
          onClick={() => setSelectedCompanionId(null)}
        >
          不选择
        </button>
        {ownedCompanions.map((c) => (
          <button
            key={c.id}
            className={`relic-companion-btn ${selectedCompanionId === c.id ? 'selected' : ''}`}
            onClick={() => setSelectedCompanionId(c.id)}
          >
            👤 {c.name}
          </button>
        ))}
      </div>
      {selectedCompanionId && (
        <div className="relic-companion-equipped">
          <h5>已装备神器</h5>
          {getEquippedRelics(selectedCompanionId).length === 0 ? (
            <span className="empty-hint">暂无装备</span>
          ) : (
            <div className="relic-companion-stats">
              {(() => {
                const total = getRelicTotalStats(selectedCompanionId);
                const setBonus = getRelicSetBonus(selectedCompanionId);
                return (
                  <>
                    <div className="relic-total-stats">
                      <h6>神器加成</h6>
                      {Object.entries(total.flat).filter(([_, v]) => v !== 0).map(([k, v]) => (
                        <span key={k} className="relic-stat-line">
                          {STAT_NAMES[k] || k} +{Math.floor(v as number)}
                        </span>
                      ))}
                      {Object.entries(total.percent).filter(([_, v]) => v !== 0).map(([k, v]) => (
                        <span key={k} className="relic-stat-line">
                          {STAT_NAMES[k] || k} +{((v as number) * 100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                    {setBonus.length > 0 && (
                      <div className="relic-set-bonus-active">
                        <h6>套装效果</h6>
                        {setBonus.map((s, i) => (
                          <span key={i} className="relic-stat-line set-bonus">{renderStatLine(s)}</span>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="relic-panel">
      <div className="panel-header">
        <h2>🏆 神器系统</h2>
        <div className="relic-codex-progress">
          图鉴进度: {codexProgress.unlocked}/{codexProgress.total} ({(codexProgress.percentage * 100).toFixed(1)}%)
        </div>
      </div>

      <div className="relic-sub-tabs">
        <button
          className={`relic-sub-tab ${activeSubTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('owned')}
        >
          🎒 我的神器 ({ownedRelics.length})
        </button>
        <button
          className={`relic-sub-tab ${activeSubTab === 'codex' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('codex')}
        >
          📜 神器图鉴 ({codexProgress.unlocked}/{codexProgress.total})
        </button>
        <button
          className={`relic-sub-tab ${activeSubTab === 'sets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sets')}
        >
          💫 共鸣套装 ({getActiveRelicSets().length}激活)
        </button>
      </div>

      <div className="relic-filters">
        {RELIC_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`relic-filter-btn ${categoryFilter === opt.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(opt.id)}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {(activeSubTab === 'owned') && renderCompanionSelector()}

      <div className="relic-content">
        {activeSubTab === 'owned' && (
          filteredOwnedRelics.length === 0 ? (
            <div className="empty-state">
              <span>暂无神器</span>
              <span className="hint">击败精英或BOSS怪物有几率获得神器</span>
            </div>
          ) : (
            <div className="relic-grid">
              {filteredOwnedRelics.map((owned) => renderRelicCardOwned(owned))}
            </div>
          )
        )}

        {activeSubTab === 'codex' && (
          <div className="relic-grid">
            {filteredCodexRelics.map((relic) => renderRelicCardCodex(relic))}
          </div>
        )}

        {activeSubTab === 'sets' && (
          <div className="relic-sets-grid">
            {RELIC_SETS.map((set) => renderRelicSetCard(set))}
          </div>
        )}
      </div>
    </div>
  );
}
