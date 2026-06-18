import { useState, useMemo } from 'react';
import { useGameStore } from '../game/store';
import { ACHIEVEMENTS } from '../game/data';
import {
  ACHIEVEMENT_RARITY_COLORS,
  ACHIEVEMENT_RARITY_NAMES,
  ACHIEVEMENT_CATEGORY_NAMES,
  ACHIEVEMENT_CATEGORY_ICONS,
} from '../game/types';
import type { Achievement, AchievementCategory, AchievementRarity } from '../game/types';

const CATEGORY_LIST: AchievementCategory[] = ['monster', 'event', 'companion', 'rebirth', 'exploration', 'combat', 'collection'];

const RARITY_BG_COLORS: Record<AchievementRarity, string> = {
  common: '#374151',
  rare: '#1e3a8a',
  epic: '#581c87',
  legendary: '#78350f',
};

export default function AchievementPanel() {
  const {
    achievementProgresses,
    getAchievementProgress,
    getAchievementProgressValue,
    getAchievementsByCategory,
    getAchievementSummary,
    claimAchievementReward,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const summary = useMemo(() => getAchievementSummary(), [getAchievementSummary, achievementProgresses]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; unlocked: number }> = {};
    CATEGORY_LIST.forEach((cat) => {
      const achievements = getAchievementsByCategory(cat);
      stats[cat] = {
        total: achievements.length,
        unlocked: achievements.filter((a) => a.progress.unlocked).length,
      };
    });
    return stats;
  }, [getAchievementsByCategory, achievementProgresses]);

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return ACHIEVEMENTS.map((achievement) => ({
        achievement,
        progress: getAchievementProgress(achievement.id),
      }));
    }
    return getAchievementsByCategory(selectedCategory);
  }, [selectedCategory, getAchievementsByCategory, getAchievementProgress, achievementProgresses]);

  const sortedAchievements = useMemo(() => {
    return [...filteredAchievements].sort((a, b) => {
      if (a.progress.unlocked !== b.progress.unlocked) {
        return a.progress.unlocked ? -1 : 1;
      }
      if (a.progress.claimed !== b.progress.claimed) {
        return !a.progress.claimed ? -1 : 1;
      }
      const rarityOrder: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];
      return rarityOrder.indexOf(a.achievement.rarity) - rarityOrder.indexOf(b.achievement.rarity);
    });
  }, [filteredAchievements]);

  const renderRewardIcon = (type: string, value: number) => {
    switch (type) {
      case 'gold':
        return `💰 ${value.toLocaleString()} 金币`;
      case 'exp':
        return `⭐ ${value.toLocaleString()} 经验`;
      case 'soulOrbs':
        return `💎 ${value} 魂珠`;
      case 'attack':
        return `⚔️ +${value} 攻击`;
      case 'defense':
        return `🛡️ +${value} 防御`;
      case 'hp':
        return `❤️ +${value} 生命`;
      case 'speed':
        return `👟 +${value} 速度`;
      case 'luck':
        return `🍀 +${value} 幸运`;
      default:
        return `${type}: ${value}`;
    }
  };

  const handleClaim = (achievementId: string) => {
    const success = claimAchievementReward(achievementId);
    if (success) {
      setSelectedAchievement(null);
    }
  };

  const renderAchievementCard = ({ achievement, progress }: { achievement: Achievement; progress: ReturnType<typeof getAchievementProgress> }) => {
    const isUnlocked = progress.unlocked;
    const isClaimed = progress.claimed;
    const canClaim = isUnlocked && !isClaimed;
    const currentProgress = getAchievementProgressValue(achievement);
    const target = Math.min(...achievement.conditions.map((c) => c.target));
    const progressPercent = Math.min(100, (currentProgress / target) * 100);

    return (
      <div
        key={achievement.id}
        className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${canClaim ? 'claimable' : ''}`}
        style={{ borderColor: isUnlocked ? ACHIEVEMENT_RARITY_COLORS[achievement.rarity] : '#374151' }}
        onClick={() => setSelectedAchievement(achievement)}
      >
        <div className="achievement-card-icon" style={{ backgroundColor: isUnlocked ? RARITY_BG_COLORS[achievement.rarity] : '#1f2937' }}>
          <span>{achievement.icon}</span>
          {canClaim && <span className="claim-badge">!</span>}
        </div>
        <div className="achievement-card-info">
          <h4 className="achievement-card-name" style={{ color: isUnlocked ? ACHIEVEMENT_RARITY_COLORS[achievement.rarity] : '#6b7280' }}>
            {isUnlocked || !achievement.hidden ? achievement.name : '???'}
          </h4>
          <p className="achievement-card-desc">
            {isUnlocked || !achievement.hidden ? achievement.description : '完成特定条件解锁'}
          </p>
          {!isUnlocked && (
            <div className="achievement-progress">
              <div className="achievement-progress-bar">
                <div className="achievement-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="achievement-progress-text">
                {Math.floor(currentProgress)} / {target}
              </span>
            </div>
          )}
          {isClaimed && <span className="claimed-badge">✅ 已领取</span>}
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedAchievement) return null;

    const progress = getAchievementProgress(selectedAchievement.id);
    const isUnlocked = progress.unlocked;
    const isClaimed = progress.claimed;
    const canClaim = isUnlocked && !isClaimed;
    const currentProgress = getAchievementProgressValue(selectedAchievement);

    return (
      <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
        <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setSelectedAchievement(null)}>
            ✕
          </button>
          <div className="achievement-modal-header" style={{ backgroundColor: RARITY_BG_COLORS[selectedAchievement.rarity] }}>
            <span className="achievement-modal-icon">{selectedAchievement.icon}</span>
            <div className="achievement-modal-title">
              <h3 style={{ color: ACHIEVEMENT_RARITY_COLORS[selectedAchievement.rarity] }}>
                {isUnlocked || !selectedAchievement.hidden ? selectedAchievement.name : '???'}
              </h3>
              <p className="achievement-modal-rarity">
                {ACHIEVEMENT_RARITY_NAMES[selectedAchievement.rarity]}
              </p>
            </div>
          </div>

          <div className="achievement-modal-body">
            <p className="achievement-modal-desc">
              {isUnlocked || !selectedAchievement.hidden ? selectedAchievement.description : '完成特定条件解锁此成就'}
            </p>

            {selectedAchievement.hidden && !isUnlocked && (
              <p className="achievement-hidden-hint">🔒 这是一个隐藏成就</p>
            )}

            <div className="achievement-modal-conditions">
              <h4>完成条件</h4>
              {selectedAchievement.conditions.map((condition, index) => (
                <div key={index} className="condition-item">
                  <span>{condition.description}</span>
                  <div className="condition-progress">
                    <div className="condition-progress-bar">
                      <div
                        className="condition-progress-fill"
                        style={{ width: `${Math.min(100, (currentProgress / condition.target) * 100)}%` }}
                      />
                    </div>
                    <span>{Math.floor(currentProgress)} / {condition.target}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="achievement-modal-rewards">
              <h4>奖励</h4>
              <div className="rewards-list">
                {selectedAchievement.rewards.map((reward, index) => (
                  <div key={index} className="reward-item">
                    {renderRewardIcon(reward.type, reward.value)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="achievement-modal-footer">
            {canClaim ? (
              <button
                className="claim-reward-btn"
                onClick={() => handleClaim(selectedAchievement.id)}
              >
                🎁 领取奖励
              </button>
            ) : isClaimed ? (
              <span className="already-claimed">✅ 奖励已领取</span>
            ) : (
              <span className="not-unlocked">🔒 尚未达成</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="achievement-panel panel">
      <h2 className="panel-title">
        🏆 成就系统
        {summary.unlocked - summary.claimed > 0 && <span className="unclaimed-count">{summary.unlocked - summary.claimed}</span>}
      </h2>

      <div className="achievement-summary">
        <div className="summary-progress">
          <div className="summary-progress-bar">
            <div className="summary-progress-fill" style={{ width: `${summary.percentage}%` }} />
          </div>
          <span className="summary-progress-text">
            已解锁 {summary.unlocked} / {summary.total} ({summary.percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">{summary.claimed}</span>
            <span className="stat-label">已领取</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{summary.unlocked - summary.claimed}</span>
            <span className="stat-label">待领取</span>
          </div>
        </div>
      </div>

      <div className="achievement-categories">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          📋 全部
          <span className="category-count">{summary.unlocked}/{summary.total}</span>
        </button>
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {ACHIEVEMENT_CATEGORY_ICONS[cat]} {ACHIEVEMENT_CATEGORY_NAMES[cat]}
            <span className="category-count">
              {categoryStats[cat]?.unlocked || 0}/{categoryStats[cat]?.total || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="achievement-list">
        {sortedAchievements.map(({ achievement, progress }) =>
          renderAchievementCard({ achievement, progress })
        )}
      </div>

      {renderDetailModal()}
    </div>
  );
}
