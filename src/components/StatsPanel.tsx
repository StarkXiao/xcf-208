import { useState } from 'react';
import { useGameStore } from '../game/store';
import type { PlayerStats, PowerComponent } from '../game/types';
import { RARITY_COLORS, RARITY_NAMES, TALENT_TREES } from '../game/data';

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

function PowerBarRow({ label, icon, value, maxValue, color, showPercent = false }: {
  label: string; icon: string; value: number; maxValue: number; color: string; showPercent?: boolean;
}) {
  const percent = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
  return (
    <div className="power-bar-row">
      <div className="power-bar-label">
        <span className="power-bar-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="power-bar-track">
        <div
          className="power-bar-fill"
          style={{
            width: `${Math.min(100, percent)}%`,
            backgroundColor: value >= 0 ? color : '#ef4444',
          }}
        />
      </div>
      <span className={`power-bar-value ${value < 0 ? 'negative' : ''}`}>
        {value >= 0 ? '+' : ''}{showPercent && value !== 0 && typeof value === 'number' ? `${(value * 100).toFixed(0)}%` : value}
      </span>
    </div>
  );
}

function StatBreakdownSection({
  title,
  icon,
  component,
  expanded,
  onToggle,
  color,
}: {
  title: string;
  icon: string;
  component: PowerComponent;
  expanded: boolean;
  onToggle: () => void;
  color: string;
}) {
  const maxAbsValue = Math.max(
    component.base,
    component.companion,
    component.bond,
    Math.abs(component.rebirthValue),
    Math.abs(component.talentValue),
    Math.abs(component.mapModifier),
    Math.abs(component.affinityValue),
    1
  );

  return (
    <div className="stat-breakdown-section">
      <div className="stat-breakdown-header" onClick={onToggle}>
        <div className="stat-breakdown-title">
          <span className="stat-breakdown-icon" style={{ color }}>{icon}</span>
          <span>{title}</span>
          <span className="stat-breakdown-total" style={{ color }}>{component.total}</span>
        </div>
        <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>
      {expanded && (
        <div className="stat-breakdown-content">
          <div className="power-breakdown-grid">
            <div className="power-source-section">
              <h5 className="power-source-title">🏠 基础值</h5>
              <PowerBarRow
                label="角色基础"
                icon="👤"
                value={component.base}
                maxValue={maxAbsValue}
                color="#60a5fa"
              />
            </div>
            <div className="power-source-section">
              <h5 className="power-source-title">🤝 伙伴加成</h5>
              <PowerBarRow
                label="编队伙伴"
                icon="👥"
                value={component.companion}
                maxValue={maxAbsValue}
                color="#22c55e"
              />
              <PowerBarRow
                label="羁绊加成"
                icon="🔗"
                value={component.bond}
                maxValue={maxAbsValue}
                color="#fbbf24"
              />
            </div>
            <div className="power-source-section">
              <h5 className="power-source-title">🔄 转生增益</h5>
              <PowerBarRow
                label={`转生加成 ($\{(component.rebirthPercent * 100).toFixed(0)}%)`}
                icon="✨"
                value={component.rebirthValue}
                maxValue={maxAbsValue}
                color="#a855f7"
              />
            </div>
            <div className="power-source-section">
              <h5 className="power-source-title">⚡ 临时效果</h5>
              <PowerBarRow
                label={`天赋加成 ($\{(component.talentPercent * 100).toFixed(0)}%)`}
                icon="🌟"
                value={component.talentValue}
                maxValue={maxAbsValue}
                color="#f472b6"
              />
              <PowerBarRow
                label="地图修正"
                icon="🗺️"
                value={component.mapModifier}
                maxValue={maxAbsValue}
                color="#06b6d4"
              />
              <PowerBarRow
                label={`好感倍率 ($\{(component.affinityPercent * 100).toFixed(0)}%)`}
                icon="💛"
                value={component.affinityValue}
                maxValue={maxAbsValue}
                color="#f59e0b"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatsPanel() {
  const { player, upgradeStat, getTotalAttack, getTotalDefense, rebirthBonuses, getFormationCompanions, getBondBonus, getTotalTalentBonus, getActiveSynergies, getPowerBreakdown } = useGameStore();
  const { stats, skillPoints } = player;

  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({
    attack: true,
    defense: false,
    hp: false,
    speed: false,
  });
  const [showSources, setShowSources] = useState(false);

  const powerBreakdown = getPowerBreakdown();

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

  const totalPower = powerBreakdown.attack.total + powerBreakdown.defense.total + Math.floor(powerBreakdown.hp.total / 10) + powerBreakdown.speed.total;

  const toggleStat = (stat: string) => {
    setExpandedStats((prev) => ({ ...prev, [stat]: !prev[stat] }));
  };

  const getTalentTreeName = (category: string) => {
    const tree = TALENT_TREES.find((t) => t.id === category);
    return tree?.name || category;
  };

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

      <div className="power-breakdown-section">
        <div className="power-header">
          <h4>💪 战力拆解</h4>
          <div className="total-power">
            <span className="total-power-label">总战力</span>
            <span className="total-power-value">{totalPower.toLocaleString()}</span>
          </div>
        </div>

        <StatBreakdownSection
          title="⚔️ 攻击力"
          icon="⚔️"
          component={powerBreakdown.attack}
          expanded={expandedStats.attack}
          onToggle={() => toggleStat('attack')}
          color="#ef4444"
        />

        <StatBreakdownSection
          title="🛡️ 防御力"
          icon="🛡️"
          component={powerBreakdown.defense}
          expanded={expandedStats.defense}
          onToggle={() => toggleStat('defense')}
          color="#3b82f6"
        />

        <StatBreakdownSection
          title="❤️ 生命值"
          icon="❤️"
          component={powerBreakdown.hp}
          expanded={expandedStats.hp}
          onToggle={() => toggleStat('hp')}
          color="#22c55e"
        />

        <StatBreakdownSection
          title="👟 速度"
          icon="👟"
          component={powerBreakdown.speed}
          expanded={expandedStats.speed}
          onToggle={() => toggleStat('speed')}
          color="#f59e0b"
        />

        <button className="sources-toggle-btn" onClick={() => setShowSources(!showSources)}>
          {showSources ? '▼ 收起来源详情' : '▶ 查看来源详情'}
        </button>

        {showSources && (
          <div className="sources-detail-section">
            {powerBreakdown.companionDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>🤝 伙伴来源</h5>
                <div className="source-detail-list">
                  {powerBreakdown.companionDetails.map((c, idx) => (
                    <div key={idx} className="source-detail-item">
                      <div className="source-detail-left">
                        <span
                          className="source-rarity-dot"
                          style={{ backgroundColor: RARITY_COLORS[c.rarity as keyof typeof RARITY_COLORS] }}
                        />
                        <span className="source-detail-name">{c.name}</span>
                        <span className="source-detail-badge">
                          {'⭐'.repeat(c.stars)}
                        </span>
                      </div>
                      <div className="source-detail-right">
                        <span className="attack-val">⚔️ +{c.attack}</span>
                        <span className="defense-val">🛡️ +{c.defense}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {powerBreakdown.bondDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>🔗 羁绊效果</h5>
                <div className="source-detail-list">
                  {powerBreakdown.bondDetails.map((b, idx) => (
                    <div key={idx} className="source-detail-item bond-item">
                      <div className="source-detail-left">
                        <span className="bond-icon">{b.icon}</span>
                        <div>
                          <span className="source-detail-name">{b.name}</span>
                          <div className="bond-members">{b.members.join('、')}</div>
                        </div>
                      </div>
                      <div className="source-detail-right">
                        {b.bonus.map((bo, bi) => (
                          <span key={bi} className="bond-bonus-tag">
                            {bo.type === 'attack' ? '⚔️' : bo.type === 'defense' ? '🛡️' : bo.type === 'hp' ? '❤️' : bo.type === 'speed' ? '👟' : '🍀'}
                            +{bo.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {powerBreakdown.rebirthDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>🔄 转生祝福</h5>
                <div className="source-detail-list">
                  {powerBreakdown.rebirthDetails.map((r, idx) => (
                    <div key={idx} className="source-detail-item">
                      <div className="source-detail-left">
                        <span className="rebirth-icon">{r.icon}</span>
                        <span className="source-detail-name">{r.name}</span>
                      </div>
                      <div className="source-detail-right">
                        <span className="rebirth-value">+{(r.value * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {powerBreakdown.talentDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>🌟 天赋激活</h5>
                <div className="source-detail-list">
                  {powerBreakdown.talentDetails.map((t, idx) => (
                    <div key={idx} className="source-detail-item talent-item">
                      <div className="source-detail-left">
                        <span className="talent-icon">{t.icon}</span>
                        <div>
                          <span className="source-detail-name">{t.name}</span>
                          <div className="talent-meta">
                            <span
                              className="talent-rarity-badge"
                              style={{
                                backgroundColor: `${RARITY_COLORS[t.rarity as keyof typeof RARITY_COLORS]}30`,
                                color: RARITY_COLORS[t.rarity as keyof typeof RARITY_COLORS],
                              }}
                            >
                              {RARITY_NAMES[t.rarity as keyof typeof RARITY_NAMES]}
                            </span>
                            <span className="talent-level">Lv.{t.level}</span>
                            <span className="talent-category">{getTalentTreeName(t.category)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {powerBreakdown.mapModifierDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>🗺️ 区域状态</h5>
                <div className="source-detail-list">
                  {powerBreakdown.mapModifierDetails.map((m, idx) => (
                    <div key={idx} className={`source-detail-item modifier-item ${m.value < 0 ? 'negative' : ''}`}>
                      <div className="source-detail-left">
                        <span className="modifier-type-tag">
                          {m.type === 'blessing' ? '✨' : m.type === 'hazard' ? '⚠️' : m.type === 'cursed' ? '💀' : m.type === 'hiddenPath' ? '🚪' : '🔒'}
                        </span>
                        <div>
                          <span className="source-detail-name">{m.name}</span>
                          <div className="modifier-area">{m.areaName} - {m.description}</div>
                        </div>
                      </div>
                      <div className="source-detail-right">
                        <span className={`modifier-value ${m.value < 0 ? 'negative' : ''}`}>
                          {m.stat === 'attack' ? '⚔️' : m.stat === 'defense' ? '🛡️' : m.stat === 'hp' ? '❤️' : m.stat === 'speed' ? '👟' : m.stat === 'luck' ? '🍀' : m.stat === 'mp' ? '💙' : m.stat === 'gold' ? '💰' : '⭐'}
                          {m.value >= 0 ? '+' : ''}{m.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {powerBreakdown.affinityDetails.length > 0 && (
              <div className="source-detail-block">
                <h5>💛 伙伴好感度</h5>
                <div className="source-detail-list">
                  {powerBreakdown.affinityDetails.map((a, idx) => (
                    <div key={idx} className="source-detail-item">
                      <div className="source-detail-left">
                        <span
                          className="affinity-level-badge"
                          style={{ backgroundColor: `${a.color}30`, color: a.color }}
                        >
                          {a.level}
                        </span>
                        <span className="source-detail-name">{a.name}</span>
                      </div>
                      <div className="source-detail-right">
                        <span className="affinity-score" style={{ color: a.color }}>
                          {a.value >= 0 ? '+' : ''}{a.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="affinity-multiplier-hint">
                  好感平均倍率：×{(1 + ((powerBreakdown.attack.affinityPercent + powerBreakdown.defense.affinityPercent) / 2)).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}
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
