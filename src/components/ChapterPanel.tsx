import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { MAIN_CHAPTERS } from '../game/data';
import { getStageTypeIcon, getStageTypeName } from '../game/types';
import type { ChapterStage } from '../game/types';

export default function ChapterPanel() {
  const {
    chapterStamina,
    maxChapterStamina,
    currentChapterId,
    setCurrentChapter,
    getChapterProgress,
    getStageProgress,
    isStageAccessible,
    isChapterUnlocked,
    getChapterUnlockProgress,
    getChapterTotalStars,
    getChapterMaxStars,
    canClaimStageReward,
    canClaimFirstClearReward,
    claimStageReward,
    claimFirstClearReward,
    enterChapterStage,
    startChapterBattle,
    simulateChapterBattle,
    completeChapterBattle,
    resetChapterBattle,
    chapterBattleState,
    regenChapterStamina,
    calculateChapterBattlePower,
    isChapterBossDefeated,
  } = useGameStore();

  const [selectedStage, setSelectedStage] = useState<ChapterStage | null>(null);
  const [showStageDetail, setShowStageDetail] = useState(false);
  const [isBattling, setIsBattling] = useState(false);

  const currentChapter = MAIN_CHAPTERS.find((c) => c.id === currentChapterId) || MAIN_CHAPTERS[0];
  const totalStars = getChapterTotalStars(currentChapter?.id || '');
  const maxStars = getChapterMaxStars(currentChapter?.id || '');
  const battlePower = calculateChapterBattlePower();
  const bossDefeated = isChapterBossDefeated(currentChapter?.id || '');

  useEffect(() => {
    if (!currentChapterId && MAIN_CHAPTERS.length > 0) {
      setCurrentChapter(MAIN_CHAPTERS[0].id);
    }
  }, [currentChapterId, setCurrentChapter]);

  useEffect(() => {
    const interval = setInterval(() => {
      regenChapterStamina();
    }, 10000);
    return () => clearInterval(interval);
  }, [regenChapterStamina]);

  const handleStageClick = (stage: ChapterStage) => {
    if (!isStageAccessible(currentChapter.id, stage.id)) return;
    setSelectedStage(stage);
    setShowStageDetail(true);
  };

  const handleStartBattle = () => {
    if (!selectedStage) return;
    if (!enterChapterStage(currentChapter.id, selectedStage.id)) return;
    
    if (selectedStage.type === 'story' || selectedStage.type === 'event' || selectedStage.type === 'rest' || selectedStage.type === 'treasure') {
      handleClaimFirstClear();
      return;
    }

    if (!startChapterBattle(currentChapter.id, selectedStage.id)) return;

    setIsBattling(true);
    setTimeout(() => {
      const result = simulateChapterBattle(currentChapter.id, selectedStage.id);
      completeChapterBattle(result.won, result.stars);
      setIsBattling(false);
    }, 1500);
  };

  const handleClaimReward = () => {
    if (!selectedStage) return;
    claimStageReward(currentChapter.id, selectedStage.id);
  };

  const handleClaimFirstClear = () => {
    if (!selectedStage) return;
    claimFirstClearReward(currentChapter.id, selectedStage.id);
  };

  const handleCloseDetail = () => {
    setShowStageDetail(false);
    setSelectedStage(null);
    resetChapterBattle();
  };

  const getStageColor = (stage: ChapterStage) => {
    switch (stage.type) {
      case 'boss': return '#dc2626';
      case 'elite': return '#9333ea';
      case 'battle': return '#2563eb';
      case 'story': return '#ca8a04';
      case 'treasure': return '#f59e0b';
      case 'event': return '#10b981';
      case 'rest': return '#6b7280';
      default: return '#374151';
    }
  };

  const renderRewardIcon = (type: string) => {
    switch (type) {
      case 'gold': return '💰';
      case 'exp': return '⚡';
      case 'soulOrbs': return '💎';
      case 'hp': return '❤️';
      case 'attack': return '⚔️';
      case 'defense': return '🛡️';
      case 'speed': return '💨';
      case 'reputation': return '🏛️';
      default: return '🎁';
    }
  };

  const renderChapterHeader = () => (
    <div className="chapter-header">
      <div className="chapter-info-bar">
        <div className="chapter-title-section">
          <span className="chapter-icon-big">{currentChapter?.icon}</span>
          <div>
            <h2>{currentChapter?.name}</h2>
            <div className="chapter-stars-display">
              <span className="star-icon">⭐</span>
              <span>{totalStars} / {maxStars}</span>
            </div>
          </div>
        </div>
        <div className="chapter-stamina-section">
          <div className="stamina-display">
            <span className="stamina-icon">⚡</span>
            <span className="stamina-text">{chapterStamina}/{maxChapterStamina}</span>
          </div>
          {bossDefeated && (
            <div className="boss-cleared-badge">
              🏆 Boss已击败
            </div>
          )}
        </div>
      </div>
      <p className="chapter-description">{currentChapter?.description}</p>
    </div>
  );

  const renderChapterSelector = () => (
    <div className="chapter-selector">
      {MAIN_CHAPTERS.map((chapter) => {
        const unlocked = isChapterUnlocked(chapter.id);
        const isActive = currentChapterId === chapter.id;
        const chapterStars = getChapterTotalStars(chapter.id);
        const chapterMaxStars = getChapterMaxStars(chapter.id);

        return (
          <button
            key={chapter.id}
            className={`chapter-select-btn ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
            onClick={() => unlocked && setCurrentChapter(chapter.id)}
            disabled={!unlocked}
          >
            <span className="chapter-select-icon">{chapter.icon}</span>
            <div className="chapter-select-info">
              <span className="chapter-select-name">{chapter.name}</span>
              {unlocked ? (
                <span className="chapter-select-stars">⭐ {chapterStars}/{chapterMaxStars}</span>
              ) : (
                <span className="chapter-select-locked">🔒 未解锁</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderMap = () => {
    if (!currentChapter) return null;

    const progresses = getChapterProgress(currentChapter.id);

    return (
      <div className="chapter-map-container">
        <div
          className="chapter-map"
          style={{ backgroundColor: currentChapter.bgColor }}
        >
          <svg className="map-connections" viewBox="0 0 100 70" preserveAspectRatio="none">
            {currentChapter.stages.map((stage) =>
              stage.connections.map((connId) => {
                const targetStage = currentChapter.stages.find((s) => s.id === connId);
                if (!targetStage) return null;
                const stageProgress = getStageProgress(currentChapter.id, stage.id);
                const targetProgress = getStageProgress(currentChapter.id, connId);
                const isCleared = stageProgress?.cleared && targetProgress?.cleared;
                return (
                  <line
                    key={`${stage.id}-${connId}`}
                    x1={stage.x}
                    y1={stage.y + 10}
                    x2={targetStage.x}
                    y2={targetStage.y + 10}
                    stroke={isCleared ? '#fbbf24' : 'rgba(255,255,255,0.25)'}
                    strokeWidth="0.6"
                    strokeDasharray={isCleared ? 'none' : '2,2'}
                  />
                );
              })
            )}
          </svg>

          {currentChapter.stages.map((stage) => {
            const progress = getStageProgress(currentChapter.id, stage.id);
            const accessible = isStageAccessible(currentChapter.id, stage.id);
            const hasReward = canClaimStageReward(currentChapter.id, stage.id);
            const hasFirstClear = canClaimFirstClearReward(currentChapter.id, stage.id);

            return (
              <button
                key={stage.id}
                className={`stage-node ${stage.type} ${progress?.cleared ? 'cleared' : ''} ${!accessible ? 'locked' : ''} ${hasReward || hasFirstClear ? 'has-reward' : ''}`}
                style={{
                  left: `${stage.x}%`,
                  top: `${stage.y + 10}%`,
                  borderColor: getStageColor(stage),
                }}
                onClick={() => handleStageClick(stage)}
                disabled={!accessible}
              >
                <span className="stage-node-icon">{getStageTypeIcon(stage.type)}</span>
                {progress?.bestStars && progress.bestStars > 0 && (
                  <div className="stage-node-stars">
                    {'★'.repeat(progress.bestStars)}
                  </div>
                )}
                {(hasReward || hasFirstClear) && <span className="reward-indicator">!</span>}
                {!accessible && <span className="lock-icon">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStageDetail = () => {
    if (!showStageDetail || !selectedStage) return null;

    const progress = getStageProgress(currentChapter.id, selectedStage.id);
    const canClaim = canClaimStageReward(currentChapter.id, selectedStage.id);
    const canFirstClear = canClaimFirstClearReward(currentChapter.id, selectedStage.id);
    const isCombatStage = selectedStage.type === 'battle' || selectedStage.type === 'elite' || selectedStage.type === 'boss';

    return (
      <div className="stage-detail-modal" onClick={handleCloseDetail}>
        <div className="stage-detail-content" onClick={(e) => e.stopPropagation()}>
          <div className="stage-detail-header" style={{ backgroundColor: getStageColor(selectedStage) }}>
            <span className="stage-detail-icon">{getStageTypeIcon(selectedStage.type)}</span>
            <h3>{selectedStage.name}</h3>
            <span className="stage-type-badge">{getStageTypeName(selectedStage.type)}</span>
          </div>

          <div className="stage-detail-body">
            {selectedStage.storyText && (
              <div className="story-section">
                <p className="story-text">"{selectedStage.storyText}"</p>
              </div>
            )}

            <p className="stage-desc">{selectedStage.description}</p>

            <div className="stage-stats-grid">
              <div className="stage-stat-item">
                <span className="stat-label">推荐等级</span>
                <span className="stat-value">Lv.{selectedStage.minLevel}</span>
              </div>
              {isCombatStage && (
                <>
                  <div className="stage-stat-item">
                    <span className="stat-label">体力消耗</span>
                    <span className="stat-value stamina">⚡ {selectedStage.staminaCost}</span>
                  </div>
                  <div className="stage-stat-item">
                    <span className="stat-label">敌人数量</span>
                    <span className="stat-value">x{selectedStage.enemyCount || 1}</span>
                  </div>
                </>
              )}
            </div>

            {selectedStage.bossMechanics && selectedStage.bossMechanics.length > 0 && (
              <div className="boss-mechanics-section">
                <h4>👹 Boss 机制</h4>
                <div className="mechanics-list">
                  {selectedStage.bossMechanics.map((mech) => (
                    <div key={mech.id} className="mechanic-item">
                      <span className="mechanic-icon">{mech.icon}</span>
                      <div className="mechanic-info">
                        <span className="mechanic-name">{mech.name}</span>
                        <span className="mechanic-desc">{mech.description}</span>
                        <span className="mechanic-trigger">触发: 血量 {mech.triggerHpPercent * 100}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStage.rewards && selectedStage.rewards.length > 0 && (
              <div className="rewards-section">
                <h4>🎁 通关奖励</h4>
                <div className="reward-tags">
                  {selectedStage.rewards.map((reward, idx) => (
                    <span key={idx} className="reward-tag">
                      {renderRewardIcon(reward.type)} +{reward.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStage.firstClearRewards && selectedStage.firstClearRewards.length > 0 && (
              <div className={`first-clear-section ${canFirstClear ? 'available' : ''}`}>
                <h4>🏆 首通奖励</h4>
                <div className="reward-tags">
                  {selectedStage.firstClearRewards.map((reward, idx) => (
                    <span key={idx} className="reward-tag first-clear">
                      {renderRewardIcon(reward.type)} +{reward.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {chapterBattleState.battleResult && !isBattling && (
              <div className={`battle-result-panel ${chapterBattleState.battleResult === 'win' ? 'win' : 'lose'}`}>
                <div className="result-title">
                  {chapterBattleState.battleResult === 'win' ? '🎉 战斗胜利！' : '💀 战斗失败'}
                </div>
                {chapterBattleState.battleResult === 'win' && (
                  <div className="result-stars">
                    {'★'.repeat(chapterBattleState.earnedStars)}
                    {'☆'.repeat(3 - chapterBattleState.earnedStars)}
                  </div>
                )}
              </div>
            )}

            {isBattling && (
              <div className="battle-loading">
                <div className="battle-animation">⚔️</div>
                <p>战斗进行中...</p>
              </div>
            )}

            {!isBattling && !chapterBattleState.battleResult && (
              <button
                className="start-battle-btn"
                onClick={handleStartBattle}
                disabled={isCombatStage && chapterStamina < (selectedStage.staminaCost || 0)}
              >
                {isCombatStage
                  ? `⚔️ 开始战斗（⚡${selectedStage.staminaCost}）`
                  : progress?.cleared
                    ? '已完成'
                    : '✨ 开始事件'
                }
              </button>
            )}

            {!isBattling && chapterBattleState.battleResult === 'win' && canFirstClear && (
              <button className="claim-first-clear-btn" onClick={handleClaimFirstClear}>
                🏆 领取首通奖励
              </button>
            )}

            {!isBattling && chapterBattleState.battleResult === 'win' && canClaim && (
              <button className="claim-reward-btn" onClick={handleClaimReward}>
                🎁 领取通关奖励
              </button>
            )}

            {!isBattling && chapterBattleState.battleResult && (
              <button className="retry-battle-btn" onClick={handleStartBattle}>
                🔄 再次挑战
              </button>
            )}

            <button className="close-detail-btn" onClick={handleCloseDetail}>
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUnlockInfo = () => {
    if (isChapterUnlocked(currentChapter?.id || '')) return null;

    const unlockProgress = getChapterUnlockProgress(currentChapter?.id || '');

    return (
      <div className="chapter-unlock-overlay">
        <div className="unlock-content">
          <h3>🔒 章节未解锁</h3>
          <p>完成以下条件解锁本章节：</p>
          <div className="unlock-conditions">
            {unlockProgress.map((item, idx) => (
              <div key={idx} className={`unlock-condition ${item.completed ? 'completed' : ''}`}>
                <span className="condition-check">{item.completed ? '✅' : '⬜'}</span>
                <span className="condition-text">{item.condition}</span>
                <span className="condition-progress">{item.current}/{item.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!currentChapter) {
    return <div className="chapter-panel">加载中...</div>;
  }

  return (
    <div className="chapter-panel">
      {renderChapterHeader()}
      {renderChapterSelector()}
      {isChapterUnlocked(currentChapter.id) ? renderMap() : renderUnlockInfo()}
      {renderStageDetail()}
    </div>
  );
}
