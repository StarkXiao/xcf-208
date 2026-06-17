import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import StatsPanel from './StatsPanel';
import MapPanel from './MapPanel';
import CompanionsPanel from './CompanionsPanel';
import EventModal from './EventModal';
import OfflineRewardsModal from './OfflineRewardsModal';
import { REBIRTH_OPTIONS } from '../game/data';

export default function GameScreen() {
  const {
    activeTab,
    setActiveTab,
    player,
    rebirthBonuses,
    updateLastOnlineTime,
  } = useGameStore();

  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [selectedRebirthBonuses, setSelectedRebirthBonuses] = useState<string[]>([]);

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
    { id: 'events' as const, label: '🔄 转生', icon: '🔄' },
  ];

  const canRebirth = player.stats.level >= 30;
  const soulOrbsGained = Math.floor(player.stats.level / 10);

  const toggleRebirthBonus = (bonusId: string) => {
    const option = REBIRTH_OPTIONS.find((o) => o.id === bonusId);
    if (!option) return;

    const currentCost = selectedRebirthBonuses.reduce((sum, id) => {
      const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
      return sum + (opt?.cost || 0);
    }, 0);

    const availableSoulOrbs = player.stats.soulOrbs + soulOrbsGained;

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

  const handleRebirth = () => {
    const tempSoulOrbs = player.stats.soulOrbs + soulOrbsGained;
    if (totalSelectedCost > tempSoulOrbs) return;

    const remainingSoulOrbs = tempSoulOrbs - totalSelectedCost;
    
    const newBonuses = { ...rebirthBonuses };
    selectedRebirthBonuses.forEach((id) => {
      const option = REBIRTH_OPTIONS.find((o) => o.id === id);
      if (option) {
        newBonuses[id] = (newBonuses[id] || 0) + option.bonus;
      }
    });

    setShowRebirthModal(false);
    setSelectedRebirthBonuses([]);
    
    useGameStore.setState((state) => ({
      screen: 'rebirth',
      player: {
        ...state.player,
        name: '',
        race: '',
        class: '',
        stats: { ...state.player.stats, soulOrbs: remainingSoulOrbs },
        rebirthCount: state.player.rebirthCount + 1,
        totalRebirthBonus: state.player.totalRebirthBonus + selectedRebirthBonuses.length,
      },
      ownedCompanions: [],
      rebirthBonuses: newBonuses,
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'companions':
        return <CompanionsPanel />;
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
                <span className="value soul">💎 +{soulOrbsGained}</span>
              </div>
            </div>

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

            <div className="rebirth-bonuses-list">
              <h4>转生加成选项</h4>
              <p className="hint">选择本次转生要购买的加成</p>
              <div className="bonus-grid">
                {REBIRTH_OPTIONS.map((option) => {
                  const currentBonus = rebirthBonuses[option.id] || 0;
                  const isSelected = selectedRebirthBonuses.includes(option.id);
                  const availableSoulOrbs = player.stats.soulOrbs + soulOrbsGained;
                  const canAfford = totalSelectedCost + option.cost <= availableSoulOrbs;

                  return (
                    <button
                      key={option.id}
                      className={`bonus-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => canRebirth && toggleRebirthBonus(option.id)}
                      disabled={!canRebirth || (!isSelected && !canAfford)}
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
            </div>

            <button
              className={`rebirth-btn ${canRebirth ? '' : 'disabled'}`}
              onClick={() => canRebirth && setShowRebirthModal(true)}
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

      {showRebirthModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>确认转生？</h3>
            <p>你将失去当前进度，但获得永久加成</p>
            <div className="confirm-info">
              <p>获得魂珠：💎 +{soulOrbsGained}</p>
              <p>选择的加成：{selectedRebirthBonuses.length} 个</p>
              <p>消耗魂珠：💎 {totalSelectedCost}</p>
            </div>
            <div className="confirm-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowRebirthModal(false)}
              >
                取消
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleRebirth}
              >
                确认转生
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
