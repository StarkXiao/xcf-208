import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import StatsPanel from './StatsPanel';
import MapPanel from './MapPanel';
import CompanionsPanel from './CompanionsPanel';
import EventModal from './EventModal';
import OfflineRewardsModal from './OfflineRewardsModal';
import ExpeditionPanel from './ExpeditionPanel';
import TalentPanel from './TalentPanel';
import { REBIRTH_OPTIONS, REPUTATION_LEVELS, RARITY_COLORS, RARITY_NAMES, getShardConfig } from '../game/data';

type RebirthPrepStep = 'welcome' | 'unclaimed' | 'companions' | 'exchange' | 'bonuses' | 'settlement';

export default function GameScreen() {
  const {
    activeTab,
    setActiveTab,
    player,
    rebirthBonuses,
    updateLastOnlineTime,
    areaReputations,
    mapAreas,
    ownedCompanions,
    getShardCount,
    dismissCompanion,
    exchangeGoldToSoulOrbs,
    getUnclaimedRewards,
    claimStarReward,
    claimFirstClearReward,
    claimRebirthChallengeReward,
  } = useGameStore();

  const [showRebirthPrep, setShowRebirthPrep] = useState(false);
  const [currentStep, setCurrentStep] = useState<RebirthPrepStep>('welcome');
  const [selectedRebirthBonuses, setSelectedRebirthBonuses] = useState<string[]>([]);
  const [exchangeGoldInput, setExchangeGoldInput] = useState('');
  const [dismissedCompanions, setDismissedCompanions] = useState<{ id: string; shards: number; gold: number }[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<{ gold: number; soulOrbs: number }[]>([]);
  const [prepSoulOrbsBonus, setPrepSoulOrbsBonus] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLastOnlineTime();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateLastOnlineTime();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateLastOnlineTime]);

  const tabs = [
    { id: 'map' as const, label: '🗺️ 地图', icon: '🗺️' },
    { id: 'stats' as const, label: '📊 属性', icon: '📊' },
    { id: 'companions' as const, label: '🤝 伙伴', icon: '🤝' },
    { id: 'expedition' as const, label: '🏔️ 远征', icon: '🏔️' },
    { id: 'talents' as const, label: '🌟 天赋', icon: '🌟' },
    { id: 'events' as const, label: '🔄 转生', icon: '🔄' },
  ];

  const canRebirth = player.stats.level >= 30;
  const baseSoulOrbsGained = Math.floor(player.stats.level / 10);
  const totalSoulOrbsGained = baseSoulOrbsGained + prepSoulOrbsBonus;

  const unclaimedRewards = getUnclaimedRewards();
  const hasUnclaimedRewards =
    unclaimedRewards.starRewards.length > 0 ||
    unclaimedRewards.firstClearRewards.length > 0 ||
    unclaimedRewards.rebirthChallengeRewards.length > 0;

  const resetRebirthPrep = () => {
    setCurrentStep('welcome');
    setSelectedRebirthBonuses([]);
    setExchangeGoldInput('');
    setDismissedCompanions([]);
    setExchangeHistory([]);
    setPrepSoulOrbsBonus(0);
  };

  const openRebirthPrep = () => {
    if (!canRebirth) return;
    resetRebirthPrep();
    setShowRebirthPrep(true);
  };

  const closeRebirthPrep = () => {
    setShowRebirthPrep(false);
    resetRebirthPrep();
  };

  const toggleRebirthBonus = (bonusId: string) => {
    const option = REBIRTH_OPTIONS.find((o) => o.id === bonusId);
    if (!option) return;

    const currentCost = selectedRebirthBonuses.reduce((sum, id) => {
      const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
      return sum + (opt?.cost || 0);
    }, 0);

    const availableSoulOrbs = player.stats.soulOrbs + totalSoulOrbsGained;

    if (selectedRebirthBonuses.includes(bonusId)) {
      setSelectedRebirthBonuses(selectedRebirthBonuses.filter((id) => id !== bonusId));
    } else if (currentCost + option.cost <= availableSoulOrbs) {
      setSelectedRebirthBonuses([...selectedRebirthBonuses, bonusId]);
    }
  };

  const totalSelectedCost = selectedRebirthBonuses.reduce((sum, id) => {
    const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
    return sum + (opt?.cost || 0);
  }, 0);

  const handleDismissCompanion = (companionId: string) => {
    const result = dismissCompanion(companionId);
    if (result) {
      setDismissedCompanions([...dismissedCompanions, { id: companionId, ...result }]);
    }
  };

  const handleExchange = () => {
    const goldAmount = parseInt(exchangeGoldInput, 10);
    if (isNaN(goldAmount) || goldAmount <= 0) return;
    const soulOrbs = exchangeGoldToSoulOrbs(goldAmount);
    if (soulOrbs > 0) {
      const actualCost = soulOrbs * 1000;
      setExchangeHistory([...exchangeHistory, { gold: actualCost, soulOrbs }]);
      setPrepSoulOrbsBonus(prepSoulOrbsBonus + soulOrbs);
      setExchangeGoldInput('');
    }
  };

  const handleClaimAllUnclaimed = () => {
    unclaimedRewards.firstClearRewards.forEach((r) => claimFirstClearReward(r.areaId));
    unclaimedRewards.starRewards.forEach((r) => claimStarReward(r.areaId, r.stars));
    unclaimedRewards.rebirthChallengeRewards.forEach((r) => claimRebirthChallengeReward(r.id));
  };

  const handleRebirth = () => {
    const tempSoulOrbs = player.stats.soulOrbs + totalSoulOrbsGained;
    if (totalSelectedCost > tempSoulOrbs) return;

    const remainingSoulOrbs = tempSoulOrbs - totalSelectedCost;

    const newBonuses = { ...rebirthBonuses };
    selectedRebirthBonuses.forEach((id) => {
      const option = REBIRTH_OPTIONS.find((o) => o.id === id);
      if (option) {
        newBonuses[id] = (newBonuses[id] || 0) + option.bonus;
      }
    });

    const newRebirthCount = player.rebirthCount + 1;
    const bonusTalentPoints = newRebirthCount >= 1 ? 1 + Math.floor(newRebirthCount / 2) : 0;

    const preserveRatio = newBonuses['reputation_preserve'] || 0;
    const newReputations = areaReputations.map((rep) => {
      const preservedPoints = Math.floor(rep.points * preserveRatio);
      let level = 0;
      for (const rl of REPUTATION_LEVELS) {
        if (preservedPoints >= rl.minPoints) level = rl.level;
      }
      return {
        areaId: rep.areaId,
        points: preservedPoints,
        level,
      };
    });

    closeRebirthPrep();

    useGameStore.setState((state) => ({
      screen: 'rebirth',
      player: {
        ...state.player,
        name: '',
        race: '',
        class: '',
        stats: { ...state.player.stats, soulOrbs: remainingSoulOrbs },
        rebirthCount: newRebirthCount,
        totalRebirthBonus: state.player.totalRebirthBonus + selectedRebirthBonuses.length,
        talentPoints: state.player.talentPoints + bonusTalentPoints,
      },
      ownedCompanions: [],
      formation: { slots: state.formation.slots.map((s) => ({ ...s, companionId: null })), activeBondIds: [] },
      rebirthBonuses: newBonuses,
      areaReputations: newReputations,
    }));
  };

  const getStepInfo = () => {
    const steps: { id: RebirthPrepStep; label: string; icon: string }[] = [
      { id: 'welcome', label: '开始', icon: '✨' },
      { id: 'unclaimed', label: '奖励提醒', icon: '🎁' },
      { id: 'companions', label: '伙伴遣散', icon: '👋' },
      { id: 'exchange', label: '资源兑换', icon: '🔄' },
      { id: 'bonuses', label: '转生加成', icon: '💎' },
      { id: 'settlement', label: '确认结算', icon: '📋' },
    ];
    return steps;
  };

  const renderStepIndicator = () => {
    const steps = getStepInfo();
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    return (
      <div className="rebirth-step-indicator">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`step-item ${idx < currentIndex ? 'done' : ''} ${idx === currentIndex ? 'active' : ''}`}
          >
            <div className="step-icon">{idx < currentIndex ? '✓' : step.icon}</div>
            <div className="step-label">{step.label}</div>
            {idx < steps.length - 1 && <div className={`step-connector ${idx < currentIndex ? 'done' : ''}`} />}
          </div>
        ))}
      </div>
    );
  };

  const renderWelcomeStep = () => (
    <div className="rebirth-prep-content">
      <div className="rebirth-welcome-icon">🔄</div>
      <h2 className="rebirth-prep-title">准备转生</h2>
      <p className="rebirth-prep-desc">
        你即将踏上新的旅程！在转生前，请完成以下准备工作，最大化你的收益。
      </p>
      <div className="rebirth-prep-info">
        <div className="prep-info-item">
          <span>当前等级</span>
          <span className="value">Lv.{player.stats.level}</span>
        </div>
        <div className="prep-info-item">
          <span>转生获得魂珠</span>
          <span className="value soul">💎 +{baseSoulOrbsGained}</span>
        </div>
        <div className="prep-info-item">
          <span>已转生次数</span>
          <span className="value">{player.rebirthCount} 次</span>
        </div>
      </div>
      {hasUnclaimedRewards && (
        <div className="prep-warning">
          ⚠️ 你有未领取的奖励，建议先领取再转生
        </div>
      )}
      <button className="rebirth-prep-next-btn" onClick={() => setCurrentStep('unclaimed')}>
        开始准备 →
      </button>
    </div>
  );

  const renderUnclaimedStep = () => (
    <div className="rebirth-prep-content">
      <h2 className="rebirth-prep-title">🎁 未领取奖励</h2>
      <p className="rebirth-prep-desc">
        以下奖励将在转生后重置，请及时领取！
      </p>
      {!hasUnclaimedRewards ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>所有奖励都已领取完毕！</p>
        </div>
      ) : (
        <>
          {unclaimedRewards.firstClearRewards.length > 0 && (
            <div className="unclaimed-section">
              <h4>🎉 首通奖励</h4>
              <div className="unclaimed-list">
                {unclaimedRewards.firstClearRewards.map((r) => (
                  <div key={`first-${r.areaId}`} className="unclaimed-item">
                    <span>{r.areaName} - 首次通关奖励</span>
                    <button className="claim-mini-btn" onClick={() => claimFirstClearReward(r.areaId)}>
                      领取
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {unclaimedRewards.starRewards.length > 0 && (
            <div className="unclaimed-section">
              <h4>⭐ 星级奖励</h4>
              <div className="unclaimed-list">
                {unclaimedRewards.starRewards.map((r) => (
                  <div key={`star-${r.areaId}-${r.stars}`} className="unclaimed-item">
                    <span>{r.areaName} - {r.stars}星评价奖励</span>
                    <button className="claim-mini-btn" onClick={() => claimStarReward(r.areaId, r.stars)}>
                      领取
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {unclaimedRewards.rebirthChallengeRewards.length > 0 && (
            <div className="unclaimed-section">
              <h4>🏆 转生挑战奖励</h4>
              <div className="unclaimed-list">
                {unclaimedRewards.rebirthChallengeRewards.map((r) => (
                  <div key={`challenge-${r.id}`} className="unclaimed-item">
                    <span>{r.description}</span>
                    <button className="claim-mini-btn" onClick={() => claimRebirthChallengeReward(r.id)}>
                      领取
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button className="claim-all-btn" onClick={handleClaimAllUnclaimed}>
            🎁 一键领取全部
          </button>
        </>
      )}
      <div className="rebirth-prep-nav">
        <button className="rebirth-prep-back-btn" onClick={() => setCurrentStep('welcome')}>
          ← 上一步
        </button>
        <button className="rebirth-prep-next-btn" onClick={() => setCurrentStep('companions')}>
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderCompanionsStep = () => (
    <div className="rebirth-prep-content">
      <h2 className="rebirth-prep-title">👋 伙伴遣散</h2>
      <p className="rebirth-prep-desc">
        转生前可遣散伙伴获得碎片和金币返还（转生后伙伴将被重置）
      </p>
      {ownedCompanions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤝</div>
          <p>没有可遣散的伙伴</p>
        </div>
      ) : (
        <>
          <div className="companions-dismiss-list">
            {ownedCompanions.map((companion) => {
              const shardConfig = getShardConfig(companion.rarity);
              const baseShards = shardConfig.duplicateToShards;
              const starBonusShards = (companion.stars - 1) * Math.ceil(baseShards * 0.3);
              const levelBonusShards = Math.floor(companion.level * 0.5);
              const estimatedShards = baseShards + starBonusShards + levelBonusShards;
              const estimatedGold = Math.floor(companion.cost * 0.3);
              const alreadyDismissed = dismissedCompanions.some((d) => d.id === companion.id);
              const shardCount = getShardCount(companion.id);

              return (
                <div
                  key={companion.id}
                  className={`dismiss-companion-card ${alreadyDismissed ? 'dismissed' : ''}`}
                  style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                >
                  <div
                    className="dismiss-avatar"
                    style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                  >
                    {companion.name[0]}
                  </div>
                  <div className="dismiss-info">
                    <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                      {companion.name}
                      {alreadyDismissed && <span className="dismissed-tag">已遣散</span>}
                    </h5>
                    <p className="dismiss-rarity">
                      {RARITY_NAMES[companion.rarity]} · Lv.{companion.level} · {companion.stars}★
                    </p>
                    <div className="dismiss-estimate">
                      <span>预计获得：💎{estimatedShards} 碎片</span>
                      <span>💰{estimatedGold} 金币</span>
                      <span>（当前碎片：{shardCount}）</span>
                    </div>
                  </div>
                  <button
                    className={`dismiss-btn ${alreadyDismissed ? 'disabled' : ''}`}
                    onClick={() => handleDismissCompanion(companion.id)}
                    disabled={alreadyDismissed}
                  >
                    {alreadyDismissed ? '已遣散' : '遣散'}
                  </button>
                </div>
              );
            })}
          </div>
          {dismissedCompanions.length > 0 && (
            <div className="dismiss-summary">
              <h5>本次遣散统计</h5>
              <p>已遣散：{dismissedCompanions.length} 个伙伴</p>
              <p>共获得：💎 {dismissedCompanions.reduce((s, d) => s + d.shards, 0)} 碎片</p>
              <p>共获得：💰 {dismissedCompanions.reduce((s, d) => s + d.gold, 0)} 金币</p>
            </div>
          )}
        </>
      )}
      <div className="rebirth-prep-nav">
        <button className="rebirth-prep-back-btn" onClick={() => setCurrentStep('unclaimed')}>
          ← 上一步
        </button>
        <button className="rebirth-prep-next-btn" onClick={() => setCurrentStep('exchange')}>
          下一步 →
        </button>
      </div>
    </div>
  );

  const renderExchangeStep = () => {
    const exchangeableGold = Math.floor(player.stats.gold / 1000) * 1000;
    const maxExchangeSoulOrbs = Math.floor(player.stats.gold / 1000);
    return (
      <div className="rebirth-prep-content">
        <h2 className="rebirth-prep-title">🔄 资源兑换</h2>
        <p className="rebirth-prep-desc">
          将金币兑换为魂珠（转生后金币重置为0，魂珠永久保留）
        </p>
        <div className="exchange-rate-info">
          <p>兑换比率：💰 1000 金币 = 💎 1 魂珠</p>
          <p>当前金币：💰 {player.stats.gold.toLocaleString()}</p>
          <p>可兑换魂珠：💎 {maxExchangeSoulOrbs}</p>
          {prepSoulOrbsBonus > 0 && (
            <p className="exchange-bonus">已额外获得：💎 +{prepSoulOrbsBonus} 魂珠</p>
          )}
        </div>
        <div className="exchange-input-section">
          <input
            type="number"
            className="exchange-input"
            placeholder="输入金币数量（1000的倍数）"
            value={exchangeGoldInput}
            onChange={(e) => setExchangeGoldInput(e.target.value)}
            min="1000"
            step="1000"
          />
          <div className="exchange-quick-btns">
            <button
              className="quick-exchange-btn"
              onClick={() => setExchangeGoldInput('1000')}
            >
              1000
            </button>
            <button
              className="quick-exchange-btn"
              onClick={() => setExchangeGoldInput('5000')}
            >
              5000
            </button>
            <button
              className="quick-exchange-btn"
              onClick={() => setExchangeGoldInput('10000')}
            >
              10000
            </button>
            <button
              className="quick-exchange-btn"
              onClick={() => setExchangeGoldInput(String(exchangeableGold))}
            >
              全部
            </button>
          </div>
          <button
            className="exchange-confirm-btn"
            onClick={handleExchange}
            disabled={parseInt(exchangeGoldInput, 10) < 1000 || parseInt(exchangeGoldInput, 10) > player.stats.gold}
          >
            确认兑换
          </button>
        </div>
        {exchangeHistory.length > 0 && (
          <div className="exchange-history">
            <h5>兑换记录</h5>
            {exchangeHistory.map((h, i) => (
              <div key={i} className="exchange-history-item">
                <span>💰 -{h.gold.toLocaleString()}</span>
                <span>→</span>
                <span className="soul">💎 +{h.soulOrbs}</span>
              </div>
            ))}
          </div>
        )}
        {player.stats.gold > 0 && player.stats.gold < 1000 && (
          <div className="prep-warning">
            ⚠️ 你还有 💰{player.stats.gold} 金币，不足1000无法兑换，转生后将消失
          </div>
        )}
        <div className="rebirth-prep-nav">
          <button className="rebirth-prep-back-btn" onClick={() => setCurrentStep('companions')}>
            ← 上一步
          </button>
          <button className="rebirth-prep-next-btn" onClick={() => setCurrentStep('bonuses')}>
            下一步 →
          </button>
        </div>
      </div>
    );
  };

  const renderBonusesStep = () => {
    const availableSoulOrbs = player.stats.soulOrbs + totalSoulOrbsGained;
    return (
      <div className="rebirth-prep-content">
        <h2 className="rebirth-prep-title">💎 转生加成</h2>
        <p className="rebirth-prep-desc">
          选择本次转生要购买的永久加成（消耗魂珠）
        </p>
        <div className="rebirth-prep-info compact">
          <div className="prep-info-item">
            <span>可用魂珠</span>
            <span className="value soul">
              💎 {availableSoulOrbs}
              {prepSoulOrbsBonus > 0 && <span className="bonus-hint"> (+{prepSoulOrbsBonus})</span>}
            </span>
          </div>
          <div className="prep-info-item">
            <span>已选消耗</span>
            <span className="value soul">💎 {totalSelectedCost}</span>
          </div>
          <div className="prep-info-item">
            <span>剩余魂珠</span>
            <span className="value soul">💎 {availableSoulOrbs - totalSelectedCost}</span>
          </div>
        </div>
        <div className="bonus-grid">
          {REBIRTH_OPTIONS.map((option) => {
            const currentBonus = rebirthBonuses[option.id] || 0;
            const isSelected = selectedRebirthBonuses.includes(option.id);
            const canAfford = totalSelectedCost + option.cost <= availableSoulOrbs;

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
                <div className="bonus-current">
                  当前: +{(currentBonus * 100).toFixed(0)}%
                </div>
                <div className="bonus-cost">💎 {option.cost} 魂珠</div>
              </button>
            );
          })}
        </div>
        <div className="rebirth-prep-nav">
          <button className="rebirth-prep-back-btn" onClick={() => setCurrentStep('exchange')}>
            ← 上一步
          </button>
          <button className="rebirth-prep-next-btn" onClick={() => setCurrentStep('settlement')}>
            下一步 →
          </button>
        </div>
      </div>
    );
  };

  const renderSettlementStep = () => {
    const preserveRatio = (rebirthBonuses['reputation_preserve'] || 0) +
      (selectedRebirthBonuses.includes('reputation_preserve') ? 0.3 : 0);
    const availableSoulOrbs = player.stats.soulOrbs + totalSoulOrbsGained;
    const remainingSoulOrbs = availableSoulOrbs - totalSelectedCost;
    const newRebirthCount = player.rebirthCount + 1;
    const bonusTalentPoints = newRebirthCount >= 1 ? 1 + Math.floor(newRebirthCount / 2) : 0;

    return (
      <div className="rebirth-prep-content">
        <h2 className="rebirth-prep-title">📋 确认结算</h2>
        <p className="rebirth-prep-desc">
          请确认以下信息，确认后将进行转生
        </p>

        <div className="settlement-section">
          <h4>✨ 转生收获</h4>
          <div className="settlement-grid">
            <div className="settlement-item">
              <span>转生次数</span>
              <span className="value">{player.rebirthCount} → {newRebirthCount}</span>
            </div>
            <div className="settlement-item">
              <span>获得魂珠</span>
              <span className="value soul">💎 +{totalSoulOrbsGained}</span>
              {prepSoulOrbsBonus > 0 && (
                <span className="hint">（含兑换 {prepSoulOrbsBonus}）</span>
              )}
            </div>
            <div className="settlement-item">
              <span>剩余魂珠</span>
              <span className="value soul">💎 {remainingSoulOrbs}</span>
            </div>
            <div className="settlement-item">
              <span>天赋点数</span>
              <span className="value">🌟 +{bonusTalentPoints}</span>
            </div>
          </div>
        </div>

        {selectedRebirthBonuses.length > 0 && (
          <div className="settlement-section">
            <h4>💎 选择的加成</h4>
            <div className="settlement-bonus-list">
              {selectedRebirthBonuses.map((id) => {
                const option = REBIRTH_OPTIONS.find((o) => o.id === id);
                if (!option) return null;
                return (
                  <div key={id} className="settlement-bonus-item">
                    <span>{option.icon} {option.name}</span>
                    <span className="value">+{(option.bonus * 100).toFixed(0)}%</span>
                    <span className="cost">💎 {option.cost}</span>
                  </div>
                );
              })}
              <div className="settlement-bonus-total">
                <span>合计消耗</span>
                <span className="value soul">💎 {totalSelectedCost}</span>
              </div>
            </div>
          </div>
        )}

        <div className="settlement-section">
          <h4>⚠️ 转生后将重置</h4>
          <div className="reset-list">
            <div className="reset-item">
              <span>👤 角色等级</span>
              <span className="reset-label">重置为 Lv.1</span>
            </div>
            <div className="reset-item">
              <span>💰 金币</span>
              <span className="reset-label">重置为 0</span>
            </div>
            <div className="reset-item">
              <span>🤝 伙伴</span>
              <span className="reset-label">重置（已遣散获得碎片）</span>
            </div>
            <div className="reset-item">
              <span>⚔️ 技能点</span>
              <span className="reset-label">重置为 0</span>
            </div>
            <div className="reset-item">
              <span>🏛️ 区域声望</span>
              <span className={preserveRatio > 0 ? 'preserve-label' : 'reset-label'}>
                {preserveRatio > 0 ? `保留 ${(preserveRatio * 100).toFixed(0)}%` : '重置为 0'}
              </span>
            </div>
            <div className="reset-item">
              <span>🗺️ 地图进度</span>
              <span className="reset-label">重置（图鉴保留）</span>
            </div>
          </div>
        </div>

        {dismissedCompanions.length > 0 && (
          <div className="settlement-section">
            <h4>👋 遣散记录</h4>
            <p>已遣散 {dismissedCompanions.length} 个伙伴，获得：</p>
            <p>💎 {dismissedCompanions.reduce((s, d) => s + d.shards, 0)} 碎片</p>
            <p>💰 {dismissedCompanions.reduce((s, d) => s + d.gold, 0)} 金币</p>
          </div>
        )}

        {exchangeHistory.length > 0 && (
          <div className="settlement-section">
            <h4>🔄 兑换记录</h4>
            <p>已兑换 💰 {exchangeHistory.reduce((s, h) => s + h.gold, 0).toLocaleString()} 金币</p>
            <p>获得 💎 {exchangeHistory.reduce((s, h) => s + h.soulOrbs, 0)} 魂珠</p>
          </div>
        )}

        <div className="settlement-warning">
          ⚠️ 转生操作不可逆，请确认后再继续
        </div>

        <div className="rebirth-prep-nav">
          <button className="rebirth-prep-back-btn" onClick={() => setCurrentStep('bonuses')}>
            ← 返回修改
          </button>
          <button className="rebirth-final-btn" onClick={handleRebirth}>
            🌟 确认转生
          </button>
        </div>
      </div>
    );
  };

  const renderRebirthPrepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'unclaimed':
        return renderUnclaimedStep();
      case 'companions':
        return renderCompanionsStep();
      case 'exchange':
        return renderExchangeStep();
      case 'bonuses':
        return renderBonusesStep();
      case 'settlement':
        return renderSettlementStep();
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'companions':
        return <CompanionsPanel />;
      case 'expedition':
        return <ExpeditionPanel />;
      case 'talents':
        return <TalentPanel />;
      case 'events':
        return (
          <div className="rebirth-panel">
            <div className="rebirth-header">
              <h3>🔄 转生系统</h3>
              <p className="rebirth-desc">
                转生后将重新开始，但获得永久属性加成
              </p>
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
                <span className="value soul">💎 +{baseSoulOrbsGained}</span>
              </div>
            </div>

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
                        <span style={{ color: repData.color }}>{repData.name} ({rep.points})</span>
                      </div>
                    );
                  })}
                  {(rebirthBonuses['reputation_preserve'] || 0) > 0 ? (
                    <p className="rebirth-rep-preserve">🏛️ 声望传承：保留 {((rebirthBonuses['reputation_preserve'] || 0) * 100).toFixed(0)}% 声望</p>
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

            {hasUnclaimedRewards && (
              <div className="rebirth-warning-card">
                <p>⚠️ 你有未领取的奖励，建议先领取再转生</p>
              </div>
            )}

            <button
              className={`rebirth-btn ${canRebirth ? '' : 'disabled'}`}
              onClick={openRebirthPrep}
              disabled={!canRebirth}
            >
              🔄 进入转生准备
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
                        <span>{option.icon} {option.name}</span>
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

      <main className="game-main">
        {renderContent()}
      </main>

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

      {showRebirthPrep && (
        <div className="rebirth-prep-overlay">
          <div className="rebirth-prep-modal">
            <button className="rebirth-prep-close" onClick={closeRebirthPrep}>
              ✕
            </button>
            {renderStepIndicator()}
            <div className="rebirth-prep-scroll">
              {renderRebirthPrepContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
