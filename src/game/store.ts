import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Player,
  PlayerStats,
  Companion,
  MapArea,
  BattleLog,
  GameEvent,
  GameScreen,
  GameTab,
} from './types';
import {
  INITIAL_STATS,
  MAP_AREAS,
  COMPANIONS,
  RANDOM_EVENTS,
  REBIRTH_OPTIONS,
} from './data';

interface GameState {
  screen: GameScreen;
  activeTab: GameTab;
  player: Player;
  ownedCompanions: Companion[];
  mapAreas: MapArea[];
  currentAreaId: string;
  battleLogs: BattleLog[];
  currentEvent: GameEvent | null;
  lastOnlineTime: number;
  totalPlayTime: number;
  rebirthBonuses: Record<string, number>;
  isAutoBattle: boolean;
  currentMonster: {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    expReward: number;
    goldReward: number;
    color: string;
  } | null;

  setScreen: (screen: GameScreen) => void;
  setActiveTab: (tab: GameTab) => void;
  initializePlayer: (name: string, race: string, playerClass: string) => void;
  addExp: (amount: number) => void;
  addGold: (amount: number) => void;
  addSoulOrbs: (amount: number) => void;
  takeDamage: (amount: number) => void;
  healHp: (amount: number) => void;
  healMp: (amount: number) => void;
  upgradeStat: (stat: keyof PlayerStats, amount: number) => void;
  setCurrentArea: (areaId: string) => void;
  unlockMapArea: (areaId: string) => void;
  buyCompanion: (companionId: string) => boolean;
  addBattleLog: (message: string, type: BattleLog['type']) => void;
  triggerRandomEvent: () => void;
  handleEventChoice: (choiceId: string) => void;
  closeEvent: () => void;
  performRebirth: (bonusIds: string[]) => boolean;
  setAutoBattle: (value: boolean) => void;
  setCurrentMonster: (monster: GameState['currentMonster']) => void;
  calculateDamage: () => number;
  calculateDefense: () => number;
  calculateGoldBonus: () => number;
  calculateExpBonus: () => number;
  calculateOfflineRewards: () => { exp: number; gold: number };
  collectOfflineRewards: () => void;
  updateLastOnlineTime: () => void;
  getTotalAttack: () => number;
  getTotalDefense: () => number;
}

