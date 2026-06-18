import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../game/store';
import { BUILDINGS, RARITY_COLORS } from '../game/data';
import type { TownTab, Building } from '../game/types';

const RARITY_BG_COLORS: Record<string, string> = {
  common: '#9ca3af30',
  rare: '#3b82f630',
  epic: '#8b5cf630',
  legendary: '#f59e0b30',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '已结束';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}时${minutes}分`;
  if (minutes > 0) return `${minutes}分${secs}秒`;
  return `${secs}秒`;
}

export default function TownPanel() {
  const {
    ownedBuildings,
    townActiveTab,
    setTownActiveTab,
    getBuilding,
    getBuildingLevel,
    getBuildingProduction,
    getBuildingUpgradeCost,
    canUpgradeBuilding,
    upgradeBuilding,
    collectBuildingResources,
    collectAllBuildingResources,
    getBuildingCurrentResources,
    getTotalBuildingProduction,
    isBuildingUnlocked,
    getStationedCompanions,
    getAvailableCompanionsForStation,
    getStationBonus,
    stationCompanion,
    unstationCompanion,
    getBuildingStationSlots,
    getActiveMerchantEvents,
    getMerchantEvent,
    getMerchantItemStock,
    canBuyMerchantItem,
    buyMerchantItem,
    checkMerchantEvents,
    getMerchantEventChance,
    updateTownProduction,
  } = useGameStore();

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showBuildingDetail, setShowBuildingDetail] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      updateTownProduction();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateTownProduction]);

  const totalProduction = useMemo(() => getTotalBuildingProduction(), [getTotalBuildingProduction]);
  const activeEvents = useMemo(() => getActiveMerchantEvents(), [getActiveMerchantEvents]);
  const merchantChance = useMemo(() => getMerchantEventChance(), [getMerchantEventChance]);

  const townTabs: { id: TownTab; label: string; icon: string }[] = [
    { id: 'overview', label: '概览', icon: '🏘️' },
    { id: 'buildings', label: '建筑', icon: '🏗️' },
    { id: 'merchant', label: '商人', icon: '🛒' },
    { id: 'station', label: '驻守', icon: '👥' },
  ];

  const handleBuildingClick = (building: Building) => {
    if (!isBuildingUnlocked(building.id)) return;
    setSelectedBuilding(building);
    setShowBuildingDetail(true);
  };

  const handleUpgrade = () => {
    if (!selectedBuilding) return;
    upgradeBuilding(selectedBuilding.id);
  };

  const handleCollect = (buildingId: string) => {
    collectBuildingResources(buildingId);
  };

  const handleCollectAll = () => {
    collectAllBuildingResources();
  };

  const handleStation = (buildingId: string, companionId: string) => {
    stationCompanion(buildingId, companionId);
  };

  const handleUnstation = (buildingId: string, companionId: string) => {
    unstationCompanion(buildingId, companionId);
  };

  const handleBuyItem = (eventId: string, itemId: string) => {
    buyMerchantItem(eventId, itemId);
  };

  const renderOverview = () => (
    <div className="town-overview">
      <div className="town-header">
        <h3>🏘️ 我的城镇</h3>
        <p className="town-desc">经营你的城镇，获取丰厚收益</p>
      </div>

      <div className="town-stats-card">
        <div className="town-stat-item">
          <span className="stat-icon">💰</span>
          <div className="stat-info">
            <span className="stat-label">金币产出</span>
            <span className="stat-value">{formatNumber(totalProduction.goldPerMinute)}/分钟</span>
          </div>
        </div>
        <div className="town-stat-item">
          <span className="stat-icon">⭐</span>
          <div className="stat-info">
            <span className="stat-label">经验产出</span>
            <span className="stat-value">{formatNumber(totalProduction.expPerMinute)}/分钟</span>
          </div>
        </div>
        <div className="town-stat-item">
          <span className="stat-icon">💎</span>
          <div className="stat-info">
            <span className="stat-label">魂珠产出</span>
            <span className="stat-value">{formatNumber(totalProduction.soulOrbsPerMinute)}/分钟</span>
          </div>
        </div>
      </div>

      <div className="town-actions">
        <button className="collect-all-btn" onClick={handleCollectAll}>
          🎁 一键收取
        </button>
      </div>

      <div className="town-buildings-preview">
        <h4>🏗️ 我的建筑 ({ownedBuildings.length}/{BUILDINGS.length})</h4>
        <div className="buildings-grid small">
          {ownedBuildings.length === 0 ? (
            <div className="empty-state">
              <p>还没有建筑，去建造一些吧！</p>
            </div>
          ) : (
            ownedBuildings.map((owned) => {
              const building = getBuilding(owned.buildingId);
              if (!building) return null;
              const production = getBuildingProduction(owned.buildingId);
              const resources = getBuildingCurrentResources(owned.buildingId);
              const progress = Math.min(100, (resources / production.capacity) * 100);

              return (
                <div
                  key={owned.buildingId}
                  className="building-card small"
                  style={{ borderColor: building.bgColor }}
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className="building-icon" style={{ backgroundColor: building.bgColor + '30' }}>
                    {building.icon}
                  </div>
                  <div className="building-info">
                    <h5>{building.name}</h5>
                    <p className="building-level">Lv.{owned.level}</p>
                    <div className="building-progress">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%`, backgroundColor: building.bgColor }}
                      />
                    </div>
                    <p className="building-amount">
                      {formatNumber(resources)} / {formatNumber(production.capacity)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeEvents.length > 0 && (
        <div className="town-merchants-preview">
          <h4>🛒 当前商人 ({activeEvents.length})</h4>
          <div className="merchant-list small">
            {activeEvents.slice(0, 2).map((active) => {
              const event = getMerchantEvent(active.eventId);
              if (!event) return null;
              const remaining = (active.endTime - Date.now()) / 1000;

              return (
                <div
                  key={active.eventId}
                  className="merchant-card small"
                  style={{ borderColor: RARITY_COLORS[event.rarity] }}
                  onClick={() => setTownActiveTab('merchant')}
                >
                  <span className="merchant-icon">{event.icon}</span>
                  <div className="merchant-info">
                    <h5 style={{ color: RARITY_COLORS[event.rarity] }}>{event.title}</h5>
                    <p className="merchant-time">剩余: {formatTime(remaining)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderBuildings = () => (
    <div className="town-buildings">
      <div className="panel-header">
        <h3>🏗️ 建筑管理</h3>
        <p className="panel-desc">建造和升级建筑，提升产出效率</p>
      </div>

      <div className="buildings-grid">
        {BUILDINGS.map((building) => {
          const level = getBuildingLevel(building.id);
          const isUnlocked = isBuildingUnlocked(building.id);
          const production = getBuildingProduction(building.id);
          const resources = getBuildingCurrentResources(building.id);
          const upgradeCost = getBuildingUpgradeCost(building.id);
          const progress = production.capacity > 0 ? Math.min(100, (resources / production.capacity) * 100) : 0;
          const stationSlots = getBuildingStationSlots(building.id);
          const stationed = getStationedCompanions(building.id);

          return (
            <div
              key={building.id}
              className={`building-card ${!isUnlocked ? 'locked' : ''} ${level > 0 ? 'owned' : ''}`}
              style={{ borderColor: isUnlocked ? building.bgColor : '#4b5563' }}
              onClick={() => isUnlocked && handleBuildingClick(building)}
            >
              <div
                className="building-icon"
                style={{ backgroundColor: isUnlocked ? building.bgColor + '30' : '#374151' }}
              >
                {building.icon}
                {!isUnlocked && <span className="lock-icon">🔒</span>}
              </div>
              <div className="building-info">
                <h5>{building.name}</h5>
                {level > 0 ? (
                  <>
                    <p className="building-level">等级: Lv.{level}</p>
                    {production.rate > 0 && (
                      <p className="building-production">
                        产出: {formatNumber(production.rate)}/分钟
                      </p>
                    )}
                    {production.capacity > 0 && (
                      <>
                        <div className="building-progress">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%`, backgroundColor: building.bgColor }}
                          />
                        </div>
                        <p className="building-amount">
                          {formatNumber(resources)} / {formatNumber(production.capacity)}
                        </p>
                      </>
                    )}
                    {stationSlots > 0 && (
                      <p className="building-station">
                        驻守: {stationed.length}/{stationSlots}
                      </p>
                    )}
                  </>
                ) : isUnlocked ? (
                  <p className="building-cost">
                    建造: {upgradeCost?.cost?.toLocaleString()}{' '}
                    {upgradeCost?.currency === 'gold' ? '💰' : '💎'}
                  </p>
                ) : (
                  <p className="building-unlock">需要 Lv.{building.unlockLevel} 解锁</p>
                )}
              </div>
              {level > 0 && resources >= production.rate * 0.1 && (
                <button
                  className="collect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollect(building.id);
                  }}
                >
                  收取
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMerchant = () => (
    <div className="town-merchant">
      <div className="panel-header">
        <h3>🛒 商人集市</h3>
        <p className="panel-desc">
          神秘商人带来珍稀物品，商人出现概率: {(merchantChance * 100).toFixed(1)}%
        </p>
        <button className="refresh-btn" onClick={() => checkMerchantEvents()}>
          🔄 刷新商人
        </button>
      </div>

      {activeEvents.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🛒</p>
          <p>暂时没有商人来访</p>
          <p className="empty-desc">升级酒馆和市场可以增加商人出现概率</p>
        </div>
      ) : (
        <div className="merchant-list">
          {activeEvents.map((active) => {
            const event = getMerchantEvent(active.eventId);
            if (!event) return null;
            const remaining = (active.endTime - Date.now()) / 1000;

            return (
              <div
                key={active.eventId}
                className="merchant-card"
                style={{ borderColor: RARITY_COLORS[event.rarity] }}
              >
                <div className="merchant-header">
                  <div className="merchant-avatar" style={{ backgroundColor: RARITY_BG_COLORS[event.rarity] }}>
                    {event.merchantAvatar}
                  </div>
                  <div className="merchant-title">
                    <h4 style={{ color: RARITY_COLORS[event.rarity] }}>{event.title}</h4>
                    <p className="merchant-name">{event.merchantName}</p>
                  </div>
                  <div className="merchant-timer">
                    <span className="timer-label">剩余时间</span>
                    <span className="timer-value">{formatTime(remaining)}</span>
                  </div>
                </div>

                <p className="merchant-desc">{event.description}</p>

                <div className="merchant-items">
                  {event.items.map((item) => {
                    const stock = getMerchantItemStock(active.eventId, item.id);
                    const canBuy = canBuyMerchantItem(active.eventId, item.id);
                    const itemRarity = item.rarity || 'common';

                    return (
                      <div
                        key={item.id}
                        className={`merchant-item ${stock <= 0 ? 'sold-out' : ''}`}
                        style={{ borderColor: RARITY_COLORS[itemRarity] }}
                      >
                        <div
                          className="item-icon"
                          style={{ backgroundColor: RARITY_BG_COLORS[itemRarity] }}
                        >
                          {item.icon}
                        </div>
                        <div className="item-info">
                          <h5 style={{ color: RARITY_COLORS[itemRarity] }}>{item.name}</h5>
                          <p className="item-desc">{item.description}</p>
                          {item.stock !== undefined && (
                            <p className="item-stock">库存: {stock}/{item.stock}</p>
                          )}
                        </div>
                        <div className="item-action">
                          <span className="item-price">
                            {item.price.toLocaleString()} {item.priceCurrency === 'gold' ? '💰' : '💎'}
                          </span>
                          <button
                            className={`buy-btn ${!canBuy ? 'disabled' : ''}`}
                            disabled={!canBuy}
                            onClick={() => handleBuyItem(active.eventId, item.id)}
                          >
                            购买
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStation = () => {
    const availableCompanions = getAvailableCompanionsForStation();

    return (
      <div className="town-station">
        <div className="panel-header">
          <h3>👥 伙伴驻守</h3>
          <p className="panel-desc">派遣伙伴驻守建筑，提升产出效率</p>
        </div>

        <div className="station-buildings">
          {ownedBuildings.filter((b) => getBuildingStationSlots(b.buildingId) > 0).length === 0 ? (
            <div className="empty-state">
              <p>暂时没有可驻守的建筑</p>
              <p className="empty-desc">建造建筑后可以派遣伙伴驻守</p>
            </div>
          ) : (
            ownedBuildings
              .filter((owned) => getBuildingStationSlots(owned.buildingId) > 0)
              .map((owned) => {
                const building = getBuilding(owned.buildingId);
                if (!building) return null;
                const slots = getBuildingStationSlots(owned.buildingId);
                const stationed = getStationedCompanions(owned.buildingId);
                const bonus = getStationBonus(owned.buildingId);

                return (
                  <div
                    key={owned.buildingId}
                    className="station-building-card"
                    style={{ borderColor: building.bgColor }}
                  >
                    <div className="station-building-header">
                      <div
                        className="building-icon"
                        style={{ backgroundColor: building.bgColor + '30' }}
                      >
                        {building.icon}
                      </div>
                      <div className="station-building-info">
                        <h4>{building.name}</h4>
                        <p>
                          驻守: {stationed.length}/{slots} · 产出加成: +{(bonus * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="station-slots">
                      {Array.from({ length: slots }).map((_, idx) => {
                        const companion = stationed[idx];
                        return (
                          <div
                            key={idx}
                            className={`station-slot ${companion ? 'occupied' : 'empty'}`}
                            style={{ borderColor: companion ? RARITY_COLORS[companion.rarity] : '#4b5563' }}
                          >
                            {companion ? (
                              <>
                                <div
                                  className="slot-avatar"
                                  style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                                >
                                  {companion.name[0]}
                                </div>
                                <span
                                  className="slot-name"
                                  style={{ color: RARITY_COLORS[companion.rarity] }}
                                >
                                  {companion.name}
                                </span>
                                <button
                                  className="unstation-btn"
                                  onClick={() => handleUnstation(owned.buildingId, companion.id)}
                                >
                                  撤离
                                </button>
                              </>
                            ) : (
                              <span className="slot-empty">空位</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {availableCompanions.length > 0 && stationed.length < slots && (
                      <div className="available-companions">
                        <p className="available-title">可派遣:</p>
                        <div className="available-list">
                          {availableCompanions.slice(0, 6).map((companion) => (
                            <button
                              key={companion.id}
                              className="companion-chip"
                              style={{
                                borderColor: RARITY_COLORS[companion.rarity],
                                backgroundColor: RARITY_BG_COLORS[companion.rarity],
                              }}
                              onClick={() => handleStation(owned.buildingId, companion.id)}
                            >
                              {companion.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    );
  };

  const renderBuildingDetail = () => {
    if (!selectedBuilding || !showBuildingDetail) return null;

    const level = getBuildingLevel(selectedBuilding.id);
    const production = getBuildingProduction(selectedBuilding.id);
    const resources = getBuildingCurrentResources(selectedBuilding.id);
    const upgradeCost = getBuildingUpgradeCost(selectedBuilding.id);
    const canUpgrade = canUpgradeBuilding(selectedBuilding.id);
    const isMaxLevel = level >= selectedBuilding.maxLevel;
    const progress = production.capacity > 0 ? Math.min(100, (resources / production.capacity) * 100) : 0;
    const slots = getBuildingStationSlots(selectedBuilding.id);
    const stationed = getStationedCompanions(selectedBuilding.id);
    const bonus = getStationBonus(selectedBuilding.id);
    const availableCompanions = getAvailableCompanionsForStation();

    return (
      <div className="modal-overlay" onClick={() => setShowBuildingDetail(false)}>
        <div className="modal building-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header" style={{ backgroundColor: selectedBuilding.bgColor }}>
            <div className="modal-title-icon">{selectedBuilding.icon}</div>
            <div className="modal-title-text">
              <h3>{selectedBuilding.name}</h3>
              <p>Lv.{level} / {selectedBuilding.maxLevel}</p>
            </div>
            <button className="close-btn" onClick={() => setShowBuildingDetail(false)}>
              ✕
            </button>
          </div>

          <div className="modal-body">
            <p className="building-desc">{selectedBuilding.description}</p>

            {level > 0 && (
              <>
                <div className="detail-section">
                  <h4>📊 当前状态</h4>
                  {production.rate > 0 && (
                    <div className="detail-row">
                      <span>产出速率</span>
                      <span>
                        {formatNumber(production.rate)}/分钟 ({production.currency === 'gold' ? '金币' : production.currency === 'exp' ? '经验' : '魂珠'})
                      </span>
                    </div>
                  )}
                  {production.capacity > 0 && (
                    <>
                      <div className="detail-row">
                        <span>存储上限</span>
                        <span>{formatNumber(production.capacity)}</span>
                      </div>
                      <div className="resource-progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, backgroundColor: selectedBuilding.bgColor }}
                        />
                        <span className="progress-text">
                          {formatNumber(resources)} / {formatNumber(production.capacity)}
                        </span>
                      </div>
                    </>
                  )}
                  {slots > 0 && (
                    <div className="detail-row">
                      <span>驻守加成</span>
                      <span>+{(bonus * 100).toFixed(0)}% ({stationed.length}/{slots}人)</span>
                    </div>
                  )}
                </div>

                {resources >= production.rate * 0.1 && production.capacity > 0 && (
                  <button
                    className="collect-btn large"
                    onClick={() => handleCollect(selectedBuilding.id)}
                  >
                    🎁 收取资源
                  </button>
                )}
              </>
            )}

            {!isMaxLevel && (
              <div className="detail-section">
                <h4>⬆️ 升级</h4>
                {upgradeCost && (
                  <div className="detail-row">
                    <span>升级费用</span>
                    <span>
                      {upgradeCost.cost.toLocaleString()}{' '}
                      {upgradeCost.currency === 'gold' ? '💰 金币' : '💎 魂珠'}
                    </span>
                  </div>
                )}
                {level < selectedBuilding.maxLevel && (
                  <div className="next-level-preview">
                    <p>下一级效果预览:</p>
                    <ul>
                      <li>产出速率提升</li>
                      <li>存储上限提升</li>
                      {slots > 0 && level % 3 === 2 && <li>驻守位 +1</li>}
                    </ul>
                  </div>
                )}
                <button
                  className={`upgrade-btn ${!canUpgrade ? 'disabled' : ''}`}
                  disabled={!canUpgrade}
                  onClick={handleUpgrade}
                >
                  {level === 0 ? '🏗️ 建造' : '⬆️ 升级'}
                </button>
              </div>
            )}

            {isMaxLevel && (
              <div className="max-level-badge">
                ✨ 已达到最高等级 ✨
              </div>
            )}

            {slots > 0 && level > 0 && (
              <div className="detail-section">
                <h4>👥 驻守伙伴</h4>
                <div className="station-slots large">
                  {Array.from({ length: slots }).map((_, idx) => {
                    const companion = stationed[idx];
                    return (
                      <div
                        key={idx}
                        className={`station-slot ${companion ? 'occupied' : 'empty'}`}
                        style={{ borderColor: companion ? RARITY_COLORS[companion.rarity] : '#4b5563' }}
                      >
                        {companion ? (
                          <>
                            <div
                              className="slot-avatar"
                              style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                            >
                              {companion.name[0]}
                            </div>
                            <span className="slot-name" style={{ color: RARITY_COLORS[companion.rarity] }}>
                              {companion.name}
                            </span>
                            <button
                              className="unstation-btn"
                              onClick={() => handleUnstation(selectedBuilding.id, companion.id)}
                            >
                              撤离
                            </button>
                          </>
                        ) : (
                          <span className="slot-empty">空位</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {availableCompanions.length > 0 && stationed.length < slots && (
                  <div className="available-companions">
                    <p className="available-title">可派遣:</p>
                    <div className="available-list">
                      {availableCompanions.map((companion) => (
                        <button
                          key={companion.id}
                          className="companion-chip"
                          style={{
                            borderColor: RARITY_COLORS[companion.rarity],
                            backgroundColor: RARITY_BG_COLORS[companion.rarity],
                          }}
                          onClick={() => handleStation(selectedBuilding.id, companion.id)}
                        >
                          {companion.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (townActiveTab) {
      case 'overview':
        return renderOverview();
      case 'buildings':
        return renderBuildings();
      case 'merchant':
        return renderMerchant();
      case 'station':
        return renderStation();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="town-panel">
      <div className="panel-tabs">
        {townTabs.map((tab) => (
          <button
            key={tab.id}
            className={`panel-tab ${townActiveTab === tab.id ? 'active' : ''}`}
            onClick={() => setTownActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="panel-content">{renderContent()}</div>
      {renderBuildingDetail()}
    </div>
  );
}