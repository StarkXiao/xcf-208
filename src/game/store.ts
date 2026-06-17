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
  ActiveExpedition,
  ExpeditionLoot,
  ExpeditionPhase,
  Formation,
  FormationSlot,
  MapAreaModifier,
  CompanionAffinityRecord,
  EventWeightMod,
} from './types';
import { getAffinityLevel } from './types';
import {
  INITIAL_STATS,
  MAP_AREAS,
  COMPANIONS,
  RANDOM_EVENTS,
  REBIRTH_OPTIONS,
  REPUTATION_LEVELS,
  SHOP_ITEMS,
  EXPEDITION_MISSIONS,
  EXPEDITION_EVENTS,
  BONDS,
  STAR_UP_CONFIGS,
  FORMATION_SLOT_CONFIG,
} from './data';

interface GameState {
  screen: GameScreen;
  activeTab: GameTab;
  player: Player;
  ownedCompanions: Companion[];
  formation: Formation;
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

  addCompanionStarExp: (companionId: string, exp: number) => void;
  getCompanionEffectiveAttack: (companion: Companion) => number;
  getCompanionEffectiveDefense: (companion: Companion) => number;
  getActiveBonds: () => string[];
  getBondBonus: () => { attack: number; defense: number; hp: number; speed: number; luck: number };
  setFormationSlot: (slotIndex: number, companionId: string | null) => void;
  getFormationCompanions: () => Companion[];
  getUnlockedFormationSlots: () => number;

  activeExpedition: ActiveExpedition | null;
  consequenceTags: string[];
  companionAffinities: CompanionAffinityRecord[];
  mapAreaModifiers: MapAreaModifier[];
  eventWeightModifiers: EventWeightMod[];

  addConsequenceTag: (tag: string) => void;
  hasConsequenceTag: (tag: string) => boolean;
  getCompanionAffinity: (companionId: string) => CompanionAffinityRecord;
  addCompanionAffinity: (companionId: string, value: number) => void;
  addMapAreaModifier: (modifier: MapAreaModifier) => void;
  getMapAreaModifiers: (areaId: string) => MapAreaModifier[];
  getMapAreaModifierBonus: (areaId: string, stat: keyof PlayerStats) => number;
  getEventWeight: (eventId: string) => number;
  addEventWeightModifier: (mod: EventWeightMod) => void;

