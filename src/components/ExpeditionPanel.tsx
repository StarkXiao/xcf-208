import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../game/store';
import {
  EXPEDITION_MISSIONS,
  EXPEDITION_DIFFICULTY_COLORS,
  EXPEDITION_DIFFICULTY_NAMES,
  RARITY_COLORS,
} from '../game/data';
import type { ExpeditionMission, ExpeditionCasualty } from '../game/types';

export default function ExpeditionPanel() {
  const {
    player,
    ownedCompanions,
    activeExpedition,
    startExpedition,
    advanceExpeditionStage,
    resolveExpeditionEvent,
    skipExpeditionEvent,
    completeExpedition,
    cancelExpedition,
    getExpeditionPower,
  } = useGameStore();

  const [selectedMission, setSelectedMission] = useState<ExpeditionMission | null>(null);
  const [selectedCompanionIds, setSelectedCompanionIds] = useState<string[]>([]);
  const [showSettlement, setShowSettlement] = useState(false);
  const [finalLoot, setFinalLoot] = useState<{ gold: number; exp: number; soulOrbs: number; reputation: number } | null>(null);
  const [settlementCasualties, setSettlementCasualties] = useState<ExpeditionCasualty[]>([]);
  const [settlementLog, setSettlementLog] = useState<string[]>([]);
  const [settlementMissionName, setSettlementMissionName] = useState<string>('');

  const maxCompanions = 4;

  const formationCompanionIds = useGameStore.getState().formation.slots
    .filter((s) => s.unlocked && s.companionId !== null)
    .map((s) => s.companionId!);

  const toggleCompanion = (id: string) => {
    if (selectedCompanionIds.includes(id)) {
      setSelectedCompanionIds(selectedCompanionIds.filter((cid) => cid !== id));
    } else if (selectedCompanionIds.length < maxCompanions) {
      setSelectedCompanionIds([...selectedCompanionIds, id]);
    }
  };

  const handleStartExpedition = () => {
    if (!selectedMission) return;
    startExpedition(selectedMission.id, selectedCompanionIds.length > 0 ? selectedCompanionIds : formationCompanionIds);
    setSelectedMission(null);
    setSelectedCompanionIds([]);
  };

  const handleCompleteExpedition = useCallback(() => {
    const state = useGameStore.getState();
    const active = state.activeExpedition;
    if (active) {
      setSettlementCasualties([...active.casualties]);
      setSettlementLog([...active.eventLog]);
      const mission = EXPEDITION_MISSIONS.find((m) => m.id === active.missionId);
      setSettlementMissionName(mission?.name || '远征');
    }
    const loot = completeExpedition();
    setFinalLoot(loot);
    setShowSettlement(true);
  }, [completeExpedition]);

  useEffect(() => {
    if (!activeExpedition || activeExpedition.phase !== 'progress' || activeExpedition.completed) return;
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (!state.activeExpedition || state.activeExpedition.phase !== 'progress' || state.activeExpedition.completed) return;
      advanceExpeditionStage();
    }, 3000);
    return () => clearInterval(timer);
  }, [activeExpedition?.phase, activeExpedition?.currentStage, advanceExpeditionStage]);

  useEffect(() => {
    if (activeExpedition?.completed && activeExpedition.phase === 'settlement') {
      const timer = setTimeout(() => {
        handleCompleteExpedition();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeExpedition?.completed, activeExpedition?.phase, handleCompleteExpedition]);

  const expeditionPower = selectedMission ? getExpeditionPower(selectedCompanionIds) : 0;

  if (showSettlement && finalLoot) {
    return (
      <div className="expedition-settlement">
        <div className="settlement-header">
          <span className="settlement-icon">🏁</span>
          <h3>{settlementMissionName} · 远征结算</h3>
        </div>

        <div className="settlement-result-banner">
          <span className="result-icon">🎉</span>
          <span className="result-text">远征归来！</span>
        </div>

        <div className="settlement-loot-section">
          <h4>📦 战利品</h4>
          <div className="loot-grid">
            {finalLoot.exp > 0 && (
              <div className="loot-item">
                <span className="loot-icon">⚡</span>
                <span className="loot-label">经验</span>
                <span className="loot-value exp">+{finalLoot.exp}</span>
              </div>
            )}
            {finalLoot.gold > 0 && (
              <div className="loot-item">
                <span className="loot-icon">💰</span>
                <span className="loot-label">金币</span>
                <span className="loot-value gold">+{finalLoot.gold}</span>
              </div>
            )}
            {finalLoot.soulOrbs > 0 && (
              <div className="loot-item">
                <span className="loot-icon">💎</span>
                <span className="loot-label">魂珠</span>
                <span className="loot-value soul">+{finalLoot.soulOrbs}</span>
              </div>
            )}
            {finalLoot.reputation > 0 && (
              <div className="loot-item">
                <span className="loot-icon">🏛️</span>
                <span className="loot-label">声望</span>
                <span className="loot-value rep">+{finalLoot.reputation}</span>
              </div>
            )}
          </div>
        </div>

        {settlementCasualties.length > 0 && (
          <div className="settlement-casualty-section">
            <h4>🏥 伤亡回营</h4>
            <div className="casualty-list">
              {settlementCasualties.map((c) => (
                <div
                  key={c.companionId}
                  className={`casualty-item ${c.status === 'critical' ? 'critical' : 'injured'}`}
                >
                  <span className="casualty-name">{c.companionName}</span>
                  <span className="casualty-status">
                    {c.status === 'critical' ? '🔴 重伤' : '🟡 轻伤'}
                  </span>
                  <span className="casualty-damage">-{c.hpLost} HP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="settlement-log">
          <h4>📜 远征日志</h4>
          <div className="expedition-log-list">
            {settlementLog.map((log, i) => (
              <div key={i} className="expedition-log-item">{log}</div>
            ))}
          </div>
        </div>

        <button
          className="settlement-confirm-btn"
          onClick={() => {
            setShowSettlement(false);
            setFinalLoot(null);
            setSettlementCasualties([]);
            setSettlementLog([]);
            setSettlementMissionName('');
          }}
        >
          确认结算
        </button>
      </div>
    );
  }

  if (activeExpedition) {
    const mission = EXPEDITION_MISSIONS.find((m) => m.id === activeExpedition.missionId);

    if (activeExpedition.phase === 'event' && activeExpedition.currentEvent) {
      const evt = activeExpedition.currentEvent;
      return (
        <div className="expedition-event">
          <div className="event-header">
            <span className="event-icon-large">{evt.icon}</span>
            <h3>{evt.name}</h3>
            <span className={`event-type-badge ${evt.type}`}>{evt.type}</span>
          </div>
          <p className="event-desc">{evt.description}</p>

          <div className="event-rewards-preview">
            <span className="rewards-label">可能获得的奖励：</span>
            <div className="rewards-list">
              {evt.rewards.map((r, i) => (
                <span key={i} className={`reward-preview-tag ${r.type}`}>
                  {r.type === 'gold' ? '💰' : r.type === 'exp' ? '⚡' : r.type === 'soulOrbs' ? '💎' : '❤️'}
                  {' '}{r.min > 0 ? `+${r.min}` : r.min}~{r.max > 0 ? `+${r.max}` : r.max}
                </span>
              ))}
            </div>
          </div>

          <div className="event-difficulty">
            <span>难度：</span>
            <div className="difficulty-stars">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`star ${s <= Math.ceil(evt.difficulty) ? 'filled' : ''}`}>★</span>
              ))}
            </div>
          </div>

          <div className="event-actions">
            <button
              className="event-action-btn engage"
              onClick={() => resolveExpeditionEvent(evt.id)}
            >
              ⚔️ 正面应对
            </button>
            <button
              className="event-action-btn skip"
              onClick={skipExpeditionEvent}
            >
              ⏭️ 绕道而行
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="expedition-progress">
        <div className="progress-header">
          <h3>🏔️ {mission?.name || '远征中'}</h3>
          <button className="cancel-expedition-btn" onClick={cancelExpedition}>
            ✕ 取消远征
          </button>
        </div>

        <div className="progress-stage-bar">
          <div className="stage-track">
            {Array.from({ length: activeExpedition.totalStages }).map((_, i) => (
              <div
                key={i}
                className={`stage-dot ${i < activeExpedition.currentStage ? 'completed' : ''} ${i === activeExpedition.currentStage ? 'current' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="stage-label">
            阶段 {activeExpedition.currentStage}/{activeExpedition.totalStages}
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat">
            <span>💰 已获得金币</span>
            <span className="stat-val gold">{activeExpedition.accumulatedLoot.gold}</span>
          </div>
          <div className="progress-stat">
            <span>⚡ 已获得经验</span>
            <span className="stat-val exp">{activeExpedition.accumulatedLoot.exp}</span>
          </div>
          {activeExpedition.accumulatedLoot.soulOrbs > 0 && (
            <div className="progress-stat">
              <span>💎 魂珠</span>
              <span className="stat-val soul">{activeExpedition.accumulatedLoot.soulOrbs}</span>
            </div>
          )}
          {activeExpedition.casualties.length > 0 && (
            <div className="progress-stat casualties">
              <span>🏥 伤亡</span>
              <span className="stat-val casualty">{activeExpedition.casualties.length} 人</span>
            </div>
          )}
        </div>

        <div className="progress-squad">
          <h4>🛡️ 出征编队</h4>
          <div className="squad-list">
            <div className="squad-member player-member">
              <div className="member-avatar player-avatar">🗡️</div>
              <span className="member-name">{player.name}</span>
              <span className="member-role">指挥官</span>
            </div>
            {activeExpedition.selectedCompanionIds.map((cid) => {
              const comp = ownedCompanions.find((c) => c.id === cid);
              if (!comp) return null;
              const casualty = activeExpedition.casualties.find((c) => c.companionId === cid);
              return (
                <div key={cid} className={`squad-member ${casualty ? 'has-casualty' : ''}`}>
                  <div
                    className="member-avatar"
                    style={{ borderColor: RARITY_COLORS[comp.rarity] }}
                  >
                    {comp.name[0]}
                  </div>
                  <span className="member-name">{comp.name}</span>
                  {casualty && (
                    <span className={`member-status ${casualty.status}`}>
                      {casualty.status === 'critical' ? '重伤' : '轻伤'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="progress-log">
          <h4>📜 远征日志</h4>
          <div className="expedition-log-list">
            {activeExpedition.eventLog.map((log, i) => (
              <div key={i} className="expedition-log-item">{log}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedMission) {
    return (
      <div className="expedition-formation">
        <div className="formation-header">
          <button className="back-btn" onClick={() => setSelectedMission(null)}>
            ← 返回
          </button>
          <h3>{selectedMission.icon} {selectedMission.name}</h3>
          <span
            className="difficulty-badge"
            style={{ backgroundColor: EXPEDITION_DIFFICULTY_COLORS[selectedMission.difficulty] }}
          >
            {EXPEDITION_DIFFICULTY_NAMES[selectedMission.difficulty]}
          </span>
        </div>

        <div className="formation-mission-info">
          <p className="mission-desc">{selectedMission.description}</p>
          <div className="mission-stats-grid">
            <div className="mission-stat">
              <span>⏱️ 时长</span>
              <span>{selectedMission.durationSeconds}秒</span>
            </div>
            <div className="mission-stat">
              <span>📍 阶段</span>
              <span>{selectedMission.stages}阶段</span>
            </div>
            <div className="mission-stat">
              <span>⚡ 基础经验</span>
              <span>{selectedMission.baseExp}</span>
            </div>
            <div className="mission-stat">
              <span>💰 基础金币</span>
              <span>{selectedMission.baseGold}</span>
            </div>
            <div className="mission-stat">
              <span>💎 魂珠几率</span>
              <span>{(selectedMission.soulOrbChance * 100).toFixed(0)}%</span>
            </div>
            <div className="mission-stat">
              <span>⚔️ 战力</span>
              <span className={expeditionPower < selectedMission.baseExp / 2 ? 'low-power' : ''}>{expeditionPower}</span>
            </div>
          </div>
        </div>

        <div className="formation-companions">
          <h4>🤝 选择出征伙伴（最多{maxCompanions}人）</h4>
          <p className="formation-hint">已选 {selectedCompanionIds.length}/{maxCompanions}（未选择时默认使用编队伙伴）</p>
          {ownedCompanions.length === 0 ? (
            <p className="no-companions-hint">暂无伙伴，可先在伙伴面板招募</p>
          ) : (
            <div className="formation-companion-grid">
              {ownedCompanions.map((comp) => {
                const isSelected = selectedCompanionIds.includes(comp.id);
                const effectiveAtk = useGameStore.getState().getCompanionEffectiveAttack(comp);
                const effectiveDef = useGameStore.getState().getCompanionEffectiveDefense(comp);
                return (
                  <button
                    key={comp.id}
                    className={`formation-companion-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCompanion(comp.id)}
                    style={{ borderColor: isSelected ? RARITY_COLORS[comp.rarity] : 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="formation-avatar"
                      style={{ backgroundColor: RARITY_COLORS[comp.rarity] }}
                    >
                      {comp.name[0]}
                    </div>
                    <div className="formation-comp-info">
                      <span className="formation-comp-name">{comp.name} {'★'.repeat(Math.min(comp.stars, 5))}</span>
                      <span className="formation-comp-stats">
                        ⚔️{effectiveAtk} 🛡️{effectiveDef}
                      </span>
                    </div>
                    {isSelected && <span className="formation-check">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          className="expedition-depart-btn"
          onClick={handleStartExpedition}
          disabled={player.stats.level < selectedMission.minLevel}
        >
          🏔️ 出征！
        </button>
        {player.stats.level < selectedMission.minLevel && (
          <p className="level-warning">⚠️ 需要等级 {selectedMission.minLevel} 才能出征</p>
        )}
      </div>
    );
  }

  return (
    <div className="expedition-entrance">
      <div className="expedition-entrance-header">
        <h3>🏔️ 英雄远征</h3>
        <p className="expedition-subtitle">率领伙伴，深入未知领域，赢取丰厚战利品</p>
      </div>

      <div className="expedition-mission-list">
        {EXPEDITION_MISSIONS.map((mission) => {
          const unlocked = player.stats.level >= mission.minLevel;
          return (
            <button
              key={mission.id}
              className={`mission-card ${!unlocked ? 'locked' : ''}`}
              onClick={() => unlocked && setSelectedMission(mission)}
              disabled={!unlocked}
            >
              <div
                className="mission-card-bg"
                style={{ background: `linear-gradient(135deg, ${mission.bgColor}, ${mission.bgColor}dd)` }}
              />
              <div className="mission-card-content">
                <div className="mission-card-top">
                  <span className="mission-icon">{mission.icon}</span>
                  <span
                    className="difficulty-tag"
                    style={{ color: EXPEDITION_DIFFICULTY_COLORS[mission.difficulty] }}
                  >
                    {EXPEDITION_DIFFICULTY_NAMES[mission.difficulty]}
                  </span>
                </div>
                <h4 className="mission-name">{mission.name}</h4>
                <p className="mission-brief">{mission.description}</p>
                <div className="mission-card-stats">
                  <span>⚡ {mission.baseExp}</span>
                  <span>💰 {mission.baseGold}</span>
                  <span>💎 {(mission.soulOrbChance * 100).toFixed(0)}%</span>
                </div>
                {!unlocked && (
                  <div className="mission-lock">
                    🔒 需要等级 {mission.minLevel}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
