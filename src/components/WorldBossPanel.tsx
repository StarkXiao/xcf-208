import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../game/store';
import { WORLD_BOSSES, WORLD_BOSS_ROTATION, WORLD_BOSS_REVIVE_COST_GOLD, WORLD_BOSS_REVIVE_COST_SOUL_ORBS, WORLD_BOSS_MAX_REVIVES } from '../game/data';

type WorldBossTab = 'battle' | 'ranking' | 'rewards' | 'history';

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function WorldBossPanel() {
  const {
    player,
    worldBossState,
    getCurrentWorldBoss,
    getWorldBossSession,
    startWorldBossSession,
    dealWorldBossDamage,
    reviveInWorldBoss,
    canReviveInWorldBoss,
    checkWorldBossRotation,
    claimWorldBossRewards,
    canClaimWorldBossRewards,
    getPlayerWorldBossRank,
    getPlayerDamagePercent,
    getWorldBossPhaseInfo,
    getWorldBossActiveMechanic,
    getWorldBossTimeRemaining,
    isWorldBossAvailable,
    tickWorldBoss,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<WorldBossTab>('battle');
  const [lastDamage, setLastDamage] = useState<number>(0);
  const [showDamagePopup, setShowDamagePopup] = useState(false);
  const [isCrit, setIsCrit] = useState(false);
  const [autoAttack, setAutoAttack] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const autoAttackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const boss = getCurrentWorldBoss();
  const session = getWorldBossSession();
  const phaseInfo = getWorldBossPhaseInfo();
  const activeMechanic = getWorldBossActiveMechanic();
  const playerRank = getPlayerWorldBossRank();
  const damagePercent = getPlayerDamagePercent();
  const timeRemaining = getWorldBossTimeRemaining();
  const available = isWorldBossAvailable();
  const canRevive = canReviveInWorldBoss();
  const canClaim = canClaimWorldBossRewards();

  const hpPercent = session ? (session.currentHp / session.maxHp) * 100 : 0;

  useEffect(() => {
    rotationRef.current = setInterval(() => {
      checkWorldBossRotation();
    }, 5000);
    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
    };
  }, [checkWorldBossRotation]);

  useEffect(() => {
    if (available && session && !session.isDead && !session.isDefeated) {
      tickRef.current = setInterval(() => {
        tickWorldBoss();
      }, 2000);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [available, session?.isDead, session?.isDefeated, tickWorldBoss]);

  useEffect(() => {
    if (autoAttack && available && session && !session.isDead && !session.isDefeated) {
      autoAttackRef.current = setInterval(() => {
        const dmg = dealWorldBossDamage();
        if (dmg > 0) {
          setLastDamage(dmg);
          setIsCrit(dmg > (player.stats.attack + 50) * 1.3);
          setShowDamagePopup(true);
          setTimeout(() => setShowDamagePopup(false), 600);
        }
      }, 1000);
      return () => {
        if (autoAttackRef.current) clearInterval(autoAttackRef.current);
      };
    }
    return () => {
      if (autoAttackRef.current) clearInterval(autoAttackRef.current);
    };
  }, [autoAttack, available, session?.isDead, session?.isDefeated, dealWorldBossDamage, player.stats.attack]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getWorldBossTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [getWorldBossTimeRemaining]);

  const handleAttack = useCallback(() => {
    if (!available || !session || session.isDead || session.isDefeated) return;
    const dmg = dealWorldBossDamage();
    if (dmg > 0) {
      setLastDamage(dmg);
      setIsCrit(dmg > (player.stats.attack + 50) * 1.3);
      setShowDamagePopup(true);
      setTimeout(() => setShowDamagePopup(false), 600);
    }
  }, [available, session, dealWorldBossDamage, player.stats.attack]);

  const handleRevive = () => {
    reviveInWorldBoss();
  };

  const handleClaim = () => {
    claimWorldBossRewards();
  };

  const handleStart = () => {
    if (!worldBossState.isActive) {
      checkWorldBossRotation();
    } else {
      startWorldBossSession();
    }
  };

  const nextBossName = () => {
    const idx = worldBossState.rotationIndex % WORLD_BOSS_ROTATION.bossIds.length;
    const bossData = WORLD_BOSSES.find((b) => b.id === WORLD_BOSS_ROTATION.bossIds[idx]);
    return bossData ? `${bossData.icon} ${bossData.name}` : '???';
  };

  const tabs: { key: WorldBossTab; label: string; icon: string }[] = [
    { key: 'battle', label: '战斗', icon: '⚔️' },
    { key: 'ranking', label: '排行', icon: '🏆' },
    { key: 'rewards', label: '奖励', icon: '🎁' },
    { key: 'history', label: '记录', icon: '📜' },
  ];

  const renderWaitingState = () => (
    <div className="worldboss-waiting">
      <div className="worldboss-waiting-icon">⏳</div>
      <h3>世界Boss轮替中</h3>
      <p>下一位Boss即将降临...</p>
      <div className="worldboss-countdown">
        <span className="countdown-time">{formatTime(countdown)}</span>
      </div>
      <div className="worldboss-next-info">
        <span>下一个: {nextBossName()}</span>
      </div>
      {!worldBossState.isActive && (
        <button className="worldboss-start-btn" onClick={handleStart}>
          ⚔️ 立即召唤Boss
        </button>
      )}
    </div>
  );

  const renderBattleTab = () => {
    if (!boss || !session) return renderWaitingState();

    return (
      <div className="worldboss-battle">
        <div className="worldboss-header" style={{ borderColor: boss.color }}>
          <div className="worldboss-icon" style={{ backgroundColor: boss.color + '30' }}>
            {boss.icon}
          </div>
          <div className="worldboss-info">
            <h3 style={{ color: boss.color }}>{boss.name}</h3>
            <p className="worldboss-desc">{boss.description}</p>
          </div>
          <div className="worldboss-timer">
            <span className="timer-label">剩余时间</span>
            <span className="timer-value" style={{ color: countdown < 300000 ? '#ef4444' : '#fbbf24' }}>
              {formatTime(countdown)}
            </span>
          </div>
        </div>

        {phaseInfo && (
          <div className="worldboss-phase" style={{ backgroundColor: phaseInfo.color + '20', borderColor: phaseInfo.color }}>
            <span className="phase-name" style={{ color: phaseInfo.color }}>{phaseInfo.name}</span>
            <span className="phase-desc">{phaseInfo.description}</span>
          </div>
        )}

        {activeMechanic && (
          <div className="worldboss-mechanic" style={{ borderColor: '#ef4444' }}>
            <span className="mechanic-icon">{activeMechanic.icon}</span>
            <span className="mechanic-name">{activeMechanic.name}</span>
            <span className="mechanic-desc">{activeMechanic.description}</span>
          </div>
        )}

        <div className="worldboss-hp-section">
          <div className="worldboss-hp-label">
            <span>❤️ {formatNumber(session.currentHp)} / {formatNumber(session.maxHp)}</span>
            <span>⏱️ {formatTime(timeRemaining)}</span>
            <span>{hpPercent.toFixed(1)}%</span>
          </div>
          <div className="worldboss-hp-bar">
            <div
              className="worldboss-hp-fill"
              style={{
                width: `${hpPercent}%`,
                backgroundColor: hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#f59e0b' : '#ef4444',
              }}
            />
            {boss.phaseThresholds.map((phase, idx) => (
              <div
                key={idx}
                className="worldboss-phase-marker"
                style={{ left: `${phase.hpPercent * 100}%`, borderColor: phase.color }}
                title={phase.name}
              />
            ))}
          </div>
        </div>

        <div className="worldboss-stats-row">
          <div className="worldboss-stat">
            <span className="stat-label">⚔️ 攻击</span>
            <span className="stat-value">{boss.attack * (phaseInfo ? (boss.phaseThresholds[session.phaseIndex]?.attackMultiplier || 1) : 1)}</span>
          </div>
          <div className="worldboss-stat">
            <span className="stat-label">🛡️ 防御</span>
            <span className="stat-value">{boss.defense * (phaseInfo ? (boss.phaseThresholds[session.phaseIndex]?.defenseMultiplier || 1) : 1)}</span>
          </div>
          <div className="worldboss-stat">
            <span className="stat-label">🗺️ 关联地图</span>
            <span className="stat-value">
              {useGameStore.getState().mapAreas.find((a) => a.id === boss.areaId)?.name || boss.areaId}
            </span>
          </div>
        </div>

        <div className="worldboss-player-stats">
          <div className="player-damage-stat">
            <span>💀 你的伤害</span>
            <span className="damage-value">{formatNumber(session.playerDamage)}</span>
          </div>
          <div className="player-rank-stat">
            <span>🏆 你的排名</span>
            <span className="rank-value">#{playerRank}</span>
          </div>
          <div className="player-damage-percent">
            <span>📊 伤害占比</span>
            <span className="percent-value">{(damagePercent * 100).toFixed(2)}%</span>
          </div>
          <div className="player-deaths">
            <span>💀 死亡次数</span>
            <span className="deaths-value">{session.playerDeaths}</span>
          </div>
        </div>

        {session.isDefeated ? (
          <div className="worldboss-defeated">
            <h3>🎉 Boss已被击败！</h3>
            {!session.rewardsClaimed && canClaim && (
              <button className="worldboss-claim-btn" onClick={handleClaim}>
                🎁 领取奖励
              </button>
            )}
            {session.rewardsClaimed && <p className="rewards-claimed">✅ 奖励已领取</p>}
          </div>
        ) : session.isDead ? (
          <div className="worldboss-dead">
            <h3>💀 你已阵亡</h3>
            <p>复活次数: {session.reviveCount} / {WORLD_BOSS_MAX_REVIVES}</p>
            {canRevive ? (
              <button className="worldboss-revive-btn" onClick={handleRevive}>
                💫 复活 (💰{WORLD_BOSS_REVIVE_COST_GOLD} 💎{WORLD_BOSS_REVIVE_COST_SOUL_ORBS})
              </button>
            ) : (
              <p className="revive-unavailable">
                {session.reviveCount >= WORLD_BOSS_MAX_REVIVES ? '已达最大复活次数' : '资源不足，无法复活'}
              </p>
            )}
          </div>
        ) : (
          <div className="worldboss-actions">
            <button className="worldboss-attack-btn" onClick={handleAttack} disabled={!available}>
              ⚔️ 攻击
            </button>
            <button
              className={`worldboss-auto-btn ${autoAttack ? 'active' : ''}`}
              onClick={() => setAutoAttack(!autoAttack)}
              disabled={!available}
            >
              {autoAttack ? '⏸️ 停止' : '🔄 自动'}
            </button>
            {showDamagePopup && (
              <div className={`damage-popup ${isCrit ? 'critical' : ''}`}>
                {isCrit && '💥 '}{formatNumber(lastDamage)}
              </div>
            )}
          </div>
        )}

        {session.damageLog.length > 0 && (
          <div className="worldboss-damage-log">
            <h4>📜 伤害记录</h4>
            <div className="damage-log-list">
              {session.damageLog.slice(-10).reverse().map((log, idx) => (
                <div key={idx} className={`damage-log-item ${log.isCritical ? 'critical' : ''}`}>
                  <span className="log-source">{log.source}</span>
                  <span className="log-damage">
                    {log.isCritical ? '💥 ' : ''}{formatNumber(log.damage)}
                  </span>
                  {log.mechanic && (
                    <span className="log-mechanic">
                      {boss.mechanics.find((m) => m.id === log.mechanic)?.icon}
                    </span>
                  )}
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankingTab = () => {
    if (!session || !boss) {
      return <div className="worldboss-empty">暂无排名数据</div>;
    }

    const sortedRanking = [...session.ranking].sort((a, b) => b.damage - a.damage);
    const playerName = player.name || '你';

    return (
      <div className="worldboss-ranking">
        <h4>🏆 输出排行 - {boss.icon} {boss.name}</h4>
        <div className="ranking-list">
          {sortedRanking.map((entry, idx) => {
            const rank = idx + 1;
            const isPlayer = entry.name === playerName;
            const damagePct = session.maxHp > 0 ? (entry.damage / session.maxHp * 100).toFixed(2) : '0';
            return (
              <div
                key={idx}
                className={`ranking-item ${isPlayer ? 'player' : ''} rank-${rank}`}
              >
                <span className="rank-badge">
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </span>
                <span className="rank-name">{entry.name}{isPlayer ? ' (你)' : ''}</span>
                <span className="rank-damage">{formatNumber(entry.damage)}</span>
                <span className="rank-percent">{damagePct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRewardsTab = () => {
    if (!boss) {
      return <div className="worldboss-empty">暂无奖励信息</div>;
    }

    return (
      <div className="worldboss-rewards">
        <h4>🎁 限时奖励 - {boss.icon} {boss.name}</h4>

        <div className="reward-tier-list">
          {boss.rewardTiers.map((tier, idx) => {
            const canReach = damagePercent >= tier.minDamagePercent;
            const currentTier = session && damagePercent >= tier.minDamagePercent;
            return (
              <div
                key={idx}
                className={`reward-tier ${currentTier ? 'reached' : ''} ${canReach ? 'achievable' : ''}`}
              >
                <div className="tier-header">
                  <span className="tier-title">{tier.title}</span>
                  <span className="tier-requirement">
                    伤害占比 ≥ {(tier.minDamagePercent * 100).toFixed(0)}%
                    {session && (
                      <span className={`tier-status ${currentTier ? 'yes' : 'no'}`}>
                        {currentTier ? ' ✓' : ` (${(damagePercent * 100).toFixed(1)}%)`}
                      </span>
                    )}
                  </span>
                </div>
                <div className="tier-rewards">
                  {tier.rewards.map((effect, eidx) => (
                    <span key={eidx} className="tier-reward-item">
                      {effect.type === 'gold' ? '💰' : effect.type === 'exp' ? '⭐' : effect.type === 'soulOrbs' ? '💎' : effect.type === 'attack' ? '⚔️' : effect.type === 'defense' ? '🛡️' : effect.type === 'hp' ? '❤️' : effect.type === 'speed' ? '👟' : '✨'}
                      {' '}{formatNumber(effect.value)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="participation-reward">
          <h5>参与奖励</h5>
          <div className="participation-items">
            {boss.participationReward.map((effect, idx) => (
              <span key={idx} className="participation-item">
                {effect.type === 'gold' ? '💰' : effect.type === 'exp' ? '⭐' : '✨'}
                {' '}{formatNumber(effect.value)}
              </span>
            ))}
          </div>
        </div>

        {session && !session.rewardsClaimed && canClaim && (
          <button className="worldboss-claim-btn" onClick={handleClaim}>
            🎁 领取奖励
          </button>
        )}
        {session?.rewardsClaimed && (
          <div className="rewards-claimed-banner">✅ 奖励已领取</div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (worldBossState.history.length === 0) {
      return <div className="worldboss-empty">暂无讨伐记录</div>;
    }

    return (
      <div className="worldboss-history">
        <h4>📜 讨伐记录</h4>
        <div className="history-stats">
          <span>累计击败: {worldBossState.totalBossesDefeated}</span>
        </div>
        <div className="history-list">
          {worldBossState.history.slice().reverse().map((entry, idx) => {
            const bossData = WORLD_BOSSES.find((b) => b.id === entry.bossId);
            return (
              <div key={idx} className="history-item" style={{ borderColor: bossData?.color || '#9ca3af' }}>
                <div className="history-header">
                  <span className="history-boss">{bossData?.icon || '👾'} {bossData?.name || entry.bossId}</span>
                  <span className="history-time">{new Date(entry.defeatedAt).toLocaleString()}</span>
                </div>
                <div className="history-details">
                  <span>💀 伤害: {formatNumber(entry.playerDamage)}</span>
                  <span>🏆 排名: #{entry.playerRank}</span>
                  <span>👥 参与者: {entry.totalParticipants}</span>
                  <span>{entry.rewardsClaimed ? '✅ 已领奖' : '⏳ 未领奖'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'battle': return renderBattleTab();
      case 'ranking': return renderRankingTab();
      case 'rewards': return renderRewardsTab();
      case 'history': return renderHistoryTab();
    }
  };

  return (
    <div className="worldboss-panel">
      <div className="worldboss-panel-header">
        <h3>🐉 世界Boss轮替</h3>
        <div className="worldboss-status-bar">
          {worldBossState.isActive && session ? (
            <span className="status-active" style={{ color: boss?.color || '#ef4444' }}>
              🔴 进行中 - {boss?.icon} {boss?.name}
            </span>
          ) : (
            <span className="status-waiting">
              ⏳ 等待中 - 下一轮: {formatTime(countdown)}
            </span>
          )}
          <span className="status-defeated">击败总数: {worldBossState.totalBossesDefeated}</span>
        </div>
      </div>

      <div className="worldboss-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`worldboss-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="worldboss-content">
        {renderContent()}
      </div>
    </div>
  );
}
