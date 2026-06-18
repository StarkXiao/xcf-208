import { useState, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../game/store';
import {
  RELIC_DUNGEON_ROOM_TYPE_NAMES,
  RELIC_DUNGEON_ROOM_TYPE_ICONS,
  RELIC_DUNGEON_ROOM_TYPE_COLORS,
  RELIC_DUNGEON_DIFFICULTY_NAMES,
  RELIC_DUNGEON_DIFFICULTY_COLORS,
  RELIC_DUNGEON_BUFF_RARITY_COLORS,
  RELIC_DUNGEON_BUFF_RARITY_NAMES,
  RELIC_DUNGEON_RANK_COLORS,
} from '../game/types';
import type {
  RelicDungeonBuff,
  RelicDungeonDifficulty,
  RelicDungeonShopItem,
  RelicDungeonReplayEvent,
} from '../game/types';
import { RELIC_DUNGEON_DIFFICULTY_CONFIG } from '../game/data';

type DungeonView = 'entry' | 'map' | 'room' | 'buff_select' | 'boss' | 'settlement' | 'history' | 'replay';

const STAT_NAMES: Record<string, string> = {
  attack: '⚔️攻击',
  defense: '🛡️防御',
  hp: '❤️生命',
  mp: '💙魔力',
  speed: '👟速度',
  luck: '🍀幸运',
  critRate: '💥暴击率',
  critDamage: '🔥暴击伤害',
  dodge: '💨闪避',
  goldBonus: '💰金币加成',
  expBonus: '⭐经验加成',
  damageReduction: '🛡️减伤',
  lifesteal: '🩸吸血',
  thorns: '🌵反伤',
};

const DIFFICULTY_OPTIONS: { id: RelicDungeonDifficulty; desc: string; req: string }[] = [
  { id: 'easy', desc: '推荐新手，敌人较弱', req: '无限制' },
  { id: 'normal', desc: '标准难度，均衡挑战', req: '历史最高层 ≥ 5' },
  { id: 'hard', desc: '高风险高回报', req: '历史最高层 ≥ 10' },
  { id: 'nightmare', desc: '极限挑战，传说奖励', req: '历史最高层 ≥ 15' },
];

export default function RelicDungeonPanel() {
  const {
    relicDungeon,
    startRelicDungeon,
    getRelicDungeonCurrentFloor,
    getRelicDungeonCurrentRoom,
    getAccessibleRelicDungeonRooms,
    enterRelicDungeonRoom,
    clearRelicDungeonRoom,
    collectRelicDungeonBuff,
    getRelicDungeonTotalAttack,
    getRelicDungeonTotalDefense,
    advanceToNextRelicDungeonFloor,
    completeRelicDungeonBoss,
    dealRelicDungeonBossDamage,
    takeRelicDungeonBossDamage,
    abandonRelicDungeon,
    settleRelicDungeon,
    claimRelicDungeonRewards,
    getRelicDungeonHistory,
    viewRelicDungeonReplay,
    closeRelicDungeonReplay,
    stepRelicDungeonReplay,
    toggleRelicDungeonReplayPlaying,
    buyRelicDungeonShopItem,
  } = useGameStore();

  const [currentView, setCurrentView] = useState<DungeonView>('entry');
  const [selectedBuff, setSelectedBuff] = useState<RelicDungeonBuff | null>(null);
  const [autoBattle, setAutoBattle] = useState(false);
  const autoBattleRef = useRef<number | null>(null);

  const currentFloor = useMemo(() => getRelicDungeonCurrentFloor(), [getRelicDungeonCurrentFloor, relicDungeon.currentFloor]);
  const currentRoom = useMemo(() => getRelicDungeonCurrentRoom(), [getRelicDungeonCurrentRoom, relicDungeon.currentRoomId]);
  const accessibleRooms = useMemo(() => getAccessibleRelicDungeonRooms(), [getAccessibleRelicDungeonRooms, relicDungeon.visitedRoomIds]);
  const history = useMemo(() => getRelicDungeonHistory(), [getRelicDungeonHistory, relicDungeon.history]);

  const totalAttack = getRelicDungeonTotalAttack();
  const totalDefense = getRelicDungeonTotalDefense();

  useEffect(() => {
    if (relicDungeon.viewingReplay) {
      setCurrentView('replay');
    } else if (relicDungeon.settlement) {
      setCurrentView('settlement');
    } else if (relicDungeon.isActive) {
      if (relicDungeon.currentBoss) {
        setCurrentView('boss');
      } else if (currentRoom) {
        if (currentRoom.buffChoices && currentRoom.buffChoices.length > 0 && !currentRoom.cleared) {
          setCurrentView('buff_select');
        } else {
          setCurrentView('room');
        }
      } else {
        setCurrentView('map');
      }
    } else {
      setCurrentView('entry');
    }
  }, [
    relicDungeon.isActive,
    relicDungeon.currentBoss,
    relicDungeon.currentRoomId,
    relicDungeon.settlement,
    relicDungeon.viewingReplay,
    currentRoom,
  ]);

  useEffect(() => {
    if (autoBattle && relicDungeon.currentBoss && relicDungeon.isActive) {
      autoBattleRef.current = window.setInterval(() => {
        const dmg = dealRelicDungeonBossDamage();
        if (dmg <= 0 || !relicDungeon.currentBoss) {
          setAutoBattle(false);
        } else {
          takeRelicDungeonBossDamage();
        }
      }, 500);
    }
    return () => {
      if (autoBattleRef.current) {
        clearInterval(autoBattleRef.current);
        autoBattleRef.current = null;
      }
    };
  }, [autoBattle, relicDungeon.currentBoss, relicDungeon.isActive, dealRelicDungeonBossDamage, takeRelicDungeonBossDamage]);

  const handleStartDungeon = (difficulty: RelicDungeonDifficulty) => {
    if (startRelicDungeon(difficulty)) {
      setCurrentView('map');
    }
  };

  const handleEnterRoom = (roomId: string) => {
    enterRelicDungeonRoom(roomId);
  };

  const handleClearRoom = () => {
    if (currentRoom) {
      clearRelicDungeonRoom(currentRoom.id);
    }
  };

  const handleSelectBuff = (buff: RelicDungeonBuff) => {
    collectRelicDungeonBuff(buff);
    setSelectedBuff(null);
  };

  const handleBossAttack = () => {
    dealRelicDungeonBossDamage();
    takeRelicDungeonBossDamage();
  };

  const handleCompleteBoss = () => {
    completeRelicDungeonBoss();
  };

  const handleAdvanceFloor = () => {
    advanceToNextRelicDungeonFloor();
  };

  const handleClaimRewards = () => {
    claimRelicDungeonRewards();
    setCurrentView('entry');
  };

  const handleViewReplay = (runId: string) => {
    viewRelicDungeonReplay(runId);
  };

  const renderEntryView = () => (
    <div className="relic-dungeon-entry">
      <div className="dungeon-entry-header">
        <h2>🏛️ 遗物秘境</h2>
        <p className="dungeon-entry-desc">探索神秘的多层秘境，收集强力增益，击败Boss获取丰厚奖励！</p>
      </div>

      <div className="dungeon-stats-card">
        <div className="dungeon-stat-item">
          <span className="stat-label">🏆 历史最高层</span>
          <span className="stat-value">{relicDungeon.highestFloorReached}</span>
        </div>
        <div className="dungeon-stat-item">
          <span className="stat-label">🎯 总探索次数</span>
          <span className="stat-value">{relicDungeon.totalRuns}</span>
        </div>
        <div className="dungeon-stat-item">
          <span className="stat-label">👑 击败Boss数</span>
          <span className="stat-value">{relicDungeon.totalBossesDefeated}</span>
        </div>
      </div>

      <div className="difficulty-selection">
        <h3>选择难度</h3>
        <div className="difficulty-grid">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isUnlocked = relicDungeon.unlockedDifficulties.includes(opt.id);
            const config = RELIC_DUNGEON_DIFFICULTY_CONFIG[opt.id];
            return (
              <button
                key={opt.id}
                className={`difficulty-card ${isUnlocked ? '' : 'locked'}`}
                style={{ borderColor: RELIC_DUNGEON_DIFFICULTY_COLORS[opt.id] }}
                onClick={() => isUnlocked && handleStartDungeon(opt.id)}
                disabled={!isUnlocked}
              >
                <div className="difficulty-header" style={{ color: RELIC_DUNGEON_DIFFICULTY_COLORS[opt.id] }}>
                  <span className="difficulty-name">{RELIC_DUNGEON_DIFFICULTY_NAMES[opt.id]}</span>
                  {!isUnlocked && <span className="lock-icon">🔒</span>}
                </div>
                <p className="difficulty-desc">{opt.desc}</p>
                <div className="difficulty-rewards">
                  <span>📊 层数: {config.totalFloors}</span>
                  <span>💰 奖励: ×{config.goldMultiplier}</span>
                </div>
                <p className="difficulty-req">条件: {opt.req}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dungeon-actions-row">
        <button className="history-btn" onClick={() => setCurrentView('history')}>
          📜 探索历史
        </button>
      </div>
    </div>
  );

  const renderMapView = () => {
    if (!currentFloor) return null;
    const dConfig = RELIC_DUNGEON_DIFFICULTY_CONFIG[relicDungeon.difficulty];
    const canAdvance = currentFloor.rooms.every((r) => r.cleared || r.id === currentFloor.bossRoomId) 
      && currentFloor.rooms.find(r => r.id === currentFloor.bossRoomId)?.cleared;

    return (
      <div className="relic-dungeon-map">
        <div className="dungeon-map-header">
          <div className="floor-info">
            <span className="floor-label" style={{ color: RELIC_DUNGEON_DIFFICULTY_COLORS[relicDungeon.difficulty] }}>
              {RELIC_DUNGEON_DIFFICULTY_NAMES[relicDungeon.difficulty]}
            </span>
            <span className="floor-number">第 {relicDungeon.currentFloor} / {dConfig.totalFloors} 层</span>
          </div>
          <div className="dungeon-player-stats">
            <span>❤️ {relicDungeon.playerHp}/{relicDungeon.playerMaxHp}</span>
            <span>💙 {relicDungeon.playerMp}/{relicDungeon.playerMaxMp}</span>
            <span>💰 {relicDungeon.tempGold}</span>
            <span>💎 {relicDungeon.tempSoulOrbs}</span>
          </div>
        </div>

        {relicDungeon.activeBuffs.length > 0 && (
          <div className="active-buffs-bar">
            <span className="buffs-label">激活增益:</span>
            {relicDungeon.activeBuffs.map((b) => (
              <div
                key={b.id}
                className="buff-chip"
                style={{ borderColor: RELIC_DUNGEON_BUFF_RARITY_COLORS[b.rarity] }}
                title={`${b.name}: ${b.description}`}
              >
                <span>{b.icon}</span>
                {b.remainingRooms !== undefined && <span className="buff-duration">({b.remainingRooms})</span>}
              </div>
            ))}
          </div>
        )}

        <div className="dungeon-rooms-grid">
          {currentFloor.rooms.map((room) => {
            const isAccessible = accessibleRooms.some((r) => r.id === room.id);
            const isVisited = relicDungeon.visitedRoomIds.includes(room.id);
            const isCurrent = relicDungeon.currentRoomId === room.id;
            return (
              <button
                key={room.id}
                className={`dungeon-room-node ${room.cleared ? 'cleared' : ''} ${isAccessible ? 'accessible' : ''} ${isVisited ? 'visited' : ''} ${isCurrent ? 'current' : ''} ${room.isBoss ? 'boss' : ''}`}
                style={{
                  '--room-color': RELIC_DUNGEON_ROOM_TYPE_COLORS[room.type],
                } as React.CSSProperties}
                onClick={() => isAccessible && !room.cleared && handleEnterRoom(room.id)}
                disabled={!isAccessible || room.cleared}
              >
                <div className="room-icon">{RELIC_DUNGEON_ROOM_TYPE_ICONS[room.type]}</div>
                <div className="room-name">{room.name}</div>
                <div className="room-status">
                  {room.cleared ? '✓' : isAccessible ? '可进入' : ''}
                </div>
              </button>
            );
          })}
        </div>

        <div className="dungeon-map-actions">
          <button
            className="abandon-btn"
            onClick={() => {
              if (confirm('确定要放弃本次探索吗？已获得的临时奖励将会结算。')) {
                abandonRelicDungeon();
              }
            }}
          >
            🚪 放弃探索
          </button>
          {canAdvance && (
            <button
              className="advance-btn"
              onClick={handleAdvanceFloor}
            >
              {relicDungeon.currentFloor >= dConfig.totalFloors ? '🏁 完成秘境' : '⬇️ 进入下一层'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRoomView = () => {
    if (!currentRoom) return null;

    const renderRoomContent = () => {
      switch (currentRoom.type) {
        case 'combat':
        case 'elite':
          return (
            <div className="room-combat">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="combat-preview">
                <span className="enemy-tier">{RELIC_DUNGEON_ROOM_TYPE_NAMES[currentRoom.type]}敌人</span>
                <span className="enemy-tip">击败后可获得 {currentRoom.type === 'elite' ? '稀有' : ''} 奖励</span>
              </div>
              <button className="action-btn primary" onClick={handleClearRoom}>
                ⚔️ 开始战斗
              </button>
            </div>
          );

        case 'treasure':
          return (
            <div className="room-treasure">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="treasure-chest">🎁</div>
              <button className="action-btn primary" onClick={handleClearRoom}>
                🔓 开启宝箱
              </button>
            </div>
          );

        case 'event':
          return (
            <div className="room-event">
              <p className="room-desc">{currentRoom.description}</p>
              <button className="action-btn primary" onClick={handleClearRoom}>
                ✨ 触发事件
              </button>
            </div>
          );

        case 'shrine':
          return (
            <div className="room-shrine">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="shrine-icon">⛩️</div>
              <p className="shrine-tip">在此祈祷可获得神圣增益</p>
              <button className="action-btn primary" onClick={handleClearRoom}>
                🙏 祈祷
              </button>
            </div>
          );

        case 'rest':
          return (
            <div className="room-rest">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="camp-icon">🏕️</div>
              <p className="rest-tip">休息可恢复生命值和魔力值</p>
              <button className="action-btn primary" onClick={handleClearRoom}>
                💤 休息恢复
              </button>
            </div>
          );

        case 'shop':
          const shopItems: RelicDungeonShopItem[] = currentRoom.shopItems || relicDungeon.currentShopInventory;
          return (
            <div className="room-shop">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="shop-items-list">
                {shopItems.map((item) => {
                  const canAfford = item.currency === 'gold'
                    ? relicDungeon.tempGold >= item.cost
                    : relicDungeon.tempSoulOrbs >= item.cost;
                  return (
                    <div
                      key={item.id}
                      className={`shop-item-card ${canAfford ? '' : 'unaffordable'}`}
                      style={item.rarity ? { borderColor: RELIC_DUNGEON_BUFF_RARITY_COLORS[item.rarity] } : undefined}
                    >
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-info">
                        <h5 className="shop-item-name">{item.name}</h5>
                        <p className="shop-item-desc">{item.description}</p>
                        {item.rarity && (
                          <span className="shop-item-rarity" style={{ color: RELIC_DUNGEON_BUFF_RARITY_COLORS[item.rarity] }}>
                            {RELIC_DUNGEON_BUFF_RARITY_NAMES[item.rarity]}
                          </span>
                        )}
                      </div>
                      <div className="shop-item-buy">
                        <span className="shop-cost">
                          {item.currency === 'gold' ? '💰' : '💎'} {item.cost}
                        </span>
                        <button
                          className="buy-btn"
                          onClick={() => buyRelicDungeonShopItem(item.id)}
                          disabled={!canAfford}
                        >
                          购买
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {currentRoom.cleared ? (
                <button className="action-btn secondary" onClick={() => setCurrentView('map')}>
                  ← 返回地图
                </button>
              ) : (
                <button className="action-btn secondary" onClick={handleClearRoom}>
                  离开商店
                </button>
              )}
            </div>
          );

        case 'mystery':
          return (
            <div className="room-mystery">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="mystery-icon">❓</div>
              <p className="mystery-tip">未知的机遇或危险...</p>
              <button className="action-btn primary" onClick={handleClearRoom}>
                🎲 探索
              </button>
            </div>
          );

        case 'boss':
          return (
            <div className="room-boss-entry">
              <p className="room-desc">{currentRoom.description}</p>
              <div className="boss-entrance-icon">👑</div>
              <p className="boss-warning">⚠️ Boss战一旦开始无法撤退！</p>
              <button className="action-btn danger" onClick={handleClearRoom}>
                ⚔️ 挑战Boss
              </button>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="relic-dungeon-room">
        <div className="room-header" style={{ borderBottomColor: RELIC_DUNGEON_ROOM_TYPE_COLORS[currentRoom.type] }}>
          <div className="room-title">
            <span className="room-type-icon">{RELIC_DUNGEON_ROOM_TYPE_ICONS[currentRoom.type]}</span>
            <h3 style={{ color: RELIC_DUNGEON_ROOM_TYPE_COLORS[currentRoom.type] }}>
              {currentRoom.name}
            </h3>
            <span className="room-type-tag">{RELIC_DUNGEON_ROOM_TYPE_NAMES[currentRoom.type]}</span>
          </div>
          <button className="back-btn" onClick={() => setCurrentView('map')}>
            ← 地图
          </button>
        </div>
        <div className="room-content">
          {renderRoomContent()}
        </div>
      </div>
    );
  };

  const renderBuffSelectView = () => {
    if (!currentRoom || !currentRoom.buffChoices) return null;

    return (
      <div className="relic-dungeon-buff-select">
        <div className="buff-select-header">
          <h3>✨ 选择一个增益</h3>
          <p>从以下三个增益中选择一个，它们将在本次秘境探索中持续生效</p>
        </div>
        <div className="buff-choices-grid">
          {currentRoom.buffChoices.map((buff) => (
            <div
              key={buff.id}
              className={`buff-choice-card ${selectedBuff?.id === buff.id ? 'selected' : ''}`}
              style={{ borderColor: RELIC_DUNGEON_BUFF_RARITY_COLORS[buff.rarity] }}
              onClick={() => setSelectedBuff(buff)}
            >
              <div className="buff-icon">{buff.icon}</div>
              <h4 className="buff-name" style={{ color: RELIC_DUNGEON_BUFF_RARITY_COLORS[buff.rarity] }}>
                {buff.name}
              </h4>
              <span className="buff-rarity" style={{ color: RELIC_DUNGEON_BUFF_RARITY_COLORS[buff.rarity] }}>
                {RELIC_DUNGEON_BUFF_RARITY_NAMES[buff.rarity]}
              </span>
              <p className="buff-desc">{buff.description}</p>
              <div className="buff-effects">
                {buff.effects.map((eff, i) => (
                  <span key={i} className="buff-effect-line">
                    {STAT_NAMES[eff.stat] || eff.stat}
                    {eff.isPercent
                      ? ` +${(eff.value * 100).toFixed(1)}%`
                      : ` +${Math.floor(eff.value)}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="buff-select-actions">
          <button
            className="action-btn primary"
            disabled={!selectedBuff}
            onClick={() => selectedBuff && handleSelectBuff(selectedBuff)}
          >
            ✅ 确认选择
          </button>
        </div>
      </div>
    );
  };

  const renderBossView = () => {
    const boss = relicDungeon.currentBoss;
    if (!boss) return null;

    const hpPercent = (boss.hp / boss.maxHp) * 100;
    const playerHpPercent = (relicDungeon.playerHp / relicDungeon.playerMaxHp) * 100;
    const bossDefeated = boss.hp <= 0;
    const playerDead = relicDungeon.playerHp <= 0;

    return (
      <div className="relic-dungeon-boss">
        <div className="boss-battle-header">
          <h2 className="boss-name" style={{ color: '#ef4444' }}>
            👑 {boss.name}
          </h2>
          <span className="boss-phase">阶段 {boss.currentPhase + 1}</span>
        </div>

        <div className="boss-battle-arena">
          <div className="player-side">
            <div className="combatant-avatar player">🧙</div>
            <div className="combatant-info">
              <h4>冒险者</h4>
              <div className="hp-bar">
                <div className="hp-fill player" style={{ width: `${Math.max(0, playerHpPercent)}%` }} />
                <span className="hp-text">{Math.max(0, relicDungeon.playerHp)} / {relicDungeon.playerMaxHp}</span>
              </div>
              <div className="combatant-stats">
                <span>⚔️ {totalAttack}</span>
                <span>🛡️ {totalDefense}</span>
              </div>
            </div>
          </div>

          <div className="vs-divider">⚔️ VS ⚔️</div>

          <div className="boss-side">
            <div className="combatant-avatar boss">👹</div>
            <div className="combatant-info">
              <h4>{boss.name}</h4>
              <div className="hp-bar boss">
                <div className="hp-fill boss" style={{ width: `${Math.max(0, hpPercent)}%` }} />
                <span className="hp-text">{Math.max(0, boss.hp)} / {boss.maxHp}</span>
              </div>
              <div className="combatant-stats">
                <span>⚔️ {boss.attack}</span>
                <span>🛡️ {boss.defense}</span>
              </div>
            </div>
          </div>
        </div>

        {boss.mechanicActive && (
          <div className="boss-mechanic-alert">
            ⚠️ {boss.mechanicActive.description}
          </div>
        )}

        <div className="boss-battle-log">
          <div className="log-header">📜 战斗日志</div>
          <div className="log-content">
            {relicDungeon.bossLog.slice(-8).map((log, i) => (
              <p key={i} className="log-line">{log}</p>
            ))}
          </div>
        </div>

        {bossDefeated ? (
          <div className="battle-actions victory">
            <p className="victory-text">🎉 Boss已被击败！</p>
            <button className="action-btn primary" onClick={handleCompleteBoss}>
              🏆 领取奖励
            </button>
          </div>
        ) : playerDead ? (
          <div className="battle-actions defeat">
            <p className="defeat-text">💀 你被击败了...</p>
            <button className="action-btn danger" onClick={() => settleRelicDungeon(false)}>
              查看结算
            </button>
          </div>
        ) : (
          <div className="battle-actions">
            <label className="auto-battle-toggle">
              <input
                type="checkbox"
                checked={autoBattle}
                onChange={(e) => setAutoBattle(e.target.checked)}
              />
              <span>⚡ 自动战斗</span>
            </label>
            <button className="action-btn primary" onClick={handleBossAttack}>
              ⚔️ 攻击
            </button>
            <button
              className="action-btn danger"
              onClick={() => {
                if (confirm('逃跑将损失部分奖励，确定吗？')) {
                  abandonRelicDungeon();
                }
              }}
            >
              🏃 逃跑
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSettlementView = () => {
    const s = relicDungeon.settlement;
    if (!s) return null;

    return (
      <div className="relic-dungeon-settlement">
        <div className={`settlement-header ${s.survival ? 'victory' : 'defeat'}`}>
          <h2>{s.survival ? '🏆 探索完成！' : '💀 探索失败'}</h2>
          <div className="settlement-rank" style={{ color: RELIC_DUNGEON_RANK_COLORS[s.rank] }}>
            评级: {s.rank}
          </div>
        </div>

        <div className="settlement-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-label">通关层数</span>
            <span className="stat-value">{s.floorsCleared} / {s.totalFloors}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🚪</span>
            <span className="stat-label">清理房间</span>
            <span className="stat-value">{s.roomsCleared}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚔️</span>
            <span className="stat-label">造成伤害</span>
            <span className="stat-value">{s.totalDamageDealt.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🛡️</span>
            <span className="stat-label">承受伤害</span>
            <span className="stat-value">{s.totalDamageTaken.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👹</span>
            <span className="stat-label">击杀怪物</span>
            <span className="stat-value">{s.monstersKilled}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👑</span>
            <span className="stat-label">击败Boss</span>
            <span className="stat-value">{s.bossesDefeated}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✨</span>
            <span className="stat-label">收集增益</span>
            <span className="stat-value">{s.buffsCollected}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏺</span>
            <span className="stat-label">发现遗物</span>
            <span className="stat-value">{s.relicsFound}</span>
          </div>
        </div>

        <div className="settlement-rewards">
          <h3>🎁 获得奖励</h3>
          <div className="rewards-list">
            <div className="reward-item">
              <span>💰 金币</span>
              <span className="reward-value">+{s.goldEarned.toLocaleString()}</span>
            </div>
            <div className="reward-item">
              <span>⭐ 经验</span>
              <span className="reward-value">+{s.expEarned.toLocaleString()}</span>
            </div>
            <div className="reward-item">
              <span>💎 魂珠</span>
              <span className="reward-value">+{s.soulOrbsEarned}</span>
            </div>
            {s.rewards.map((r, i) => (
              <div key={i} className="reward-item">
                <span>{r.type === 'hp' ? '❤️' : r.type === 'mp' ? '💙' : '🎁'} 额外奖励</span>
                <span className="reward-value">+{r.value}{r.isPercent ? '%' : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="settlement-actions">
          <button className="action-btn secondary" onClick={() => handleViewReplay(s.runId)}>
            📽️ 观看回放
          </button>
          <button className="action-btn primary" onClick={handleClaimRewards}>
            ✅ 领取奖励
          </button>
        </div>
      </div>
    );
  };

  const renderHistoryView = () => (
    <div className="relic-dungeon-history">
      <div className="history-header">
        <h2>📜 探索历史</h2>
        <button className="back-btn" onClick={() => setCurrentView('entry')}>
          ← 返回
        </button>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>暂无探索记录</p>
          <p className="hint">完成一次遗物秘境探索后会显示在这里</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((record) => (
            <div
              key={record.runId}
              className={`history-record ${record.survival ? 'victory' : 'defeat'}`}
            >
              <div className="record-main">
                <div className="record-rank" style={{ color: RELIC_DUNGEON_RANK_COLORS[record.rank] }}>
                  {record.rank}
                </div>
                <div className="record-info">
                  <div className="record-title">
                    <span
                      className="record-difficulty"
                      style={{ color: RELIC_DUNGEON_DIFFICULTY_COLORS[record.difficulty] }}
                    >
                      {RELIC_DUNGEON_DIFFICULTY_NAMES[record.difficulty]}
                    </span>
                    <span className="record-result">
                      {record.survival ? '🏆 通关' : '💀 失败'}
                    </span>
                  </div>
                  <div className="record-meta">
                    <span>📊 {record.floorsCleared}/{record.totalFloors}层</span>
                    <span>🚪 {record.roomsCleared}房间</span>
                    <span>⚔️ {record.totalDamageDealt.toLocaleString()}伤害</span>
                    <span>👑 {record.bossesDefeated}Boss</span>
                  </div>
                  <div className="record-time">
                    {new Date(record.endTime).toLocaleString()}
                  </div>
                </div>
                <div className="record-rewards">
                  <span>💰 {record.goldEarned.toLocaleString()}</span>
                  <span>⭐ {record.expEarned.toLocaleString()}</span>
                  <span>💎 {record.soulOrbsEarned}</span>
                </div>
              </div>
              <div className="record-actions">
                <button
                  className="replay-btn"
                  onClick={() => handleViewReplay(record.runId)}
                >
                  📽️ 回放
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReplayView = () => {
    const replay = relicDungeon.viewingReplay;
    if (!replay) return null;

    const currentEvent: RelicDungeonReplayEvent | undefined = replay.replay[relicDungeon.replayIndex];
    const progress = replay.replay.length > 0
      ? ((relicDungeon.replayIndex + 1) / replay.replay.length) * 100
      : 0;

    return (
      <div className="relic-dungeon-replay">
        <div className="replay-header">
          <h2>📽️ 回放 - {new Date(replay.endTime).toLocaleDateString()}</h2>
          <button className="close-btn" onClick={closeRelicDungeonReplay}>
            ✕ 关闭
          </button>
        </div>

        <div className="replay-summary">
          <div className="replay-info-item">
            <span style={{ color: RELIC_DUNGEON_DIFFICULTY_COLORS[replay.difficulty] }}>
              {RELIC_DUNGEON_DIFFICULTY_NAMES[replay.difficulty]}
            </span>
          </div>
          <div className="replay-info-item">
            <span style={{ color: RELIC_DUNGEON_RANK_COLORS[replay.rank] }}>
              评级: {replay.rank}
            </span>
          </div>
          <div className="replay-info-item">
            {replay.survival ? '🏆 通关' : '💀 失败'}
          </div>
        </div>

        <div className="replay-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {relicDungeon.replayIndex + 1} / {replay.replay.length}
          </span>
        </div>

        <div className="replay-event-detail">
          {currentEvent ? (
            <>
              <div className="event-type-tag">
                {currentEvent.type === 'room_enter' && '🚪 进入房间'}
                {currentEvent.type === 'room_clear' && '✅ 清理房间'}
                {currentEvent.type === 'buff_gain' && '✨ 获得增益'}
                {currentEvent.type === 'buff_lose' && '📉 失去增益'}
                {currentEvent.type === 'damage_dealt' && '⚔️ 造成伤害'}
                {currentEvent.type === 'damage_taken' && '💥 承受伤害'}
                {currentEvent.type === 'reward_gain' && '🎁 获得奖励'}
                {currentEvent.type === 'player_death' && '💀 玩家死亡'}
                {currentEvent.type === 'boss_phase' && '👑 Boss阶段'}
                {currentEvent.type === 'choice_made' && '🎯 做出选择'}
              </div>
              <div className="event-floor-info">第 {currentEvent.floor} 层</div>
              {currentEvent.roomType && (
                <div className="event-room-type" style={{ color: RELIC_DUNGEON_ROOM_TYPE_COLORS[currentEvent.roomType] }}>
                  {RELIC_DUNGEON_ROOM_TYPE_ICONS[currentEvent.roomType]} {RELIC_DUNGEON_ROOM_TYPE_NAMES[currentEvent.roomType]}
                </div>
              )}
              <p className="event-description">{currentEvent.description}</p>
              {currentEvent.details && (
                <div className="event-details">
                  {Object.entries(currentEvent.details).map(([k, v]) => (
                    <span key={k} className="detail-item">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
              <div className="event-time">
                {new Date(currentEvent.timestamp).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <p className="no-event">选择回放步骤查看详情</p>
          )}
        </div>

        <div className="replay-timeline">
          <div className="timeline-events">
            {replay.replay.map((ev, idx) => (
              <button
                key={ev.id}
                className={`timeline-dot ${idx === relicDungeon.replayIndex ? 'active' : ''} ${idx < relicDungeon.replayIndex ? 'passed' : ''}`}
                onClick={() => stepRelicDungeonReplay('first')}
                title={`步骤 ${idx + 1}: ${ev.description}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="replay-controls">
          <button className="ctrl-btn" onClick={() => stepRelicDungeonReplay('first')}>
            ⏮️
          </button>
          <button className="ctrl-btn" onClick={() => stepRelicDungeonReplay('prev')}>
            ◀️
          </button>
          <button
            className={`ctrl-btn play ${relicDungeon.replayPlaying ? 'playing' : ''}`}
            onClick={toggleRelicDungeonReplayPlaying}
          >
            {relicDungeon.replayPlaying ? '⏸️' : '▶️'}
          </button>
          <button className="ctrl-btn" onClick={() => stepRelicDungeonReplay('next')}>
            ▶️
          </button>
          <button className="ctrl-btn" onClick={() => stepRelicDungeonReplay('last')}>
            ⏭️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relic-dungeon-panel">
      {currentView === 'entry' && renderEntryView()}
      {currentView === 'map' && renderMapView()}
      {currentView === 'room' && renderRoomView()}
      {currentView === 'buff_select' && renderBuffSelectView()}
      {currentView === 'boss' && renderBossView()}
      {currentView === 'settlement' && renderSettlementView()}
      {currentView === 'history' && renderHistoryView()}
      {currentView === 'replay' && renderReplayView()}
    </div>
  );
}
