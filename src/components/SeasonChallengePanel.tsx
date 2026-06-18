import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../game/store';
import {
  SEASON_RANK_COLORS,
  getSeasonRankTitle,
} from '../game/types';
import type { SeasonChallengeTab, SeasonChallengeStage, SeasonChallengeTask } from '../game/types';

const REWARD_ICON_MAP: Record<string, string> = {
  gold: '💰',
  exp: '⭐',
  soulOrbs: '💎',
  attack: '⚔️',
  defense: '🛡️',
  hp: '❤️',
  speed: '👟',
  luck: '🍀',
  reputation: '🏛️',
};

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

const TAB_CONFIG: { id: SeasonChallengeTab; label: string; icon: string }[] = [
  { id: 'tasks', label: '阶段任务', icon: '📋' },
  { id: 'leaderboard', label: '排行榜', icon: '🏅' },
  { id: 'partners', label: '限定伙伴', icon: '🤝' },
  { id: 'rewards', label: '跨周奖励', icon: '🎁' },
  { id: 'history', label: '历史数据', icon: '📜' },
];

export default function SeasonChallengePanel() {
  const {
    seasonChallenge,
    player,
    getCurrentSeason,
    getSeasonTaskProgress,
    isStageUnlocked,
    claimSeasonTaskReward,
    canClaimSeasonTaskReward,
    getSeasonLeaderboard,
    getPlayerSeasonRank,
    isLimitedPartnerUnlocked,
    canClaimCrossWeekReward,
    claimCrossWeekReward,
    setSeasonChallengeTab,
    syncSeasonChallengeProgress,
  } = useGameStore();

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  useEffect(() => {
    syncSeasonChallengeProgress();
  }, [syncSeasonChallengeProgress]);

  const season = getCurrentSeason();
  const leaderboard = useMemo(() => getSeasonLeaderboard(), [getSeasonLeaderboard, seasonChallenge.seasonScore]);
  const playerRank = useMemo(() => getPlayerSeasonRank(), [getPlayerSeasonRank, seasonChallenge.seasonScore]);

  const activeTab = seasonChallenge.activeTab;

  const renderRewardText = (type: string, value: number) => {
    const icon = REWARD_ICON_MAP[type] || '';
    if (type === 'gold' || type === 'exp') return `${icon} ${value.toLocaleString()}`;
    if (type === 'soulOrbs') return `${icon} ${value}`;
    return `${icon} +${value}`;
  };

  const renderScoreHeader = () => {
    if (!season) return null;
    const maxPossibleScore = season.stages
      .flatMap((s) => s.tasks)
      .reduce((sum, t) => sum + t.scoreReward, 0);
    const scorePercent = maxPossibleScore > 0 ? (seasonChallenge.seasonScore / maxPossibleScore) * 100 : 0;

    return (
      <div className="season-score-header" style={{ borderColor: season.color }}>
        <div className="season-score-banner" style={{ background: `linear-gradient(135deg, ${season.color}22, ${season.color}44)` }}>
          <div className="season-info">
            <span className="season-icon">{season.icon}</span>
            <div className="season-title-area">
              <h3 className="season-name" style={{ color: season.color }}>{season.name}</h3>
              <p className="season-theme">{season.theme.toUpperCase()} · 第{season.totalWeeks}周</p>
            </div>
          </div>
          <div className="season-score-area">
            <div className="season-score-value">
              <span className="score-label">赛季积分</span>
              <span className="score-number" style={{ color: season.color }}>{seasonChallenge.seasonScore}</span>
            </div>
            <div className="season-score-bar">
              <div className="season-score-fill" style={{ width: `${Math.min(100, scorePercent)}%`, backgroundColor: season.color }} />
            </div>
            <div className="season-rank-badge" style={{ borderColor: SEASON_RANK_COLORS[getSeasonRankTitle(playerRank)] || '#9ca3af' }}>
              <span>🏅 #{playerRank}</span>
              <span style={{ color: SEASON_RANK_COLORS[getSeasonRankTitle(playerRank)] || '#9ca3af' }}>
                {getSeasonRankTitle(playerRank)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabBar = () => (
    <div className="season-tab-bar">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          className={`season-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setSeasonChallengeTab(tab.id)}
        >
          <span className="season-tab-icon">{tab.icon}</span>
          <span className="season-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderTaskCard = (task: SeasonChallengeTask, stage: SeasonChallengeStage) => {
    const progress = getSeasonTaskProgress(task.id);
    const progressPercent = task.target > 0 ? Math.min(100, (progress.progress / task.target) * 100) : 0;
    const canClaim = canClaimSeasonTaskReward(task.id);
    const isCompleted = progress.claimed;
    const stageUnlocked = isStageUnlocked(stage.id);

    return (
      <div
        key={task.id}
        className={`season-task-card ${isCompleted ? 'completed' : ''} ${canClaim ? 'claimable' : ''} ${!stageUnlocked ? 'locked' : ''}`}
      >
        <div className="season-task-header">
          <span className="season-task-icon">{task.icon}</span>
          <div className="season-task-info">
            <h5 className="season-task-name">{task.name}</h5>
            <p className="season-task-desc">{task.description}</p>
          </div>
          <div className="season-task-score">
            <span className="score-reward">+{task.scoreReward}</span>
            <span className="score-unit">积分</span>
          </div>
        </div>

        {!isCompleted && stageUnlocked && (
          <div className="season-task-progress">
            <div className="season-task-progress-bar">
              <div className="season-task-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="season-task-progress-text">
              {Math.floor(progress.progress)} / {task.target}
            </span>
          </div>
        )}

        <div className="season-task-footer">
          <div className="season-task-rewards">
            {task.rewards.map((reward, idx) => (
              <span key={idx} className="season-task-reward-tag">
                {renderRewardText(reward.type, reward.value)}
              </span>
            ))}
          </div>
          {canClaim && (
            <button
              className="season-task-claim-btn"
              onClick={() => claimSeasonTaskReward(task.id)}
            >
              🎁 领取
            </button>
          )}
          {isCompleted && (
            <span className="season-task-claimed">✅ 已领取</span>
          )}
          {!stageUnlocked && (
            <span className="season-task-locked">🔒 未解锁</span>
          )}
        </div>
      </div>
    );
  };

  const renderTasksTab = () => {
    if (!season) return <div className="season-empty">暂无进行中的赛季</div>;

    const stageProgress = season.stages.map((stage) => {
      const tasks = stage.tasks;
      const completed = tasks.filter((t) => getSeasonTaskProgress(t.id).claimed).length;
      const total = tasks.length;
      return { stage, completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
    });

    return (
      <div className="season-tasks-tab">
        <div className="season-stages-overview">
          {stageProgress.map(({ stage, completed, total, percent }) => {
            const unlocked = isStageUnlocked(stage.id);
            return (
              <div
                key={stage.id}
                className={`season-stage-card ${selectedStageId === stage.id ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                style={{ borderColor: unlocked ? season.color : '#374151' }}
                onClick={() => setSelectedStageId(selectedStageId === stage.id ? null : stage.id)}
              >
                <div className="season-stage-header">
                  <span className="season-stage-icon">{stage.icon}</span>
                  <div className="season-stage-info">
                    <h4 style={{ color: unlocked ? season.color : '#6b7280' }}>
                      第{stage.weekNumber}周 · {stage.name}
                    </h4>
                    <p>{stage.description}</p>
                  </div>
                  {!unlocked && (
                    <div className="season-stage-lock">
                      <span>🔒 需{stage.unlockScore}积分</span>
                    </div>
                  )}
                </div>
                {unlocked && (
                  <div className="season-stage-progress">
                    <div className="season-stage-progress-bar">
                      <div
                        className="season-stage-progress-fill"
                        style={{ width: `${percent}%`, backgroundColor: season.color }}
                      />
                    </div>
                    <span>{completed}/{total}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedStageId && (() => {
          const stage = season.stages.find((s) => s.id === selectedStageId);
          if (!stage) return null;
          return (
            <div className="season-stage-tasks">
              <h4 className="season-stage-tasks-title" style={{ color: season.color }}>
                {stage.icon} {stage.name} - 任务列表
              </h4>
              <div className="season-task-list">
                {stage.tasks.map((task) => renderTaskCard(task, stage))}
              </div>
            </div>
          );
        })()}

        {!selectedStageId && (
          <div className="season-all-tasks">
            <h4 className="season-stage-tasks-title">📋 全部可接任务</h4>
            <div className="season-task-list">
              {season.stages
                .filter((stage) => isStageUnlocked(stage.id))
                .flatMap((stage) => stage.tasks.map((task) => ({ task, stage })))
                .map(({ task, stage }) => renderTaskCard(task, stage))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLeaderboardTab = () => {
    const playerName = player.name || '勇者';

    return (
      <div className="season-leaderboard-tab">
        <div className="season-leaderboard-player" style={{ borderColor: season?.color || '#3b82f6' }}>
          <div className="leaderboard-player-rank">
            <span className="rank-number">#{playerRank}</span>
            <span className="rank-title" style={{ color: SEASON_RANK_COLORS[getSeasonRankTitle(playerRank)] || '#9ca3af' }}>
              {getSeasonRankTitle(playerRank)}
            </span>
          </div>
          <div className="leaderboard-player-info">
            <span className="player-name">{playerName}</span>
            <span className="player-score">{seasonChallenge.seasonScore} 积分</span>
          </div>
        </div>

        <div className="season-leaderboard-list">
          <div className="leaderboard-header-row">
            <span className="lb-col-rank">排名</span>
            <span className="lb-col-name">名称</span>
            <span className="lb-col-title">称号</span>
            <span className="lb-col-score">积分</span>
          </div>
          {leaderboard.map((entry) => {
            const isPlayer = entry.name === playerName;
            const rankColor = SEASON_RANK_COLORS[entry.title] || '#9ca3af';
            return (
              <div
                key={entry.rank}
                className={`leaderboard-row ${isPlayer ? 'is-player' : ''} ${entry.rank <= 3 ? 'top-rank' : ''}`}
                style={isPlayer ? { borderColor: season?.color || '#3b82f6' } : undefined}
              >
                <span className="lb-col-rank">
                  {entry.rank <= 3 ? (
                    <span className="top-rank-badge" style={{ backgroundColor: rankColor }}>
                      {entry.rank}
                    </span>
                  ) : (
                    entry.rank
                  )}
                </span>
                <span className="lb-col-name">
                  <span
                    className="lb-avatar"
                    style={{ backgroundColor: entry.avatarColor + '40' }}
                  >
                    {entry.name[0]}
                  </span>
                  <span className={isPlayer ? 'player-highlight' : ''}>{entry.name}</span>
                </span>
                <span className="lb-col-title" style={{ color: rankColor }}>{entry.title}</span>
                <span className="lb-col-score">{entry.score.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPartnersTab = () => {
    if (!season) return <div className="season-empty">暂无进行中的赛季</div>;

    return (
      <div className="season-partners-tab">
        <h4 className="season-section-title">🤝 赛季限定伙伴</h4>
        <p className="season-section-desc">达到指定积分即可解锁赛季专属伙伴，获得额外属性加成</p>

        <div className="season-partners-list">
          {season.limitedPartners.map((partner) => {
            const unlocked = isLimitedPartnerUnlocked(partner.companionId);
            const progressPercent = Math.min(100, (seasonChallenge.seasonScore / partner.unlockScore) * 100);
            const nameMatch = partner.description.match(/^(.+?)\s*[-–—]/);
            const partnerName = nameMatch ? nameMatch[1] : partner.companionId;
            const partnerDesc = partner.description.includes(' - ')
              ? partner.description.split(' - ').slice(1).join(' - ')
              : partner.description;

            return (
              <div
                key={partner.companionId}
                className={`season-partner-card ${unlocked ? 'unlocked' : 'locked'}`}
                style={{ borderColor: unlocked ? season.color : '#374151' }}
              >
                <div className="season-partner-avatar" style={{ backgroundColor: unlocked ? season.color + '30' : '#1f2937' }}>
                  <span className="partner-icon">{unlocked ? '🌟' : '🔒'}</span>
                  <span className="partner-name" style={{ color: unlocked ? season.color : '#6b7280' }}>
                    {partnerName}
                  </span>
                </div>
                <div className="season-partner-info">
                  <p className="partner-desc">{partnerDesc}</p>
                  <div className="partner-bonus-stats">
                    {partner.bonusStats.map((bs, idx) => (
                      <span key={idx} className="partner-bonus-tag">
                        {REWARD_ICON_MAP[bs.stat] || ''} +{bs.value} {bs.stat === 'attack' ? '攻击' : bs.stat === 'defense' ? '防御' : bs.stat === 'hp' ? '生命' : bs.stat === 'speed' ? '速度' : '幸运'}
                      </span>
                    ))}
                  </div>
                  {!unlocked && (
                    <div className="partner-unlock-progress">
                      <div className="partner-unlock-bar">
                        <div className="partner-unlock-fill" style={{ width: `${progressPercent}%`, backgroundColor: season.color }} />
                      </div>
                      <span className="partner-unlock-text">
                        {seasonChallenge.seasonScore} / {partner.unlockScore} 积分解锁
                      </span>
                    </div>
                  )}
                  {unlocked && (
                    <span className="partner-unlocked-badge">✅ 已解锁</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRewardsTab = () => {
    if (!season) return <div className="season-empty">暂无进行中的赛季</div>;

    return (
      <div className="season-rewards-tab">
        <h4 className="season-section-title">🎁 跨周累计奖励</h4>
        <p className="season-section-desc">赛季期间累计积分达标即可领取每周里程碑奖励</p>

        <div className="season-rewards-timeline">
          {season.crossWeekRewards.map((reward, idx) => {
            const canClaim = canClaimCrossWeekReward(reward.weekNumber);
            const claimed = seasonChallenge.crossWeekRewardClaimed.includes(`week_${reward.weekNumber}`);
            const progressPercent = Math.min(100, (seasonChallenge.seasonScore / reward.minScore) * 100);
            const isPast = seasonChallenge.seasonScore >= reward.minScore;

            return (
              <div key={reward.weekNumber} className="season-reward-timeline-item">
                {idx < season.crossWeekRewards.length - 1 && (
                  <div className={`timeline-connector ${isPast ? 'completed' : ''}`} style={{ backgroundColor: isPast ? season.color : '#374151' }} />
                )}
                <div
                  className={`timeline-dot ${isPast ? 'completed' : ''} ${claimed ? 'claimed' : ''}`}
                  style={{ backgroundColor: isPast ? season.color : '#374151', borderColor: isPast ? season.color : '#4b5563' }}
                >
                  {claimed ? '✓' : reward.icon}
                </div>
                <div
                  className={`season-reward-card ${claimed ? 'claimed' : ''} ${canClaim ? 'claimable' : ''}`}
                  style={{ borderColor: isPast ? season.color : '#374151' }}
                >
                  <div className="season-reward-header">
                    <span className="reward-week" style={{ color: isPast ? season.color : '#6b7280' }}>
                      {reward.icon} 第{reward.weekNumber}周 · {reward.title}
                    </span>
                    {!claimed && (
                      <span className="reward-threshold">
                        需要 {reward.minScore} 积分
                      </span>
                    )}
                  </div>
                  <div className="season-reward-progress">
                    <div className="season-reward-bar">
                      <div className="season-reward-fill" style={{ width: `${progressPercent}%`, backgroundColor: season.color }} />
                    </div>
                    <span>{seasonChallenge.seasonScore} / {reward.minScore}</span>
                  </div>
                  <div className="season-reward-items">
                    {reward.rewards.map((r, rIdx) => (
                      <span key={rIdx} className="season-reward-item-tag">
                        {renderRewardText(r.type, r.value)}
                      </span>
                    ))}
                  </div>
                  {canClaim && (
                    <button
                      className="season-reward-claim-btn"
                      onClick={() => claimCrossWeekReward(reward.weekNumber)}
                    >
                      🎁 领取奖励
                    </button>
                  )}
                  {claimed && <span className="season-reward-claimed">✅ 已领取</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    const history = seasonChallenge.history;

    return (
      <div className="season-history-tab">
        <h4 className="season-section-title">📜 历史赛季数据</h4>
        <p className="season-section-desc">回顾往期赛季的挑战历程</p>

        {history.length === 0 ? (
          <div className="season-history-empty">
            <div className="history-empty-icon">📋</div>
            <p>暂无历史赛季记录</p>
            <p className="history-empty-hint">完成首个赛季后将在此展示历史数据</p>

            <div className="season-history-preview">
              <h5>历史数据示例</h5>
              <div className="history-preview-card" style={{ borderColor: '#8b5cf6' }}>
                <div className="history-preview-header">
                  <span>🌊 潮汐纪元</span>
                  <span className="history-preview-rank" style={{ color: '#a78bfa' }}>前十强</span>
                </div>
                <div className="history-preview-stats">
                  <div className="history-stat">
                    <span className="stat-label">最终积分</span>
                    <span className="stat-value">1,850</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">最终排名</span>
                    <span className="stat-value">#8</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">参与人数</span>
                    <span className="stat-value">256</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">解锁伙伴</span>
                    <span className="stat-value">2</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">完成阶段</span>
                    <span className="stat-value">3/4</span>
                  </div>
                </div>
                <div className="history-preview-partners">
                  <span className="history-partner-badge" style={{ borderColor: '#3b82f6' }}>🌊 潮汐使者</span>
                  <span className="history-partner-badge" style={{ borderColor: '#8b5cf6' }}>🌀 海渊祭司</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="season-history-list">
            {history.map((entry) => (
              <div key={entry.seasonId} className="season-history-card" style={{ borderColor: RARITY_COLORS.epic }}>
                <div className="history-card-header">
                  <span className="history-season-name">
                    {entry.icon} {entry.seasonName}
                  </span>
                  <span className="history-rank" style={{ color: SEASON_RANK_COLORS[getSeasonRankTitle(entry.finalRank)] || '#9ca3af' }}>
                    #{entry.finalRank} {getSeasonRankTitle(entry.finalRank)}
                  </span>
                </div>
                <div className="history-card-stats">
                  <div className="history-stat">
                    <span className="stat-label">最终积分</span>
                    <span className="stat-value">{entry.finalScore.toLocaleString()}</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">参与人数</span>
                    <span className="stat-value">{entry.totalParticipants}</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">完成阶段</span>
                    <span className="stat-value">{entry.stagesCompleted}</span>
                  </div>
                </div>
                {entry.limitedPartnersUnlocked.length > 0 && (
                  <div className="history-card-partners">
                    {entry.limitedPartnersUnlocked.map((pId) => (
                      <span key={pId} className="history-partner-badge" style={{ borderColor: '#8b5cf6' }}>
                        🤝 {pId}
                      </span>
                    ))}
                  </div>
                )}
                <div className="history-card-time">
                  完成于 {new Date(entry.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks': return renderTasksTab();
      case 'leaderboard': return renderLeaderboardTab();
      case 'partners': return renderPartnersTab();
      case 'rewards': return renderRewardsTab();
      case 'history': return renderHistoryTab();
      default: return renderTasksTab();
    }
  };

  if (!season) {
    return (
      <div className="season-challenge-panel panel">
        <h2 className="panel-title">⚔️ 赛季挑战</h2>
        <div className="season-empty">
          <div className="empty-icon">⏳</div>
          <p>暂无进行中的赛季</p>
          <p className="empty-hint">新赛季即将开始，敬请期待！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="season-challenge-panel panel">
      <h2 className="panel-title">⚔️ 赛季挑战</h2>
      {renderScoreHeader()}
      {renderTabBar()}
      <div className="season-tab-content">
        {renderContent()}
      </div>
    </div>
  );
}
