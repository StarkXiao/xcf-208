import { useState } from 'react';
import { useGameStore } from '../game/store';
import { REPUTATION_LEVELS, SHOP_ITEMS } from '../game/data';
import { MAP_MODIFIER_ICONS } from '../game/types';
import GameCanvas from './GameCanvas';
import BattleLog from './BattleLog';

export default function MapPanel() {
  const [showMapSelect, setShowMapSelect] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const {
    mapAreas,
    currentAreaId,
    setCurrentArea,
    isAutoBattle,
    setAutoBattle,
    currentMonster,
    player,
    areaReputations,
    getAreaReputation,
    getAreaDropBonus,
    getAreaShopDiscount,
    getAreaRecruitDiscount,
    getAreaEventBonus,
    buyShopItem,
    purchasedShopItems,
    getDiscountedCost,
    getMapAreaModifiers,
    getMapModifierTotalBonus,
    getLevelProgress,
    getStarConfig,
    getFirstClearConfig,
    canClaimStarReward,
    canClaimFirstClearReward,
    claimStarReward,
    claimFirstClearReward,
    currentLevelStats,
    checkStarCondition,
  } = useGameStore();

  const currentArea = mapAreas.find((a) => a.id === currentAreaId);
  const currentRep = areaReputations.find((r) => r.areaId === currentAreaId) || { areaId: currentAreaId, points: 0, level: 0 };
  const currentRepData = REPUTATION_LEVELS.find((rl) => rl.level === currentRep.level) || REPUTATION_LEVELS[0];
  const nextRepData = REPUTATION_LEVELS.find((rl) => rl.level === currentRep.level + 1);
  const repProgress = nextRepData
    ? ((currentRep.points - currentRepData.minPoints) / (nextRepData.minPoints - currentRepData.minPoints)) * 100
    : 100;

  const dropBonus = getAreaDropBonus(currentAreaId);
  const shopDiscount = getAreaShopDiscount(currentAreaId);
  const recruitDiscount = getAreaRecruitDiscount(currentAreaId);
  const eventBonus = getAreaEventBonus(currentAreaId);
  const areaModifiers = getMapAreaModifiers(currentAreaId || '');
  const areaAtkBonus = getMapModifierTotalBonus('attack');
  const areaDefBonus = getMapModifierTotalBonus('defense');
  const areaHpBonus = getMapModifierTotalBonus('maxHp');
  const areaSpdBonus = getMapModifierTotalBonus('speed');
  const areaLukBonus = getMapModifierTotalBonus('luck');

  const areaShopItems = SHOP_ITEMS.filter((item) => item.areaId === currentAreaId);

  return (
    <div className="map-panel">
      <div className="map-header">
        <button
          className="map-select-btn"
          onClick={() => setShowMapSelect(!showMapSelect)}
        >
          🗺️ {currentArea?.name || '选择地图'}
        </button>

        <button
          className={`shop-btn ${shopDiscount > 0 ? 'has-discount' : ''}`}
          onClick={() => setShowShop(!showShop)}
        >
          🛒 商店
        </button>

        <button
          className={`auto-battle-btn ${isAutoBattle ? 'active' : ''}`}
          onClick={() => setAutoBattle(!isAutoBattle)}
        >
          {isAutoBattle ? '⏸️ 暂停挂机' : '▶️ 开始挂机'}
        </button>
      </div>

      {showMapSelect && (
        <div className="map-select-popup">
          <div className="map-list">
            {mapAreas.map((area) => {
              const rep = getAreaReputation(area.id);
              const repData = REPUTATION_LEVELS.find((rl) => rl.level === rep.level) || REPUTATION_LEVELS[0];
              const areaMods = getMapAreaModifiers(area.id);
              const progress = getLevelProgress(area.id);
              const canClaimFirst = canClaimFirstClearReward(area.id);
              return (
                <button
                  key={area.id}
                  className={`map-item ${currentAreaId === area.id ? 'current' : ''} ${!area.unlocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (area.unlocked) {
                      setCurrentArea(area.id);
                      setShowMapSelect(false);
                      setShowShop(false);
                    }
                  }}
                  disabled={!area.unlocked}
                >
                  <div
                    className="map-preview"
                    style={{ backgroundColor: area.bgColor }}
                  />
                  <div className="map-info">
                    <h4>{area.name}</h4>
                    <p>{area.description}</p>
                    <p className="map-requirement">
                      {area.unlocked ? '✅ 已解锁' : `🔒 需要等级 ${area.minLevel}`}
                    </p>
                    {area.unlocked && (
                      <>
                        <p className="map-rep-badge" style={{ color: repData.color }}>
                          🏛️ {repData.name} ({rep.points})
                        </p>
                        <div className="map-stars">
                          {[1, 2, 3].map((star) => (
                            <span
                              key={star}
                              className={`star-icon ${progress.bestStars >= star ? 'earned' : 'locked'}`}
                            >
                              {progress.bestStars >= star ? '⭐' : '☆'}
                            </span>
                          ))}
                          {canClaimFirst && (
                            <span className="first-clear-badge">🎉 首通奖励</span>
                          )}
                        </div>
                      </>
                    )}
                    {areaMods.length > 0 && (
                      <div className="map-modifiers-inline">
                        {areaMods.map((mod, i) => (
                          <span key={i} className="map-modifier-tag">
                            {MAP_MODIFIER_ICONS[mod.type] || '📌'} {mod.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {areaModifiers.length > 0 && (
        <div className="map-area-modifiers-section">
          <h4 className="modifiers-title">🗺️ 当前区域状态</h4>
          <div className="map-modifiers-list">
            {areaModifiers.map((mod, i) => {
              const isNegative = mod.type === 'hazard' || mod.type === 'cursed';
              return (
                <div
                  key={i}
                  className={`map-modifier-card ${isNegative ? 'negative' : 'positive'}`}
                >
                  <span className="modifier-icon">
                    {MAP_MODIFIER_ICONS[mod.type] || '📌'}
                  </span>
                  <div className="modifier-info">
                    <h5>{mod.name}</h5>
                    <p>{mod.description}</p>
                    {mod.effect && (
                      <p className={`modifier-effect ${mod.effect.value > 0 ? 'positive' : 'negative'}`}>
                        {mod.effect.value > 0 ? '+' : ''}{mod.effect.value} {mod.effect.stat}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {(areaAtkBonus !== 0 || areaDefBonus !== 0 || areaHpBonus !== 0 || areaSpdBonus !== 0 || areaLukBonus !== 0) && (
            <div className="modifier-total-bonus">
              <span>区域状态总加成：</span>
              {areaAtkBonus !== 0 && <span className={areaAtkBonus > 0 ? 'positive' : 'negative'}>⚔️ {areaAtkBonus > 0 ? '+' : ''}{areaAtkBonus} </span>}
              {areaDefBonus !== 0 && <span className={areaDefBonus > 0 ? 'positive' : 'negative'}>🛡️ {areaDefBonus > 0 ? '+' : ''}{areaDefBonus} </span>}
              {areaHpBonus !== 0 && <span className={areaHpBonus > 0 ? 'positive' : 'negative'}>❤️ {areaHpBonus > 0 ? '+' : ''}{areaHpBonus} </span>}
              {areaSpdBonus !== 0 && <span className={areaSpdBonus > 0 ? 'positive' : 'negative'}>👟 {areaSpdBonus > 0 ? '+' : ''}{areaSpdBonus} </span>}
              {areaLukBonus !== 0 && <span className={areaLukBonus > 0 ? 'positive' : 'negative'}>🍀 {areaLukBonus > 0 ? '+' : ''}{areaLukBonus} </span>}
            </div>
          )}
        </div>
      )}

      <div className="level-stars-section">
        <div className="stars-header">
          <h4 className="stars-title">⭐ 关卡星级</h4>
          <div className="stars-display">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`big-star ${getLevelProgress(currentAreaId).bestStars >= star ? 'earned' : 'locked'}`}
              >
                {getLevelProgress(currentAreaId).bestStars >= star ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>

        {canClaimFirstClearReward(currentAreaId) && (
          <div className="first-clear-reward">
            <div className="first-clear-info">
              <span className="first-clear-title">🎉 {getFirstClearConfig(currentAreaId)?.title}</span>
              <div className="first-clear-rewards">
                {getFirstClearConfig(currentAreaId)?.rewards.map((reward, i) => {
                  let icon = '💰';
                  let label = reward.value.toString();
                  switch (reward.type) {
                    case 'gold': icon = '💰'; label = `${reward.value} 金币`; break;
                    case 'exp': icon = '⭐'; label = `${reward.value} 经验`; break;
                    case 'soulOrbs': icon = '💎'; label = `${reward.value} 魂珠`; break;
                    case 'attack': icon = '⚔️'; label = `+${reward.value} 攻击`; break;
                    case 'defense': icon = '🛡️'; label = `+${reward.value} 防御`; break;
                    case 'hp': icon = '❤️'; label = `+${reward.value} 生命`; break;
                    case 'reputation': icon = '🏛️'; label = `+${reward.value} 声望`; break;
                  }
                  return (
                    <span key={i} className="reward-tag">
                      {icon} {label}
                    </span>
                  );
                })}
              </div>
            </div>
            <button
              className="claim-reward-btn"
              onClick={() => claimFirstClearReward(currentAreaId)}
            >
              领取首通奖励
            </button>
          </div>
        )}

        <div className="star-conditions-list">
          {getStarConfig(currentAreaId).map((config) => {
            const canClaim = canClaimStarReward(currentAreaId, config.stars);
            const progress = getLevelProgress(currentAreaId);
            const isClaimed = progress.claimedStarRewards.includes(config.stars);
            const isEarned = progress.bestStars >= config.stars;

            return (
              <div
                key={config.stars}
                className={`star-condition-card ${isEarned ? 'earned' : ''} ${isClaimed ? 'claimed' : ''}`}
              >
                <div className="star-condition-header">
                  <span className="star-condition-title">
                    {'⭐'.repeat(config.stars)} {config.title}
                  </span>
                  {isClaimed && <span className="claimed-badge">已领取</span>}
                </div>

                <div className="star-conditions">
                  {config.conditions.map((cond, i) => {
                    const isMet = checkStarCondition(cond);
                    let progressText = '';
                    let progressPercent = 0;

                    if (currentLevelStats) {
                      const survivalSeconds = (Date.now() - currentLevelStats.startTime) / 1000;
                      const killEfficiency = survivalSeconds > 0 ? currentLevelStats.totalKills / survivalSeconds : 0;

                      switch (cond.type) {
                        case 'totalKills':
                          progressText = `${currentLevelStats.totalKills} / ${cond.threshold}`;
                          progressPercent = Math.min(100, (currentLevelStats.totalKills / cond.threshold) * 100);
                          break;
                        case 'killEfficiency':
                          progressText = `${killEfficiency.toFixed(2)} / ${cond.threshold}`;
                          progressPercent = Math.min(100, (killEfficiency / cond.threshold) * 100);
                          break;
                        case 'damageTaken':
                          progressText = `${currentLevelStats.timesHit} / ${cond.threshold}`;
                          progressPercent = Math.min(100, ((cond.threshold - currentLevelStats.timesHit + cond.threshold) / (cond.threshold * 2)) * 100);
                          break;
                        case 'eventChoices':
                          progressText = `${currentLevelStats.goodEventChoices} / ${cond.threshold}`;
                          progressPercent = Math.min(100, (currentLevelStats.goodEventChoices / cond.threshold) * 100);
                          break;
                        case 'resourceDrop':
                          progressText = `${currentLevelStats.goldEarned} / ${cond.threshold}`;
                          progressPercent = Math.min(100, (currentLevelStats.goldEarned / cond.threshold) * 100);
                          break;
                        case 'survivalTime':
                          progressText = `${Math.floor(survivalSeconds)} / ${cond.threshold}秒`;
                          progressPercent = Math.min(100, (survivalSeconds / cond.threshold) * 100);
                          break;
                        case 'comboKills':
                          progressText = `${currentLevelStats.maxComboKills} / ${cond.threshold}`;
                          progressPercent = Math.min(100, (currentLevelStats.maxComboKills / cond.threshold) * 100);
                          break;
                      }
                    }

                    return (
                      <div key={i} className={`condition-item ${isMet ? 'met' : ''}`}>
                        <span className="condition-icon">{cond.icon}</span>
                        <div className="condition-info">
                          <span className="condition-text">{cond.description}</span>
                          {currentLevelStats && (
                            <div className="condition-progress-bar">
                              <div
                                className="condition-progress-fill"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <span className="condition-progress-text">{progressText}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="star-rewards">
                  <span className="rewards-label">奖励:</span>
                  {config.rewards.map((reward, i) => {
                    let icon = '💰';
                    let label = reward.value.toString();
                    switch (reward.type) {
                      case 'gold': icon = '💰'; label = `${reward.value}`; break;
                      case 'exp': icon = '⭐'; label = `${reward.value}`; break;
                      case 'soulOrbs': icon = '💎'; label = `${reward.value}`; break;
                      case 'attack': icon = '⚔️'; label = `+${reward.value}`; break;
                      case 'defense': icon = '🛡️'; label = `+${reward.value}`; break;
                      case 'hp': icon = '❤️'; label = `+${reward.value}`; break;
                      case 'reputation': icon = '🏛️'; label = `+${reward.value}`; break;
                    }
                    return (
                      <span key={i} className="reward-mini">
                        {icon} {label}
                      </span>
                    );
                  })}
                </div>

                {canClaim && (
                  <button
                    className="claim-star-reward-btn"
                    onClick={() => claimStarReward(currentAreaId, config.stars)}
                  >
                    领取奖励
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="reputation-section">
        <div className="rep-header">
          <span className="rep-title" style={{ color: currentRepData.color }}>
            🏛️ {currentRepData.name}
          </span>
          <span className="rep-points">{currentRep.points} 声望</span>
        </div>
        <div className="rep-bar-container">
          <div className="rep-bar-bg">
            <div
              className="rep-bar-fill"
              style={{
                width: `${Math.min(100, repProgress)}%`,
                backgroundColor: currentRepData.color,
              }}
            />
          </div>
          {nextRepData && (
            <span className="rep-bar-label">
              下一级: {nextRepData.name}（{nextRepData.minPoints}）
            </span>
          )}
          {!nextRepData && (
            <span className="rep-bar-label">已达到最高声望</span>
          )}
        </div>
        <div className="rep-bonuses-grid">
          <div className="rep-bonus-item">
            <span className="rep-bonus-label">📦 掉落加成</span>
            <span className="rep-bonus-value">+{(dropBonus * 100).toFixed(0)}%</span>
          </div>
          <div className="rep-bonus-item">
            <span className="rep-bonus-label">🛒 商店折扣</span>
            <span className="rep-bonus-value">-{(shopDiscount * 100).toFixed(0)}%</span>
          </div>
          <div className="rep-bonus-item">
            <span className="rep-bonus-label">🤝 招募折扣</span>
            <span className="rep-bonus-value">-{(recruitDiscount * 100).toFixed(0)}%</span>
          </div>
          <div className="rep-bonus-item">
            <span className="rep-bonus-label">✨ 事件加成</span>
            <span className="rep-bonus-value">+{(eventBonus * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {showShop && (
        <div className="shop-section">
          <h4 className="shop-title">🛒 {currentArea?.name} 商店</h4>
          {areaShopItems.length === 0 ? (
            <p className="shop-empty">此区域暂无商品</p>
          ) : (
            <div className="shop-list">
              {areaShopItems.map((item) => {
                const repLevel = getAreaReputation(currentAreaId).level;
                const locked = repLevel < item.minReputationLevel;
                const discountedCost = getDiscountedCost(item.baseCost, item.areaId);
                const canAfford = item.currency === 'gold'
                  ? player.stats.gold >= discountedCost
                  : player.stats.soulOrbs >= discountedCost;
                const purchased = purchasedShopItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`shop-item-card ${locked ? 'locked' : ''} ${purchased ? 'purchased' : ''}`}
                  >
                    <div className="shop-item-icon">{item.icon}</div>
                    <div className="shop-item-info">
                      <h5>{item.name}</h5>
                      <p className="shop-item-desc">{item.description}</p>
                      {locked && (
                        <p className="shop-item-locked">
                          🔒 需要声望等级: {REPUTATION_LEVELS.find((rl) => rl.level === item.minReputationLevel)?.name}
                        </p>
                      )}
                      {shopDiscount > 0 && !locked && (
                        <p className="shop-item-discount">
                          💰 折扣价: {discountedCost} <s>{item.baseCost}</s> {item.currency === 'gold' ? '金币' : '魂珠'}
                        </p>
                      )}
                      {shopDiscount === 0 && !locked && (
                        <p className="shop-item-price">
                          💰 {discountedCost} {item.currency === 'gold' ? '金币' : '魂珠'}
                        </p>
                      )}
                    </div>
                    <div className="shop-item-action">
                      {purchased ? (
                        <button className="purchased-btn" disabled>已购买</button>
                      ) : (
                        <button
                          className={`buy-shop-btn ${!canAfford || locked ? 'disabled' : ''}`}
                          onClick={() => buyShopItem(item.id)}
                          disabled={!canAfford || locked}
                        >
                          购买
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="game-canvas-container">
        <GameCanvas />

        {currentMonster && (
          <div className="monster-info-overlay">
            <div className="monster-name">{currentMonster.name}</div>
            <div className="monster-hp-bar">
              <div
                className="monster-hp-fill"
                style={{
                  width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%`
                }}
              />
            </div>
            <div className="monster-hp-text">
              {Math.floor(currentMonster.hp)} / {currentMonster.maxHp}
            </div>
          </div>
        )}

        {!isAutoBattle && (
          <div className="idle-overlay">
            <p>点击"开始挂机"开始自动战斗</p>
          </div>
        )}

        {player.stats.hp <= 0 && (
          <div className="dead-overlay">
            <p>💀 你被击败了</p>
            <p className="revive-text">正在复活中...</p>
          </div>
        )}
      </div>

      <BattleLog />
    </div>
  );
}
