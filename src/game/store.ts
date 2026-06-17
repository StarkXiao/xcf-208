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
  AreaReputation,
} from './types';
import {
  INITIAL_STATS,
  MAP_AREAS,
  COMPANIONS,
  RANDOM_EVENTS,
  REBIRTH_OPTIONS,
  REPUTATION_LEVELS,
  SHOP_ITEMS,
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
  areaReputations: AreaReputation[];
  purchasedShopItems: string[];
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
  addAreaReputation: (areaId: string, points: number) => void;
  getAreaReputation: (areaId: string) => AreaReputation;
  getAreaReputationLevel: (areaId: string) => number;
  getAreaDropBonus: (areaId: string) => number;
  getAreaShopDiscount: (areaId: string) => number;
  getAreaRecruitDiscount: (areaId: string) => number;
  getAreaEventBonus: (areaId: string) => number;
  buyShopItem: (itemId: string) => boolean;
  getDiscountedCost: (baseCost: number, areaId: string) => number;
  getDiscountedCompanionCost: (companion: Companion) => number;
  canRecruitCompanion: (companion: Companion) => boolean;
}

let logIdCounter = 0;

function calculateReputationLevel(points: number): number {
  let level = 0;
  for (const rl of REPUTATION_LEVELS) {
    if (points >= rl.minPoints) {
      level = rl.level;
    }
  }
  return level;
}

function getReputationLevelData(level: number) {
  return REPUTATION_LEVELS.find((rl) => rl.level === level) || REPUTATION_LEVELS[0];
}

