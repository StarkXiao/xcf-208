import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import {
  GUILD_CHAPTERS,
  GUILD_TECH_TREE,
  RARITY_COLORS,
} from '../game/data';
import type { GuildMapNode, GuildTab } from '../game/types';

export default function GuildPanel() {
  const {
    guildLevel,
    guildExp,
    guildContribution,
    currentStamina,
    getGuildMaxStamina,
    getGuildLevelConfig,
    getGuildExpToNextLevel,
    getCurrentGuildChapter,
    getNodeProgress,
    isNodeAccessible,
    enterGuildNode,
    clearGuildNode,
    claimNodeReward,
    canClaimNodeReward,
    setCurrentGuildChapter,
    currentGuildChapterId,
    guildActiveTab,
    setGuildActiveTab,
    getGuildTechLevel,
    upgradeGuildTech,
    canUpgradeGuildTech,
    guildDailyRewards,
    getDailyStreak,
    claimDailyReward,
    canClaimDailyReward,
    checkAndResetDailyRewards,
    guildFormation,
    setGuildFormation,
    getGuildFormationPower,
    ownedCompanions,
    regenStamina,
    getGuildAttackBonus,
    getGuildDefenseBonus,
    getGuildHpBonus,
    getGuildGoldBonus,
    getGuildExpBonus,
  } = useGameStore();

  const [selectedNode, setSelectedNode] = useState<GuildMapNode | null>(null);
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const [battleResult, setBattleResult] = useState<{ stars: number; won: boolean } | null>(null);

  const maxStamina = getGuildMaxStamina();
  const levelConfig = getGuildLevelConfig();
  const expToNext = getGuildExpToNextLevel();
  const currentChapter = getCurrentGuildChapter();
  const dailyStreak = getDailyStreak();
  const formationPower = getGuildFormationPower();

  useEffect(() => {
    checkAndResetDailyRewards();
    const interval = setInterval(() => {
      regenStamina();
    }, 10000);
    return () => clearInterval(interval);
  }, [checkAndResetDailyRewards, regenStamina]);

  const guildTabs: { id: GuildTab; label: string; icon: string }[] = [
    { id: 'map', label: '地图', icon: '🗺️' },
    { id: 'tech', label: '科技', icon: '🔧' },
    { id: 'daily', label: '每日', icon: '🎁' },
    { id: 'formation', label: '编队', icon: '⚔️' },
  ];

  const handleNodeClick = (node: GuildMapNode) => {
    if (!isNodeAccessible(currentGuildChapterId, node.id)) return;
    setSelectedNode(node);
    setShowNodeDetail(true);
    setBattleResult(null);
  };

  const handleEnterNode = () => {
    if (!selectedNode) return;
    const success = enterGuildNode(currentGuildChapterId, selectedNode.id);
    if (success && selectedNode.type !== 'start' && selectedNode.type !== 'rest' && selectedNode.type !== 'shop' && selectedNode.type !== 'shrine' && selectedNode.type !== 'treasure') {
      const stars = Math.floor(Math.random() * 3) + 1;
      setTimeout(() => {
        clearGuildNode(currentGuildChapterId, selectedNode.id, stars);
        setBattleResult({ stars, won: true });
      }, 500);
    } else if (success) {
      clearGuildNode(currentGuildChapterId, selectedNode.id, 3);
      setBattleResult({ stars: 3, won: true });
    }
  };

  const handleClaimReward = () => {
    if (!selectedNode) return;
    claimNodeReward(currentGuildChapterId, selectedNode.id);
  };

  const toggleFormationCompanion = (companionId: string) => {
    if (guildFormation.includes(companionId)) {
      setGuildFormation(guildFormation.filter(id => id !== companionId));
    } else if (guildFormation.length < 5) {
      setGuildFormation([...guildFormation, companionId]);
    }
  };

  const renderGuildHeader = () => (
    <div className="guild-header">
      <div className="guild-info">
        <div className="guild-level-badge">
          <span className="guild-icon">🏰</span>
          <span className="guild-level-text">Lv.{guildLevel}</span>
        </div>
        <div className="guild-exp-bar">
          <div
            className="guild-exp-fill"
            style={{ width: `${expToNext > 0 ? ((guildExp - levelConfig.expRequired) / expToNext) * 100 : 100}%` }}
          />
          <span className="guild-exp-text">
            {guildExp - levelConfig.expRequired} / {expToNext || 'MAX'}
          </span>
        </div>
      </div>
      <div className="guild-resources">
        <div className="guild-stamina">
          <span className="stamina-icon">⚡</span>
          <span className="stamina-value">{currentStamina}/{maxStamina}</span>
        </div>
        <div className="guild-contribution">
          <span className="contribution-icon">🎖️</span>
          <span className="contribution-value">{guildContribution}</span>
        </div>
      </div>
    </div>
  );

  const renderMapTab = () => (
    <div className="guild-map-tab">
      <div className="chapter-selector">
        {GUILD_CHAPTERS.map((chapter) => (
          <button
            key={chapter.id}
            className={`chapter-btn ${currentGuildChapterId === chapter.id ? 'active' : ''}`}
            onClick={() => setCurrentGuildChapter(chapter.id)}
          >
            <span className="chapter-icon">{chapter.icon}</span>
            <span className="chapter-name">{chapter.name}</span>
          </button>
        ))}
      </div>

      <div className="guild-map-container">
        <div
          className="guild-map"
          style={{ backgroundColor: currentChapter?.bgColor || '#333' }}
        >
          <svg className="map-connections" viewBox="0 0 100 60" preserveAspectRatio="none">
            {currentChapter?.nodes.map((node) =>
              node.connections.map((connId) => {
                const targetNode = currentChapter.nodes.find(n => n.id === connId);
                if (!targetNode) return null;
                const nodeProgress = getNodeProgress(currentGuildChapterId, node.id);
                const targetProgress = getNodeProgress(currentGuildChapterId, connId);
                const isCleared = nodeProgress?.cleared && targetProgress?.cleared;
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.x}
                    y1={node.y + 10}
                    x2={targetNode.x}
                    y2={targetNode.y + 10}
                    stroke={isCleared ? '#4ade80' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="0.8"
                    strokeDasharray={isCleared ? 'none' : '2,2'}
                  />
                );
              })
            )}
          </svg>

          {currentChapter?.nodes.map((node) => {
            const progress = getNodeProgress(currentGuildChapterId, node.id);
            const accessible = isNodeAccessible(currentGuildChapterId, node.id);
            const hasReward = canClaimNodeReward(currentGuildChapterId, node.id);

            return (
              <button
                key={node.id}
                className={`map-node ${node.type} ${progress?.cleared ? 'cleared' : ''} ${!accessible ? 'locked' : ''} ${hasReward ? 'has-reward' : ''}`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y + 10}%`,
                  backgroundColor: node.bgColor,
                }}
                onClick={() => handleNodeClick(node)}
                disabled={!accessible}
              >
                <span className="node-icon">{node.icon}</span>
                {progress?.bestStars && progress.bestStars > 0 && (
                  <div className="node-stars">
                    {'★'.repeat(progress.bestStars)}
                  </div>
                )}
                {hasReward && <span className="reward-badge">!</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="guild-bonuses-preview">
        <h4>公会加成</h4>
        <div className="bonus-grid-small">
          <div className="bonus-item-small">
            <span>⚔️ 攻击</span>
            <span className="bonus-value">+{getGuildAttackBonus()}</span>
          </div>
          <div className="bonus-item-small">
            <span>🛡️ 防御</span>
            <span className="bonus-value">+{getGuildDefenseBonus()}</span>
          </div>
          <div className="bonus-item-small">
            <span>❤️ 生命</span>
            <span className="bonus-value">+{getGuildHpBonus()}</span>
          </div>
          <div className="bonus-item-small">
            <span>💰 金币</span>
            <span className="bonus-value">+{(getGuildGoldBonus() * 100).toFixed(0)}%</span>
          </div>
          <div className="bonus-item-small">
            <span>⚡ 经验</span>
            <span className="bonus-value">+{(getGuildExpBonus() * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {showNodeDetail && selectedNode && (
        <div className="node-detail-modal" onClick={() => setShowNodeDetail(false)}>
          <div className="node-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="node-detail-header" style={{ backgroundColor: selectedNode.bgColor }}>
              <span className="node-detail-icon">{selectedNode.icon}</span>
              <h3>{selectedNode.name}</h3>
              <span className="node-type-tag">{selectedNode.type}</span>
            </div>

            <div className="node-detail-body">
              <p className="node-desc">{selectedNode.description}</p>

              <div className="node-stats">
                <div className="node-stat">
                  <span>推荐等级</span>
                  <span>Lv.{selectedNode.minLevel}</span>
                </div>
                <div className="node-stat">
                  <span>体力消耗</span>
                  <span className="stamina-cost">⚡ {selectedNode.staminaCost}</span>
                </div>
              </div>

              <div className="node-rewards-section">
                <h4>🎁 通关奖励</h4>
                <div className="reward-list">
                  {selectedNode.rewards.map((reward, i) => (
                    <div key={i} className={`reward-tag ${reward.type}`}>
                      {reward.type === 'gold' && '💰'}
                      {reward.type === 'exp' && '⚡'}
                      {reward.type === 'soulOrbs' && '💎'}
                      {reward.type === 'hp' && '❤️'}
                      {reward.type === 'attack' && '⚔️'}
                      {reward.type === 'defense' && '🛡️'}
                      {reward.type === 'speed' && '💨'}
                      {reward.type === 'reputation' && '🏛️'}
                      {' '}+{reward.value}
                    </div>
                  ))}
                </div>
              </div>

              {battleResult && (
                <div className={`battle-result ${battleResult.won ? 'won' : 'lost'}`}>
                  <div className="result-icon">{battleResult.won ? '🎉' : '💔'}</div>
                  <div className="result-text">
                    {battleResult.won ? '战斗胜利！' : '战斗失败...'}
                  </div>
                  {battleResult.won && (
                    <div className="result-stars">
                      {'★'.repeat(battleResult.stars)}
                      {'☆'.repeat(3 - battleResult.stars)}
                    </div>
                  )}
                </div>
              )}

              {!battleResult && (
                <button
                  className="enter-node-btn"
                  onClick={handleEnterNode}
                  disabled={currentStamina < selectedNode.staminaCost || getNodeProgress(currentGuildChapterId, selectedNode.id)?.cleared}
                >
                  {getNodeProgress(currentGuildChapterId, selectedNode.id)?.cleared ? '已通关' : `⚔️ 挑战（⚡${selectedNode.staminaCost}）`}
                </button>
              )}

              {battleResult?.won && canClaimNodeReward(currentGuildChapterId, selectedNode.id) && (
                <button className="claim-reward-btn" onClick={handleClaimReward}>
                  🎁 领取奖励
                </button>
              )}

              <button className="close-detail-btn" onClick={() => setShowNodeDetail(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTechTab = () => (
    <div className="guild-tech-tab">
      <div className="tech-header">
        <h3>🔧 公会科技</h3>
        <p className="tech-desc">升级公会科技，获得永久属性加成</p>
        <div className="tech-contribution">
          <span>当前贡献：🎖️ {guildContribution}</span>
        </div>
      </div>

      <div className="tech-categories">
        {['combat', 'economy', 'utility'].map((category) => (
          <div key={category} className="tech-category">
            <h4 className="category-title">
              {category === 'combat' ? '⚔️ 战斗' : category === 'economy' ? '💰 经济' : '✨ 辅助'}
            </h4>
            <div className="tech-list">
              {GUILD_TECH_TREE.filter(t => t.category === category).map((tech) => {
                const level = getGuildTechLevel(tech.id);
                const canUpgrade = canUpgradeGuildTech(tech.id);
                const cost = tech.costPerLevel * (level + 1);
                const isMaxed = level >= tech.maxLevel;
                const totalBonus = tech.effectValuePerLevel * level;

                return (
                  <div
                    key={tech.id}
                    className={`tech-card ${!canUpgrade && level === 0 ? 'locked' : ''} ${isMaxed ? 'maxed' : ''}`}
                  >
                    <div className="tech-icon">{tech.icon}</div>
                    <div className="tech-info">
                      <div className="tech-name-row">
                        <span className="tech-name">{tech.name}</span>
                        <span className="tech-level">Lv.{level}/{tech.maxLevel}</span>
                      </div>
                      <p className="tech-desc-small">{tech.description}</p>
                      <div className="tech-effect">
                        <span>当前效果: </span>
                        <span className="effect-value">
                          +{totalBonus}
                          {tech.effectType === 'attack' || tech.effectType === 'defense' || tech.effectType === 'hp' || tech.effectType === 'stamina' ? '' : '%'}
                        </span>
                      </div>
                      {tech.prerequisites.length > 0 && level === 0 && (
                        <div className="tech-prereqs">
                          需要: {tech.prerequisites.map(prereqId => {
                            const prereq = GUILD_TECH_TREE.find(t => t.id === prereqId);
                            return prereq?.name;
                          }).join('、')}
                        </div>
                      )}
                    </div>
                    <button
                      className="upgrade-tech-btn"
                      onClick={() => upgradeGuildTech(tech.id)}
                      disabled={!canUpgrade || isMaxed || guildContribution < cost}
                    >
                      {isMaxed ? '已满级' : `🎖️ ${cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDailyTab = () => (
    <div className="guild-daily-tab">
      <div className="daily-header">
        <h3>🎁 每日签到</h3>
        <p className="daily-desc">每日签到获得丰厚奖励，连续签到奖励更丰厚</p>
        <div className="daily-streak-info">
          <span>已连续签到</span>
          <span className="streak-count">{dailyStreak} 天</span>
        </div>
      </div>

      <div className="daily-rewards-grid">
        {guildDailyRewards.map((reward) => {
          const canClaim = canClaimDailyReward(reward.day);
          const isClaimed = reward.claimed;

          return (
            <div
              key={reward.day}
              className={`daily-reward-card ${isClaimed ? 'claimed' : ''} ${canClaim ? 'available' : ''}`}
            >
              <div className="day-badge">第 {reward.day} 天</div>
              <div className="daily-rewards-list">
                {reward.rewards.map((r, i) => (
                  <div key={i} className={`daily-reward-item ${r.type}`}>
                    <span className="reward-icon">
                      {r.type === 'gold' && '💰'}
                      {r.type === 'exp' && '⚡'}
                      {r.type === 'soulOrbs' && '💎'}
                    </span>
                    <span className="reward-amount">{r.value}</span>
                  </div>
                ))}
              </div>
              <button
                className="claim-daily-btn"
                onClick={() => claimDailyReward(reward.day)}
                disabled={!canClaim || isClaimed}
              >
                {isClaimed ? '✓ 已领取' : canClaim ? '领取' : '未解锁'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFormationTab = () => (
    <div className="guild-formation-tab">
      <div className="formation-header">
        <h3>⚔️ 公会编队</h3>
        <p className="formation-desc">选择最多5名伙伴参与公会远征</p>
        <div className="formation-power">
          <span>总战力：</span>
          <span className="power-value">{formationPower}</span>
        </div>
      </div>

      <div className="formation-slots">
        <h4>当前编队 ({guildFormation.length}/5)</h4>
        <div className="formation-slot-list">
          {[...Array(5)].map((_, i) => {
            const companionId = guildFormation[i];
            const companion = ownedCompanions.find(c => c.id === companionId);
            return (
              <div
                key={i}
                className={`formation-slot ${companion ? 'filled' : 'empty'}`}
                onClick={() => companion && toggleFormationCompanion(companion.id)}
                style={companion ? { borderColor: RARITY_COLORS[companion.rarity] } : {}}
              >
                {companion ? (
                  <>
                    <div
                      className="slot-avatar"
                      style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                    >
                      {companion.name[0]}
                    </div>
                    <span className="slot-name">{companion.name}</span>
                    <span className="slot-remove">✕</span>
                  </>
                ) : (
                  <span className="slot-empty-text">空位</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="available-companions">
        <h4>可用伙伴</h4>
        {ownedCompanions.length === 0 ? (
          <div className="empty-state">
            <p>暂无伙伴</p>
          </div>
        ) : (
          <div className="companion-grid">
            {ownedCompanions.map((companion) => {
              const isSelected = guildFormation.includes(companion.id);
              return (
                <button
                  key={companion.id}
                  className={`companion-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleFormationCompanion(companion.id)}
                  style={{ borderColor: isSelected ? RARITY_COLORS[companion.rarity] : 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="companion-avatar-small"
                    style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                  >
                    {companion.name[0]}
                  </div>
                  <div className="companion-info-small">
                    <span className="companion-name" style={{ color: RARITY_COLORS[companion.rarity] }}>
                      {companion.name}
                    </span>
                    <span className="companion-level">Lv.{companion.level}</span>
                  </div>
                  {isSelected && <span className="check-mark">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (guildActiveTab) {
      case 'map':
        return renderMapTab();
      case 'tech':
        return renderTechTab();
      case 'daily':
        return renderDailyTab();
      case 'formation':
        return renderFormationTab();
      default:
        return renderMapTab();
    }
  };

  return (
    <div className="guild-panel">
      {renderGuildHeader()}

      <div className="guild-tabs">
        {guildTabs.map((tab) => (
          <button
            key={tab.id}
            className={`guild-tab ${guildActiveTab === tab.id ? 'active' : ''}`}
            onClick={() => setGuildActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="guild-tab-content">
        {renderContent()}
      </div>
    </div>
  );
}
