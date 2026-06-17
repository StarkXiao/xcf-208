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

function getRiskRewardGrade(ratio: number): { grade: string; color: string } {
  if (ratio >= 500) return { grade: 'S', color: '#fbbf24' };
  if (ratio >= 300) return { grade: 'A', color: '#4ade80' };
  if (ratio >= 150) return { grade: 'B', color: '#60a5fa' };
  if (ratio >= 80) return { grade: 'C', color: '#a78bfa' };
  return { grade: 'D', color: '#9ca3af' };
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

              <div className="risk-warning-section">
                <h4 className="risk-title">⚠️ 风险收益提示</h4>

                <div className="risk-item">
                  <span className="risk-label">💀 预期死亡损失</span>
                  <div className="risk-values">
                    <span className="risk-value negative">-{breakdown.expectedDeathLossExp.toLocaleString()} ⭐</span>
                    <span className="risk-value negative">-{breakdown.expectedDeathLossGold.toLocaleString()} 💰</span>
                  </div>
                </div>

                <div className="risk-item">
                  <span className="risk-label">🧪 恢复消耗</span>
                  <div className="risk-values">
                    <span className="risk-value negative">-生命药水 {breakdown.recoveryHpCost.toLocaleString()} 💰</span>
                    <span className="risk-value negative">-魔力药水 {breakdown.recoveryMpCost.toLocaleString()} 💰</span>
                  </div>
                </div>

                <div className="risk-divider"></div>

                <div className="risk-item net-profit">
                  <span className="risk-label">📈 预计净收益</span>
                  <div className="risk-values">
                    <span className="risk-value positive">+{breakdown.netExpProfit.toLocaleString()} ⭐</span>
                    <span className={`risk-value ${breakdown.netGoldProfit >= 0 ? 'positive' : 'negative'}`}>
                      {breakdown.netGoldProfit >= 0 ? '+' : ''}{breakdown.netGoldProfit.toLocaleString()} 💰
                    </span>
                  </div>
                </div>
              </div>

              <div className="composition-section">
                <h4 className="composition-title">📊 收益构成</h4>
                <div className="composition-bars">
                  {breakdown.rewardComposition.map((item, idx) => (
                    <div key={idx} className="composition-row">
                      <span className="composition-label">{item.source}</span>
                      <div className="composition-bar-container">
                        <div
                          className="composition-bar exp-bar"
                          style={{ width: `${Math.max(item.expPercent * 100, 2)}%` }}
                        >
                          <span className="bar-label">⭐ {(item.expPercent * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="composition-bar-container">
                        <div
                          className="composition-bar gold-bar"
                          style={{ width: `${Math.max(item.goldPercent * 100, 2)}%` }}
                        >
                          <span className="bar-label">💰 {(item.goldPercent * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {breakdown.mapComparison.length > 1 && (
                <div className="map-comparison-section">
                  <h4 className="comparison-title">🗺️ 地图差异对比</h4>
                  <div className="comparison-list">
                    {breakdown.mapComparison.map((map) => {
                      const grade = getRiskRewardGrade(map.riskRewardRatio);
                      const isCurrent = map.areaId === useGameStore.getState().currentAreaId;
                      return (
                        <div key={map.areaId} className={`comparison-item ${isCurrent ? 'current' : ''}`}>
                          <div className="comparison-header">
                            <span className="comparison-name">
                              {isCurrent && '📍 '}{map.areaName}
                            </span>
                            <span
                              className="comparison-grade"
                              style={{ color: grade.color, borderColor: grade.color }}
                            >
                              {grade.grade}
                            </span>
                          </div>
                          <div className="comparison-details">
                            <span className="comparison-difficulty" style={{ color: getDifficultyColor(map.difficultyName) }}>
                              {map.difficultyName}
                            </span>
                            <span className="comparison-risk" style={{ color: getRiskColor(map.deathRiskLevel) }}>
                              {map.deathRiskLevel} ({map.deathRiskPercent}%)
                            </span>
                          </div>
                          <div className="comparison-rewards">
                            <span className="comparison-reward">⭐ {map.expReward.toLocaleString()}</span>
                            <span className="comparison-reward">💰 {map.goldReward.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="comparison-hint">
                    💡 等级评价综合考虑收益与风险，S级为性价比最高
                  </p>
                </div>
              )}
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
