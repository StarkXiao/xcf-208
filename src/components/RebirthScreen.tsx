import { useState } from 'react';
import { useGameStore } from '../game/store';
import { RACES, CLASSES, REBIRTH_OPTIONS } from '../game/data';

export default function RebirthScreen() {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState(RACES[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedBonuses, setSelectedBonuses] = useState<string[]>([]);
  const [showBonusSelect, setShowBonusSelect] = useState(false);

  const {
    player,
    rebirthBonuses,
    initializePlayer,
    performRebirth,
  } = useGameStore();

  const isRebirth = player.rebirthCount > 0;

  const handleStart = () => {
    if (!name.trim()) return;
    
    if (isRebirth && selectedBonuses.length > 0) {
      const success = performRebirth(selectedBonuses);
      if (success) {
        initializePlayer(name, selectedRace, selectedClass);
      }
    } else {
      initializePlayer(name, selectedRace, selectedClass);
    }
  };

  const toggleBonus = (bonusId: string) => {
    const option = REBIRTH_OPTIONS.find((o) => o.id === bonusId);
    if (!option) return;

    const currentCost = selectedBonuses.reduce((sum, id) => {
      const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
      return sum + (opt?.cost || 0);
    }, 0);

    if (selectedBonuses.includes(bonusId)) {
      setSelectedBonuses(selectedBonuses.filter((id) => id !== bonusId));
    } else if (currentCost + option.cost <= player.stats.soulOrbs) {
      setSelectedBonuses([...selectedBonuses, bonusId]);
    }
  };

  const totalSelectedCost = selectedBonuses.reduce((sum, id) => {
    const opt = REBIRTH_OPTIONS.find((o) => o.id === id);
    return sum + (opt?.cost || 0);
  }, 0);

  return (
    <div className="rebirth-screen">
      <div className="rebirth-container">
        <h1 className="rebirth-title">
          {isRebirth ? '🔄 再次转生' : '✨ 异世界转生'}
        </h1>
        
        {isRebirth && (
          <div className="rebirth-info">
            <p>已转生次数：<span className="highlight">{player.rebirthCount}</span></p>
            <p>累计转生加成：<span className="highlight">+{player.totalRebirthBonus}%</span></p>
            <p>魂珠：<span className="highlight-soul">💎 {player.stats.soulOrbs}</span></p>
          </div>
        )}

        <div className="form-group">
          <label>你的名字</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入你的名字..."
            maxLength={12}
          />
        </div>

        <div className="form-group">
          <label>选择种族</label>
          <div className="option-grid">
            {RACES.map((race) => (
              <button
                key={race}
                className={`option-btn ${selectedRace === race ? 'selected' : ''}`}
                onClick={() => setSelectedRace(race)}
              >
                {race}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>选择职业</label>
          <div className="option-grid">
            {CLASSES.map((cls) => (
              <button
                key={cls}
                className={`option-btn ${selectedClass === cls ? 'selected' : ''}`}
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {isRebirth && (
          <div className="form-group">
            <label>
              转生加成 
              <button 
                className="toggle-btn"
                onClick={() => setShowBonusSelect(!showBonusSelect)}
              >
                {showBonusSelect ? '收起' : '展开'}
              </button>
            </label>
            {showBonusSelect && (
              <div className="bonus-grid">
                {REBIRTH_OPTIONS.map((option) => {
                  const currentBonus = rebirthBonuses[option.id] || 0;
                  const isSelected = selectedBonuses.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      className={`bonus-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleBonus(option.id)}
                      disabled={!isSelected && totalSelectedCost + option.cost > player.stats.soulOrbs}
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
            )}
          </div>
        )}

        <button
          className="start-btn"
          onClick={handleStart}
          disabled={!name.trim()}
        >
          {isRebirth ? '🌟 开始新的人生' : '⚡ 开始冒险'}
        </button>

        <div className="hint-text">
          提示：达到一定等级后可以转生获得永久加成
        </div>
      </div>
    </div>
  );
}
