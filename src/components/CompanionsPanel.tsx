import { useState } from 'react';
import { useGameStore } from '../game/store';
import { COMPANIONS, RARITY_COLORS, RARITY_NAMES, BONDS, STAR_UP_CONFIGS, FORMATION_SLOT_CONFIG, RECRUIT_POOLS, getShardConfig, EQUIPMENT_RARITY_COLORS, EQUIPMENT_RARITY_NAMES, EQUIPMENT_SLOT_NAMES } from '../game/data';
import { AFFINITY_LEVEL_NAMES, AFFINITY_LEVEL_COLORS } from '../game/types';
import type { RecruitPoolType } from '../game/types';

export default function CompanionsPanel() {
  const {
    ownedCompanions,
    player,
    canRecruitCompanion,
    mapAreas,
    formation,
    setFormationSlot,
    getCompanionEffectiveAttack,
    getCompanionEffectiveDefense,
    getBondBonus,
    getCompanionAffinity,
    getCompanionAffinityBonusMultiplier,
    recruitPullCounters,
    lastRecruitResults,
    getShardCount,
    canSynthesizeCompanion,
    synthesizeCompanion,
    getCodexEntry,
    getCodexProgress,
    recruitFromPool,
    getDiscountedRecruitCost,
    clearLastRecruitResults,
    getEquippedItems,
    companionEquipments,
    equipmentInventory,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<'formation' | 'owned' | 'bonds' | 'recruit' | 'codex'>('recruit');
  const [showRecruitResults, setShowRecruitResults] = useState(false);

  const affinityMultiplier = getCompanionAffinityBonusMultiplier();
  const codexProgress = getCodexProgress();

  const isOwned = (companionId: string) => {
    return ownedCompanions.some((c) => c.id === companionId);
  };

  const formationAttack = ownedCompanions
    .filter((c) => formation.slots.some((s) => s.companionId === c.id))
    .reduce((sum, c) => sum + getCompanionEffectiveAttack(c), 0);
  const formationDefense = ownedCompanions
    .filter((c) => formation.slots.some((s) => s.companionId === c.id))
    .reduce((sum, c) => sum + getCompanionEffectiveDefense(c), 0);
  const bondBonus = getBondBonus();

  const activeBonds = BONDS.filter((b) => formation.activeBondIds.includes(b.id));

  const handleFormationSlotClick = (slotIndex: number) => {
    const slot = formation.slots.find((s) => s.index === slotIndex);
    if (!slot || !slot.unlocked) return;
    if (slot.companionId !== null) {
      setFormationSlot(slotIndex, null);
    }
  };

  const handleCompanionDragToSlot = (slotIndex: number, companionId: string) => {
    setFormationSlot(slotIndex, companionId);
  };

  const handleRecruit = (poolType: RecruitPoolType, count: number) => {
    const success = recruitFromPool(poolType, count);
    if (success) {
      setShowRecruitResults(true);
    }
  };

  const renderRecruitResults = () => {
    if (!lastRecruitResults || !showRecruitResults) return null;

    return (
      <div className="recruit-results-overlay" onClick={() => { setShowRecruitResults(false); clearLastRecruitResults(); }}>
        <div className="recruit-results-modal" onClick={(e) => e.stopPropagation()}>
          <div className="recruit-results-header">
            <h3>🎉 招募结果</h3>
            <button className="close-btn" onClick={() => { setShowRecruitResults(false); clearLastRecruitResults(); }}>✕</button>
          </div>
          <div className="recruit-results-body">
            <div className="recruit-results-grid">
              {lastRecruitResults.map((result, idx) => {
                const companion = COMPANIONS.find((c) => c.id === result.companionId);
                if (!companion) return null;
                return (
                  <div
                    key={idx}
                    className="recruit-result-card"
                    style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                  >
                    {result.isNew && <span className="new-badge">NEW!</span>}
                    <div
                      className="result-avatar"
                      style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '40' }}
                    >
                      {companion.name[0]}
                    </div>
                    <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>{companion.name}</h5>
                    <p className="result-rarity">{RARITY_NAMES[companion.rarity]}</p>
                    <p className="result-shards">💎 碎片 ×{result.shards}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            className="confirm-btn"
            onClick={() => { setShowRecruitResults(false); clearLastRecruitResults(); }}
          >
            确定
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="companions-panel">
      <div className="companions-header">
        <h3>🤝 伙伴成长</h3>
        <p className="companions-gold">💰 {player.stats.gold.toLocaleString()}</p>
      </div>

      <div className="companions-subtabs">
        <button
          className={`subtab-btn ${activeSubTab === 'recruit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('recruit')}
        >
          🎲 碎片招募
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'formation' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('formation')}
        >
          ⚔️ 编队
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('owned')}
        >
          💖 我的伙伴
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'codex' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('codex')}
        >
          📖 图鉴 ({codexProgress.unlocked}/{codexProgress.total})
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'bonds' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bonds')}
        >
          🔗 羁绊
        </button>
      </div>

      {activeSubTab === 'recruit' && (
        <div className="recruit-section">
          <div className="recruit-pools">
            <h4>🎲 碎片招募池</h4>
            <p className="recruit-hint">抽取伙伴碎片，集齐后可合成伙伴</p>
            <div className="recruit-pools-grid">
              {RECRUIT_POOLS.map((pool) => {
                const singleCost = getDiscountedRecruitCost(pool.singleCost);
                const tenCost = getDiscountedRecruitCost(pool.tenCost);
                const canSingle = player.stats.gold >= singleCost;
                const canTen = player.stats.gold >= tenCost;
                const counter = recruitPullCounters[pool.type] || 0;
                const guaranteeProgress = pool.guaranteedRarity
                  ? counter % pool.guaranteedRarity.pullCount
                  : 0;
                const pullsToGuarantee = pool.guaranteedRarity
                  ? pool.guaranteedRarity.pullCount - guaranteeProgress
                  : 0;

                return (
                  <div key={pool.type} className="recruit-pool-card">
                    <div className="pool-icon">{pool.icon}</div>
                    <h5 className="pool-name">{pool.name}</h5>
                    <p className="pool-desc">{pool.description}</p>
                    <div className="pool-rarity-preview">
                      {Object.entries(pool.rarityWeights).map(([rarity, weight]) => (
                        weight > 0 && (
                          <span
                            key={rarity}
                            className="rarity-weight-tag"
                            style={{ color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] }}
                          >
                            {RARITY_NAMES[rarity as keyof typeof RARITY_NAMES]} {weight}%
                          </span>
                        )
                      ))}
                    </div>
                    {pool.guaranteedRarity && (
                      <div className="pool-guarantee">
                        <span style={{ color: RARITY_COLORS[pool.guaranteedRarity.rarity] }}>
                          ⚡ 每 {pool.guaranteedRarity.pullCount} 抽必出 {RARITY_NAMES[pool.guaranteedRarity.rarity]}以上
                        </span>
                        <span className="guarantee-progress">
                          进度: {guaranteeProgress}/{pool.guaranteedRarity.pullCount}
                          {pullsToGuarantee > 0 && ` (再${pullsToGuarantee}抽)`}
                        </span>
                      </div>
                    )}
                    <div className="pool-actions">
                      <button
                        className={`recruit-btn single ${!canSingle ? 'disabled' : ''}`}
                        onClick={() => handleRecruit(pool.type, 1)}
                        disabled={!canSingle}
                      >
                        单抽
                        <span className="recruit-cost">💰 {singleCost.toLocaleString()}</span>
                      </button>
                      <button
                        className={`recruit-btn ten ${!canTen ? 'disabled' : ''}`}
                        onClick={() => handleRecruit(pool.type, 10)}
                        disabled={!canTen}
                      >
                        十连抽
                        <span className="recruit-cost">💰 {tenCost.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="synthesize-section">
            <h4>✨ 碎片合成</h4>
            <p className="synthesize-hint">集齐足够碎片后可合成伙伴，消耗金币</p>
            <div className="synthesize-list">
              {COMPANIONS.map((companion) => {
                const owned = isOwned(companion.id);
                const shardConfig = getShardConfig(companion.rarity);
                const shardCount = getShardCount(companion.id);
                const canSynth = canSynthesizeCompanion(companion.id);
                const shardCost = shardConfig.shardsNeeded;
                const goldCost = getDiscountedRecruitCost(shardConfig.recruitCost);
                const progress = Math.min(100, (shardCount / shardCost) * 100);
                const codexUnlocked = getCodexEntry(companion.id).unlocked;

                const areaName = companion.areaId
                  ? mapAreas.find((a) => a.id === companion.areaId)?.name
                  : null;
                const canRecruit = canRecruitCompanion(companion);
                const affinity = getCompanionAffinity(companion.id);
                const canBypassRep = companion.minReputationLevel && companion.minReputationLevel > 0 && affinity.value >= 30;
                const isHostile = affinity.value <= -50;
                const repLocked = !canRecruit;

                return (
                  <div
                    key={companion.id}
                    className={`synth-card ${owned ? 'owned' : ''} ${!codexUnlocked ? 'locked' : ''}`}
                    style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                  >
                    <div
                      className="synth-avatar"
                      style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                    >
                      <span>{codexUnlocked ? companion.name[0] : '?'}</span>
                    </div>
                    <div className="synth-info">
                      <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                        {codexUnlocked ? companion.name : '???'}
                      </h5>
                      <p className="synth-rarity">
                        {RARITY_NAMES[companion.rarity]}
                        {codexUnlocked && ` · ${companion.race} ${companion.class}`}
                      </p>
                      {codexUnlocked && <p className="synth-desc">{companion.description}</p>}
                      {areaName && codexUnlocked && (
                        <p className="companion-area">📍 {areaName}</p>
                      )}
                      {repLocked && codexUnlocked && !canBypassRep && (
                        <p className="companion-rep-requirement">
                          🔒 声望未达标
                        </p>
                      )}
                      {isHostile && codexUnlocked && (
                        <p className="companion-hostile">💔 敌对状态，无法合成</p>
                      )}
                      <div className="synth-stats">
                        <span>⚔️ {companion.attack}</span>
                        <span>🛡️ {companion.defense}</span>
                      </div>
                      <div className="shard-progress">
                        <div className="shard-progress-bar">
                          <div
                            className="shard-progress-fill"
                            style={{ width: `${progress}%`, backgroundColor: RARITY_COLORS[companion.rarity] }}
                          />
                        </div>
                        <span className="shard-count-text">
                          💎 {shardCount} / {shardCost}
                        </span>
                      </div>
                    </div>
                    <div className="synth-action">
                      {owned ? (
                        <button className="owned-btn" disabled>
                          ✅ 已拥有
                        </button>
                      ) : (
                        <button
                          className={`synth-btn ${!canSynth ? 'disabled' : ''}`}
                          onClick={() => synthesizeCompanion(companion.id)}
                          disabled={!canSynth}
                        >
                          <span>✨ 合成</span>
                          <span className="synth-cost">
                            💎{shardCost} 💰{goldCost.toLocaleString()}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'formation' && (
        <div className="formation-section">
          <h4>⚔️ 战斗编队</h4>
          <p className="formation-hint">
            编队中的伙伴将在战斗中为你出战，已解锁 {formation.slots.filter((s) => s.unlocked).length}/{formation.slots.length} 位
          </p>
          <div className="formation-slots-grid">
            {FORMATION_SLOT_CONFIG.map((cfg) => {
              const slot = formation.slots.find((s) => s.index === cfg.index);
              const isUnlocked = slot?.unlocked ?? false;
              const companion = slot?.companionId
                ? ownedCompanions.find((c) => c.id === slot.companionId)
                : null;

              return (
                <div
                  key={cfg.index}
                  className={`formation-slot ${!isUnlocked ? 'locked' : ''} ${companion ? 'filled' : 'empty'}`}
                  onClick={() => isUnlocked && handleFormationSlotClick(cfg.index)}
                >
                  {!isUnlocked ? (
                    <>
                      <span className="slot-lock-icon">🔒</span>
                      <span className="slot-unlock-level">Lv.{cfg.unlockLevel}</span>
                    </>
                  ) : companion ? (
                    <>
                      <div
                        className="slot-avatar"
                        style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '40', borderColor: RARITY_COLORS[companion.rarity] }}
                      >
                        {companion.name[0]}
                      </div>
                      <span className="slot-name">{companion.name}</span>
                      <span className="slot-stars">
                        {Array.from({ length: companion.stars }).map((_, i) => (
                          <span key={i} className="star-filled">★</span>
                        ))}
                      </span>
                      <div className="slot-drop-hint">点击移除</div>
                    </>
                  ) : (
                    <>
                      <span className="slot-empty-icon">+</span>
                      <span className="slot-empty-text">空位</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="formation-stats-summary">
            <span>⚔️ 编队攻击: {formationAttack + bondBonus.attack}{bondBonus.attack > 0 ? ` (+${bondBonus.attack}羁绊)` : ''}{affinityMultiplier !== 1.0 ? ` ×${affinityMultiplier.toFixed(2)}好感` : ''}</span>
            <span>🛡️ 编队防御: {formationDefense + bondBonus.defense}{bondBonus.defense > 0 ? ` (+${bondBonus.defense}羁绊)` : ''}{affinityMultiplier !== 1.0 ? ` ×${affinityMultiplier.toFixed(2)}好感` : ''}</span>
          </div>

          {activeBonds.length > 0 && (
            <div className="active-bonds-section">
              <h5>🔗 激活羁绊</h5>
              <div className="active-bonds-list">
                {activeBonds.map((bond) => {
                  const members = ownedCompanions.filter((c) => bond.memberIds.includes(c.id));
                  const minStars = Math.min(...members.map((m) => m.stars));
                  return (
                    <div key={bond.id} className="active-bond-card">
                      <span className="bond-icon">{bond.icon}</span>
                      <div className="bond-info">
                        <span className="bond-name">{bond.name} ({minStars}星)</span>
                        <span className="bond-desc">{bond.description}</span>
                        <div className="bond-bonus-list">
                          {bond.bonusPerStar.map((b, i) => (
                            <span key={i} className="bond-bonus-tag">
                              {b.type === 'attack' ? '⚔️' : b.type === 'defense' ? '🛡️' : b.type === 'hp' ? '❤️' : b.type === 'speed' ? '👟' : '🍀'}
                              +{b.value * minStars}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'owned' && ownedCompanions.length > 0 && (
        <div className="owned-companions-section">
          <h4>💖 我的伙伴</h4>
          <p className="companions-hint">点击伙伴可加入编队空位 | 战斗可获得升星经验</p>
          <div className="owned-companions-list">
            {ownedCompanions.map((companion) => {
              const config = STAR_UP_CONFIGS.find((c) => c.rarity === companion.rarity) || STAR_UP_CONFIGS[0];
              const isInFormation = formation.slots.some((s) => s.companionId === companion.id);
              const effectiveAtk = getCompanionEffectiveAttack(companion);
              const effectiveDef = getCompanionEffectiveDefense(companion);
              const bond = companion.bondId ? BONDS.find((b) => b.id === companion.bondId) : null;
              const isMaxStar = companion.stars >= config.maxStars;
              const starProgress = isMaxStar ? 1 : companion.starExp / companion.starExpToNext;
              const shardCount = getShardCount(companion.id);

              const emptySlot = formation.slots.find((s) => s.unlocked && s.companionId === null);

              return (
                <div
                  key={companion.id}
                  className={`companion-card owned ${isInFormation ? 'in-formation' : ''}`}
                  style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                  onClick={() => {
                    if (!isInFormation && emptySlot) {
                      handleCompanionDragToSlot(emptySlot.index, companion.id);
                    }
                  }}
                >
                  <div
                    className="companion-avatar"
                    style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                  >
                    <span>{companion.name[0]}</span>
                  </div>
                  <div className="companion-info">
                    <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                      {companion.name}
                      {isInFormation && <span className="in-formation-badge">⚔️ 出战</span>}
                    </h5>
                    <p className="companion-rarity">
                      {RARITY_NAMES[companion.rarity]} · {companion.race} {companion.class}
                    </p>
                    <div className="companion-stars">
                      {Array.from({ length: config.maxStars }).map((_, i) => (
                        <span key={i} className={`comp-star ${i < companion.stars ? 'filled' : ''}`}>★</span>
                      ))}
                      <span className="star-level">{companion.stars}/{config.maxStars}</span>
                    </div>
                    {!isMaxStar && (
                      <div className="star-exp-bar">
                        <div className="star-exp-fill" style={{ width: `${starProgress * 100}%` }} />
                        <span className="star-exp-text">{companion.starExp}/{companion.starExpToNext}</span>
                      </div>
                    )}
                    {isMaxStar && <span className="star-max-label">MAX</span>}
                    <div className="companion-stats">
                      <span>Lv.{companion.level}</span>
                      <span>⚔️ {effectiveAtk}</span>
                      <span>🛡️ {effectiveDef}</span>
                    </div>
                    {(() => {
                      const affinity = getCompanionAffinity(companion.id);
                      return (
                        <div className="companion-affinity-info">
                          <span className="affinity-label">💛 好感度:</span>
                          <span className="affinity-value" style={{ color: AFFINITY_LEVEL_COLORS[affinity.level] }}>
                            {AFFINITY_LEVEL_NAMES[affinity.level]} ({affinity.value})
                          </span>
                        </div>
                      );
                    })()}
                    <div className="shard-info-owned">
                      <span>💎 碎片: {shardCount}</span>
                    </div>
                    {bond && (
                      <div className="companion-bond-info">
                        <span className="bond-tag">{bond.icon} {bond.name}</span>
                      </div>
                    )}
                    {(() => {
                      const eqItems = getEquippedItems(companion.id);
                      if (eqItems.length === 0) return null;
                      return (
                        <div className="companion-equipment-info">
                          <span className="eq-label">🛡️ 装备:</span>
                          {eqItems.map((eq) => (
                            <span
                              key={eq.uid}
                              className="eq-mini-tag"
                              style={{ color: EQUIPMENT_RARITY_COLORS[eq.rarity], borderColor: EQUIPMENT_RARITY_COLORS[eq.rarity] }}
                            >
                              {eq.icon} {eq.name}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'codex' && (
        <div className="codex-section">
          <h4>📖 伙伴图鉴</h4>
          <div className="codex-progress-header">
            <div className="codex-progress-bar">
              <div
                className="codex-progress-fill"
                style={{ width: `${codexProgress.percentage}%` }}
              />
            </div>
            <span className="codex-progress-text">
              收集进度: {codexProgress.unlocked} / {codexProgress.total} ({codexProgress.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="codex-list">
            {COMPANIONS.map((companion) => {
              const entry = getCodexEntry(companion.id);
              const owned = isOwned(companion.id);
              const shardCount = getShardCount(companion.id);
              const shardConfig = getShardConfig(companion.rarity);
              const shardCost = shardConfig.shardsNeeded;

              return (
                <div
                  key={companion.id}
                  className={`codex-card ${!entry.unlocked ? 'locked' : ''} ${owned ? 'owned' : ''}`}
                  style={{ borderColor: entry.unlocked ? RARITY_COLORS[companion.rarity] : '#374151' }}
                >
                  <div
                    className="codex-avatar"
                    style={{
                      backgroundColor: entry.unlocked ? RARITY_COLORS[companion.rarity] + '30' : '#1f2937',
                      filter: entry.unlocked ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    <span>{entry.unlocked ? companion.name[0] : '?'}</span>
                  </div>
                  <div className="codex-info">
                    <h5 style={{ color: entry.unlocked ? RARITY_COLORS[companion.rarity] : '#6b7280' }}>
                      {entry.unlocked ? companion.name : '???'}
                    </h5>
                    <p className="codex-rarity">
                      {RARITY_NAMES[companion.rarity]}
                      {entry.unlocked && ` · ${companion.race} ${companion.class}`}
                    </p>
                    {entry.unlocked && (
                      <p className="codex-desc">{companion.description}</p>
                    )}
                    {!entry.unlocked && (
                      <p className="codex-locked">🔒 尚未解锁</p>
                    )}
                    <div className="codex-stats">
                      {entry.unlocked ? (
                        <>
                          <span>⚔️ {companion.attack}</span>
                          <span>🛡️ {companion.defense}</span>
                        </>
                      ) : (
                        <>
                          <span>⚔️ ???</span>
                          <span>🛡️ ???</span>
                        </>
                      )}
                    </div>
                    <div className="codex-shards">
                      <span>💎 碎片: {shardCount} / {shardCost}</span>
                      {owned && <span className="codex-owned-badge">✅ 已拥有</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'bonds' && (
        <div className="bonds-overview-section">
          <h4>🔗 羁绊图鉴</h4>
          <div className="bonds-overview-list">
            {BONDS.map((bond) => {
              const allOwned = bond.memberIds.every((id) => isOwned(id));
              const inFormation = allOwned && formation.activeBondIds.includes(bond.id);
              return (
                <div key={bond.id} className={`bond-overview-card ${inFormation ? 'active' : ''} ${!allOwned ? 'incomplete' : ''}`}>
                  <span className="bond-ov-icon">{bond.icon}</span>
                  <div className="bond-ov-info">
                    <span className="bond-ov-name">{bond.name}</span>
                    <span className="bond-ov-desc">{bond.description}</span>
                    <div className="bond-ov-members">
                      {bond.memberIds.map((mid) => {
                        const c = COMPANIONS.find((cc) => cc.id === mid);
                        const ownedC = isOwned(mid);
                        return c ? (
                          <span key={mid} className={`bond-member-tag ${ownedC ? 'owned' : 'missing'}`}>
                            {c.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <div className="bond-ov-bonus">
                      {bond.bonusPerStar.map((b, i) => (
                        <span key={i} className="bond-bonus-preview">
                          {b.type === 'attack' ? '⚔️' : b.type === 'defense' ? '🛡️' : b.type === 'hp' ? '❤️' : b.type === 'speed' ? '👟' : '🍀'}
                          +{b.value}/星
                        </span>
                      ))}
                    </div>
                    {inFormation && <span className="bond-active-label">✅ 已激活</span>}
                    {!allOwned && <span className="bond-incomplete-label">🔒 需集齐伙伴</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {renderRecruitResults()}
    </div>
  );
}
