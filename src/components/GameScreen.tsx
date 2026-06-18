import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../game/store';
import StatsPanel from './StatsPanel';
import MapPanel from './MapPanel';
import CompanionsPanel from './CompanionsPanel';
import EventModal from './EventModal';
import OfflineRewardsModal from './OfflineRewardsModal';
import ExpeditionPanel from './ExpeditionPanel';
import TalentPanel from './TalentPanel';
import GuildPanel from './GuildPanel';
import EquipmentPanel from './EquipmentPanel';
import RelicPanel from './RelicPanel';
import { ChapterPanel } from './ChapterPanel';
import CommissionPanel from './CommissionPanel';
import TradeMarketPanel from './TradeMarketPanel';
import BlackMarketPanel from './BlackMarketPanel';
import SkillTreePanel from './SkillTreePanel';
import TownPanel from './TownPanel';
import WorldBossPanel from './WorldBossPanel';
import AlchemyWorkshopPanel from './AlchemyWorkshopPanel';
import {
  REBIRTH_OPTIONS,
  REPUTATION_LEVELS,
  RARITY_COLORS,
  RARITY_NAMES,
  RESOURCE_EXCHANGE_RATES,
  COMPANION_DISMISS_SOUL_ORBS,
  COMPANIONS,
} from '../game/data';

type RebirthPrepStep = 'rewards' | 'dismiss' | 'exchange' | 'bonuses' | 'confirm';

