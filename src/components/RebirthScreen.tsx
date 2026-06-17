import { useState } from 'react';
import { useGameStore } from '../game/store';
import { RACES, CLASSES, REBIRTH_OPTIONS, REPUTATION_LEVELS, TALENTS } from '../game/data';

export default function RebirthScreen() {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState(RACES[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);

  const {
    player,
    rebirthBonuses,
    initializePlayer,
    areaReputations,
    mapAreas,
    getActiveSynergies,
  } = useGameStore();

  const isRebirth = player.rebirthCount > 0;
  const preserveRatio = rebirthBonuses['reputation_preserve'] || 0;

  const totalTalentLevels = player.inheritedTalents.reduce((sum, t) => sum + t.currentLevel, 0);
  const activeTalentCount = player.inheritedTalents.filter((t) => t.currentLevel > 0).length;
  const activeSynergies = getActiveSynergies();

  const handleStart = () => {
    if (!name.trim()) return;
    initializePlayer(name, selectedRace, selectedClass);
  };

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
            {player.talentPoints > 0 && (
              <p>天赋点数：<span className="highlight">🌟 {player.talentPoints}</span></p>
            )}
            {Object.keys(rebirthBonuses).length > 0 && (
              <div className="rebirth-bonus-summary">
                <p className="bonus-summary-title">本次转生加成</p>
                {REBIRTH_OPTIONS.map((option) => {
                  const bonus = rebirthBonuses[option.id];
                  if (!bonus) return null;
                  return (
                    <p key={option.id} className="bonus-summary-item">
                      {option.icon} {option.name}：+{(bonus * 100).toFixed(0)}%
                    </p>
                  );
                })}
              </div>
            )}
            {activeTalentCount > 0 && (
              <div className="rebirth-bonus-summary">
                <p className="bonus-summary-title">🌟 继承天赋 ({activeTalentCount}项，总等级 {totalTalentLevels})</p>
                {player.inheritedTalents.map((node) => {
                  if (node.currentLevel <= 0) return null;
                  const talent = TALENTS.find((t) => t.id === node.talentId);
                  if (!talent) return null;
                  return (
                    <p key={node.talentId} className="bonus-summary-item">
                      {talent.icon} {talent.name}：Lv.{node.currentLevel}/{talent.maxLevel}
                    </p>
                  );
                })}
                {activeSynergies.length > 0 && (
                  <p className="synergy-summary">🔗 激活协同：{activeSynergies.length}个</p>
                )}
              </div>
            )}
            {areaReputations.some((r) => r.points > 0) && (
              <div className="rebirth-rep-summary">
                <p className="bonus-summary-title">🏛️ 声望状态</p>
                {areaReputations.map((rep) => {
                  if (rep.points <= 0) return null;
                  const area = mapAreas.find((a) => a.id === rep.areaId);
                  const repData = REPUTATION_LEVELS.find((rl) => rl.level === rep.level) || REPUTATION_LEVELS[0];
                  const preserved = Math.floor(rep.points * preserveRatio);
                  return (
                    <p key={rep.areaId} className="bonus-summary-item">
                      {area?.name}: {repData.name} ({rep.points})
                      {preserveRatio > 0 && (
                        <span className="rep-preserve-info"> → 保留 {preserved}</span>
                      )}
                    </p>
                  );
                })}
                {preserveRatio === 0 && (
                  <p className="rep-reset-warning">⚠️ 未选择声望传承，声望将重置为0</p>
                )}
              </div>
            )}
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
