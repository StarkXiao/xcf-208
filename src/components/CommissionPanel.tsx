import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../game/store';
import {
  COMMISSION_RARITY_COLORS,
  COMMISSION_RARITY_NAMES,
  COMMISSION_TYPES,
  COMMISSION_MAX_ACTIVE,
  RARE_MATERIALS,
  COMMISSION_TEMPLATES,
} from '../game/data';
import type {
  Commission,
  ActiveCommission,
  CommissionRewardResult,
} from '../game/types';

type CommissionTab = 'available' | 'active' | 'materials';

export default function CommissionPanel() {
  const {
    player,
    ownedCompanions,
    availableCommissions,
    activeCommissions,
    materialInventory,
    refreshCommissions,
    shouldRefreshCommissions,
    startCommission,
    updateCommissionProgress,
    resolveCommissionEvent,
    collectCommissionReward,
    cancelCommission,
    getCommissionPower,
    getMaterialInfo,
    getActiveCommissionCount,
    canStartCommission,
    sellMaterial,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<CommissionTab>('available');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [selectedCompanionIds, setSelectedCompanionIds] = useState<string[]>([]);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementRewards, setSettlementRewards] = useState<CommissionRewardResult[]>([]);
  const [settlementTitle, setSettlementTitle] = useState('');

  useEffect(() => {
    if (shouldRefreshCommissions()) {
      refreshCommissions();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateCommissionProgress();
    }, 1000);
    return () => clearInterval(timer);
  }, [updateCommissionProgress]);

  const getActiveCommissionTemplate = (ac: ActiveCommission) => {
    return COMMISSION_TEMPLATES.find((t) => t.title === ac.title);
  };

  const toggleCompanion = (id: string) => {
    if (!selectedCommission) return;
    if (selectedCompanionIds.includes(id)) {
      setSelectedCompanionIds(selectedCompanionIds.filter((cid) => cid !== id));
    } else if (selectedCompanionIds.length < selectedCommission.maxCompanions) {
      setSelectedCompanionIds([...selectedCompanionIds, id]);
    }
  };

  const handleStartCommission = () => {
    if (!selectedCommission) return;
    if (selectedCompanionIds.length < selectedCommission.minCompanions) {
      return;
    }
    const success = startCommission(selectedCommission.id, selectedCompanionIds);
    if (success) {
      setSelectedCommission(null);
      setSelectedCompanionIds([]);
      setActiveTab('active');
    }
  };

  const handleCollectReward = useCallback((commissionId: string) => {
    const rewards = collectCommissionReward(commissionId);
    const ac = activeCommissions.find((c) => c.commissionId === commissionId);
    
    if (rewards) {
      setSettlementRewards(rewards);
      setSettlementTitle(ac?.title || '委托完成');
      setShowSettlement(true);
    }
  }, [collectCommissionReward, activeCommissions]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}分${secs}秒`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}时${remainMins}分`;
  };

  const getRemainingTime = (ac: ActiveCommission) => {
    const elapsed = (Date.now() - ac.startTime) / 1000;
    const remaining = Math.max(0, ac.durationSeconds - elapsed);
    return Math.ceil(remaining);
  };

  const busyCompanionIds = activeCommissions
    .filter((c) => c.status === 'in_progress' || c.status === 'event')
    .flatMap((c) => c.companionIds);

  const renderSettlement = () => {
    if (!showSettlement) return null;

    return (
      <div className="commission-settlement-overlay" onClick={() => setShowSettlement(false)}>
        <div className="commission-settlement" onClick={(e) => e.stopPropagation()}>
          <div className="settlement-header">
            <span className="settlement-icon">🎉</span>
            <h3>{settlementTitle} · 委托结算</h3>
          </div>

          <div className="settlement-result-banner">
            <span className="result-icon">🏆</span>
            <span className="result-text">委托完成！</span>
          </div>

          <div className="settlement-rewards-section">
            <h4>📦 获得奖励</h4>
            <div className="reward-grid">
              {settlementRewards.map((reward, idx) => {
                const materialInfo = reward.materialId ? getMaterialInfo(reward.materialId) : null;
                return (
                  <div key={idx} className="reward-item">
                    <span className="reward-icon">
                      {reward.type === 'gold' && '💰'}
                      {reward.type === 'exp' && '⚡'}
                      {reward.type === 'soulOrbs' && '💎'}
                      {reward.type === 'material' && materialInfo?.icon}
                      {reward.type === 'reputation' && '🏛️'}
                    </span>
                    <span className="reward-label">
                      {reward.type === 'gold' && '金币'}
                      {reward.type === 'exp' && '经验'}
                      {reward.type === 'soulOrbs' && '魂珠'}
                      {reward.type === 'material' && materialInfo?.name}
                      {reward.type === 'reputation' && '声望'}
                    </span>
                    <span className={`reward-value ${reward.type}`}>
                      +{reward.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="settlement-confirm-btn"
            onClick={() => {
              setShowSettlement(false);
              setSettlementRewards([]);
              setSettlementTitle('');
            }}
          >
            确认结算
          </button>
        </div>
      </div>
    );
  };

  const renderCommissionDetail = () => {
    if (!selectedCommission) return null;

    const typeInfo = COMMISSION_TYPES[selectedCommission.type];
    const commissionPower = getCommissionPower(selectedCompanionIds);
    const powerRatio = commissionPower / selectedCommission.requiredPower;

    return (
      <div className="commission-detail-overlay" onClick={() => setSelectedCommission(null)}>
        <div className="commission-detail" onClick={(e) => e.stopPropagation()}>
          <div className="detail-header">
            <button className="back-btn" onClick={() => setSelectedCommission(null)}>
              ← 返回
            </button>
            <h3>{selectedCommission.icon} {selectedCommission.title}</h3>
            <span
              className="rarity-badge"
              style={{ backgroundColor: COMMISSION_RARITY_COLORS[selectedCommission.rarity] }}
            >
              {COMMISSION_RARITY_NAMES[selectedCommission.rarity]}
            </span>
          </div>

          <div className="detail-info">
            <div className="type-tag" style={{ color: typeInfo.color }}>
              {typeInfo.icon} {typeInfo.name}
            </div>
            <p className="mission-desc">{selectedCommission.description}</p>

            <div className="mission-stats-grid">
              <div className="mission-stat">
                <span>⏱️ 时长</span>
                <span>{formatDuration(selectedCommission.durationSeconds)}</span>
              </div>
              <div className="mission-stat">
                <span>👥 人数</span>
                <span>{selectedCommission.minCompanions}~{selectedCommission.maxCompanions}人</span>
              </div>
              <div className="mission-stat">
                <span>⚔️ 推荐战力</span>
                <span className={powerRatio < 0.8 ? 'low-power' : ''}>
                  {commissionPower} / {selectedCommission.requiredPower}
                </span>
              </div>
              <div className="mission-stat">
                <span>✨ 事件几率</span>
                <span>{(selectedCommission.eventChance * 100).toFixed(0)}%</span>
              </div>
              <div className="mission-stat">
                <span>💀 失败几率</span>
                <span>{(selectedCommission.failureChance * 100).toFixed(0)}%</span>
              </div>
              <div className="mission-stat">
                <span>📈 成功率</span>
                <span className={powerRatio >= 1 ? 'success' : 'warning'}>
                  {Math.min(95, 50 + powerRatio * 40).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="detail-rewards">
            <h4>🎁 可能获得的奖励</h4>
            <div className="reward-list">
              {selectedCommission.rewards.map((reward, idx) => {
                const materialInfo = reward.materialId ? getMaterialInfo(reward.materialId) : null;
                return (
                  <div key={idx} className="reward-preview">
                    <span className="reward-icon">
                      {reward.type === 'gold' && '💰'}
                      {reward.type === 'exp' && '⚡'}
                      {reward.type === 'soulOrbs' && '💎'}
                      {reward.type === 'material' && materialInfo?.icon}
                      {reward.type === 'reputation' && '🏛️'}
                    </span>
                    <span className="reward-name">
                      {reward.type === 'gold' && '金币'}
                      {reward.type === 'exp' && '经验'}
                      {reward.type === 'soulOrbs' && '魂珠'}
                      {reward.type === 'material' && materialInfo?.name}
                      {reward.type === 'reputation' && '声望'}
                    </span>
                    <span className="reward-range">
                      {reward.minAmount}~{reward.maxAmount}
                    </span>
                    <span className="reward-chance">
                      {(reward.chance * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="detail-companions">
            <h4>🤝 选择出征伙伴</h4>
            <p className="selection-hint">
              已选 {selectedCompanionIds.length}/{selectedCommission.maxCompanions}
              （至少需要 {selectedCommission.minCompanions} 人）
            </p>
            {ownedCompanions.length === 0 ? (
              <p className="no-companions-hint">暂无伙伴</p>
            ) : (
              <div className="companion-grid">
                {ownedCompanions.map((comp) => {
                  const isSelected = selectedCompanionIds.includes(comp.id);
                  const isBusy = busyCompanionIds.includes(comp.id);
                  const effectiveAtk = useGameStore.getState().getCompanionEffectiveAttack(comp);
                  const effectiveDef = useGameStore.getState().getCompanionEffectiveDefense(comp);
                  return (
                    <button
                      key={comp.id}
                      className={`companion-card ${isSelected ? 'selected' : ''} ${isBusy ? 'busy' : ''}`}
                      onClick={() => !isBusy && toggleCompanion(comp.id)}
                      disabled={isBusy}
                      style={{ borderColor: isSelected ? COMMISSION_RARITY_COLORS[comp.rarity] : 'rgba(255,255,255,0.1)' }}
                    >
                      <div
                        className="companion-avatar"
                        style={{ backgroundColor: COMMISSION_RARITY_COLORS[comp.rarity] + '30' }}
                      >
                        {comp.name[0]}
                      </div>
                      <div className="companion-info">
                        <span className="companion-name">
                          {comp.name} {'★'.repeat(Math.min(comp.stars, 5))}
                        </span>
                        <span className="companion-stats">
                          ⚔️{effectiveAtk} 🛡️{effectiveDef}
                        </span>
                        {isBusy && <span className="busy-tag">出征中</span>}
                      </div>
                      {isSelected && <span className="check-mark">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className="start-commission-btn"
            onClick={handleStartCommission}
            disabled={
              selectedCompanionIds.length < selectedCommission.minCompanions ||
              !canStartCommission()
            }
          >
            🚀 接受委托
          </button>
          {!canStartCommission() && (
            <p className="warning-text">⚠️ 进行中的委托已达上限 ({COMMISSION_MAX_ACTIVE}个)</p>
          )}
        </div>
      </div>
    );
  };

  const renderEventPanel = (ac: ActiveCommission) => {
    if (!ac.currentEvent) return null;

    return (
      <div className="commission-event">
        <div className="event-header">
          <span className="event-icon-large">{ac.currentEvent.icon}</span>
          <h3>{ac.currentEvent.title}</h3>
        </div>
        <p className="event-desc">{ac.currentEvent.description}</p>

        <div className="event-choices">
          {ac.currentEvent.choices.map((choice) => (
            <button
              key={choice.id}
              className="event-choice-btn"
              onClick={() => resolveCommissionEvent(ac.commissionId, choice.id)}
            >
              {choice.text}
              <div className="choice-effects">
                {choice.effects.map((effect, idx) => (
                  <span key={idx} className={`effect-tag ${effect.value >= 0 ? 'positive' : 'negative'}`}>
                    {effect.type === 'gold' && '💰'}
                    {effect.type === 'exp' && '⚡'}
                    {effect.type === 'soulOrbs' && '💎'}
                    {effect.type === 'material' && '📦'}
                    {effect.type === 'hp' && '❤️'}
                    {effect.type === 'success_rate' && '📈'}
                    {effect.type === 'failure_rate' && '📉'}
                    {effect.value >= 0 ? '+' : ''}
                    {effect.isPercent ? `${effect.value}%` : effect.value}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAvailableTab = () => (
    <div className="commission-list">
      <div className="list-header">
        <h3>📋 可接委托</h3>
        <button
          className="refresh-btn"
          onClick={() => refreshCommissions()}
        >
          🔄 刷新
        </button>
      </div>
      <p className="list-subtitle">
        进行中: {getActiveCommissionCount()}/{COMMISSION_MAX_ACTIVE}
      </p>

      {availableCommissions.length === 0 ? (
        <div className="empty-state">
          <p>暂无可用委托</p>
          <button className="refresh-btn" onClick={() => refreshCommissions()}>
            🔄 刷新委托
          </button>
        </div>
      ) : (
        <div className="commission-cards">
          {availableCommissions.map((commission) => {
            const typeInfo = COMMISSION_TYPES[commission.type];
            const isUnlocked = player.stats.level >= commission.minLevel;
            return (
              <button
                key={commission.id}
                className={`commission-card ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => isUnlocked && setSelectedCommission(commission)}
                disabled={!isUnlocked}
              >
                <div
                  className="card-bg"
                  style={{ background: `linear-gradient(135deg, ${commission.bgColor}, ${commission.bgColor}dd)` }}
                />
                <div className="card-content">
                  <div className="card-top">
                    <span className="card-icon">{commission.icon}</span>
                    <span
                      className="rarity-tag"
                      style={{ color: COMMISSION_RARITY_COLORS[commission.rarity] }}
                    >
                      {COMMISSION_RARITY_NAMES[commission.rarity]}
                    </span>
                  </div>
                  <h4 className="card-title">{commission.title}</h4>
                  <div className="card-type" style={{ color: typeInfo.color }}>
                    {typeInfo.icon} {typeInfo.name}
                  </div>
                  <div className="card-stats">
                    <span>⏱️ {formatDuration(commission.durationSeconds)}</span>
                    <span>⚔️ {commission.requiredPower}</span>
                  </div>
                  {!isUnlocked && (
                    <div className="card-lock">
                      🔒 需要等级 {commission.minLevel}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => (
    <div className="active-commissions">
      <div className="list-header">
        <h3>⚔️ 进行中的委托</h3>
        <span className="count-badge">{getActiveCommissionCount()}/{COMMISSION_MAX_ACTIVE}</span>
      </div>

      {activeCommissions.length === 0 ? (
        <div className="empty-state">
          <p>暂无进行中的委托</p>
          <button className="go-btn" onClick={() => setActiveTab('available')}>
            📋 去接委托
          </button>
        </div>
      ) : (
        <div className="active-list">
          {activeCommissions.map((ac) => {
            const template = getActiveCommissionTemplate(ac);
            const typeInfo = COMMISSION_TYPES[ac.type];
            const remainingTime = getRemainingTime(ac);

            if (ac.status === 'event' && ac.currentEvent) {
              return (
                <div key={ac.commissionId} className="active-commission-card event-mode">
                  {renderEventPanel(ac)}
                </div>
              );
            }

            return (
              <div key={ac.commissionId} className="active-commission-card">
                <div className="active-card-header">
                  <div className="active-card-title">
                    <span className="active-icon">{template?.icon || '📜'}</span>
                    <h4>{ac.title}</h4>
                  </div>
                  <span className="type-tag" style={{ color: typeInfo.color }}>
                    {typeInfo.name}
                  </span>
                </div>

                <div className="progress-section">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${ac.progress * 100}%` }}
                    />
                  </div>
                  <div className="progress-info">
                    <span>{(ac.progress * 100).toFixed(0)}%</span>
                    <span>
                      {ac.status === 'completed' ? '✅ 已完成' : `剩余 ${formatDuration(remainingTime)}`}
                    </span>
                  </div>
                </div>

                <div className="active-card-squad">
                  <span className="squad-label">出征队伍:</span>
                  <div className="squad-avatars">
                    {ac.companionIds.map((cid) => {
                      const comp = ownedCompanions.find((c) => c.id === cid);
                      return (
                        <div
                          key={cid}
                          className="squad-avatar"
                          title={comp?.name}
                          style={{ borderColor: comp ? COMMISSION_RARITY_COLORS[comp.rarity] : '#666' }}
                        >
                          {comp?.name[0] || '?'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="active-card-log">
                  <div className="log-preview">
                    {ac.eventLog.slice(-3).map((log, i) => (
                      <div key={i} className="log-item">{log}</div>
                    ))}
                  </div>
                </div>

                <div className="active-card-actions">
                  {ac.status === 'completed' ? (
                    <button
                      className="collect-btn"
                      onClick={() => handleCollectReward(ac.commissionId)}
                    >
                      🎁 领取奖励
                    </button>
                  ) : (
                    <button
                      className="cancel-btn-small"
                      onClick={() => cancelCommission(ac.commissionId)}
                    >
                      ✕ 取消委托
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMaterialsTab = () => (
    <div className="material-inventory">
      <div className="list-header">
        <h3>🎒 材料背包</h3>
        <span className="count-badge">{materialInventory.length} 种</span>
      </div>

      {materialInventory.length === 0 ? (
        <div className="empty-state">
          <p>暂无材料</p>
          <p className="hint">完成委托可获得稀有材料</p>
        </div>
      ) : (
        <div className="material-grid">
          {materialInventory.map((mat) => {
            const info = getMaterialInfo(mat.materialId);
            if (!info) return null;
            return (
              <div
                key={mat.materialId}
                className="material-card"
                style={{ borderColor: COMMISSION_RARITY_COLORS[info.rarity] }}
              >
                <div
                  className="material-icon"
                  style={{ backgroundColor: COMMISSION_RARITY_COLORS[info.rarity] + '20' }}
                >
                  {info.icon}
                </div>
                <div className="material-info">
                  <h5 style={{ color: COMMISSION_RARITY_COLORS[info.rarity] }}>
                    {info.name}
                  </h5>
                  <p className="material-desc">{info.description}</p>
                  <div className="material-footer">
                    <span className="material-count">x{mat.count}</span>
                    <button
                      className="sell-btn"
                      onClick={() => sellMaterial(mat.materialId, 1)}
                    >
                      💰 出售 ({info.sellPrice}金)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="material-collection">
        <h4>📚 材料图鉴</h4>
        <div className="collection-grid">
          {RARE_MATERIALS.map((mat) => {
            const owned = materialInventory.some((m) => m.materialId === mat.id);
            return (
              <div
                key={mat.id}
                className={`collection-item ${owned ? 'owned' : 'locked'}`}
                title={owned ? mat.name : '???'}
              >
                <div
                  className="collection-icon"
                  style={{
                    backgroundColor: owned ? COMMISSION_RARITY_COLORS[mat.rarity] + '20' : '#1a1a1a',
                    borderColor: owned ? COMMISSION_RARITY_COLORS[mat.rarity] : '#333',
                  }}
                >
                  {owned ? mat.icon : '?'}
                </div>
                <span className="collection-name">
                  {owned ? mat.name : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'available' as const, label: '📋 可接委托' },
    { id: 'active' as const, label: '⚔️ 进行中' },
    { id: 'materials' as const, label: '🎒 材料' },
  ];

  return (
    <div className="commission-panel">
      <div className="panel-header">
        <h2>🏛️ 冒险委托中心</h2>
        <p className="panel-subtitle">派遣伙伴完成委托，获取稀有材料和丰厚奖励</p>
      </div>

      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'available' && renderAvailableTab()}
        {activeTab === 'active' && renderActiveTab()}
        {activeTab === 'materials' && renderMaterialsTab()}
      </div>

      {renderCommissionDetail()}
      {renderSettlement()}
    </div>
  );
}
