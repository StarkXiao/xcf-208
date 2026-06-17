import { useGameStore } from '../game/store';
import type { PlayerStats } from '../game/types';

function StatBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  return (
    <div className="stat-bar-container">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>{Math.floor(current)} / {Math.floor(max)}</span>
      </div>
      <div className="stat-bar-bg">
        <div
          className="stat-bar-fill"
          style={{
            width: `${Math.min(100, (current / max) * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function UpgradeButton({ stat, label, value, cost = 1, skillPoints, onUpgrade }: { stat: keyof PlayerStats; label: string; value: number | string; cost?: number; skillPoints: number; onUpgrade: (stat: keyof PlayerStats, cost: number) => void }) {
  return (
    <div className="upgrade-item">
      <span className="upgrade-label">{label}</span>
      <span className="upgrade-value">{value}</span>
      <button
        className="upgrade-btn"
        onClick={() => onUpgrade(stat, cost)}
        disabled={skillPoints < cost}
      >
        +{cost}点
      </button>
    </div>
  );
}

export default function StatsPanel() {
  const { player, upgradeStat, getTotalAttack, getTotalDefense, rebirthBonuses, getFormationCompanions, getBondBonus, getTotalTalentBonus, getActiveSynergies } = useGameStore();
  const { stats, skillPoints } = player;

  const expBonus = rebirthBonuses['exp_boost'] || 0;
  const goldBonus = rebirthBonuses['gold_boost'] || 0;
  const attackBonus = rebirthBonuses['attack_boost'] || 0;
  const defenseBonus = rebirthBonuses['defense_boost'] || 0;
  const hpBonus = rebirthBonuses['hp_boost'] || 0;

  const talentAtkBonus = getTotalTalentBonus('attack');
  const talentDefBonus = getTotalTalentBonus('defense');
  const talentHpBonus = getTotalTalentBonus('hp');
  const talentExpBonus = getTotalTalentBonus('exp');
  const talentGoldBonus = getTotalTalentBonus('gold');
  const talentCritRate = getTotalTalentBonus('critRate');
  const talentCritDamage = getTotalTalentBonus('critDamage');
  const talentDodge = getTotalTalentBonus('dodge');
  const talentLuck = getTotalTalentBonus('luck');
  const talentSpeed = getTotalTalentBonus('speed');
  const talentMp = getTotalTalentBonus('mp');
  const talentSoulOrbs = getTotalTalentBonus('soulOrbs');
  const activeSynergies = getActiveSynergies();

  const hasAnyTalentBonus = talentAtkBonus.percent > 0 || talentAtkBonus.flat > 0 ||
    talentDefBonus.percent > 0 || talentDefBonus.flat > 0 ||
    talentHpBonus.percent > 0 || talentHpBonus.flat > 0 ||
    talentExpBonus.percent > 0 || talentGoldBonus.percent > 0 ||
    talentCritRate.percent > 0 || talentCritDamage.percent > 0 ||
    talentDodge.percent > 0 || talentLuck.flat > 0 ||
    talentSpeed.percent > 0 || talentSpeed.flat > 0 ||
    talentMp.percent > 0 || talentMp.flat > 0 ||
    talentSoulOrbs.percent > 0;

  const formationCompanions = getFormationCompanions();
  const bondBonus = getBondBonus();
  const formationAtk = formationCompanions.reduce((s, c) => s + useGameStore.getState().getCompanionEffectiveAttack(c), 0);
  const formationDef = formationCompanions.reduce((s, c) => s + useGameStore.getState().getCompanionEffectiveDefense(c), 0);

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <div className="player-info">
          <h3>{player.name}</h3>
          <p className="player-race-class">{player.race} · {player.class}</p>
        </div>
        <div className="level-badge">
          <span className="level-number">Lv.{stats.level}</span>
        </div>
      </div>

      <div className="stats-bars">
        <StatBar label="❤️ 生命" current={stats.hp} max={stats.maxHp} color="#ef4444" />
        <StatBar label="💙 魔力" current={stats.mp} max={stats.maxMp} color="#3b82f6" />
        <StatBar label="⭐ 经验" current={stats.exp} max={stats.expToNext} color="#f59e0b" />
      </div>

      <div className="skill-points-section">
        <span className="skill-points-label">可用技能点</span>
        <span className="skill-points-value">🎯 {skillPoints}</span>
      </div>

      <div className="upgrade-section">
        <h4>属性升级</h4>
        <UpgradeButton stat="maxHp" label="❤️ 生命值" value={`${stats.maxHp} (+10)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
        <UpgradeButton stat="maxMp" label="💙 魔力值" value={`${stats.maxMp} (+5)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
        <UpgradeButton stat="attack" label="⚔️ 攻击力" value={`${stats.attack} (+2)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
        <UpgradeButton stat="defense" label="🛡️ 防御力" value={`${stats.defense} (+2)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
        <UpgradeButton stat="speed" label="👟 速度" value={`${stats.speed} (+1)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
        <UpgradeButton stat="luck" label="🍀 幸运" value={`${stats.luck} (+1)`} skillPoints={skillPoints} onUpgrade={upgradeStat} />
      </div>

      <div className="total-stats-section">
        <h4>战斗属性（含编队伙伴 + 羁绊）</h4>
        <div className="total-stats-grid">
          <div className="total-stat-item">
            <span>⚔️ 总攻击</span>
            <span>{getTotalAttack()}</span>
          </div>
          <div className="total-stat-item">
            <span>🛡️ 总防御</span>
            <span>{getTotalDefense()}</span>
          </div>
        </div>
        {formationCompanions.length > 0 && (
          <div className="formation-breakdown">
            <div className="breakdown-row">
              <span>玩家基础</span>
              <span>⚔️ {stats.attack} 🛡️ {stats.defense}</span>
            </div>
            <div className="breakdown-row">
              <span>编队伙伴 ({formationCompanions.length}人)</span>
              <span>⚔️ +{formationAtk} 🛡️ +{formationDef}</span>
            </div>
            {(bondBonus.attack > 0 || bondBonus.defense > 0) && (
              <div className="breakdown-row bond">
                <span>🔗 羁绊加成</span>
                <span>⚔️ +{bondBonus.attack} 🛡️ +{bondBonus.defense}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="currency-section">
        <div className="currency-item">
          <span>💰 金币</span>
          <span className="gold-value">{stats.gold.toLocaleString()}</span>
        </div>
        <div className="currency-item">
          <span>💎 魂珠</span>
          <span className="soul-value">{stats.soulOrbs}</span>
        </div>
      </div>

      {(expBonus > 0 || goldBonus > 0 || attackBonus > 0 || defenseBonus > 0 || hpBonus > 0) && (
        <div className="rebirth-bonus-section">
          <h4>🔄 转生加成</h4>
          <div className="bonus-list">
            {attackBonus > 0 && <div className="bonus-item">攻击 +{(attackBonus * 100).toFixed(0)}%</div>}
            {defenseBonus > 0 && <div className="bonus-item">防御 +{(defenseBonus * 100).toFixed(0)}%</div>}
            {hpBonus > 0 && <div className="bonus-item">生命 +{(hpBonus * 100).toFixed(0)}%</div>}
            {expBonus > 0 && <div className="bonus-item">经验 +{(expBonus * 100).toFixed(0)}%</div>}
            {goldBonus > 0 && <div className="bonus-item">金币 +{(goldBonus * 100).toFixed(0)}%</div>}
          </div>
        </div>
      )}

      {hasAnyTalentBonus && (
        <div className="talent-bonus-section">
          <h4>🌟 天赋加成</h4>
          <div className="bonus-list">
            {(talentAtkBonus.percent > 0 || talentAtkBonus.flat > 0) && (
              <div className="bonus-item">
                攻击 {talentAtkBonus.percent > 0 ? `+${(talentAtkBonus.percent * 100).toFixed(0)}%` : ''}
                {talentAtkBonus.flat > 0 ? ` +${talentAtkBonus.flat}` : ''}
              </div>
            )}
            {(talentDefBonus.percent > 0 || talentDefBonus.flat > 0) && (
              <div className="bonus-item">
                防御 {talentDefBonus.percent > 0 ? `+${(talentDefBonus.percent * 100).toFixed(0)}%` : ''}
                {talentDefBonus.flat > 0 ? ` +${talentDefBonus.flat}` : ''}
              </div>
            )}
            {(talentHpBonus.percent > 0 || talentHpBonus.flat > 0) && (
              <div className="bonus-item">
                生命 {talentHpBonus.percent > 0 ? `+${(talentHpBonus.percent * 100).toFixed(0)}%` : ''}
                {talentHpBonus.flat > 0 ? ` +${talentHpBonus.flat}` : ''}
              </div>
            )}
            {(talentMp.percent > 0 || talentMp.flat > 0) && (
              <div className="bonus-item">
                魔力 {talentMp.percent > 0 ? `+${(talentMp.percent * 100).toFixed(0)}%` : ''}
                {talentMp.flat > 0 ? ` +${talentMp.flat}` : ''}
              </div>
            )}
            {(talentSpeed.percent > 0 || talentSpeed.flat > 0) && (
              <div className="bonus-item">
                速度 {talentSpeed.percent > 0 ? `+${(talentSpeed.percent * 100).toFixed(0)}%` : ''}
                {talentSpeed.flat > 0 ? ` +${talentSpeed.flat}` : ''}
              </div>
            )}
            {talentLuck.flat > 0 && <div className="bonus-item">幸运 +{talentLuck.flat}</div>}
            {talentExpBonus.percent > 0 && <div className="bonus-item">经验 +{(talentExpBonus.percent * 100).toFixed(0)}%</div>}
            {talentGoldBonus.percent > 0 && <div className="bonus-item">金币 +{(talentGoldBonus.percent * 100).toFixed(0)}%</div>}
            {talentSoulOrbs.percent > 0 && <div className="bonus-item">魂珠获取 +{(talentSoulOrbs.percent * 100).toFixed(0)}%</div>}
            {talentCritRate.percent > 0 && <div className="bonus-item">暴击率 +{(talentCritRate.percent * 100).toFixed(1)}%</div>}
            {talentCritDamage.percent > 0 && <div className="bonus-item">暴击伤害 +{(talentCritDamage.percent * 100).toFixed(0)}%</div>}
            {talentDodge.percent > 0 && <div className="bonus-item">闪避率 +{(talentDodge.percent * 100).toFixed(1)}%</div>}
          </div>
        </div>
      )}

      {activeSynergies.length > 0 && (
        <div className="synergy-section">
          <h4>🔗 天赋协同</h4>
          <div className="bonus-list">
            {activeSynergies.map((id) => (
              <div key={id} className="synergy-item">已激活</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
