import { useState } from 'react';
import { useGameStore } from '../game/store';
import { REPUTATION_LEVELS, SHOP_ITEMS } from '../game/data';
import GameCanvas from './GameCanvas';
import BattleLog from './BattleLog';

export default function MapPanel() {
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
  } = useGameStore();

  const [showMapSelect, setShowMapSelect] = useState(false);
  const [showShop, setShowShop] = useState(false);

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
                      <p className="map-rep-badge" style={{ color: repData.color }}>
                        🏛️ {repData.name} ({rep.points})
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