function initAreaReputations(): AreaReputation[] {
  return MAP_AREAS.map((area) => ({
    areaId: area.id,
    points: 0,
    level: 0,
  }));
}

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
      areaReputations: initAreaReputations(),
      purchasedShopItems: [],
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
        if (state.ownedCompanions.find((c) => c.id === companionId)) return false;
        if (!get().canRecruitCompanion(companion)) return false;

        const discountedCost = get().getDiscountedCompanionCost(companion);
        if (state.player.stats.gold < discountedCost) return false;

        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - discountedCost,
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
        const state = get();
        const currentAreaId = state.currentAreaId;
        const repLevel = get().getAreaReputationLevel(currentAreaId);

        const areaSpecificEvents = RANDOM_EVENTS.filter(
          (e) => e.areaId === currentAreaId && (e.minReputationLevel || 0) <= repLevel
        );
        const genericEvents = RANDOM_EVENTS.filter((e) => !e.areaId);

        const eventBonus = get().getAreaEventBonus(currentAreaId);
        const areaWeight = 0.3 + eventBonus;

        let availableEvents: GameEvent[];
        if (areaSpecificEvents.length > 0 && Math.random() < areaWeight) {
          availableEvents = areaSpecificEvents;
        } else {
          availableEvents = genericEvents;
        }

        if (availableEvents.length === 0) {
          availableEvents = RANDOM_EVENTS.filter((e) => !e.areaId);
        }

        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        set({ currentEvent: { ...randomEvent } });
        get().addBattleLog(`✨ 触发了随机事件：${randomEvent.title}`, 'event');
      },

      handleEventChoice: (choiceId) => {
        const state = get();
        if (!state.currentEvent) return;

        const choice = state.currentEvent.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        const currentAreaId = state.currentAreaId;

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
            case 'reputation':
              if (currentAreaId) {
                get().addAreaReputation(currentAreaId, effect.value);
              }
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

        const preserveRatio = newBonuses['reputation_preserve'] || 0;
        const newReputations = state.areaReputations.map((rep) => {
          const preservedPoints = Math.floor(rep.points * preserveRatio);
          const newLevel = calculateReputationLevel(preservedPoints);
          return {
            areaId: rep.areaId,
            points: preservedPoints,
            level: newLevel,
          };
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
          areaReputations: newReputations,
          purchasedShopItems: [],
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

      addAreaReputation: (areaId, points) => {
        set((state) => {
          const newReps = state.areaReputations.map((rep) => {
            if (rep.areaId !== areaId) return rep;
            const newPoints = Math.max(0, rep.points + points);
            const newLevel = calculateReputationLevel(newPoints);
            return { ...rep, points: newPoints, level: newLevel };
          });
          return { areaReputations: newReps };
        });

        if (points > 0) {
          const rep = get().getAreaReputation(areaId);
          const area = get().mapAreas.find((a) => a.id === areaId);
          if (area) {
            get().addBattleLog(`🏛️ ${area.name}声望 +${points}（${getReputationLevelData(rep.level).name}）`, 'reputation');
          }
        }
      },

      getAreaReputation: (areaId) => {
        const state = get();
        return state.areaReputations.find((r) => r.areaId === areaId) || { areaId, points: 0, level: 0 };
      },

      getAreaReputationLevel: (areaId) => {
        return get().getAreaReputation(areaId).level;
      },

      getAreaDropBonus: (areaId) => {
        const repLevel = get().getAreaReputationLevel(areaId);
        return getReputationLevelData(repLevel).dropBonus;
      },

      getAreaShopDiscount: (areaId) => {
        const repLevel = get().getAreaReputationLevel(areaId);
        return getReputationLevelData(repLevel).shopDiscount;
      },

      getAreaRecruitDiscount: (areaId) => {
        const repLevel = get().getAreaReputationLevel(areaId);
        return getReputationLevelData(repLevel).recruitDiscount;
      },

      getAreaEventBonus: (areaId) => {
        const repLevel = get().getAreaReputationLevel(areaId);
        return getReputationLevelData(repLevel).eventBonus;
      },

      getDiscountedCost: (baseCost, areaId) => {
        const discount = get().getAreaShopDiscount(areaId);
        return Math.max(1, Math.floor(baseCost * (1 - discount)));
      },

      getDiscountedCompanionCost: (companion) => {
        if (!companion.areaId) return companion.cost;
        const discount = get().getAreaRecruitDiscount(companion.areaId);
        return Math.max(1, Math.floor(companion.cost * (1 - discount)));
      },

      canRecruitCompanion: (companion) => {
        if (companion.areaId && companion.minReputationLevel) {
          const repLevel = get().getAreaReputationLevel(companion.areaId);
          if (repLevel < companion.minReputationLevel) return false;
        }
        return true;
      },

      buyShopItem: (itemId) => {
        const state = get();
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const repLevel = get().getAreaReputationLevel(item.areaId);
        if (repLevel < item.minReputationLevel) return false;

        const discountedCost = get().getDiscountedCost(item.baseCost, item.areaId);

        if (item.currency === 'gold' && state.player.stats.gold < discountedCost) return false;
        if (item.currency === 'soulOrbs' && state.player.stats.soulOrbs < discountedCost) return false;

        set((state) => {
          const newStats = { ...state.player.stats };
          if (item.currency === 'gold') {
            newStats.gold -= discountedCost;
          } else {
            newStats.soulOrbs -= discountedCost;
          }

          switch (item.effect.type) {
            case 'hp':
              newStats.hp = Math.min(newStats.maxHp, newStats.hp + item.effect.value);
              break;
            case 'mp':
              newStats.mp = Math.min(newStats.maxMp, newStats.mp + item.effect.value);
              break;
            case 'attack':
              newStats.attack += item.effect.value;
              break;
            case 'defense':
              newStats.defense += item.effect.value;
              break;
            case 'speed':
              newStats.speed += item.effect.value;
              break;
            case 'luck':
              newStats.luck += item.effect.value;
              break;
            case 'exp':
              break;
            case 'gold':
              newStats.gold += item.effect.value;
              break;
            case 'soulOrbs':
              newStats.soulOrbs += item.effect.value;
              break;
          }

          return {
            player: { ...state.player, stats: newStats },
            purchasedShopItems: [...state.purchasedShopItems, itemId],
          };
        });

        if (item.effect.type === 'exp') {
          get().addExp(item.effect.value);
        } else if (item.effect.type === 'gold') {
          // already handled in set
        }

        get().addBattleLog(`🛒 购买了 ${item.name}！`, 'event');
        get().addAreaReputation(item.areaId, 5);
        return true;
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
        const dropBonus = get().getAreaDropBonus(state.currentAreaId);

        const expReward = Math.floor(
          totalKills * avgMonster.expReward * 0.5 * state.calculateExpBonus() * (1 + dropBonus)
        );
        const goldReward = Math.floor(
          totalKills * avgMonster.goldReward * 0.5 * state.calculateGoldBonus() * (1 + dropBonus)
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
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          state.areaReputations = initAreaReputations();
          state.purchasedShopItems = [];
        }
        return state as unknown as GameState;
      },
    }
  )
);
