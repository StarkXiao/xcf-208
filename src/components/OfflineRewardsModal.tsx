import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import type { OfflineRewardBreakdown } from '../game/types';

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(0)}%`;
}

function getRiskColor(level: string): string {
  switch (level) {
    case '安全': return '#4ade80';
    case '低风险': return '#a3e635';
    case '中风险': return '#fbbf24';
    case '高风险': return '#f97316';
    case '极高风险': return '#ef4444';
    default: return '#9ca3af';
  }
}

function getDifficultyColor(name: string): string {
  switch (name) {
    case '简单': return '#4ade80';
    case '普通': return '#fbbf24';
    case '困难': return '#f97316';
    case '噩梦': return '#ef4444';
    default: return '#9ca3af';
  }
}

export default function OfflineRewardsModal() {
  const { calculateOfflineRewards, collectOfflineRewards, lastOnlineTime } = useGameStore();
  const [show, setShow] = useState(false);
  const [rewards, setRewards] = useState({ exp: 0, gold: 0, breakdown: null as OfflineRewardBreakdown | null });
  const [offlineDuration, setOfflineDuration] = useState('');

  useEffect(() => {
    const checkOfflineRewards = () => {
      const result = calculateOfflineRewards();
      const now = Date.now();
      const offlineMs = now - lastOnlineTime;
      const offlineMinutes = Math.floor(offlineMs / 60000);
      const offlineHours = Math.floor(offlineMinutes / 60);
      const offlineDays = Math.floor(offlineHours / 24);

      if (result.exp > 0 || result.gold > 0) {
        setRewards(result);

        if (offlineDays > 0) {
          setOfflineDuration(`${offlineDays}天${offlineHours % 24}小时`);
        } else if (offlineHours > 0) {
          setOfflineDuration(`${offlineHours}小时${offlineMinutes % 60}分钟`);
        } else {
          setOfflineDuration(`${offlineMinutes}分钟`);
        }

        setShow(true);
      }
    };

    const timer = setTimeout(checkOfflineRewards, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCollect = () => {
    collectOfflineRewards();
    setShow(false);
  };

  if (!show) return null;

  const { breakdown } = rewards;

  return (
    <div className="offline-modal-overlay">
      <div className="offline-modal">
        <div className="offline-modal-header">
          <h3>📦 欢迎回来！</h3>
        </div>

        <div className="offline-modal-body">
          <p className="offline-duration">
            你离开了 <span className="highlight">{offlineDuration}</span>
          </p>

          <div className="offline-rewards">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-label">经验</span>
              <span className="reward-value">+{rewards.exp.toLocaleString()}</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-label">金币</span>
              <span className="reward-value">+{rewards.gold.toLocaleString()}</span>
            </div>
          </div>

          {breakdown && (
            <div className="offline-breakdown">
              <h4 className="breakdown-title">📊 收益明细</h4>

              <div className="breakdown-section">
                <div className="breakdown-row">
                  <span className="breakdown-label">🗺️ 地图难度</span>
                  <span
                    className="breakdown-value"
                    style={{ color: getDifficultyColor(breakdown.mapDifficultyName) }}
                  >
                    {breakdown.mapDifficultyName} ×{breakdown.mapDifficultyMultiplier.toFixed(1)}
                  </span>
                </div>

                <div className="breakdown-row">
                  <span className="breakdown-label">⚔️ 伙伴驻守</span>
                  <span className="breakdown-value">
                    {breakdown.companionCount} 人 {formatPercent(breakdown.companionBonus)}
                  </span>
                </div>

                {breakdown.eventModifiers.length > 0 && (
                  <div className="breakdown-row breakdown-events">
                    <span className="breakdown-label">✨ 事件状态</span>
                    <div className="event-modifiers">
                      {breakdown.eventModifiers.map((mod, idx) => (
                        <span
                          key={idx}
                          className="event-modifier-tag"
                          style={{ color: mod.bonus >= 0 ? '#4ade80' : '#ef4444' }}
                        >
                          {mod.icon} {mod.name} {formatPercent(mod.bonus)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="breakdown-row">
                  <span className="breakdown-label">💀 死亡风险</span>
                  <span
                    className="breakdown-value"
                    style={{ color: getRiskColor(breakdown.deathRiskLevel) }}
                  >
                    {breakdown.deathRiskLevel} ({breakdown.deathRiskPercent}%) ×{breakdown.deathRiskMultiplier.toFixed(2)}
                  </span>
                </div>

                <div className="breakdown-row">
                  <span className="breakdown-label">⚡ 离线效率</span>
                  <span className="breakdown-value">
                    {(breakdown.efficiencyMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="breakdown-summary">
                <div className="summary-row">
                  <span>基础经验</span>
                  <span>{breakdown.baseExp.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>基础金币</span>
                  <span>{breakdown.baseGold.toLocaleString()}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row final">
                  <span>🎁 最终经验</span>
                  <span className="highlight">+{breakdown.finalExp.toLocaleString()}</span>
                </div>
                <div className="summary-row final">
                  <span>🎁 最终金币</span>
                  <span className="highlight">+{breakdown.finalGold.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <p className="offline-hint">
            提示：提升伙伴实力、选择高风险高回报地图可获得更多离线收益
          </p>
        </div>

        <button className="collect-btn" onClick={handleCollect}>
          🎁 领取奖励
        </button>
      </div>
    </div>
  );
}