let logIdCounter = 0;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'rebirth',
      activeTab: 'map',
      player: {
        name: '',
        race: '',
        class: '',
        stats: { ...INITIAL_STATS },
        skillPoints: 0,
        rebirthCount: 0,
        totalRebirthBonus: 0,
      },
      ownedCompanions: [],
      mapAreas: MAP_AREAS.map((area) => ({ ...area })),
      currentAreaId: 'forest',
      battleLogs: [],
      currentEvent: null,
      lastOnlineTime: Date.now(),
      totalPlayTime: 0,
      rebirthBonuses: {},
      isAutoBattle: false,
      currentMonster: null,

      setScreen: (screen) => set({ screen }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      initializePlayer: (name, race, playerClass) => {
        const state = get();
        const rebirthBonus = state.player.totalRebirthBonus;
        
        const baseStats = { ...INITIAL_STATS };
        const attackBonus = state.rebirthBonuses['attack_boost'] || 0;
        const defenseBonus = state.rebirthBonuses['defense_boost'] || 0;
        const hpBonus = state.rebirthBonuses['hp_boost'] || 0;

        const newStats = {
          ...baseStats,
          attack: Math.floor(baseStats.attack * (1 + attackBonus + rebirthBonus * 0.01)),
          defense: Math.floor(baseStats.defense * (1 + defenseBonus + rebirthBonus * 0.01)),
          maxHp: Math.floor(baseStats.maxHp * (1 + hpBonus + rebirthBonus * 0.01)),
          hp: Math.floor(baseStats.maxHp * (1 + hpBonus + rebirthBonus * 0.01)),
        };

        set({
          screen: 'game',
          player: {
            ...state.player,
            name,
            race,
            class: playerClass,
            stats: newStats,
          },
          lastOnlineTime: Date.now(),
        });

        get().addBattleLog(`${name} 作为 ${race} ${playerClass} 降临到了异世界！`, 'system');
      },

      addExp: (amount) => {
        const state = get();
        const expBonus = get().calculateExpBonus();
        const actualExp = Math.floor(amount * expBonus);
        
        let { exp, expToNext, level } = state.player.stats;
        let skillPoints = state.player.skillPoints;
        exp += actualExp;

        while (exp >= expToNext) {
          exp -= expToNext;
          level += 1;
          skillPoints += 3;
          expToNext = Math.floor(expToNext * 1.15);
          get().addBattleLog(`🎉 升级了！当前等级：${level}`, 'levelup');
          
          const area = state.mapAreas.find((a) => a.id === state.currentAreaId);
          if (area) {
            state.mapAreas.forEach((a) => {
              if (!a.unlocked && a.minLevel <= level) {
                get().unlockMapArea(a.id);
              }
            });
          }
        }

        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              exp,
              expToNext,
              level,
            },
            skillPoints,
          },
        }));
      },

      addGold: (amount) => {
        const goldBonus = get().calculateGoldBonus();
        const actualGold = Math.floor(amount * goldBonus);
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold + actualGold,
            },
          },
        }));
      },

      addSoulOrbs: (amount) => {
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              soulOrbs: state.player.stats.soulOrbs + amount,
            },
          },
        }));
      },

      takeDamage: (amount) => {
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              hp: Math.max(0, state.player.stats.hp - amount),
            },
          },
        }));
      },

      healHp: (amount) => {
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              hp: Math.min(state.player.stats.maxHp, state.player.stats.hp + amount),
            },
          },
        }));
      },

      healMp: (amount) => {
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              mp: Math.min(state.player.stats.maxMp, state.player.stats.mp + amount),
            },
          },
        }));
      },

      upgradeStat: (stat, amount) => {
        const state = get();
        if (state.player.skillPoints < amount) return;

        set((state) => {
          const newStats = { ...state.player.stats };
          if (stat === 'attack') newStats.attack += 2 * amount;
          else if (stat === 'defense') newStats.defense += 2 * amount;
          else if (stat === 'maxHp') {
            newStats.maxHp += 10 * amount;
            newStats.hp += 10 * amount;
          } else if (stat === 'maxMp') {
            newStats.maxMp += 5 * amount;
            newStats.mp += 5 * amount;
          } else if (stat === 'speed') newStats.speed += 1 * amount;
          else if (stat === 'luck') newStats.luck += 1 * amount;

          return {
            player: {
              ...state.player,
              stats: newStats,
              skillPoints: state.player.skillPoints - amount,
            },
          };
        });
      },

      setCurrentArea: (areaId) => {
        const state = get();
        const area = state.mapAreas.find((a) => a.id === areaId);
        if (area && area.unlocked) {
          set({ currentAreaId: areaId, currentMonster: null });
          get().addBattleLog(`来到了 ${area.name}`, 'system');
        }
      },

      unlockMapArea: (areaId) => {
        set((state) => ({
          mapAreas: state.mapAreas.map((area) =>
            area.id === areaId ? { ...area, unlocked: true } : area
          ),
        }));
        const area = get().mapAreas.find((a) => a.id === areaId);
        if (area) {
          get().addBattleLog(`🗺️ 解锁了新地图：${area.name}！`, 'system');
        }
      },

      buyCompanion: (companionId) => {
        const state = get();
        const companion = COMPANIONS.find((c) => c.id === companionId);
        if (!companion) return false;
        if (state.player.stats.gold < companion.cost) return false;
        if (state.ownedCompanions.find((c) => c.id === companionId)) return false;

        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - companion.cost,
            },
          },
          ownedCompanions: [...state.ownedCompanions, { ...companion }],
        }));

        get().addBattleLog(`🤝 招募了新伙伴：${companion.name}！`, 'event');
        return true;
      },

      addBattleLog: (message, type) => {
        logIdCounter += 1;
        const newLog: BattleLog = {
          id: logIdCounter,
          message,
          type,
          timestamp: Date.now(),
        };
        set((state) => ({
          battleLogs: [newLog, ...state.battleLogs].slice(0, 50),
        }));
      },

      triggerRandomEvent: () => {
        const events = RANDOM_EVENTS;
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        set({ currentEvent: { ...randomEvent } });
        get().addBattleLog(`✨ 触发了随机事件：${randomEvent.title}`, 'event');
      },

      handleEventChoice: (choiceId) => {
        const state = get();
        if (!state.currentEvent) return;

        const choice = state.currentEvent.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        choice.effects.forEach((effect) => {
          switch (effect.type) {
            case 'gold':
              if (effect.value > 0) {
                get().addGold(effect.value);
              } else {
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      gold: Math.max(0, s.player.stats.gold + effect.value),
                    },
                  },
                }));
              }
              break;
            case 'exp':
              if (effect.value > 0) {
                get().addExp(effect.value);
              } else {
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      exp: Math.max(0, s.player.stats.exp + effect.value),
                    },
                  },
                }));
              }
              break;
            case 'hp':
              if (effect.value > 0) {
                get().healHp(effect.value);
              } else {
                get().takeDamage(Math.abs(effect.value));
              }
              break;
            case 'mp':
              get().healMp(effect.value);
              break;
            case 'attack':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    attack: s.player.stats.attack + effect.value,
                  },
                },
              }));
              break;
            case 'defense':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    defense: s.player.stats.defense + effect.value,
                  },
                },
              }));
              break;
            case 'soulOrbs':
              get().addSoulOrbs(effect.value);
              break;
          }
        });

        set({ currentEvent: null });
      },

      closeEvent: () => set({ currentEvent: null }),

      performRebirth: (bonusIds) => {
        const state = get();
        const totalCost = bonusIds.reduce((sum, id) => {
          const option = REBIRTH_OPTIONS.find((o) => o.id === id);
          return sum + (option?.cost || 0);
        }, 0);

        if (state.player.stats.soulOrbs < totalCost) return false;

        const newBonuses = { ...state.rebirthBonuses };
        bonusIds.forEach((id) => {
          const option = REBIRTH_OPTIONS.find((o) => o.id === id);
          if (option) {
            newBonuses[id] = (newBonuses[id] || 0) + option.bonus;
          }
        });

        set({
          screen: 'rebirth',
          player: {
            ...state.player,
            name: '',
            race: '',
            class: '',
            stats: { ...INITIAL_STATS, soulOrbs: state.player.stats.soulOrbs - totalCost },
            rebirthCount: state.player.rebirthCount + 1,
            totalRebirthBonus: state.player.totalRebirthBonus + bonusIds.length,
          },
          ownedCompanions: [],
          mapAreas: MAP_AREAS.map((area) => ({ ...area })),
          currentAreaId: 'forest',
          battleLogs: [],
          currentEvent: null,
          rebirthBonuses: newBonuses,
          currentMonster: null,
        });

        return true;
      },

      setAutoBattle: (value) => set({ isAutoBattle: value }),
      setCurrentMonster: (monster) => set({ currentMonster: monster }),

      calculateDamage: () => {
        const state = get();
        const baseAttack = state.player.stats.attack;
        const companionAttack = state.ownedCompanions.reduce(
          (sum, c) => sum + c.attack * c.level,
          0
        );
        return baseAttack + companionAttack;
      },

      calculateDefense: () => {
        const state = get();
        const baseDefense = state.player.stats.defense;
        const companionDefense = state.ownedCompanions.reduce(
          (sum, c) => sum + c.defense * c.level,
          0
        );
        return baseDefense + companionDefense;
      },

      calculateGoldBonus: () => {
        const state = get();
        return 1 + (state.rebirthBonuses['gold_boost'] || 0);
      },

      calculateExpBonus: () => {
        const state = get();
        return 1 + (state.rebirthBonuses['exp_boost'] || 0);
      },

      getTotalAttack: () => {
        const state = get();
        const playerAttack = state.player.stats.attack;
        const companionAttack = state.ownedCompanions.reduce(
          (sum, c) => sum + c.attack * c.level,
          0
        );
        return playerAttack + companionAttack;
      },

      getTotalDefense: () => {
        const state = get();
        const playerDefense = state.player.stats.defense;
        const companionDefense = state.ownedCompanions.reduce(
          (sum, c) => sum + c.defense * c.level,
          0
        );
        return playerDefense + companionDefense;
      },

      calculateOfflineRewards: () => {
        const state = get();
        const now = Date.now();
        const offlineTime = now - state.lastOnlineTime;
        const offlineSeconds = Math.min(offlineTime / 1000, 8 * 60 * 60);

        const currentArea = state.mapAreas.find((a) => a.id === state.currentAreaId);
        if (!currentArea || offlineSeconds < 60) {
          return { exp: 0, gold: 0 };
        }

        const killsPerSecond = 0.3;
        const totalKills = Math.floor(offlineSeconds * killsPerSecond);
        const avgMonster = currentArea.monsters[0];

        const expReward = Math.floor(
          totalKills * avgMonster.expReward * 0.5 * state.calculateExpBonus()
        );
        const goldReward = Math.floor(
          totalKills * avgMonster.goldReward * 0.5 * state.calculateGoldBonus()
        );

        return { exp: expReward, gold: goldReward };
      },

      collectOfflineRewards: () => {
        const rewards = get().calculateOfflineRewards();
        if (rewards.exp > 0 || rewards.gold > 0) {
          get().addExp(rewards.exp);
          get().addGold(rewards.gold);
          get().addBattleLog(
            `📦 离线收益：+${rewards.exp} 经验, +${rewards.gold} 金币`,
            'system'
          );
        }
        get().updateLastOnlineTime();
      },

      updateLastOnlineTime: () => {
        set({ lastOnlineTime: Date.now() });
      },
    }),
    {
      name: 'isekai-idle-game',
      version: 1,
    }
  )
);