  startExpedition: (missionId: string, companionIds: string[]) => void;
  advanceExpeditionStage: () => void;
  resolveExpeditionEvent: (eventId: string) => void;
  skipExpeditionEvent: () => void;
  completeExpedition: () => ExpeditionLoot;
  cancelExpedition: () => void;
  setExpeditionPhase: (phase: ExpeditionPhase) => void;
  getExpeditionPower: (companionIds: string[]) => number;
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

function initFormation(playerLevel: number): Formation {
  const slots: FormationSlot[] = FORMATION_SLOT_CONFIG.map((cfg) => ({
    index: cfg.index,
    companionId: null,
    unlocked: playerLevel >= cfg.unlockLevel,
    unlockLevel: cfg.unlockLevel,
  }));
  return { slots, activeBondIds: [] };
}

function getStarUpConfig(rarity: Companion['rarity']) {
  return STAR_UP_CONFIGS.find((c) => c.rarity === rarity) || STAR_UP_CONFIGS[0];
}

function computeEffectiveAttack(companion: Companion): number {
  const config = getStarUpConfig(companion.rarity);
  const multiplier = config.attackMultiplier[companion.stars] || config.attackMultiplier[config.attackMultiplier.length - 1];
  return Math.floor(companion.attack * multiplier * companion.level);
}

function computeEffectiveDefense(companion: Companion): number {
  const config = getStarUpConfig(companion.rarity);
  const multiplier = config.defenseMultiplier[companion.stars] || config.defenseMultiplier[config.defenseMultiplier.length - 1];
  return Math.floor(companion.defense * multiplier * companion.level);
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
      formation: initFormation(1),
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
      activeExpedition: null,
      consequenceTags: [],
      companionAffinities: [],
      mapAreaModifiers: [],
      eventWeightModifiers: [],

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

          state.mapAreas.forEach((a) => {
            if (!a.unlocked && a.minLevel <= level) {
              get().unlockMapArea(a.id);
            }
          });

          const newFormation = { ...state.formation };
          let formationChanged = false;
          newFormation.slots = newFormation.slots.map((slot) => {
            const cfg = FORMATION_SLOT_CONFIG.find((c) => c.index === slot.index);
            if (cfg && !slot.unlocked && level >= cfg.unlockLevel) {
              formationChanged = true;
              return { ...slot, unlocked: true };
            }
            return slot;
          });
          if (formationChanged) {
            set({ formation: newFormation });
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

        const config = getStarUpConfig(companion.rarity);
        const newCompanion: Companion = {
          ...companion,
          stars: 1,
          starExp: 0,
          starExpToNext: config.starExpToNext[0],
        };

        set((state) => {
          const newFormation = { ...state.formation };
          const emptySlot = newFormation.slots.find((s) => s.unlocked && s.companionId === null);
          if (emptySlot) {
            newFormation.slots = newFormation.slots.map((s) =>
              s.index === emptySlot.index ? { ...s, companionId: companionId } : s
            );
          }

          return {
            player: {
              ...state.player,
              stats: {
                ...state.player.stats,
                gold: state.player.stats.gold - discountedCost,
              },
            },
            ownedCompanions: [...state.ownedCompanions, newCompanion],
            formation: newFormation,
          };
        });

        get().addBattleLog(`🤝 招募了新伙伴：${companion.name}！`, 'event');
        return true;
      },

      addCompanionStarExp: (companionId, exp) => {
        set((state) => {
          const newCompanions = state.ownedCompanions.map((c) => {
            if (c.id !== companionId) return c;
            const config = getStarUpConfig(c.rarity);
            let newStars = c.stars;
            let newStarExp = c.starExp + exp;
            let newStarExpToNext = c.starExpToNext;

            while (newStars < config.maxStars && newStarExp >= newStarExpToNext) {
              newStarExp -= newStarExpToNext;
              newStars += 1;
              if (newStars < config.maxStars) {
                newStarExpToNext = config.starExpToNext[newStars - 1];
              }
            }

            if (newStars > c.stars) {
              get().addBattleLog(`⭐ ${c.name} 升至 ${newStars} 星！`, 'levelup');
            }

            return { ...c, stars: newStars, starExp: newStarExp, starExpToNext: newStarExpToNext };
          });
          return { ownedCompanions: newCompanions };
        });
      },

      getCompanionEffectiveAttack: (companion) => {
        return computeEffectiveAttack(companion);
      },

      getCompanionEffectiveDefense: (companion) => {
        return computeEffectiveDefense(companion);
      },

      getActiveBonds: () => {
        const state = get();
        const formationIds = state.formation.slots
          .filter((s) => s.unlocked && s.companionId !== null)
          .map((s) => s.companionId!);

        return BONDS
          .filter((bond) => bond.memberIds.every((id) => formationIds.includes(id)))
          .map((b) => b.id);
      },

      getBondBonus: () => {
        const state = get();
        const activeBondIds = state.formation.activeBondIds;
        const bonus = { attack: 0, defense: 0, hp: 0, speed: 0, luck: 0 };

        activeBondIds.forEach((bondId) => {
          const bond = BONDS.find((b) => b.id === bondId);
          if (!bond) return;

          const memberIds = bond.memberIds;
          const formationIds = state.formation.slots
            .filter((s) => s.unlocked && s.companionId !== null)
            .map((s) => s.companionId!);

          if (!memberIds.every((id) => formationIds.includes(id))) return;

          const members = state.ownedCompanions.filter((c) => memberIds.includes(c.id));
          const minStars = members.length > 0 ? Math.min(...members.map((m) => m.stars)) : 0;

          bond.bonusPerStar.forEach((b) => {
            bonus[b.type] += b.value * minStars;
          });
        });

        return bonus;
      },

      setFormationSlot: (slotIndex, companionId) => {
        set((state) => {
          const newSlots = state.formation.slots.map((s) => {
            if (s.index !== slotIndex) return s;
            return { ...s, companionId };
          });

          if (companionId !== null) {
            newSlots.forEach((s, i) => {
              if (s.index !== slotIndex && s.companionId === companionId) {
                newSlots[i] = { ...s, companionId: null };
              }
            });
          }

          const formationIds = newSlots
            .filter((s) => s.unlocked && s.companionId !== null)
            .map((s) => s.companionId!);

          const activeBondIds = BONDS
            .filter((bond) => bond.memberIds.every((id) => formationIds.includes(id)))
            .map((b) => b.id);

          return { formation: { slots: newSlots, activeBondIds } };
        });
      },

      getFormationCompanions: () => {
        const state = get();
        const ids = state.formation.slots
          .filter((s) => s.unlocked && s.companionId !== null)
          .map((s) => s.companionId!);
        return ids
          .map((id) => state.ownedCompanions.find((c) => c.id === id))
          .filter((c): c is Companion => c !== undefined);
      },

      getUnlockedFormationSlots: () => {
        const state = get();
        return state.formation.slots.filter((s) => s.unlocked).length;
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

        const filterByTags = (events: GameEvent[]) => {
          return events.filter((e) => {
            if (e.requiredTags && !e.requiredTags.every((t) => state.consequenceTags.includes(t))) return false;
            if (e.blockedByTags && e.blockedByTags.some((t) => state.consequenceTags.includes(t))) return false;
            return true;
          });
        };

        const areaSpecificEvents = filterByTags(
          RANDOM_EVENTS.filter(
            (e) => e.areaId === currentAreaId && (e.minReputationLevel || 0) <= repLevel
          )
        );
        const genericEvents = filterByTags(RANDOM_EVENTS.filter((e) => !e.areaId));

        const eventBonus = get().getAreaEventBonus(currentAreaId);
        const areaWeight = 0.3 + eventBonus;

        let availableEvents: GameEvent[];
        if (areaSpecificEvents.length > 0 && Math.random() < areaWeight) {
          availableEvents = areaSpecificEvents;
        } else {
          availableEvents = genericEvents;
        }

        if (availableEvents.length === 0) {
          availableEvents = filterByTags(RANDOM_EVENTS.filter((e) => !e.areaId));
        }

        if (availableEvents.length === 0) return;

        const weighted = availableEvents.map((e) => {
          const base = e.baseWeight ?? 1.0;
          const mod = get().getEventWeight(e.id);
          return { event: e, weight: Math.max(0.05, base + mod) };
        });

        const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
        let roll = Math.random() * totalWeight;
        let selectedEvent = weighted[0].event;
        for (const w of weighted) {
          roll -= w.weight;
          if (roll <= 0) {
            selectedEvent = w.event;
            break;
          }
        }

        set({ currentEvent: { ...selectedEvent } });
        get().addBattleLog(`✨ 触发了随机事件：${selectedEvent.title}`, 'event');
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
            case 'speed':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    speed: s.player.stats.speed + effect.value,
                  },
                },
              }));
              break;
            case 'luck':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    luck: s.player.stats.luck + effect.value,
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

        if (choice.consequences) {
          const csq = choice.consequences;

          if (csq.tags && csq.tags.length > 0) {
            csq.tags.forEach((tag) => {
              get().addConsequenceTag(tag);
            });
          }

          if (csq.companionAffinity && csq.companionAffinity.length > 0) {
            csq.companionAffinity.forEach((ca) => {
              get().addCompanionAffinity(ca.companionId, ca.value);
              const companion = COMPANIONS.find((c) => c.id === ca.companionId);
              const owned = state.ownedCompanions.find((c) => c.id === ca.companionId);
              if (companion && owned) {
                if (ca.value > 0) {
                  get().addBattleLog(`💛 ${companion.name}好感 +${ca.value}`, 'event');
                } else {
                  get().addBattleLog(`💔 ${companion.name}好感 ${ca.value}`, 'event');
                }
              }
            });
          }

          if (csq.mapModifiers && csq.mapModifiers.length > 0) {
            csq.mapModifiers.forEach((mod) => {
              get().addMapAreaModifier(mod);
              const area = state.mapAreas.find((a) => a.id === mod.areaId);
              if (area) {
                const icon = mod.type === 'hazard' || mod.type === 'cursed' ? '⚠️' : '✨';
                get().addBattleLog(`${icon} ${area.name} - ${mod.name}: ${mod.description}`, 'system');
              }
            });
          }

          if (csq.eventWeights && csq.eventWeights.length > 0) {
            csq.eventWeights.forEach((ew) => {
              get().addEventWeightModifier(ew);
            });
          }
        }

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
          formation: initFormation(1),
          mapAreas: MAP_AREAS.map((area) => ({ ...area })),
          currentAreaId: 'forest',
          battleLogs: [],
          currentEvent: null,
          rebirthBonuses: newBonuses,
          currentMonster: null,
          areaReputations: newReputations,
          purchasedShopItems: [],
          consequenceTags: [],
          companionAffinities: [],
          mapAreaModifiers: [],
          eventWeightModifiers: [],
        });

        return true;
      },

      setAutoBattle: (value) => set({ isAutoBattle: value }),
      setCurrentMonster: (monster) => set({ currentMonster: monster }),

      addConsequenceTag: (tag) => {
        set((state) => {
          if (state.consequenceTags.includes(tag)) return state;
          return { consequenceTags: [...state.consequenceTags, tag] };
        });
      },

      hasConsequenceTag: (tag) => {
        return get().consequenceTags.includes(tag);
      },

      getCompanionAffinity: (companionId) => {
        const record = get().companionAffinities.find((a) => a.companionId === companionId);
        if (record) return record;
        return { companionId, value: 0, level: getAffinityLevel(0) };
      },

      addCompanionAffinity: (companionId, value) => {
        set((state) => {
          const existing = state.companionAffinities.find((a) => a.companionId === companionId);
          if (existing) {
            const newValue = existing.value + value;
            return {
              companionAffinities: state.companionAffinities.map((a) =>
                a.companionId === companionId
                  ? { ...a, value: newValue, level: getAffinityLevel(newValue) }
                  : a
              ),
            };
          }
          return {
            companionAffinities: [
              ...state.companionAffinities,
              { companionId, value, level: getAffinityLevel(value) },
            ],
          };
        });
      },

      addMapAreaModifier: (modifier) => {
        set((state) => ({
          mapAreaModifiers: [...state.mapAreaModifiers, modifier],
        }));
      },

      getMapAreaModifiers: (areaId) => {
        return get().mapAreaModifiers.filter((m) => m.areaId === areaId);
      },

      getMapAreaModifierBonus: (areaId, stat) => {
        return get().mapAreaModifiers
          .filter((m) => m.areaId === areaId && m.effect && m.effect.stat === stat)
          .reduce((sum, m) => sum + (m.effect?.value || 0), 0);
      },

      getEventWeight: (eventId) => {
        return get().eventWeightModifiers
          .filter((m) => m.eventId === eventId)
          .reduce((sum, m) => sum + m.delta, 0);
      },

      addEventWeightModifier: (mod) => {
        set((state) => ({
          eventWeightModifiers: [...state.eventWeightModifiers, mod],
        }));
      },

      calculateDamage: () => {
        const state = get();
        const baseAttack = state.player.stats.attack;
        const formationCompanions = get().getFormationCompanions();
        const companionAttack = formationCompanions.reduce(
          (sum, c) => sum + computeEffectiveAttack(c),
          0
        );
        const bondBonus = get().getBondBonus();
        return baseAttack + companionAttack + bondBonus.attack;
      },

      calculateDefense: () => {
        const state = get();
        const baseDefense = state.player.stats.defense;
        const formationCompanions = get().getFormationCompanions();
        const companionDefense = formationCompanions.reduce(
          (sum, c) => sum + computeEffectiveDefense(c),
          0
        );
        const bondBonus = get().getBondBonus();
        return baseDefense + companionDefense + bondBonus.defense;
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
        const formationCompanions = get().getFormationCompanions();
        const companionAttack = formationCompanions.reduce(
          (sum, c) => sum + computeEffectiveAttack(c),
          0
        );
        const bondBonus = get().getBondBonus();
        return playerAttack + companionAttack + bondBonus.attack;
      },

      getTotalDefense: () => {
        const state = get();
        const playerDefense = state.player.stats.defense;
        const formationCompanions = get().getFormationCompanions();
        const companionDefense = formationCompanions.reduce(
          (sum, c) => sum + computeEffectiveDefense(c),
          0
        );
        const bondBonus = get().getBondBonus();
        return playerDefense + companionDefense + bondBonus.defense;
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

        const formationCompanions = get().getFormationCompanions();
        const companionPowerBonus = 1 + formationCompanions.reduce(
          (sum, c) => sum + (computeEffectiveAttack(c) + computeEffectiveDefense(c)) * 0.001,
          0
        );
        const bondBonus = get().getBondBonus();
        const bondPowerBonus = 1 + (bondBonus.attack + bondBonus.defense) * 0.002;

        const killsPerSecond = 0.3 * companionPowerBonus * bondPowerBonus;
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

          const formationCompanions = get().getFormationCompanions();
          formationCompanions.forEach((c) => {
            const starExp = Math.floor(rewards.exp * 0.1);
            if (starExp > 0) {
              get().addCompanionStarExp(c.id, starExp);
            }
          });
        }
        get().updateLastOnlineTime();
      },

      updateLastOnlineTime: () => {
        set({ lastOnlineTime: Date.now() });
      },

      getExpeditionPower: (companionIds) => {
        const state = get();
        const playerPower = state.player.stats.attack + state.player.stats.defense;
        const companionPower = state.ownedCompanions
          .filter((c) => companionIds.includes(c.id))
          .reduce((sum, c) => sum + computeEffectiveAttack(c) + computeEffectiveDefense(c), 0);
        const bondBonus = get().getBondBonus();
        return playerPower + companionPower + bondBonus.attack + bondBonus.defense;
      },

      startExpedition: (missionId, companionIds) => {
        const mission = EXPEDITION_MISSIONS.find((m) => m.id === missionId);
        if (!mission) return;
        const state = get();
        if (state.player.stats.level < mission.minLevel) return;
        const validIds = companionIds.filter((id) =>
          state.ownedCompanions.some((c) => c.id === id)
        );

        const expedition: ActiveExpedition = {
          missionId,
          selectedCompanionIds: validIds,
          startTime: Date.now(),
          currentStage: 0,
          totalStages: mission.stages,
          phase: 'progress',
          currentEvent: null,
          accumulatedLoot: { gold: 0, exp: 0, soulOrbs: 0, reputation: 0 },
          casualties: [],
          eventLog: ['🏔️ 远征队出发了！'],
          completed: false,
        };
        set({ activeExpedition: expedition });
        get().addBattleLog(`🏔️ 开始远征：${mission.name}`, 'system');
      },

      advanceExpeditionStage: () => {
        const state = get();
        if (!state.activeExpedition || state.activeExpedition.completed) return;
        const expedition = { ...state.activeExpedition };
        const mission = EXPEDITION_MISSIONS.find((m) => m.id === expedition.missionId);
        if (!mission) return;

        expedition.currentStage += 1;
        expedition.eventLog = [...expedition.eventLog, `📍 到达第 ${expedition.currentStage}/${expedition.totalStages} 阶段`];

        if (expedition.currentStage >= expedition.totalStages) {
          expedition.phase = 'settlement';
          expedition.completed = true;
          expedition.eventLog = [...expedition.eventLog, '🏁 远征完成！正在结算...'];
          set({ activeExpedition: expedition });
          return;
        }

        const eventChance = 0.6 + mission.stages * 0.05;
        if (Math.random() < eventChance) {
          const possibleEvents = EXPEDITION_EVENTS.filter((e) => {
            if (mission.difficulty === 'easy') return e.difficulty <= 1;
            if (mission.difficulty === 'normal') return e.difficulty <= 2;
            if (mission.difficulty === 'hard') return e.difficulty <= 2.5;
            return true;
          });
          if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            expedition.currentEvent = { ...event };
            expedition.phase = 'event';
            expedition.eventLog = [...expedition.eventLog, `${event.icon} 触发事件：${event.name}`];
          }
        }

        const baseExp = Math.floor(mission.baseExp / mission.stages);
        const baseGold = Math.floor(mission.baseGold / mission.stages);
        expedition.accumulatedLoot = {
          ...expedition.accumulatedLoot,
          gold: expedition.accumulatedLoot.gold + baseGold,
          exp: expedition.accumulatedLoot.exp + baseExp,
          reputation: expedition.accumulatedLoot.reputation + Math.floor(mission.baseExp / 20),
        };

        set({ activeExpedition: expedition });
      },

      resolveExpeditionEvent: (eventId) => {
        const state = get();
        if (!state.activeExpedition || !state.activeExpedition.currentEvent) return;
        const expedition = { ...state.activeExpedition };
        const event = expedition.currentEvent;
        if (!event || event.id !== eventId) return;

        const power = get().getExpeditionPower(expedition.selectedCompanionIds);
        const mission = EXPEDITION_MISSIONS.find((m) => m.id === expedition.missionId);
        const difficultyMultiplier = mission ? { easy: 0.6, normal: 1, hard: 1.5, nightmare: 2.2 }[mission.difficulty] : 1;
        const successThreshold = event.difficulty * 20 * difficultyMultiplier;
        const success = power >= successThreshold || Math.random() < 0.3 + (power / (successThreshold + power)) * 0.5;

        if (success) {
          event.rewards.forEach((reward) => {
            const value = Math.floor(reward.min + Math.random() * (reward.max - reward.min));
            if (value === 0) return;
            switch (reward.type) {
              case 'gold':
                expedition.accumulatedLoot.gold += value;
                break;
              case 'exp':
                expedition.accumulatedLoot.exp += value;
                break;
              case 'soulOrbs':
                expedition.accumulatedLoot.soulOrbs += value;
                break;
              case 'hp':
                if (value < 0) {
                  const companionIds = expedition.selectedCompanionIds;
                  if (companionIds.length > 0 && Math.random() < 0.4) {
                    const victimId = companionIds[Math.floor(Math.random() * companionIds.length)];
                    const companion = state.ownedCompanions.find((c) => c.id === victimId);
                    if (companion) {
                      const existing = expedition.casualties.find((c) => c.companionId === victimId);
                      const hpLost = Math.abs(value);
                      if (existing) {
                        existing.hpLost += hpLost;
                        existing.status = existing.hpLost > 50 ? 'critical' : 'injured';
                      } else {
                        expedition.casualties.push({
                          companionId: victimId,
                          companionName: companion.name,
                          status: hpLost > 50 ? 'critical' : 'injured',
                          hpLost,
                        });
                      }
                      expedition.eventLog = [...expedition.eventLog, `💔 ${companion.name} 受到了 ${hpLost} 点伤害`];
                    }
                  } else {
                    get().takeDamage(Math.abs(value));
                    expedition.eventLog = [...expedition.eventLog, `💔 你受到了 ${Math.abs(value)} 点伤害`];
                  }
                } else {
                  get().healHp(value);
                  expedition.eventLog = [...expedition.eventLog, `💚 恢复了 ${value} 点生命`];
                }
                break;
            }
          });
          expedition.eventLog = [...expedition.eventLog, `✅ 事件成功解决！`];
        } else {
          const penaltyGold = Math.floor(event.difficulty * 15 * difficultyMultiplier);
          expedition.accumulatedLoot.gold = Math.max(0, expedition.accumulatedLoot.gold - penaltyGold);

          const companionIds = expedition.selectedCompanionIds;
          if (companionIds.length > 0 && Math.random() < 0.5 * difficultyMultiplier) {
            const victimId = companionIds[Math.floor(Math.random() * companionIds.length)];
            const companion = state.ownedCompanions.find((c) => c.id === victimId);
            if (companion) {
              const hpLost = Math.floor(event.difficulty * 20 * difficultyMultiplier);
              const existing = expedition.casualties.find((c) => c.companionId === victimId);
              if (existing) {
                existing.hpLost += hpLost;
                existing.status = existing.hpLost > 80 ? 'critical' : 'injured';
              } else {
                expedition.casualties.push({
                  companionId: victimId,
                  companionName: companion.name,
                  status: hpLost > 80 ? 'critical' : 'injured',
                  hpLost,
                });
              }
              expedition.eventLog = [...expedition.eventLog, `💔 ${companion.name} 受到了 ${hpLost} 点伤害`];
            }
          }
          get().takeDamage(Math.floor(event.difficulty * 10 * difficultyMultiplier));
          expedition.eventLog = [...expedition.eventLog, `❌ 事件处理失败，损失 ${penaltyGold} 金币`];
        }

        expedition.currentEvent = null;
        expedition.phase = 'progress';
        set({ activeExpedition: expedition });
      },

      skipExpeditionEvent: () => {
        const state = get();
        if (!state.activeExpedition || !state.activeExpedition.currentEvent) return;
        const expedition = { ...state.activeExpedition };
        expedition.eventLog = [...expedition.eventLog, `⏭️ 选择了绕过事件`];
        expedition.currentEvent = null;
        expedition.phase = 'progress';
        set({ activeExpedition: expedition });
      },

      completeExpedition: () => {
        const state = get();
        if (!state.activeExpedition) return { gold: 0, exp: 0, soulOrbs: 0, reputation: 0 };
        const expedition = state.activeExpedition;
        const mission = EXPEDITION_MISSIONS.find((m) => m.id === expedition.missionId);
        const loot = { ...expedition.accumulatedLoot };

        if (mission && Math.random() < mission.soulOrbChance) {
          loot.soulOrbs += 1;
        }

        const expBonus = get().calculateExpBonus();
        const goldBonus = get().calculateGoldBonus();
        loot.exp = Math.floor(loot.exp * expBonus);
        loot.gold = Math.floor(loot.gold * goldBonus);

        if (loot.exp > 0) get().addExp(loot.exp);
        if (loot.gold > 0) get().addGold(loot.gold);
        if (loot.soulOrbs > 0) get().addSoulOrbs(loot.soulOrbs);
        if (loot.reputation > 0 && mission) {
          get().addAreaReputation(mission.areaId, loot.reputation);
        }

        expedition.selectedCompanionIds.forEach((cid) => {
          const starExp = Math.floor(loot.exp * 0.05);
          if (starExp > 0) {
            get().addCompanionStarExp(cid, starExp);
          }
        });

        get().addBattleLog(
          `🏁 远征完成！获得 ${loot.exp} 经验, ${loot.gold} 金币${loot.soulOrbs > 0 ? `, ${loot.soulOrbs} 魂珠` : ''}`,
          'system'
        );

        if (expedition.casualties.length > 0) {
          expedition.casualties.forEach((c) => {
            get().addBattleLog(`🏥 ${c.companionName} ${c.status === 'critical' ? '重伤' : '轻伤'}归来`, 'event');
          });
        }

        set({ activeExpedition: null });
        return loot;
      },

      cancelExpedition: () => {
        const state = get();
        if (!state.activeExpedition) return;
        get().addBattleLog('🚫 远征已取消', 'system');
        set({ activeExpedition: null });
      },

      setExpeditionPhase: (phase) => {
        const state = get();
        if (!state.activeExpedition) return;
        set({ activeExpedition: { ...state.activeExpedition, phase } });
      },
    }),
    {
      name: 'isekai-idle-game',
      version: 4,
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          state.areaReputations = initAreaReputations();
          state.purchasedShopItems = [];
        }
        if (version < 3) {
          const ownedCompanions = (state.ownedCompanions as Companion[]) || [];
          state.ownedCompanions = ownedCompanions.map((c: Companion) => ({
            ...c,
            stars: c.stars || 1,
            starExp: c.starExp || 0,
            starExpToNext: c.starExpToNext || getStarUpConfig(c.rarity).starExpToNext[0],
            bondId: c.bondId || COMPANIONS.find((cc) => cc.id === c.id)?.bondId,
          }));
          state.formation = initFormation(1);
        }
        if (version < 4) {
          state.consequenceTags = [];
          state.companionAffinities = [];
          state.mapAreaModifiers = [];
          state.eventWeightModifiers = [];
        }
        return state as unknown as GameState;
      },
    }
  )
);
