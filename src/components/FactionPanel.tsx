import { useState, useMemo } from 'react';
import { useGameStore } from '../game/store';
import { FACTIONS, FACTION_SHOP_ITEMS } from '../game/data';
import {
  getFactionReputationLevel,
  FACTION_REPUTATION_LEVELS,
  STRONGHOLD_TYPE_NAMES,
} from '../game/types';
import type { FactionTab, Stronghold, FactionShopItem } from '../game/types';

const TAB_CONFIG: { id: FactionTab; label: string; icon: string }[] = [
  { id: 'overview', label: '总览', icon: '🏛️' },
  { id: 'strongholds', label: '据点', icon: '🏰' },
  { id: 'garrison', label: '驻防', icon: '⚔️' },
  { id: 'events', label: '事件', icon: '📜' },
  { id: 'shop', label: '商店', icon: '🛒' },
  { id: 'battlelog', label: '战报', icon: '📋' },
];

const STAT_NAMES: Record<string, string> = {
  attack: '攻击',
  defense: '防御',
  maxHp: '生命',
  speed: '速度',
  luck: '幸运',
};

export default function FactionPanel() {
  const {
    faction,
    player,
    joinFaction,
    leaveFaction,
    getPlayerFaction,
    getFactionReputation,
    getStrongholdsByFaction,
    getControlledStrongholds,
    captureStronghold,
    canCaptureStronghold,
    garrisonCompanion,
    ungarrisonCompanion,
    getGarrisonedCompanions,
    getStrongholdPower,
    triggerFactionEvent,
    handleFactionEventChoice,
    closeFactionEvent,
    performFactionSettlement,
    canSettle,
    buyFactionShopItem,
    setFactionTab,
    getFactionBonusStats,
    ownedCompanions,
    getTotalPower,
  } = useGameStore();

  const [selectedStrongholdId, setSelectedStrongholdId] = useState<string | null>(null);
  const [showSettlementResult, setShowSettlementResult] = useState(false);
  const [lastSettlement, setLastSettlement] = useState<ReturnType<typeof performFactionSettlement>>(null);

  const playerFaction = getPlayerFaction();
  const activeTab = faction.activeTab;

  const playerReputation = useMemo(() => {
    if (!playerFaction) return null;
    return getFactionReputation(playerFaction.id);
  }, [playerFaction, getFactionReputation, faction.reputations]);

  const reputationLevel = useMemo(() => {
    if (!playerReputation) return 0;
    return getFactionReputationLevel(playerReputation.points);
  }, [playerReputation]);

  const reputationLevelData = useMemo(() => {
    return FACTION_REPUTATION_LEVELS.find((l) => l.level === reputationLevel) || FACTION_REPUTATION_LEVELS[0];
  }, [reputationLevel]);

  const controlledStrongholds = useMemo(() => getControlledStrongholds(), [getControlledStrongholds, faction.strongholds, faction.playerFaction]);

  const totalPower = useMemo(() => getTotalPower(), [getTotalPower]);

  const handleJoinFaction = (factionId: string) => {
    const success = joinFaction(factionId);
    if (success) {
      setFactionTab('overview');
    }
  };

  const handleSettle = () => {
    const result = performFactionSettlement();
    if (result) {
      setLastSettlement(result);
      setShowSettlementResult(true);
    }
  };

  const handleTriggerEvent = () => {
    triggerFactionEvent();
  };

  const renderFactionSelect = () => (
    <div className="faction-select-container">
      <h2 className="faction-select-title">选择你的阵营</h2>
      <p className="faction-select-desc">加入一个阵营，参与阵营对抗，获取丰厚奖励！</p>
      <div className="faction-cards">
        {FACTIONS.map((faction) => {
          const isPreferredRace = faction.preferredRaces.includes(player.race);
          const isPreferredClass = faction.preferredClasses.includes(player.class);
          const hasBonus = isPreferredRace || isPreferredClass;

          return (
            <div
              key={faction.id}
              className={`faction-card ${hasBonus ? 'has-bonus' : ''}`}
              style={{ borderColor: faction.color, backgroundColor: faction.bgColor }}
            >
              <div className="faction-card-header">
                <span className="faction-icon">{faction.icon}</span>
                <h3 className="faction-name" style={{ color: faction.color }}>{faction.name}</h3>
              </div>
              <p className="faction-description">{faction.description}</p>

              <div className="faction-bonus-section">
                <h4>阵营加成</h4>
                <div className="bonus-stats">
                  {faction.bonusStats.map((bs) => (
                    <div key={bs.stat} className="bonus-stat-item">
                      <span>{STAT_NAMES[bs.stat] || bs.stat}</span>
                      <span className="bonus-value">+{bs.value}</span>
                    </div>
                  ))}
                </div>
                {hasBonus && (
                  <div className="preferred-bonus">
                    <span className="bonus-tag">种族职业契合!</span>
                    <span className="bonus-text">加成效果 ×{(isPreferredRace && isPreferredClass) ? '2.25' : '1.5'}</span>
                  </div>
                )}
              </div>

              <div className="faction-preferences">
                <div className="pref-section">
                  <span className="pref-label">偏好种族:</span>
                  <div className="pref-tags">
                    {faction.preferredRaces.map((r) => (
                      <span key={r} className={`pref-tag ${player.race === r ? 'active' : ''}`}>{r}</span>
                    ))}
                  </div>
                </div>
                <div className="pref-section">
                  <span className="pref-label">偏好职业:</span>
                  <div className="pref-tags">
                    {faction.preferredClasses.map((c) => (
                      <span key={c} className={`pref-tag ${player.class === c ? 'active' : ''}`}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="faction-lore">{faction.lore}</p>

              <button
                className="join-faction-btn"
                style={{ backgroundColor: faction.color }}
                onClick={() => handleJoinFaction(faction.id)}
              >
                加入{faction.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!playerFaction || !playerReputation) return null;

    const nextLevel = FACTION_REPUTATION_LEVELS.find((l) => l.level === reputationLevel + 1);
    const currentLevelMin = reputationLevelData.minPoints;
    const nextLevelMin = nextLevel?.minPoints || currentLevelMin + 1000;
    const progress = nextLevel
      ? ((playerReputation.points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
      : 100;

    const lightStrongholds = getStrongholdsByFaction('light').length;
    const shadowStrongholds = getStrongholdsByFaction('shadow').length;
    const neutralStrongholds = faction.strongholds.filter((s) => s.controllerFaction === 'neutral').length;

    const bonusStats = getFactionBonusStats();

    return (
      <div className="faction-overview">
        <div className="faction-header-card" style={{ borderColor: playerFaction.color, backgroundColor: playerFaction.bgColor }}>
          <div className="faction-header-left">
            <span className="faction-big-icon">{playerFaction.icon}</span>
            <div>
              <h2 className="faction-title" style={{ color: playerFaction.color }}>{playerFaction.name}</h2>
              <p className="faction-subtitle">{reputationLevelData.title}</p>
            </div>
          </div>
          <div className="faction-header-right">
            <div className="reputation-display">
              <span className="rep-label">声望</span>
              <span className="rep-value" style={{ color: playerFaction.color }}>{playerReputation.points}</span>
            </div>
            <div className="reputation-bar">
              <div
                className="reputation-fill"
                style={{ width: `${Math.min(100, progress)}%`, backgroundColor: playerFaction.color }}
              />
            </div>
            <span className="reputation-level-text">
              Lv.{reputationLevel} {nextLevel ? `(${playerReputation.points}/${nextLevelMin})` : '(已满级)'}
            </span>
          </div>
        </div>

        <div className="faction-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-label">总贡献</span>
              <span className="stat-value">{faction.totalContribution}</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏰</span>
            <div className="stat-info">
              <span className="stat-label">控制据点</span>
              <span className="stat-value">{controlledStrongholds.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚔️</span>
            <div className="stat-info">
              <span className="stat-label">战力</span>
              <span className="stat-value">{totalPower}</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎖️</span>
            <div className="stat-info">
              <span className="stat-label">阵营排名</span>
              <span className="stat-value">#{faction.factionRank}</span>
            </div>
          </div>
        </div>

        <div className="bonus-stats-card">
          <h3>阵营加成</h3>
          <div className="bonus-stats-row">
            {bonusStats.map((bs) => (
              <div key={bs.stat} className="bonus-stat-chip">
                <span>{STAT_NAMES[bs.stat] || bs.stat}</span>
                <span className="chip-value">+{bs.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stronghold-overview-card">
          <h3>据点分布</h3>
          <div className="stronghold-bars">
            <div className="stronghold-bar-item">
              <span className="bar-label" style={{ color: '#fbbf24' }}>光明联盟</span>
              <div className="bar-bg">
                <div
                  className="bar-fill light-fill"
                  style={{ width: `${(lightStrongholds / faction.strongholds.length) * 100}%` }}
                />
              </div>
              <span className="bar-count">{lightStrongholds}</span>
            </div>
            <div className="stronghold-bar-item">
              <span className="bar-label" style={{ color: '#a78bfa' }}>暗影部落</span>
              <div className="bar-bg">
                <div
                  className="bar-fill shadow-fill"
                  style={{ width: `${(shadowStrongholds / faction.strongholds.length) * 100}%` }}
                />
              </div>
              <span className="bar-count">{shadowStrongholds}</span>
            </div>
            <div className="stronghold-bar-item">
              <span className="bar-label">中立</span>
              <div className="bar-bg">
                <div
                  className="bar-fill neutral-fill"
                  style={{ width: `${(neutralStrongholds / faction.strongholds.length) * 100}%` }}
                />
              </div>
              <span className="bar-count">{neutralStrongholds}</span>
            </div>
          </div>
        </div>

        <div className="settlement-card">
          <div className="settlement-info">
            <h3>💎 长期收益结算</h3>
            <p className="settlement-desc">
              根据你控制的据点数量和驻防战力，定期获得资源奖励
            </p>
            <p className="settling-hint">
              下次结算还需: {canSettle() ? '已就绪!' : formatTimeUntilSettle(faction.lastSettlementTime)}
            </p>
          </div>
          <button
            className={`settle-btn ${canSettle() ? 'ready' : 'disabled'}`}
            onClick={handleSettle}
            disabled={!canSettle()}
          >
            {canSettle() ? '立即结算' : '冷却中'}
          </button>
        </div>

        <button
          className="leave-faction-link"
          onClick={() => {
            if (confirm('确定要退出阵营吗？退出后将失去所有阵营加成和据点控制！')) {
              leaveFaction();
            }
          }}
        >
          退出阵营
        </button>
      </div>
    );
  };

  const formatTimeUntilSettle = (lastTime: number) => {
    const elapsed = Date.now() - lastTime;
    const remaining = Math.max(0, 3600000 - elapsed); // 1小时
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  const renderStrongholds = () => {
    if (!playerFaction) return null;

    return (
      <div className="faction-strongholds">
        <h3 className="section-title">🗺️ 据点列表</h3>
        <p className="section-desc">攻占更多据点，获取更多资源收益！</p>

        <div className="strongholds-grid">
          {faction.strongholds.map((sh) => {
            const isControlled = sh.controllerFaction === playerFaction.id;
            const isEnemy = sh.controllerFaction !== 'neutral' && sh.controllerFaction !== playerFaction.id;
            const canCapture = canCaptureStronghold(sh.id);
            const garrisonPower = getStrongholdPower(sh.id);

            return (
              <div
                key={sh.id}
                className={`stronghold-card ${isControlled ? 'controlled' : ''} ${isEnemy ? 'enemy' : ''}`}
                style={{ borderColor: isControlled ? playerFaction.color : isEnemy ? '#ef4444' : '#6b7280' }}
                onClick={() => setSelectedStrongholdId(sh.id)}
              >
                <div className="stronghold-header">
                  <span className="stronghold-icon">{sh.icon}</span>
                  <div className="stronghold-title-area">
                    <h4 className="stronghold-name">{sh.name}</h4>
                    <span className={`stronghold-type ${sh.type}`}>
                      {STRONGHOLD_TYPE_NAMES[sh.type] || sh.type}
                    </span>
                  </div>
                  <span className={`controller-badge ${sh.controllerFaction}`}>
                    {sh.controllerFaction === 'light' ? '光明' : sh.controllerFaction === 'shadow' ? '暗影' : '中立'}
                  </span>
                </div>

                <p className="stronghold-desc">{sh.description}</p>

                <div className="stronghold-stats">
                  <div className="sh-stat">
                    <span>防守战力</span>
                    <span className="sh-stat-value">{sh.defensePower}</span>
                  </div>
                  <div className="sh-stat">
                    <span>难度</span>
                    <span className={`difficulty difficulty-${sh.difficulty}`}>
                      {'★'.repeat(sh.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="stronghold-resources">
                  <span>💰 {sh.resourceGeneration.gold}/时</span>
                  <span>💎 {sh.resourceGeneration.soulOrbs}/时</span>
                </div>

                {sh.strategicBonus && (
                  <div className="strategic-bonus">
                    <span>🏆 战略价值: {sh.strategicBonus}</span>
                  </div>
                )}

                {isControlled && garrisonPower > 0 && (
                  <div className="garrison-power">
                    <span>驻防战力: +{garrisonPower}</span>
                  </div>
                )}

                {!isControlled && (
                  <button
                    className={`capture-btn ${canCapture ? 'can-capture' : 'cannot-capture'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      captureStronghold(sh.id);
                    }}
                    disabled={!canCapture}
                  >
                    {canCapture ? '攻占' : '无法攻占'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGarrison = () => {
    if (!playerFaction) return null;

    const garrisonedIds = faction.garrisons.map((g) => g.companionId);
    const availableCompanions = ownedCompanions.filter((c) => !garrisonedIds.includes(c.id));

    return (
      <div className="faction-garrison">
        <h3 className="section-title">⚔️ 伙伴驻防</h3>
        <p className="section-desc">将伙伴派驻到据点中，提升资源产出和防守能力</p>

        <div className="garrison-section">
          <h4>已驻防据点</h4>
          <div className="garrisoned-strongholds">
            {controlledStrongholds.length === 0 ? (
              <p className="empty-text">暂未控制任何据点</p>
            ) : (
              controlledStrongholds.map((sh) => {
                const garrisons = getGarrisonedCompanions(sh.id);
                return (
                  <div key={sh.id} className="garrison-stronghold-card">
                    <div className="gs-header">
                      <span className="gs-icon">{sh.icon}</span>
                      <span className="gs-name">{sh.name}</span>
                      <span className="gs-count">{garrisons.length}/3</span>
                    </div>
                    <div className="gs-companions">
                      {garrisons.length === 0 ? (
                        <span className="empty-slot">空槽位</span>
                      ) : (
                        garrisons.map((g) => {
                          const companion = ownedCompanions.find((c) => c.id === g.companionId);
                          if (!companion) return null;
                          return (
                            <div key={g.companionId} className="garrisoned-companion">
                              <span className="gc-name">{companion.name}</span>
                              <button
                                className="remove-btn"
                                onClick={() => ungarrisonCompanion(sh.id, g.companionId)}
                              >
                                撤回
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {garrisons.length < 3 && availableCompanions.length > 0 && (
                      <select
                        className="garrison-select"
                        onChange={(e) => {
                          if (e.target.value) {
                            garrisonCompanion(sh.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">+ 派驻伙伴</option>
                        {availableCompanions.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="garrison-section">
          <h4>可派驻伙伴 ({availableCompanions.length})</h4>
          <div className="available-companions">
            {availableCompanions.length === 0 ? (
              <p className="empty-text">所有伙伴都已派驻</p>
            ) : (
              <div className="companion-list">
                {availableCompanions.map((c) => (
                  <div key={c.id} className="available-companion-item">
                    <span className="companion-name">{c.name}</span>
                    <span className="companion-rarity">{c.rarity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    if (!playerFaction) return null;

    const currentEvent = faction.currentFactionEvent;

    return (
      <div className="faction-events">
        <h3 className="section-title">📜 阵营事件</h3>
        <p className="section-desc">处理阵营事件，影响双方声望和奖励</p>

        {currentEvent ? (
          <div className="event-card active">
            <div className="event-header">
              <span className="event-icon">{currentEvent.icon}</span>
              <h4 className="event-title">{currentEvent.title}</h4>
              <span className={`event-type ${currentEvent.type}`}>
                {currentEvent.type === 'battle' ? '战斗' : currentEvent.type === 'diplomacy' ? '外交' : '随机'}
              </span>
            </div>
            <p className="event-description">{currentEvent.description}</p>
            <div className="event-choices">
              {currentEvent.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="event-choice-btn"
                  onClick={() => handleFactionEventChoice(choice.id)}
                >
                  <span className="choice-text">{choice.text}</span>
                  {choice.effects.reputation && (
                    <div className="choice-effects">
                      {Object.entries(choice.effects.reputation).map(([fId, points]) => (
                        <span
                          key={fId}
                          className={`effect-rep ${points > 0 ? 'positive' : 'negative'}`}
                        >
                          {fId === 'light' ? '光明' : fId === 'shadow' ? '暗影' : fId} {points > 0 ? '+' : ''}{points}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button className="close-event-btn" onClick={closeFactionEvent}>
              忽略事件
            </button>
          </div>
        ) : (
          <div className="no-event-card">
            <p>暂无进行中的事件</p>
            <button className="trigger-event-btn" onClick={handleTriggerEvent}>
              触发随机事件
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderShop = () => {
    if (!playerFaction || !playerReputation) return null;

    return (
      <div className="faction-shop">
        <h3 className="section-title">🛒 声望商店</h3>
        <p className="section-desc">消耗声望值兑换稀有奖励</p>
        <p className="current-rep">当前声望: <span style={{ color: playerFaction.color }}>{playerReputation.points}</span></p>

        <div className="shop-items-grid">
          {FACTION_SHOP_ITEMS.map((item) => {
            const canBuy = playerReputation.points >= item.cost && item.requiredLevel <= reputationLevel;
            const locked = item.requiredLevel > reputationLevel;

            return (
              <div
                key={item.id}
                className={`shop-item-card ${locked ? 'locked' : ''} ${canBuy ? 'can-buy' : ''}`}
              >
                <div className="shop-item-header">
                  <span className="shop-item-icon">{item.icon}</span>
                  <h4 className="shop-item-name">{item.name}</h4>
                </div>
                <p className="shop-item-desc">{item.description}</p>
                <div className="shop-item-rewards">
                  {item.rewards.gold && <span>💰 {item.rewards.gold}</span>}
                  {item.rewards.soulOrbs && <span>💎 {item.rewards.soulOrbs}</span>}
                  {item.rewards.exp && <span>⭐ {item.rewards.exp}</span>}
                </div>
                <div className="shop-item-footer">
                  <span className={`item-cost ${canBuy ? 'affordable' : 'unaffordable'}`}>
                    🏛️ {item.cost}
                  </span>
                  <span className="item-level-req">
                    需要 Lv.{item.requiredLevel}
                  </span>
                </div>
                <button
                  className={`buy-btn ${canBuy ? 'can-buy' : 'cannot-buy'}`}
                  onClick={() => buyFactionShopItem(item.id)}
                  disabled={!canBuy}
                >
                  {locked ? '等级不足' : canBuy ? '兑换' : '声望不足'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBattleLog = () => {
    if (!playerFaction) return null;

    return (
      <div className="faction-battlelog">
        <h3 className="section-title">📋 战报记录</h3>
        <p className="section-desc">查看近期的阵营战斗和事件记录</p>

        {faction.battleLogs.length === 0 ? (
          <p className="empty-text">暂无战报记录</p>
        ) : (
          <div className="battlelog-list">
            {faction.battleLogs.map((log) => (
              <div key={log.id} className={`battlelog-item ${log.result}`}>
                <div className="log-header">
                  <span className="log-icon">
                    {log.type === 'capture' ? '🏰' : log.type === 'defense' ? '🛡️' : '📜'}
                  </span>
                  <span className="log-title">
                    {log.type === 'capture' ? '攻占据点' : log.type === 'defense' ? '防守据点' : '阵营事件'}
                  </span>
                  <span className={`log-result ${log.result}`}>
                    {log.result === 'victory' ? '胜利' : log.result === 'defeat' ? '失败' : '进行中'}
                  </span>
                </div>
                <p className="log-desc">{log.description}</p>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="settlement-history">
          <h4>💎 结算历史</h4>
          {faction.settlementHistory.length === 0 ? (
            <p className="empty-text">暂无结算记录</p>
          ) : (
            <div className="settlement-list">
              {faction.settlementHistory.map((settle) => (
                <div key={settle.id} className="settlement-item">
                  <div className="settle-header">
                    <span className="settle-icon">💎</span>
                    <span className="settle-title">周期结算</span>
                    <span className="settle-time">
                      {new Date(settle.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="settle-rewards">
                    <span>🏰 {settle.strongholdCount} 个据点</span>
                    <span>💰 {settle.gold}</span>
                    <span>💎 {settle.soulOrbs}</span>
                    <span>🏛️ +{settle.reputation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabBar = () => (
    <div className="faction-tab-bar">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          className={`faction-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setFactionTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderSettlementModal = () => {
    if (!showSettlementResult || !lastSettlement) return null;

    return (
      <div className="settlement-modal-overlay" onClick={() => setShowSettlementResult(false)}>
        <div className="settlement-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="modal-title">🎉 收益结算完成！</h3>
          <div className="modal-content">
            <div className="settle-summary">
              <p>控制据点: <strong>{lastSettlement.strongholdCount} 个</strong></p>
            </div>
            <div className="settle-rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">💰</span>
                <span className="reward-label">金币</span>
                <span className="reward-value">+{lastSettlement.gold}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">💎</span>
                <span className="reward-label">魂珠</span>
                <span className="reward-value">+{lastSettlement.soulOrbs}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🏛️</span>
                <span className="reward-label">声望</span>
                <span className="reward-value">+{lastSettlement.reputation}</span>
              </div>
            </div>
            {lastSettlement.strongholdRewards && lastSettlement.strongholdRewards.length > 0 && (
              <div className="settle-details">
                <h4>据点明细</h4>
                {lastSettlement.strongholdRewards.map((sr) => (
                  <div key={sr.strongholdId} className="detail-item">
                    <span>{sr.strongholdName}</span>
                    <span>💰 {sr.gold} 💎 {sr.soulOrbs}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setShowSettlementResult(false)}
          >
            确定
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="faction-panel">
      {!playerFaction ? (
        renderFactionSelect()
      ) : (
        <>
          {renderTabBar()}
          <div className="faction-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'strongholds' && renderStrongholds()}
            {activeTab === 'garrison' && renderGarrison()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'shop' && renderShop()}
            {activeTab === 'battlelog' && renderBattleLog()}
          </div>
        </>
      )}
      {renderSettlementModal()}
    </div>
  );
}