export default function GameScreen() {
  const {
    activeTab,
    setActiveTab,
    player,
    rebirthBonuses,
    updateLastOnlineTime,
    checkMerchantEvents,
    updateTownProduction,
    areaReputations,
    mapAreas,
    ownedCompanions,
    formation,
    companionShards,
    dismissCompanion,
    exchangeGoldToSoulOrbs,
    exchangeShardsToSoulOrbs,
    getUnclaimedRewards,
    levelProgresses,
    rebirthChallenges,
    claimStarReward,
    claimFirstClearReward,
    claimRebirthChallengeReward,
    performRebirth,
  } = useGameStore();

  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [selectedRebirthBonuses, setSelectedRebirthBonuses] = useState<string[]>([]);
  const [rebirthStep, setRebirthStep] = useState<RebirthPrepStep>('rewards');
  const [dismissedCompanions, setDismissedCompanions] = useState<string[]>([]);
  const [exchangeGoldAmount, setExchangeGoldAmount] = useState(0);
  const [exchangeShardsMap, setExchangeShardsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      updateLastOnlineTime();
      updateTownProduction();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateLastOnlineTime();
      } else {
        checkMerchantEvents();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    checkMerchantEvents();

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateLastOnlineTime, updateTownProduction, checkMerchantEvents]);

  const tabs = [
    { id: 'map' as const, label: '🗺️ 地图', icon: '🗺️' },
    { id: 'chapters' as const, label: '📚 章节', icon: '📚' },
    { id: 'stats' as const, label: '📊 属性', icon: '📊' },
    { id: 'companions' as const, label: '🤝 伙伴', icon: '🤝' },
    { id: 'commissions' as const, label: '📜 委托', icon: '📜' },
    { id: 'trade' as const, label: '🏪 交易行', icon: '🏪' },
    { id: 'blackmarket' as const, label: '🌑 黑市', icon: '🌑' },
    { id: 'expedition' as const, label: '🏔️ 远征', icon: '🏔️' },
    { id: 'guild' as const, label: '🏰 公会', icon: '🏰' },
    { id: 'town' as const, label: '🏘️ 城镇', icon: '🏘️' },
    { id: 'worldboss' as const, label: '🐉 Boss', icon: '🐉' },
    { id: 'equipment' as const, label: '⚒️ 装备', icon: '⚒️' },
    { id: 'relics' as const, label: '🏆 神器', icon: '🏆' },
    { id: 'talents' as const, label: '🌟 天赋', icon: '🌟' },
    { id: 'skilltree' as const, label: '🌳 技能树', icon: '🌳' },
    { id: 'alchemy' as const, label: '⚗️ 炼金', icon: '⚗️' },
    { id: 'events' as const, label: '🔄 转生', icon: '🔄' },
  ];

  const canRebirth = player.stats.level >= 30;
  const soulOrbsGained = Math.floor(player.stats.level / 10);

  const unclaimedRewards = useMemo(() => getUnclaimedRewards(), [getUnclaimedRewards, levelProgresses, rebirthChallenges]);
  const hasUnclaimedRewards =
    unclaimedRewards.starRewards.length > 0 ||
    unclaimedRewards.firstClearRewards.length > 0 ||
    unclaimedRewards.rebirthChallengeRewards.length > 0;

  const totalDismissSoulOrbs = dismissedCompanions.reduce((sum, id) => {
    const c = ownedCompanions.find((comp) => comp.id === id);
    return sum + (c ? COMPANION_DISMISS_SOUL_ORBS[c.rarity] || 1 : 0);
  }, 0);

  const goldExchangeSoulOrbs = Math.floor(exchangeGoldAmount / RESOURCE_EXCHANGE_RATES.goldToSoulOrbs);
  const actualGoldCost = goldExchangeSoulOrbs * RESOURCE_EXCHANGE_RATES.goldToSoulOrbs;

  const totalShardExchangeSoulOrbs = Object.entries(exchangeShardsMap).reduce((sum, [_id, amount]) => {
    return sum + Math.floor(amount / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs);
  }, 0);

  const totalShardCost = Object.entries(exchangeShardsMap).reduce((sum, [_id, amount]) => {
    const orbs = Math.floor(amount / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs);
    return sum + orbs * RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs;
  }, 0);

  const totalSelectedCost = selectedRebirthBonuses.reduce((sum, id) => {
    const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
    return sum + (opt?.cost || 0);
  }, 0);

  const totalPrepSoulOrbs = soulOrbsGained + totalDismissSoulOrbs + goldExchangeSoulOrbs + totalShardExchangeSoulOrbs;
  const remainingSoulOrbs = player.stats.soulOrbs + totalPrepSoulOrbs - totalSelectedCost;

  const toggleRebirthBonus = (bonusId: string) => {
    const option = REBIRTH_OPTIONS.find((o) => o.id === bonusId);
    if (!option) return;

    const currentCost = selectedRebirthBonuses.reduce((sum, id) => {
      const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
      return sum + (opt?.cost || 0);
    }, 0);

    const availableSoulOrbs = player.stats.soulOrbs + totalPrepSoulOrbs;

    if (selectedRebirthBonuses.includes(bonusId)) {
      setSelectedRebirthBonuses(selectedRebirthBonuses.filter((id) => id !== bonusId));
    } else if (currentCost + option.cost <= availableSoulOrbs) {
      setSelectedRebirthBonuses([...selectedRebirthBonuses, bonusId]);
    }
  };

  const openRebirthModal = () => {
    if (!canRebirth) return;
    setRebirthStep('rewards');
    setSelectedRebirthBonuses([]);
    setDismissedCompanions([]);
    setExchangeGoldAmount(0);
    setExchangeShardsMap({});
    setShowRebirthModal(true);
  };

  const toggleDismissCompanion = (companionId: string) => {
    if (dismissedCompanions.includes(companionId)) {
      setDismissedCompanions(dismissedCompanions.filter((id) => id !== companionId));
    } else {
      setDismissedCompanions([...dismissedCompanions, companionId]);
    }
  };

  const updateShardExchange = (companionId: string, amount: number) => {
    const shard = companionShards.find((s) => s.companionId === companionId);
    const maxAmount = shard?.count || 0;
    const clamped = Math.max(0, Math.min(amount, maxAmount));
    setExchangeShardsMap({ ...exchangeShardsMap, [companionId]: clamped });
  };

  const handleRebirth = () => {
    dismissedCompanions.forEach((id) => dismissCompanion(id));

    if (actualGoldCost > 0) {
      exchangeGoldToSoulOrbs(exchangeGoldAmount);
    }

    Object.entries(exchangeShardsMap).forEach(([id, amount]) => {
      const actualAmount = Math.floor(amount / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs) * RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs;
      if (actualAmount > 0) {
        exchangeShardsToSoulOrbs(id, actualAmount);
      }
    });

    performRebirth(selectedRebirthBonuses);

    setShowRebirthModal(false);
    setSelectedRebirthBonuses([]);
    setDismissedCompanions([]);
    setExchangeGoldAmount(0);
    setExchangeShardsMap({});
  };

  const steps: { key: RebirthPrepStep; label: string; icon: string }[] = [
    { key: 'rewards', label: '奖励', icon: '🎁' },
    { key: 'dismiss', label: '遣散', icon: '💔' },
    { key: 'exchange', label: '兑换', icon: '🔄' },
    { key: 'bonuses', label: '加成', icon: '⭐' },
    { key: 'confirm', label: '确认', icon: '✅' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === rebirthStep);

  const renderStepIndicator = () => (
    <div className="rebirth-steps">
      {steps.map((step, idx) => (
        <div
          key={step.key}
          className={`step-item ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
        >
          <div className="step-icon">{idx < currentStepIndex ? '✓' : step.icon}</div>
          <span className="step-label">{step.label}</span>
          {idx < steps.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );

  const renderRewardsStep = () => (
    <div className="rebirth-step-content">
      <h4>🎁 未领取奖励提醒</h4>
      <p className="step-desc">转生后进度将重置，请确认是否领取以下奖励</p>

      {!hasUnclaimedRewards ? (
        <div className="empty-state">
          <p>✅ 没有未领取的奖励</p>
        </div>
      ) : (
        <div className="unclaimed-rewards-list">
          {unclaimedRewards.starRewards.length > 0 && (
            <div className="reward-category">
              <h5>⭐ 关卡星级奖励</h5>
              {unclaimedRewards.starRewards.map(({ areaId, stars }) => {
                const area = mapAreas.find((a) => a.id === areaId);
                return (
                  <div key={`${areaId}-${stars}`} className="reward-item">
                    <span>{area?.name} - {stars}星</span>
                    <button
                      className="claim-btn"
                      onClick={() => claimStarReward(areaId, stars)}
                    >
                      领取
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {unclaimedRewards.firstClearRewards.length > 0 && (
            <div className="reward-category">
              <h5>🏆 首次通关奖励</h5>
              {unclaimedRewards.firstClearRewards.map((areaId) => {
                const area = mapAreas.find((a) => a.id === areaId);
                return (
                  <div key={areaId} className="reward-item">
                    <span>{area?.name} 首通</span>
                    <button
                      className="claim-btn"
                      onClick={() => claimFirstClearReward(areaId)}
                    >
                      领取
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {unclaimedRewards.rebirthChallengeRewards.length > 0 && (
            <div className="reward-category">
              <h5>🎯 转生挑战奖励</h5>
              {unclaimedRewards.rebirthChallengeRewards.map((challengeId) => {
                const challenge = rebirthChallenges.find((c) => c.id === challengeId);
                return (
                  <div key={challengeId} className="reward-item">
                    <span>{challenge?.description}</span>
                    <button
                      className="claim-btn"
                      onClick={() => claimRebirthChallengeReward(challengeId)}
                    >
                      领取
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="step-actions">
        <button className="cancel-btn" onClick={() => setShowRebirthModal(false)}>
          取消
        </button>
        <button
          className="next-btn"
          onClick={() => setRebirthStep('dismiss')}
        >
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderDismissStep = () => (
    <div className="rebirth-step-content">
      <h4>💔 伙伴遣散</h4>
      <p className="step-desc">选择要遣散的伙伴，可获得魂珠奖励</p>

      {ownedCompanions.length === 0 ? (
        <div className="empty-state">
          <p>暂无可遣散的伙伴</p>
        </div>
      ) : (
        <div className="dismiss-companions-list">
          {ownedCompanions.map((companion) => {
            const isSelected = dismissedCompanions.includes(companion.id);
            const reward = COMPANION_DISMISS_SOUL_ORBS[companion.rarity] || 1;
            const isInFormation = formation.slots.some((s) => s.companionId === companion.id);
            return (
              <div
                key={companion.id}
                className={`dismiss-companion-card ${isSelected ? 'selected' : ''}`}
                style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                onClick={() => toggleDismissCompanion(companion.id)}
              >
                <div
                  className="companion-avatar"
                  style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                >
                  {companion.name[0]}
                </div>
                <div className="companion-info">
                  <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                    {companion.name}
                    {isInFormation && <span className="formation-badge">出战中</span>}
                  </h5>
                  <p className="companion-rarity">
                    {RARITY_NAMES[companion.rarity]} · Lv.{companion.level}
                  </p>
                  <p className="dismiss-reward">遣散获得: 💎 {reward} 魂珠</p>
                </div>
                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && '✓'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dismissedCompanions.length > 0 && (
        <div className="exchange-summary">
          <p>已选择 {dismissedCompanions.length} 个伙伴，将获得 💎 {totalDismissSoulOrbs} 魂珠</p>
        </div>
      )}

      <div className="step-actions">
        <button className="back-btn" onClick={() => setRebirthStep('rewards')}>
          ← 上一步
        </button>
        <button className="next-btn" onClick={() => setRebirthStep('exchange')}>
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderExchangeStep = () => (
    <div className="rebirth-step-content">
      <h4>🔄 资源兑换</h4>
      <p className="step-desc">将金币和伙伴碎片兑换为魂珠（转生后保留）</p>

      <div className="exchange-section">
        <h5>💰 金币兑换</h5>
        <div className="exchange-rate-info">
          汇率: {RESOURCE_EXCHANGE_RATES.goldToSoulOrbs.toLocaleString()} 金币 = 1 💎 魂珠
        </div>
        <div className="exchange-row">
          <span>当前金币: 💰 {player.stats.gold.toLocaleString()}</span>
        </div>
        <div className="exchange-input-group">
          <input
            type="range"
            min="0"
            max={player.stats.gold}
            step={RESOURCE_EXCHANGE_RATES.goldToSoulOrbs}
            value={exchangeGoldAmount}
            onChange={(e) => setExchangeGoldAmount(Number(e.target.value))}
            className="exchange-slider"
          />
          <div className="exchange-values">
            <span>💰 {exchangeGoldAmount.toLocaleString()}</span>
            <span>→</span>
            <span className="soul">💎 {goldExchangeSoulOrbs}</span>
          </div>
          <div className="exchange-quick-btns">
            <button onClick={() => setExchangeGoldAmount(0)}>清零</button>
            <button onClick={() => setExchangeGoldAmount(Math.floor(player.stats.gold / RESOURCE_EXCHANGE_RATES.goldToSoulOrbs) * RESOURCE_EXCHANGE_RATES.goldToSoulOrbs)}>
              全部
            </button>
          </div>
        </div>
      </div>

      <div className="exchange-section">
        <h5>💎 碎片兑换</h5>
        <div className="exchange-rate-info">
          汇率: {RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs} 碎片 = 1 💎 魂珠
        </div>

        {companionShards.filter((s) => s.count > 0).length === 0 ? (
          <div className="empty-state small">
            <p>暂无可兑换的碎片</p>
          </div>
        ) : (
          <div className="shard-exchange-list">
            {companionShards
              .filter((s) => s.count > 0)
              .map((shard) => {
                const companion = COMPANIONS.find((c) => c.id === shard.companionId);
                if (!companion) return null;
                const selectedAmount = exchangeShardsMap[shard.companionId] || 0;
                const soulOrbOutput = Math.floor(selectedAmount / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs);
                return (
                  <div
                    key={shard.companionId}
                    className="shard-exchange-item"
                    style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                  >
                    <div className="shard-info">
                      <span style={{ color: RARITY_COLORS[companion.rarity] }}>
                        {companion.name}
                      </span>
                      <span>拥有: {shard.count}</span>
                    </div>
                    <div className="shard-exchange-controls">
                      <input
                        type="range"
                        min="0"
                        max={shard.count}
                        step={RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs}
                        value={selectedAmount}
                        onChange={(e) => updateShardExchange(shard.companionId, Number(e.target.value))}
                        className="exchange-slider"
                      />
                      <div className="exchange-values small">
                        <span>💎 {selectedAmount}</span>
                        <span>→</span>
                        <span className="soul">💎 {soulOrbOutput}</span>
                      </div>
                      <div className="exchange-quick-btns small">
                        <button onClick={() => updateShardExchange(shard.companionId, 0)}>
                          清零
                        </button>
                        <button
                          onClick={() =>
                            updateShardExchange(
                              shard.companionId,
                              Math.floor(shard.count / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs) * RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs
                            )
                          }
                        >
                          全部
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {(goldExchangeSoulOrbs > 0 || totalShardExchangeSoulOrbs > 0) && (
        <div className="exchange-summary">
          <p>兑换总计: 💎 {goldExchangeSoulOrbs + totalShardExchangeSoulOrbs} 魂珠</p>
        </div>
      )}

      <div className="step-actions">
        <button className="back-btn" onClick={() => setRebirthStep('dismiss')}>
          ← 上一步
        </button>
        <button className="next-btn" onClick={() => setRebirthStep('bonuses')}>
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderBonusesStep = () => (
    <div className="rebirth-step-content">
      <h4>⭐ 转生加成</h4>
      <p className="step-desc">选择本次转生要购买的永久加成</p>

      <div className="available-soul-orbs">
        <span>可用魂珠:</span>
        <span className="soul">💎 {player.stats.soulOrbs + totalPrepSoulOrbs - totalSelectedCost}</span>
      </div>

      <div className="bonus-grid">
        {REBIRTH_OPTIONS.map((option) => {
          const currentBonus = rebirthBonuses[option.id] || 0;
          const isSelected = selectedRebirthBonuses.includes(option.id);
          const availableSoulOrbs = player.stats.soulOrbs + totalPrepSoulOrbs;
          const currentCost = selectedRebirthBonuses.reduce((sum, id) => {
            const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
            return sum + (opt?.cost || 0);
          }, 0);
          const canAfford = currentCost + option.cost <= availableSoulOrbs;

          return (
            <button
              key={option.id}
              className={`bonus-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleRebirthBonus(option.id)}
              disabled={!isSelected && !canAfford}
            >
              <div className="bonus-icon">{option.icon}</div>
              <div className="bonus-name">{option.name}</div>
              <div className="bonus-desc">{option.description}</div>
              <div className="bonus-current">当前: +{(currentBonus * 100).toFixed(0)}%</div>
              <div className="bonus-cost">💎 {option.cost} 魂珠</div>
            </button>
          );
        })}
      </div>

      {selectedRebirthBonuses.length > 0 && (
        <div className="exchange-summary">
          <p>已选择 {selectedRebirthBonuses.length} 项加成，消耗 💎 {totalSelectedCost} 魂珠</p>
        </div>
      )}

      <div className="step-actions">
        <button className="back-btn" onClick={() => setRebirthStep('exchange')}>
          ← 上一步
        </button>
        <button className="next-btn" onClick={() => setRebirthStep('confirm')}>
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="rebirth-step-content">
      <h4>✅ 确认结算</h4>
      <p className="step-desc">请确认以下转生结算信息</p>

      <div className="settlement-summary">
        <div className="settlement-section">
          <h5>🔄 转生信息</h5>
          <div className="settlement-row">
            <span>当前等级</span>
            <span className="value">Lv.{player.stats.level}</span>
          </div>
          <div className="settlement-row">
            <span>转生次数</span>
            <span className="value">{player.rebirthCount} → {player.rebirthCount + 1}</span>
          </div>
          <div className="settlement-row highlight">
            <span>等级奖励魂珠</span>
            <span className="value soul">+💎 {soulOrbsGained}</span>
          </div>
        </div>

        {(totalDismissSoulOrbs > 0 || goldExchangeSoulOrbs > 0 || totalShardExchangeSoulOrbs > 0) && (
          <div className="settlement-section">
            <h5>💰 准备收益</h5>
            {totalDismissSoulOrbs > 0 && (
              <div className="settlement-row">
                <span>伙伴遣散 ({dismissedCompanions.length}个)</span>
                <span className="value soul">+💎 {totalDismissSoulOrbs}</span>
              </div>
            )}
            {goldExchangeSoulOrbs > 0 && (
              <div className="settlement-row">
                <span>金币兑换 (💰{actualGoldCost.toLocaleString()})</span>
                <span className="value soul">+💎 {goldExchangeSoulOrbs}</span>
              </div>
            )}
            {totalShardExchangeSoulOrbs > 0 && (
              <div className="settlement-row">
                <span>碎片兑换 ({totalShardCost}碎片)</span>
                <span className="value soul">+💎 {totalShardExchangeSoulOrbs}</span>
              </div>
            )}
          </div>
        )}

        {selectedRebirthBonuses.length > 0 && (
          <div className="settlement-section">
            <h5>⭐ 购买加成</h5>
            {selectedRebirthBonuses.map((id) => {
              const option = REBIRTH_OPTIONS.find((o) => o.id === id);
              if (!option) return null;
              return (
                <div key={id} className="settlement-row">
                  <span>{option.icon} {option.name}</span>
                  <span className="value">-💎 {option.cost}</span>
                </div>
              );
            })}
            <div className="settlement-row total">
              <span>加成消耗</span>
              <span className="value">-💎 {totalSelectedCost}</span>
            </div>
          </div>
        )}

        <div className="settlement-section final">
          <div className="settlement-row final">
            <span>最终保留魂珠</span>
            <span className="value soul large">💎 {Math.max(0, remainingSoulOrbs)}</span>
          </div>
          <div className="settlement-row">
            <span>累计转生加成</span>
            <span className="value">+{player.totalRebirthBonus + selectedRebirthBonuses.length}%</span>
          </div>
          {(rebirthBonuses['reputation_preserve'] || 0) > 0 ? (
            <div className="settlement-row">
              <span>🏛️ 声望传承</span>
              <span className="value">保留 {((rebirthBonuses['reputation_preserve'] || 0) * 100).toFixed(0)}%</span>
            </div>
          ) : (
            <div className="settlement-row warning">
              <span>⚠️ 区域声望</span>
              <span className="value">将重置为0</span>
            </div>
          )}
          <div className="settlement-row warning">
            <span>⚠️ 伙伴、编队、金币</span>
            <span className="value">将重置</span>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="back-btn" onClick={() => setRebirthStep('bonuses')}>
          ← 上一步
        </button>
        <button
          className="confirm-btn danger"
          onClick={handleRebirth}
        >
          🔄 确认转生
        </button>
      </div>
    </div>
  );

  const renderRebirthModal = () => {
    if (!showRebirthModal) return null;

    let stepContent = null;
    switch (rebirthStep) {
      case 'rewards':
        stepContent = renderRewardsStep();
        break;
      case 'dismiss':
        stepContent = renderDismissStep();
        break;
      case 'exchange':
        stepContent = renderExchangeStep();
        break;
      case 'bonuses':
        stepContent = renderBonusesStep();
        break;
      case 'confirm':
        stepContent = renderConfirmStep();
        break;
    }

    return (
      <div className="rebirth-modal-overlay" onClick={() => setShowRebirthModal(false)}>
        <div className="rebirth-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rebirth-modal-header">
            <h3>🔄 转生前准备</h3>
            <button className="close-modal-btn" onClick={() => setShowRebirthModal(false)}>
              ✕
            </button>
          </div>
          {renderStepIndicator()}
          <div className="rebirth-modal-body">{stepContent}</div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapPanel />;
      case 'chapters':
        return <ChapterPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'companions':
        return <CompanionsPanel />;
      case 'commissions':
        return <CommissionPanel />;
      case 'trade':
        return <TradeMarketPanel />;
      case 'blackmarket':
        return <BlackMarketPanel />;
      case 'expedition':
        return <ExpeditionPanel />;
      case 'guild':
        return <GuildPanel />;
      case 'town':
        return <TownPanel />;
      case 'worldboss':
        return <WorldBossPanel />;
      case 'equipment':
        return <EquipmentPanel />;
      case 'relics':
        return <RelicPanel />;
      case 'talents':
        return <TalentPanel />;
      case 'skilltree':
        return <SkillTreePanel />;
      case 'alchemy':
        return <AlchemyWorkshopPanel />;
      case 'events':
        return (
          <div className="rebirth-panel">
            <div className="rebirth-header">
              <h3>🔄 转生系统</h3>
              <p className="rebirth-desc">转生后将重新开始，但获得永久属性加成</p>
            </div>

            <div className="rebirth-info-card">
              <div className="rebirth-info-item">
                <span>当前等级</span>
                <span className="value">Lv.{player.stats.level}</span>
              </div>
              <div className="rebirth-info-item">
                <span>已转生次数</span>
                <span className="value">{player.rebirthCount} 次</span>
              </div>
              <div className="rebirth-info-item">
                <span>当前魂珠</span>
                <span className="value soul">💎 {player.stats.soulOrbs}</span>
              </div>
              <div className="rebirth-info-item">
                <span>转生可获得</span>
                <span className="value soul">💎 +{soulOrbsGained}</span>
              </div>
            </div>

            {hasUnclaimedRewards && (
              <div className="unclaimed-rewards-warning">
                <p>
                  ⚠️ 你有
                  <strong>
                    {' '}
                    {unclaimedRewards.starRewards.length +
                      unclaimedRewards.firstClearRewards.length +
                      unclaimedRewards.rebirthChallengeRewards.length}{' '}
                  </strong>
                  项未领取奖励，转生后将无法领取！
                </p>
              </div>
            )}

            {areaReputations.some((r) => r.points > 0) && (
              <div className="rebirth-rep-card">
                <h4>🏛️ 当前区域声望</h4>
                <div className="rebirth-rep-list">
                  {areaReputations.map((rep) => {
                    if (rep.points <= 0) return null;
                    const area = mapAreas.find((a) => a.id === rep.areaId);
                    const repData = REPUTATION_LEVELS.find((rl) => rl.level === rep.level) || REPUTATION_LEVELS[0];
                    return (
                      <div key={rep.areaId} className="rebirth-rep-item">
                        <span>{area?.name}</span>
                        <span style={{ color: repData.color }}>
                          {repData.name} ({rep.points})
                        </span>
                      </div>
                    );
                  })}
                  {(rebirthBonuses['reputation_preserve'] || 0) > 0 ? (
                    <p className="rebirth-rep-preserve">
                      🏛️ 声望传承：保留 {((rebirthBonuses['reputation_preserve'] || 0) * 100).toFixed(0)}% 声望
                    </p>
                  ) : (
                    <p className="rebirth-rep-reset">⚠️ 转生将重置所有区域声望为0</p>
                  )}
                </div>
              </div>
            )}

            {!canRebirth && (
              <div className="rebirth-requirement">
                <p>⚠️ 需要达到 30 级才能转生</p>
                <div className="level-progress-bar">
                  <div
                    className="level-progress-fill"
                    style={{ width: `${Math.min(100, (player.stats.level / 30) * 100)}%` }}
                  />
                </div>
                <p className="level-progress-text">{player.stats.level} / 30</p>
              </div>
            )}

            <button
              className={`rebirth-btn ${canRebirth ? '' : 'disabled'}`}
              onClick={openRebirthModal}
              disabled={!canRebirth}
            >
              🔄 立即转生
            </button>

            {player.rebirthCount > 0 && (
              <div className="current-bonuses-section">
                <h4>已获得的永久加成</h4>
                <div className="bonus-list">
                  {Object.entries(rebirthBonuses).map(([id, bonus]) => {
                    const option = REBIRTH_OPTIONS.find((o) => o.id === id);
                    if (!option || bonus <= 0) return null;
                    return (
                      <div key={id} className="bonus-item">
                        <span>
                          {option.icon} {option.name}
                        </span>
                        <span className="bonus-value">+{(bonus * 100).toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <MapPanel />;
    }
  };

  return (
    <div className="game-screen">
      <header className="game-header">
        <div className="header-left">
          <span className="player-name">{player.name}</span>
          <span className="player-level">Lv.{player.stats.level}</span>
        </div>
        <div className="header-right">
          <span className="currency">💰 {player.stats.gold.toLocaleString()}</span>
          <span className="currency soul">💎 {player.stats.soulOrbs}</span>
        </div>
      </header>

      <main className="game-main">{renderContent()}</main>

      <nav className="game-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <EventModal />
      <OfflineRewardsModal />
      {renderRebirthModal()}
    </div>
  );
}
