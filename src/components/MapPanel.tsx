import { useState } from 'react';
import { useGameStore } from '../game/store';
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
  } = useGameStore();

  const [showMapSelect, setShowMapSelect] = useState(false);

  const currentArea = mapAreas.find((a) => a.id === currentAreaId);

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
          className={`auto-battle-btn ${isAutoBattle ? 'active' : ''}`}
          onClick={() => setAutoBattle(!isAutoBattle)}
        >
          {isAutoBattle ? '⏸️ 暂停挂机' : '▶️ 开始挂机'}
        </button>
      </div>

      {showMapSelect && (
        <div className="map-select-popup">
          <div className="map-list">
            {mapAreas.map((area) => (
              <button
                key={area.id}
                className={`map-item ${currentAreaId === area.id ? 'current' : ''} ${!area.unlocked ? 'locked' : ''}`}
                onClick={() => {
                  if (area.unlocked) {
                    setCurrentArea(area.id);
                    setShowMapSelect(false);
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
                </div>
              </button>
            ))}
          </div>
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
