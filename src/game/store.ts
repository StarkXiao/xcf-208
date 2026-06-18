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
  Skill,
  MonsterPhase,
  OfflineRewardBreakdown,
  PowerBreakdown,
  PowerComponent,
  Talent,
  TalentEffect,
  LevelProgress,
  LevelStats,
  StarReward,
  LevelStarConfig,
  FirstClearReward,
  StarCondition,
  CompanionShard,
  CompanionCodexEntry,
  RecruitPoolType,
  ShopInventory,
  ShopItem,
  MonsterTier,
  MonsterTierConfig,
  MonsterKillStats,
  RebirthChallengeTarget,
  Monster,
  ClassPassive,
  Equipment,
  ActiveCommission,
  CommissionRewardResult,
  Commission,
  GuildChapter,
  GuildTab,
  GuildLevelConfig,
  GuildDailyReward,
  Chapter,
  DialogueState,
  RareMaterial,
  MaterialInventoryItem,
  SkillTreeNode,
  ProfessionSpec,
  TradeItem,
  TradeEvent,
  TradeInventoryItem,
  TradeRecord,
  Relic,
  OwnedRelic,
  RelicCodexEntry,
  RelicSet,
  RelicStatBonus,
  Building,
  OwnedBuilding,
  MerchantEvent,
  ActiveMerchantEvent,
  OfflineTownRewards,
  TownTab,
  WorldBoss,
  WorldBossState,
  WorldBossSession,
  WorldBossRankingEntry,
  WorldBossDamageLogEntry,
  WorldBossHistoryEntry,
  AlchemyRecipe,
  Potion,
  AlchemyLevelConfig,
  OwnedPotion,
  ActiveAlchemyBuff,
  AlchemyPotionEffect,
  AlchemyTab,
  MonsterCodexEntry,
  EventCodexEntry,
  RebirthRecord,
  Achievement,
  AchievementProgress,
  EventEffect,
  RelicDungeonState,
  RelicDungeonRoom,
  RelicDungeonFloor,
  RelicDungeonBuff,
  RelicDungeonBuffEffect,
  RelicDungeonDifficulty,
  RelicDungeonShopItem,
  RelicDungeonSettlement,
  RelicDungeonReplayEvent,
  SeasonChallengeState,
  SeasonChallengeTaskProgress,
  SeasonChallengeHistoryEntry,
  SeasonChallengeLeaderboardEntry,
  FactionState,
  Faction,
  FactionReputation,
  Stronghold,
  GarrisonedCompanion,
  FactionSettlement,
  FactionTab,
  FactionType,
  FactionIncomeBreakdown,
  FactionBattleLog,
} from './types';
import { getAffinityLevel, MAP_MODIFIER_ICONS, AFFINITY_LEVEL_NAMES, AFFINITY_LEVEL_COLORS, MONSTER_TIER_CONFIGS, MONSTER_TIER_NAMES, RELIC_RARITY_NAMES, RELIC_DUNGEON_ROOM_TYPE_NAMES, getFactionReputationLevel, FACTION_REPUTATION_LEVELS } from './types';
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
  SKILLS,
  MONSTER_PHASES,
  TALENTS,
  TALENT_SYNERGIES,
  LEVEL_STAR_CONFIGS,
  FIRST_CLEAR_REWARDS,
  RECRUIT_POOLS,
  getShardConfig,
  REBIRTH_CHALLENGE_TARGETS,
  getClassPassive,
  SKILL_TREE_NODES,
  PROFESSION_SPECS,
  CHAPTERS,
  RARE_MATERIALS,
  RELICS,
  RELIC_SETS,
  RELIC_LEVEL_EXP,
  RELIC_MAX_LEVEL,
  RELIC_LEVEL_STAT_MULTIPLIER,
  RELIC_DROP_CONFIG,
  RELIC_COMPAT_BONUS,
  BUILDINGS,
  MERCHANT_EVENTS,
  TOWN_MERCHANT_EVENT_BASE_CHANCE,
  TOWN_MAX_OFFLINE_HOURS,
  TOWN_OFFLINE_EFFICIENCY,
  WORLD_BOSSES,
  WORLD_BOSS_ROTATION,
  WORLD_BOSS_REVIVE_COST_GOLD,
  WORLD_BOSS_REVIVE_COST_SOUL_ORBS,
  WORLD_BOSS_MAX_REVIVES,
  WORLD_BOSS_SIMULATED_PARTICIPANTS,
  ALCHEMY_RECIPES,
  POTIONS,
  ALCHEMY_LEVEL_CONFIGS,
  ALCHEMY_CRAFT_FAIL_REFUND_RATE,
  ALCHEMY_BATTLE_BUFF_DURATION,
  ALCHEMY_EXP_PER_CRAFT,
  ACHIEVEMENTS,
  RELIC_DUNGEON_BUFFS,
  RELIC_DUNGEON_BOSSES,
  RELIC_DUNGEON_DIFFICULTY_CONFIG,
  RELIC_DUNGEON_ROOM_DISTRIBUTION,
  RELIC_DUNGEON_ROOM_NAMES,
  SEASON_CHALLENGE_SEASONS,
  SEASON_CHALLENGE_SIMULATED_LEADERBOARD,
  FACTIONS,
  FACTION_EVENTS,
  FACTION_SHOP_ITEMS,
  getInitialFactionState,
  FACTION_SETTLEMENT_INTERVAL,
  FACTION_MAX_BATTLE_LOGS,
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
  shopInventories: ShopInventory[];
  currentMonster: {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    expReward: number;
    goldReward: number;
    color: string;
    baseAttack: number;
    baseDefense: number;
    baseSpeed: number;
    currentPhase: number;
    tier: MonsterTier;
    baseMaxHp: number;
    baseExpReward: number;
    baseGoldReward: number;
  } | null;

  monsterKillStats: MonsterKillStats;
  rebirthChallenges: RebirthChallengeTarget[];

  generateMonster: (areaId: string, forceTier?: MonsterTier) => GameState['currentMonster'];
  getMonsterTierConfig: (tier: MonsterTier) => MonsterTierConfig;
  updateKillStats: (monsterTier: MonsterTier, areaId: string, monsterId?: string) => void;
  getAreaEliteKills: (areaId: string) => number;
  getAreaBossKills: (areaId: string) => number;
  getTotalEliteKills: () => number;
  getTotalBossKills: () => number;
  checkMapUnlockConditions: (areaId: string) => boolean;
  getUnlockProgress: (areaId: string) => { condition: string; current: number; target: number; completed: boolean }[];
  checkRebirthChallenges: () => void;
  claimRebirthChallengeReward: (challengeId: string) => boolean;
  canClaimRebirthChallenge: (challengeId: string) => boolean;
  getTotalPower: () => number;
  calculateMonsterStats: (monster: Monster, tier: MonsterTier, playerLevel: number, area: MapArea) => GameState['currentMonster'];
  getMonsterDropReward: (monster: GameState['currentMonster']) => { exp: number; gold: number; soulOrbs: number; shardChance: number };

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
  calculateOfflineRewards: () => { exp: number; gold: number; breakdown: OfflineRewardBreakdown | null };
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
  restockShop: (areaId: string, triggerType?: 'map_change' | 'event' | 'timer' | 'manual') => void;
  getShopInventory: (areaId: string) => ShopInventory | undefined;
  getItemStock: (itemId: string, areaId: string) => number;
  getAvailableShopItems: (areaId: string) => ShopItem[];
  shouldRestockShop: (areaId: string) => boolean;

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
  levelProgresses: LevelProgress[];
  currentLevelStats: LevelStats | null;

  addConsequenceTag: (tag: string) => void;
  hasConsequenceTag: (tag: string) => boolean;
  getCompanionAffinity: (companionId: string) => CompanionAffinityRecord;
  addCompanionAffinity: (companionId: string, value: number) => void;
  addMapAreaModifier: (modifier: MapAreaModifier) => void;
  getMapAreaModifiers: (areaId: string) => MapAreaModifier[];
  getMapAreaModifierBonus: (areaId: string, stat: keyof PlayerStats) => number;
  getEventWeight: (eventId: string) => number;
  addEventWeightModifier: (mod: EventWeightMod) => void;

  getMapModifierTotalBonus: (stat: keyof PlayerStats) => number;
  getAffinityTotalBonus: (stat: keyof PlayerStats) => number;
  getCompanionAffinityBonusMultiplier: () => number;

  startExpedition: (missionId: string, companionIds: string[]) => void;
  advanceExpeditionStage: () => void;
  resolveExpeditionEvent: (eventId: string) => void;
  skipExpeditionEvent: () => void;
  completeExpedition: () => ExpeditionLoot;
  cancelExpedition: () => void;
  setExpeditionPhase: (phase: ExpeditionPhase) => void;
  getExpeditionPower: (companionIds: string[]) => number;

  getPlayerSkills: () => Skill[];
  getTotalSpeed: () => number;
  useMp: (amount: number) => boolean;
  getMonsterPhaseMultipliers: () => { attack: number; defense: number; speed: number };
  updateMonsterPhase: () => void;
  getMonsterPhases: () => MonsterPhase[];

  getTalentLevel: (talentId: string) => number;
  getTalentCost: (talent: Talent, currentLevel: number) => number;
  upgradeTalent: (talentId: string) => boolean;
  canUpgradeTalent: (talent: Talent) => boolean;
  isTalentUnlocked: (talent: Talent) => boolean;
  getTalentBonus: (type: TalentEffect['type']) => number;
  getTalentBonusFlat: (type: TalentEffect['type']) => number;
  getActiveSynergies: () => string[];
  getSynergyBonus: (type: TalentEffect['type']) => number;
  getSynergyBonusFlat: (type: TalentEffect['type']) => number;
  getTotalTalentBonus: (type: TalentEffect['type']) => { percent: number; flat: number };
  resetTalents: () => boolean;
  getPowerBreakdown: () => PowerBreakdown;

  initLevelStats: () => void;
  getLevelProgress: (areaId: string) => LevelProgress;
  getCurrentLevelStars: () => number;
  checkStarCondition: (condition: StarCondition) => boolean;
  checkAllStarConditions: (areaId: string) => { stars: number; completedConditions: boolean[] }[];
  updateLevelStatsOnKill: (damageDealt: number, goldReward: number, expReward: number) => void;
  updateLevelStatsOnDamage: (damageTaken: number) => void;
  updateLevelStatsOnEvent: (isGoodChoice: boolean) => void;
  updateSurvivalTime: () => void;
  claimStarReward: (areaId: string, stars: number) => boolean;
  claimFirstClearReward: (areaId: string) => boolean;
  canClaimStarReward: (areaId: string, stars: number) => boolean;
  canClaimFirstClearReward: (areaId: string) => boolean;
  getStarConfig: (areaId: string) => LevelStarConfig[];
  getFirstClearConfig: (areaId: string) => FirstClearReward | null;
  applyStarReward: (rewards: StarReward[], areaId: string) => void;

  companionShards: CompanionShard[];
  companionCodex: CompanionCodexEntry[];
  recruitPullCounters: Record<RecruitPoolType, number>;
  lastRecruitResults: { companionId: string; shards: number; isNew: boolean }[] | null;

  getShardCount: (companionId: string) => number;
  addShards: (companionId: string, count: number) => void;
  canSynthesizeCompanion: (companionId: string) => boolean;
  synthesizeCompanion: (companionId: string) => boolean;
  getCodexEntry: (companionId: string) => CompanionCodexEntry;
  getCodexProgress: () => { total: number; unlocked: number; percentage: number };
  unlockCodexEntry: (companionId: string) => void;
  recruitFromPool: (poolType: RecruitPoolType, count: number) => boolean;
  getDiscountedRecruitCost: (baseCost: number) => number;
  convertDuplicateToShards: (companionId: string) => number;
  clearLastRecruitResults: () => void;

  getClassPassive: () => ClassPassive | undefined;
  getClassLevelBonusMultiplier: (stat: 'attack' | 'defense' | 'maxHp' | 'maxMp' | 'speed' | 'luck') => number;
  getClassIdleExpMultiplier: () => number;
  getClassIdleGoldMultiplier: () => number;
  getClassSoulOrbChanceBonus: () => number;
  getClassEventPositiveMultiplier: () => number;
  getClassEventNegativeReduction: () => number;
  getClassEventWeightBonus: () => number;
  isPreferredCompanion: (companion: Companion) => boolean;
  getClassCompanionAffinityBonus: (companion: Companion) => number;
  getClassCompanionStatMultiplier: (companion: Companion) => number;

  skillNodeLevels: Record<string, number>;
  activeSpecId: string | null;
  getSkillNodeLevel: (nodeId: string) => number;
  canUpgradeSkillNode: (nodeId: string) => boolean;
  isSkillNodeUnlocked: (node: SkillTreeNode) => boolean;
  upgradeSkillNode: (nodeId: string) => boolean;
  getAvailableSkillPoints: () => number;
  getTotalAllocatedPoints: () => number;
  getBranchPoints: (branchId: string) => number;
  getSkillTreeTotalBonus: (type: TalentEffect['type']) => number;
  resetSkillTree: () => boolean;
  getActiveSpec: () => ProfessionSpec | null;
  getSpecCombatMultiplier: () => { damage: number; defense: number; speed: number };
  getSpecRebirthInheritRate: () => number;
  canActivateProfessionSpec: (specId: string) => boolean;
  activateProfessionSpec: (specId: string) => boolean;
  deactivateProfessionSpec: () => void;

  equipmentInventory: Equipment[];
  companionEquipments: Record<string, Record<string, string>>;
  equipItem: (equipmentUid: string, companionId: string | null) => boolean;
  unequipItem: (equipmentUid: string) => boolean;
  recycleEquipment: (equipmentUid: string) => { gold: number; exp: number };
  forgeEquipments: (recipeId: string, inputUids: string[]) => Equipment | null;
  canForge: (recipeId: string, inputUids: string[]) => boolean;
  getEquippedItems: (companionId: string | null) => Equipment[];
  getEquipmentStatBonus: (companionId: string, stat?: string) => { flat: number; percent: number };
  generateEquipmentDrop: (tier: string | number, areaLevel?: number) => Equipment | null;
  addEquipmentToInventory: (equipment: Equipment) => void;
  addEquipmentForgeExp: (equipmentUid: string, exp: number) => void;

  availableCommissions: Commission[];
  activeCommissions: ActiveCommission[];
  materialInventory: MaterialInventoryItem[];
  refreshCommissions: () => void;
  shouldRefreshCommissions: () => boolean;
  startCommission: (commissionId: string, companionIds: string[]) => boolean;
  updateCommissionProgress: () => void;
  resolveCommissionEvent: (commissionId: string, choiceId: string) => void;
  collectCommissionReward: (commissionId: string) => CommissionRewardResult[] | null;
  cancelCommission: (commissionId: string) => boolean;
  getCommissionPower: (companionIds: string[]) => number;
  getMaterialInfo: (materialId: string) => RareMaterial | undefined;
  getActiveCommissionCount: () => number;
  canStartCommission: (commission?: Commission) => boolean;
  sellMaterial: (materialId: string, count: number) => boolean;

  guildLevel: number;
  guildExp: number;
  guildContribution: number;
  currentStamina: number;
  getGuildMaxStamina: () => number;
  getGuildLevelConfig: () => GuildLevelConfig | undefined;
  getGuildExpToNextLevel: () => number;
  getCurrentGuildChapter: () => GuildChapter | undefined;
  getNodeProgress: (chapterId: string, nodeId: string) => { cleared: boolean; stars: number; claimed: boolean; bestStars: number };
  isNodeAccessible: (chapterId: string, nodeId: string) => boolean;
  enterGuildNode: (chapterId: string, nodeId: string) => boolean | void;
  clearGuildNode: (chapterId: string, nodeId: string, stars: number, rewards?: unknown) => void;
  battleGuildNode: (chapterId: string, nodeId: string) => { won: boolean; stars: number; powerRatio: number };
  claimNodeReward: (chapterId: string, nodeId: string) => boolean;
  canClaimNodeReward: (chapterId: string, nodeId: string) => boolean;
  setCurrentGuildChapter: (chapterId: string) => void;
  currentGuildChapterId: string;
  guildActiveTab: GuildTab;
  setGuildActiveTab: (tab: GuildTab) => void;
  getGuildTechLevel: (techId: string) => number;
  upgradeGuildTech: (techId: string) => boolean;
  canUpgradeGuildTech: (techId: string) => boolean;
  guildDailyRewards: GuildDailyReward[];
  getDailyStreak: () => number;
  claimDailyReward: (day: number) => boolean;
  canClaimDailyReward: (day: number) => boolean;
  checkAndResetDailyRewards: () => void;
  guildFormation: string[];
  setGuildFormation: (formation: string[]) => void;
  getGuildFormationPower: () => number;
  regenStamina: () => void;
  getGuildAttackBonus: () => number;
  getGuildDefenseBonus: () => number;
  getGuildHpBonus: () => number;
  getGuildGoldBonus: () => number;
  getGuildExpBonus: () => number;

  currentChapterId: string;
  chapterActiveTab: 'chapters' | 'stages' | 'bosses' | 'list' | 'detail';
  getChapter: (chapterId: string) => Chapter | undefined;
  getChapterProgress: (chapterId: string) => { unlocked: boolean; completed: boolean; claimed: boolean; totalStars: number; maxStars: number };
  getStageProgress: (chapterId: string, stageId: string) => { cleared: boolean; stars: number; firstClearClaimed: boolean; bestStars: number };
  isChapterUnlocked: (chapterId: string) => boolean;
  isStageAccessible: (chapterId: string, stageId: string) => boolean;
  getChapterUnlockProgress: (chapterId: string) => { condition: string; current: number; target: number; completed: boolean }[];
  setCurrentChapter: (chapterId: string) => void;
  setChapterActiveTab: (tab: 'chapters' | 'stages' | 'bosses' | 'list' | 'detail') => void;
  startStage: (chapterId: string, stageId: string) => void;
  canClaimStageReward: (chapterId: string, stageId: string) => boolean;
  canClaimStageFirstClearReward: (chapterId: string, stageId: string) => boolean;
  claimChapterReward: (chapterId: string) => boolean;
  canClaimChapterReward: (chapterId: string) => boolean;
  currentDialogue: DialogueState | null;
  advanceDialogue: (choiceId?: string) => void;
  closeDialogue: () => void;

  tradeRecords: TradeRecord[];
  getAvailableTradeItems: (areaId?: string) => { item: TradeItem; inventory: TradeInventoryItem }[];
  shouldRefreshTrade: (areaId?: string) => boolean;
  refreshTradeInventory: (areaId?: string) => void;
  buyTradeItem: (itemId: string, areaId: string, quantity: number) => boolean;
  sellTradeItem: (itemId: string, areaId: string, quantity: number) => boolean;
  getMaterialCount: (materialId: string) => number;
  getActiveTradeEvents: (areaId?: string) => TradeEvent[];
  checkTradeEvents: () => void;

  blackMarketInventory: ShopItem[];
  isBlackMarketUnlocked: () => boolean;
  shouldRefreshBlackMarket: () => boolean;
  refreshBlackMarket: () => void;
  buyBlackMarketItem: (itemId: string, quantity?: number) => boolean;
  getBlackMarketItems: () => { item: TradeItem; inventory: TradeInventoryItem }[];
  dismissCompanion: (companionId: string) => boolean;
  exchangeGoldToSoulOrbs: (goldAmount: number) => boolean;
  exchangeShardsToSoulOrbs: (companionId: string, shardCount: number) => boolean;
  getUnclaimedRewards: () => {
    gold: number;
    exp: number;
    soulOrbs: number;
    starRewards: { areaId: string; stars: number }[];
    firstClearRewards: string[];
    rebirthChallengeRewards: string[];
  };

  ownedRelics: OwnedRelic[];
  relicCodex: RelicCodexEntry[];

  getRelic: (relicId: string) => Relic | undefined;
  getOwnedRelic: (relicId: string) => OwnedRelic | undefined;
  getRelicSet: (setId: string) => RelicSet | undefined;
  getActiveRelicSets: () => RelicSet[];
  getRelicCodexEntry: (relicId: string) => RelicCodexEntry;
  getRelicCodexProgress: () => { total: number; unlocked: number; percentage: number };
  getRelicLevel: (relicId: string) => number;
  getRelicExpToNext: (relicId: string) => { current: number; next: number };
  getRelicStatBonus: (relicId: string, includeAwakened: boolean) => RelicStatBonus[];
  getEquippedRelics: (companionId: string | null) => OwnedRelic[];
  getRelicTotalStats: (companionId: string | null) => { flat: Partial<Record<string, number>>; percent: Partial<Record<string, number>> };
  getRelicSetBonus: (companionId: string | null) => RelicStatBonus[];
  isRelicCompatible: (relicId: string, companionId: string | null) => boolean;
  getCompatibleBonusMultiplier: (relicId: string, companionId: string | null) => number;

  addRelic: (relicId: string) => boolean;
  addRelicShards: (relicId: string, count: number) => void;
  upgradeRelic: (relicId: string, exp: number) => boolean;
  awakenRelic: (relicId: string) => boolean;
  equipRelic: (relicId: string, companionId: string | null) => boolean;
  unequipRelic: (relicId: string) => boolean;
  synthesizeRelic: (relicId: string) => boolean;
  tryDropRelic: (monsterTier: MonsterTier, areaId: string) => { relic: string | null; shards: { relicId: string; count: number } | null };
  getDroppableRelics: (monsterTier: MonsterTier, areaId: string, playerLevel: number) => Relic[];

  ownedBuildings: OwnedBuilding[];
  activeMerchantEvents: ActiveMerchantEvent[];
  townActiveTab: TownTab;
  lastTownProductionTime: number;

  getBuilding: (buildingId: string) => Building | undefined;
  getOwnedBuilding: (buildingId: string) => OwnedBuilding | undefined;
  getBuildingLevel: (buildingId: string) => number;
  getBuildingProduction: (buildingId: string) => { rate: number; currency: string; capacity: number };
  getBuildingUpgradeCost: (buildingId: string) => { cost: number; currency: string } | null;
  canUpgradeBuilding: (buildingId: string) => boolean;
  upgradeBuilding: (buildingId: string) => boolean;
  collectBuildingResources: (buildingId: string) => { gold: number; exp: number; soulOrbs: number };
  collectAllBuildingResources: () => { gold: number; exp: number; soulOrbs: number };
  getBuildingCurrentResources: (buildingId: string) => number;
  getTotalBuildingProduction: () => { goldPerMinute: number; expPerMinute: number; soulOrbsPerMinute: number };
  getUnlockedBuildings: () => Building[];
  isBuildingUnlocked: (buildingId: string) => boolean;

  getStationedCompanions: (buildingId: string) => Companion[];
  getAvailableCompanionsForStation: () => Companion[];
  getStationBonus: (buildingId: string) => number;
  canStationCompanion: (buildingId: string, companionId: string) => boolean;
  stationCompanion: (buildingId: string, companionId: string) => boolean;
  unstationCompanion: (buildingId: string, companionId: string) => boolean;
  getBuildingStationSlots: (buildingId: string) => number;
  getWarehouseCapacityBonus: () => number;

  getActiveMerchantEvents: () => ActiveMerchantEvent[];
  getMerchantEvent: (eventId: string) => MerchantEvent | undefined;
  getMerchantItemStock: (eventId: string, itemId: string) => number;
  canBuyMerchantItem: (eventId: string, itemId: string) => boolean;
  buyMerchantItem: (eventId: string, itemId: string) => boolean;
  checkMerchantEvents: () => void;
  getMerchantEventChance: () => number;

  calculateOfflineTownRewards: () => OfflineTownRewards;
  collectOfflineTownRewards: () => void;
  updateTownProduction: () => void;

  setTownActiveTab: (tab: TownTab) => void;

  worldBossState: WorldBossState;
  getCurrentWorldBoss: () => WorldBoss | undefined;
  getWorldBossSession: () => WorldBossSession | null;
  startWorldBossSession: () => void;
  dealWorldBossDamage: () => number;
  reviveInWorldBoss: () => boolean;
  canReviveInWorldBoss: () => boolean;
  checkWorldBossRotation: () => void;
  claimWorldBossRewards: () => boolean;
  canClaimWorldBossRewards: () => boolean;
  getPlayerWorldBossRank: () => number;
  getPlayerDamagePercent: () => number;
  getWorldBossPhaseInfo: () => { index: number; name: string; color: string; description: string } | null;
  getWorldBossActiveMechanic: () => { id: string; name: string; description: string; icon: string } | null;
  getWorldBossTimeRemaining: () => number;
  isWorldBossAvailable: () => boolean;
  tickWorldBoss: () => void;

  alchemyLevel: number;
  alchemyExp: number;
  ownedPotions: OwnedPotion[];
  activeAlchemyBuffs: ActiveAlchemyBuff[];
  unlockedRecipeIds: string[];
  alchemyActiveTab: AlchemyTab;
  craftingInProgress: boolean;
  lastCraftTime: number;

  getAlchemyLevelConfig: () => AlchemyLevelConfig;
  getAlchemyExpToNext: () => number;
  addAlchemyExp: (exp: number) => void;
  getAlchemySuccessRate: (recipe: AlchemyRecipe) => number;
  getAlchemyEffectMultiplier: () => number;
  canCraftPotion: (recipeId: string) => boolean;
  craftPotion: (recipeId: string) => { success: boolean; potionId: string | null; count: number };
  usePotion: (potionId: string) => boolean;
  usePotionInCombat: (potionId: string) => boolean;
  applyAlchemyBuffs: (potionId: string) => void;
  tickAlchemyBuffs: () => void;
  consumeBattleBuff: () => void;
  getActiveAlchemyBonus: (type: AlchemyPotionEffect['type']) => { flat: number; percent: number };
  getAlchemyBuffDamageReduction: () => number;
  getAlchemyBuffCritRate: () => number;
  getAlchemyBuffCritDamage: () => number;
  getAlchemyBuffExpBonus: () => number;
  getAlchemyBuffGoldBonus: () => number;
  getAlchemyBuffSoulOrbBonus: () => number;
  getPotionInfo: (potionId: string) => Potion | undefined;
  getOwnedPotionCount: (potionId: string) => number;
  addPotion: (potionId: string, count: number) => void;
  sellPotion: (potionId: string, count: number) => boolean;
  unlockRecipe: (recipeId: string) => void;
  isRecipeUnlocked: (recipeId: string) => boolean;
  setAlchemyActiveTab: (tab: AlchemyTab) => void;

  monsterCodex: MonsterCodexEntry[];
  eventCodex: EventCodexEntry[];
  rebirthRecords: RebirthRecord[];
  achievementProgresses: AchievementProgress[];
  totalGoldEarned: number;
  totalSoulOrbsEarned: number;

  unlockMonsterCodex: (monsterId: string, tier?: MonsterTier) => void;
  encounterMonsterCodex: (monsterId: string, tier?: MonsterTier) => void;
  getMonsterCodexEntry: (monsterId: string) => MonsterCodexEntry;
  getMonsterCodexProgress: () => { total: number; unlocked: number; percentage: number };

  unlockEventCodex: (eventId: string, choiceId?: string) => void;
  getEventCodexEntry: (eventId: string) => EventCodexEntry;
  getEventCodexProgress: () => { total: number; unlocked: number; percentage: number };

  addRebirthRecord: (record: Omit<RebirthRecord, 'id'>) => void;
  getRebirthRecords: () => RebirthRecord[];

  checkAchievements: () => void;
  getAchievementProgress: (achievementId: string) => AchievementProgress;
  getAchievementsByCategory: (category: string) => { achievement: Achievement; progress: AchievementProgress }[];
  getAchievementProgressValue: (achievement: Achievement) => number;
  claimAchievementReward: (achievementId: string) => boolean;
  canClaimAchievement: (achievementId: string) => boolean;
  getAchievementSummary: () => { total: number; unlocked: number; claimed: number; percentage: number };
  getUnclaimedAchievementCount: () => number;

  relicDungeon: RelicDungeonState;
  startRelicDungeon: (difficulty: RelicDungeonDifficulty) => boolean;
  generateRelicDungeonFloor: (floor: number, difficulty: RelicDungeonDifficulty) => RelicDungeonFloor;
  getRandomRelicDungeonBuff: (rarityBonus?: number, count?: number) => RelicDungeonBuff[];
  enterRelicDungeonRoom: (roomId: string) => void;
  clearRelicDungeonRoom: (roomId: string) => void;
  collectRelicDungeonBuff: (buff: RelicDungeonBuff) => void;
  getRelicDungeonBuffBonus: (stat: RelicDungeonBuffEffect['stat']) => { flat: number; percent: number };
  getRelicDungeonTotalAttack: () => number;
  getRelicDungeonTotalDefense: () => number;
  getRelicDungeonCurrentFloor: () => RelicDungeonFloor | null;
  getRelicDungeonCurrentRoom: () => RelicDungeonRoom | null;
  getAccessibleRelicDungeonRooms: () => RelicDungeonRoom[];
  advanceToNextRelicDungeonFloor: () => void;
  completeRelicDungeonBoss: () => void;
  dealRelicDungeonBossDamage: () => number;
  takeRelicDungeonBossDamage: () => number;
  updateRelicDungeonBossPhase: () => void;
  abandonRelicDungeon: () => void;
  settleRelicDungeon: (survival: boolean) => void;
  claimRelicDungeonRewards: () => void;
  addRelicDungeonReplayEvent: (event: Omit<RelicDungeonReplayEvent, 'id' | 'timestamp'>) => void;
  getRelicDungeonHistory: () => RelicDungeonSettlement[];
  viewRelicDungeonReplay: (runId: string) => void;
  closeRelicDungeonReplay: () => void;
  stepRelicDungeonReplay: (direction: 'prev' | 'next' | 'first' | 'last') => void;
  gotoRelicDungeonReplayIndex: (index: number) => void;
  toggleRelicDungeonReplayPlaying: () => void;
  generateRelicDungeonShop: () => RelicDungeonShopItem[];
  buyRelicDungeonShopItem: (itemId: string) => boolean;
  getBossForFloor: (floor: number, difficulty: RelicDungeonDifficulty) => typeof RELIC_DUNGEON_BOSSES[0] | null;

  seasonChallenge: SeasonChallengeState;
  getCurrentSeason: () => typeof SEASON_CHALLENGE_SEASONS[0] | undefined;
  getSeasonTaskProgress: (taskId: string) => SeasonChallengeTaskProgress;
  isStageUnlocked: (stageId: string) => boolean;
  claimSeasonTaskReward: (taskId: string) => boolean;
  canClaimSeasonTaskReward: (taskId: string) => boolean;
  getSeasonLeaderboard: () => SeasonChallengeLeaderboardEntry[];
  getPlayerSeasonRank: () => number;
  isLimitedPartnerUnlocked: (companionId: string) => boolean;
  canClaimCrossWeekReward: (weekNumber: number) => boolean;
  claimCrossWeekReward: (weekNumber: number) => boolean;
  getSeasonHistory: () => SeasonChallengeHistoryEntry[];
  setSeasonChallengeTab: (tab: SeasonChallengeState['activeTab']) => void;
  addSeasonScore: (score: number) => void;
  updateSeasonTaskProgress: (type: string, value: number, mode?: 'add' | 'set') => void;
  syncSeasonChallengeProgress: () => void;

  faction: FactionState;
  joinFaction: (factionId: string) => boolean;
  leaveFaction: () => boolean;
  getPlayerFaction: () => Faction | undefined;
  getFactionById: (factionId: string) => Faction | undefined;
  addFactionReputation: (factionId: string, points: number) => void;
  getFactionReputation: (factionId: string) => FactionReputation;
  getStrongholdById: (strongholdId: string) => Stronghold | undefined;
  captureStronghold: (strongholdId: string) => boolean;
  canCaptureStronghold: (strongholdId: string) => boolean;
  garrisonCompanion: (strongholdId: string, companionId: string) => boolean;
  ungarrisonCompanion: (strongholdId: string, companionId: string) => boolean;
  getGarrisonedCompanions: (strongholdId: string) => GarrisonedCompanion[];
  getStrongholdPower: (strongholdId: string) => number;
  triggerFactionEvent: () => void;
  handleFactionEventChoice: (choiceId: string) => boolean;
  canChooseFactionEventOption: (choiceId: string) => { canChoose: boolean; reason?: string };
  closeFactionEvent: () => void;
  performFactionSettlement: () => FactionSettlement | null;
  canSettle: () => boolean;
  getStrongholdsByFaction: (factionId: string) => Stronghold[];
  getControlledStrongholds: () => Stronghold[];
  getFactionShopItems: () => typeof FACTION_SHOP_ITEMS;
  buyFactionShopItem: (itemId: string) => boolean;
  setFactionTab: (tab: FactionTab) => void;
  getFactionBonusStats: () => { stat: string; value: number }[];
  getFactionBonus: (stat: 'attack' | 'defense' | 'maxHp' | 'speed' | 'luck' | 'hp' | 'maxMp' | 'mp') => number;
  getFactionReputationMultiplier: () => number;
  getCompanionFactionBonus: (companion: Companion) => { attackMultiplier: number; defenseMultiplier: number };
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

function initShopInventories(): ShopInventory[] {
  return MAP_AREAS.map((area) => ({
    areaId: area.id,
    items: [],
    lastRestockTime: 0,
  }));
}

function createEmptyLevelStats(): LevelStats {
  return {
    totalKills: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    timesHit: 0,
    eventsTriggered: 0,
    goodEventChoices: 0,
    goldEarned: 0,
    expEarned: 0,
    soulOrbsEarned: 0,
    survivalTime: 0,
    maxComboKills: 0,
    currentComboKills: 0,
    startTime: Date.now(),
  };
}

function initLevelProgresses(): LevelProgress[] {
  return MAP_AREAS.map((area) => ({
    areaId: area.id,
    currentStars: 0,
    bestStars: 0,
    firstCleared: false,
    firstClearTime: null,
    bestStats: createEmptyLevelStats(),
    claimedStarRewards: [],
  }));
}

function initCompanionCodex(): CompanionCodexEntry[] {
  return COMPANIONS.map((c) => ({
    companionId: c.id,
    unlocked: false,
    unlockedAt: null,
  }));
}

function initRecruitCounters(): Record<RecruitPoolType, number> {
  return {
    basic: 0,
    advanced: 0,
    legendary: 0,
  };
}

function initMonsterKillStats(): MonsterKillStats {
  const killsByArea: Record<string, { normal: number; elite: number; boss: number }> = {};
  MAP_AREAS.forEach((area) => {
    killsByArea[area.id] = { normal: 0, elite: 0, boss: 0 };
  });
  return {
    normalKills: 0,
    eliteKills: 0,
    bossKills: 0,
    totalKills: 0,
    killsByArea,
    bossesDefeated: [],
  };
}

function initRebirthChallenges(): RebirthChallengeTarget[] {
  return REBIRTH_CHALLENGE_TARGETS.map((target) => ({
    ...target,
    completed: false,
    claimed: false,
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

function initRelicCodex(): RelicCodexEntry[] {
  return RELICS.map((r) => ({
    relicId: r.id,
    unlocked: false,
    unlockedAt: null,
    levelReached: 0,
    awakened: false,
  }));
}

function initMonsterCodex(): MonsterCodexEntry[] {
  const allMonsters: Monster[] = [];
  MAP_AREAS.forEach((area) => {
    area.monsters.forEach((monster) => {
      if (!allMonsters.find((m) => m.id === monster.id)) {
        allMonsters.push(monster);
      }
    });
  });
  return allMonsters.map((m) => ({
    monsterId: m.id,
    unlocked: false,
    unlockedAt: null,
    firstDefeatedAt: null,
    killCount: 0,
    maxTierDefeated: null,
  }));
}

function initEventCodex(): EventCodexEntry[] {
  return RANDOM_EVENTS.map((e) => ({
    eventId: e.id,
    unlocked: false,
    unlockedAt: null,
    triggerCount: 0,
    choicesMade: {},
  }));
}

function initAchievementProgresses(): AchievementProgress[] {
  return ACHIEVEMENTS.map((a) => ({
    achievementId: a.id,
    unlocked: false,
    unlockedAt: null,
    claimed: false,
    claimedAt: null,
    progress: 0,
  }));
}

function getRelicLevelFromExp(exp: number): { level: number; currentExp: number; nextExp: number } {
  let level = 0;
  let remaining = exp;
  for (let i = 0; i < RELIC_MAX_LEVEL; i++) {
    const needed = RELIC_LEVEL_EXP[i + 1] - RELIC_LEVEL_EXP[i];
    if (remaining >= needed) {
      level = i + 1;
      remaining -= needed;
    } else {
      return {
        level,
        currentExp: remaining,
        nextExp: needed,
      };
    }
  }
  return {
    level: RELIC_MAX_LEVEL,
    currentExp: 0,
    nextExp: 0,
  };
}

function getRelicTotalExp(level: number): number {
  if (level >= RELIC_MAX_LEVEL) return RELIC_LEVEL_EXP[RELIC_MAX_LEVEL];
  return RELIC_LEVEL_EXP[level];
}

function mergeRelicStats(stats: RelicStatBonus[], multiplier = 1): { flat: Partial<Record<string, number>>; percent: Partial<Record<string, number>> } {
  const flat: Partial<Record<string, number>> = {};
  const percent: Partial<Record<string, number>> = {};
  stats.forEach((s) => {
    if (s.isPercent) {
      percent[s.stat] = (percent[s.stat] || 0) + s.value * multiplier;
    } else {
      flat[s.stat] = (flat[s.stat] || 0) + s.value * multiplier;
    }
  });
  return { flat, percent };
}

function getStarUpConfig(rarity: Companion['rarity']) {
  return STAR_UP_CONFIGS.find((c) => c.rarity === rarity) || STAR_UP_CONFIGS[0];
}

function computeEffectiveAttack(companion: Companion, classMultiplier = 1): number {
  const config = getStarUpConfig(companion.rarity);
  const multiplier = config.attackMultiplier[companion.stars] || config.attackMultiplier[config.attackMultiplier.length - 1];
  return Math.floor(companion.attack * multiplier * companion.level * classMultiplier);
}

function computeEffectiveDefense(companion: Companion, classMultiplier = 1): number {
  const config = getStarUpConfig(companion.rarity);
  const multiplier = config.defenseMultiplier[companion.stars] || config.defenseMultiplier[config.defenseMultiplier.length - 1];
  return Math.floor(companion.defense * multiplier * companion.level * classMultiplier);
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
        talentPoints: 0,
        inheritedTalents: [],
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
      shopInventories: initShopInventories(),
      currentMonster: null,
      activeExpedition: null,
      consequenceTags: [],
      companionAffinities: [],
      mapAreaModifiers: [],
      eventWeightModifiers: [],
      levelProgresses: initLevelProgresses(),
      currentLevelStats: null,
      companionShards: [],
      companionCodex: initCompanionCodex(),
      recruitPullCounters: initRecruitCounters(),
      lastRecruitResults: null,
      monsterKillStats: initMonsterKillStats(),
      rebirthChallenges: initRebirthChallenges(),

      skillNodeLevels: {},
      activeSpecId: null,
      equipmentInventory: [],
      companionEquipments: {},
      availableCommissions: [],
      activeCommissions: [],
      materialInventory: [],
      guildLevel: 1,
      guildExp: 0,
      guildContribution: 0,
      currentStamina: 100,
      currentGuildChapterId: '',
      guildActiveTab: 'chapter',
      guildDailyRewards: [],
      guildFormation: [],
      currentChapterId: '',
      chapterActiveTab: 'list',
      currentDialogue: null,
      blackMarketInventory: [],
      tradeRecords: [],
      ownedRelics: [],
      relicCodex: initRelicCodex(),
      monsterCodex: initMonsterCodex(),
      eventCodex: initEventCodex(),
      rebirthRecords: [],
      achievementProgresses: initAchievementProgresses(),
      totalGoldEarned: 0,
      totalSoulOrbsEarned: 0,

      relicDungeon: {
        isActive: false,
        currentFloor: 0,
        maxFloor: 0,
        totalFloors: 0,
        difficulty: 'easy',
        floors: [],
        currentRoomId: null,
        activeBuffs: [],
        playerHp: 0,
        playerMaxHp: 0,
        playerMp: 0,
        playerMaxMp: 0,
        currentBoss: null,
        bossLog: [],
        settlement: null,
        history: [],
        highestFloorReached: 0,
        totalRuns: 0,
        totalBossesDefeated: 0,
        unlockedDifficulties: ['easy'],
        tempGold: 0,
        tempSoulOrbs: 0,
        tempExp: 0,
        visitedRoomIds: [],
        replayBuffer: [],
        currentShopInventory: [],
        viewingReplay: null,
        replayIndex: 0,
        replayPlaying: false,
      },

      alchemyLevel: 1,
      alchemyExp: 0,
      ownedPotions: [],
      activeAlchemyBuffs: [],
      unlockedRecipeIds: ALCHEMY_RECIPES.filter(r => r.requiredAlchemyLevel <= 1).map(r => r.id),
      alchemyActiveTab: 'recipes',
      craftingInProgress: false,
      lastCraftTime: 0,

      seasonChallenge: {
        currentSeasonId: SEASON_CHALLENGE_SEASONS[0]?.id || null,
        seasonScore: 0,
        taskProgresses: SEASON_CHALLENGE_SEASONS.flatMap((s) =>
          s.stages.flatMap((st) =>
            st.tasks.map((t) => ({
              taskId: t.id,
              progress: 0,
              completed: false,
              claimed: false,
            }))
          )
        ),
        leaderboard: SEASON_CHALLENGE_SIMULATED_LEADERBOARD,
        crossWeekRewardClaimed: [],
        history: [],
        activeTab: 'tasks',
      },

      faction: getInitialFactionState(),

      setScreen: (screen) => set({ screen }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      initializePlayer: (name, race, playerClass) => {
        const state = get();
        const rebirthBonus = state.player.totalRebirthBonus;

        const baseStats = { ...INITIAL_STATS };
        const attackBonus = state.rebirthBonuses['attack_boost'] || 0;
        const defenseBonus = state.rebirthBonuses['defense_boost'] || 0;
        const hpBonus = state.rebirthBonuses['hp_boost'] || 0;

        const talentAtkPct = get().getTotalTalentBonus('attack').percent;
        const talentAtkFlat = get().getTotalTalentBonus('attack').flat;
        const talentDefPct = get().getTotalTalentBonus('defense').percent;
        const talentDefFlat = get().getTotalTalentBonus('defense').flat;
        const talentHpPct = get().getTotalTalentBonus('hp').percent;
        const talentHpFlat = get().getTotalTalentBonus('hp').flat;
        const talentMpPct = get().getTotalTalentBonus('mp').percent;
        const talentMpFlat = get().getTotalTalentBonus('mp').flat;
        const talentSpdPct = get().getTotalTalentBonus('speed').percent;
        const talentSpdFlat = get().getTotalTalentBonus('speed').flat;
        const talentLckFlat = get().getTotalTalentBonus('luck').flat;

        const newStats = {
          ...baseStats,
          attack: Math.floor((baseStats.attack + talentAtkFlat) * (1 + attackBonus + rebirthBonus * 0.01 + talentAtkPct)),
          defense: Math.floor((baseStats.defense + talentDefFlat) * (1 + defenseBonus + rebirthBonus * 0.01 + talentDefPct)),
          maxHp: Math.floor((baseStats.maxHp + talentHpFlat) * (1 + hpBonus + rebirthBonus * 0.01 + talentHpPct)),
          hp: Math.floor((baseStats.maxHp + talentHpFlat) * (1 + hpBonus + rebirthBonus * 0.01 + talentHpPct)),
          maxMp: Math.floor((baseStats.maxMp + talentMpFlat) * (1 + talentMpPct)),
          mp: Math.floor((baseStats.maxMp + talentMpFlat) * (1 + talentMpPct)),
          speed: Math.floor((baseStats.speed + talentSpdFlat) * (1 + talentSpdPct)),
          luck: baseStats.luck + talentLckFlat,
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
          currentLevelStats: createEmptyLevelStats(),
          lastOnlineTime: Date.now(),
        });

        get().addBattleLog(`${name} 作为 ${race} ${playerClass} 降临到了异世界！`, 'system');
        const activeSynergies = get().getActiveSynergies();
        if (activeSynergies.length > 0) {
          get().addBattleLog(
            `🔗 激活天赋协同：${activeSynergies.map((id) => TALENT_SYNERGIES.find((s) => s.id === id)?.name).join('、')}`,
            'system'
          );
        }
      },

      addExp: (amount) => {
        const state = get();
        const expBonus = get().calculateExpBonus();
        const actualExp = Math.floor(amount * expBonus);

        let { exp, expToNext, level } = state.player.stats;
        let skillPoints = state.player.skillPoints;
        const startLevel = level;
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

        if (level !== startLevel) {
          get().updateSeasonTaskProgress('level', level, 'set');
          get().checkAchievements();
        }
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
          totalGoldEarned: state.totalGoldEarned + actualGold,
        }));
        if (actualGold > 0) {
          get().updateSeasonTaskProgress('collect', actualGold);
        }
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
          totalSoulOrbsEarned: state.totalSoulOrbsEarned + amount,
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
          const multiplier = get().getClassLevelBonusMultiplier(stat as 'attack' | 'defense' | 'maxHp' | 'maxMp' | 'speed' | 'luck');
          if (stat === 'attack') newStats.attack += Math.floor(2 * amount * multiplier);
          else if (stat === 'defense') newStats.defense += Math.floor(2 * amount * multiplier);
          else if (stat === 'maxHp') {
            newStats.maxHp += Math.floor(10 * amount * multiplier);
            newStats.hp += Math.floor(10 * amount * multiplier);
          } else if (stat === 'maxMp') {
            newStats.maxMp += Math.floor(5 * amount * multiplier);
            newStats.mp += Math.floor(5 * amount * multiplier);
          } else if (stat === 'speed') newStats.speed += Math.floor(1 * amount * multiplier);
          else if (stat === 'luck') newStats.luck += Math.floor(1 * amount * multiplier);

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
          set({ 
            currentAreaId: areaId, 
            currentMonster: null,
            currentLevelStats: createEmptyLevelStats(),
          });
          get().addBattleLog(`来到了 ${area.name}`, 'system');
          
          if (get().shouldRestockShop(areaId)) {
            get().restockShop(areaId, 'map_change');
          }
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
        const unlockedCount = get().mapAreas.filter((a) => a.unlocked).length;
        get().updateSeasonTaskProgress('area', unlockedCount, 'set');
        get().checkAchievements();
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
        get().unlockCodexEntry(companionId);
        const companionCount = get().ownedCompanions.length;
        get().updateSeasonTaskProgress('social', companionCount, 'set');
        get().checkAchievements();
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
        const classMultiplier = get().getClassCompanionStatMultiplier(companion);
        return computeEffectiveAttack(companion, classMultiplier);
      },

      getCompanionEffectiveDefense: (companion) => {
        const classMultiplier = get().getClassCompanionStatMultiplier(companion);
        return computeEffectiveDefense(companion, classMultiplier);
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
        const classPassive = get().getClassPassive();

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

        if (classPassive?.companionBonus.extraBondBonus && activeBondIds.length > 0) {
          const extra = classPassive.companionBonus.extraBondBonus;
          bonus[extra.type] += extra.value;
        }

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
        const classEventBonus = get().getClassEventWeightBonus();

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
        const areaWeight = 0.3 + eventBonus + classEventBonus;

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
          return { event: e, weight: Math.max(0.05, base + mod + classEventBonus) };
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

        get().unlockEventCodex(state.currentEvent.id, choiceId);

        const currentAreaId = state.currentAreaId;
        const posMultiplier = get().getClassEventPositiveMultiplier();
        const negReduction = get().getClassEventNegativeReduction();

        choice.effects.forEach((effect) => {
          let adjustedValue = effect.value;
          if (adjustedValue > 0) {
            adjustedValue = Math.floor(adjustedValue * posMultiplier);
          } else if (adjustedValue < 0) {
            adjustedValue = Math.ceil(adjustedValue * (1 - negReduction));
          }

          switch (effect.type) {
            case 'gold':
              if (adjustedValue > 0) {
                get().addGold(adjustedValue);
              } else {
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      gold: Math.max(0, s.player.stats.gold + adjustedValue),
                    },
                  },
                }));
              }
              break;
            case 'exp':
              if (adjustedValue > 0) {
                get().addExp(adjustedValue);
              } else {
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      exp: Math.max(0, s.player.stats.exp + adjustedValue),
                    },
                  },
                }));
              }
              break;
            case 'hp':
              if (adjustedValue > 0) {
                get().healHp(adjustedValue);
              } else {
                get().takeDamage(Math.abs(adjustedValue));
              }
              break;
            case 'mp':
              get().healMp(adjustedValue);
              break;
            case 'attack':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    attack: s.player.stats.attack + adjustedValue,
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
                    defense: s.player.stats.defense + adjustedValue,
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
                    speed: s.player.stats.speed + adjustedValue,
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
                    luck: s.player.stats.luck + adjustedValue,
                  },
                },
              }));
              break;
            case 'soulOrbs':
              get().addSoulOrbs(adjustedValue);
              break;
            case 'reputation':
              if (currentAreaId) {
                get().addAreaReputation(currentAreaId, adjustedValue);
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

        let isGoodChoice = false;
        let totalValue = 0;
        choice.effects.forEach((effect) => {
          switch (effect.type) {
            case 'gold':
            case 'exp':
            case 'soulOrbs':
            case 'attack':
            case 'defense':
            case 'speed':
            case 'luck':
            case 'reputation':
            case 'hp':
            case 'mp':
              totalValue += effect.value;
              break;
          }
        });
        if (choice.consequences?.mapModifiers) {
          choice.consequences.mapModifiers.forEach((mod) => {
            if (mod.type === 'blessing' || mod.type === 'hiddenPath') {
              totalValue += 50;
            } else if (mod.type === 'hazard' || mod.type === 'cursed') {
              totalValue -= 50;
            }
          });
        }
        isGoodChoice = totalValue > 0;
        get().updateLevelStatsOnEvent(isGoodChoice);

        if (Math.random() < 0.4) {
          const currentAreaId = state.currentAreaId;
          if (currentAreaId) {
            setTimeout(() => {
              get().restockShop(currentAreaId, 'event');
            }, 500);
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

        const newRebirthCount = state.player.rebirthCount + 1;
        const bonusTalentPoints = newRebirthCount >= 1 ? 1 + Math.floor(newRebirthCount / 2) : 0;

        set({
          screen: 'rebirth',
          player: {
            ...state.player,
            name: '',
            race: '',
            class: '',
            stats: { ...INITIAL_STATS, soulOrbs: state.player.stats.soulOrbs - totalCost },
            rebirthCount: newRebirthCount,
            totalRebirthBonus: state.player.totalRebirthBonus + bonusIds.length,
            talentPoints: state.player.talentPoints + bonusTalentPoints,
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
          shopInventories: initShopInventories(),
          consequenceTags: [],
          companionAffinities: [],
          mapAreaModifiers: [],
          eventWeightModifiers: [],
          companionShards: [],
          companionCodex: initCompanionCodex(),
          recruitPullCounters: initRecruitCounters(),
          lastRecruitResults: null,
          ownedRelics: [],
          worldBossState: {
            currentSession: null,
            rotationIndex: 0,
            nextBossTime: Date.now() + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
            isActive: false,
            totalBossesDefeated: 0,
            history: [],
          },
        });

        get().addRebirthRecord({
          rebirthCount: newRebirthCount,
          timestamp: Date.now(),
          level: state.player.stats.level,
          soulOrbsGained: totalCost,
          bonusesPurchased: bonusIds,
          totalRebirthBonus: state.player.totalRebirthBonus + bonusIds.length,
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
        const companion = COMPANIONS.find((c) => c.id === companionId);
        let adjustedValue = value;
        if (companion && value > 0) {
          const affinityBonus = get().getClassCompanionAffinityBonus(companion);
          adjustedValue = value + affinityBonus;
        }
        set((state) => {
          const existing = state.companionAffinities.find((a) => a.companionId === companionId);
          if (existing) {
            const newValue = existing.value + adjustedValue;
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
              { companionId, value: adjustedValue, level: getAffinityLevel(adjustedValue) },
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
          (sum, c) => sum + get().getCompanionEffectiveAttack(c),
          0
        );
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('attack');
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((baseAttack + companionAttack + bondBonus.attack + mapModifierBonus) * affinityMultiplier);
      },

      calculateDefense: () => {
        const state = get();
        const baseDefense = state.player.stats.defense;
        const formationCompanions = get().getFormationCompanions();
        const companionDefense = formationCompanions.reduce(
          (sum, c) => sum + get().getCompanionEffectiveDefense(c),
          0
        );
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('defense');
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((baseDefense + companionDefense + bondBonus.defense + mapModifierBonus) * affinityMultiplier);
      },

      calculateGoldBonus: () => {
        const state = get();
        const mapModifierBonus = get().getMapModifierTotalBonus('gold') * 0.01;
        const talentBonus = get().getTotalTalentBonus('gold').percent;
        const classBonus = get().getClassIdleGoldMultiplier() - 1;
        return 1 + (state.rebirthBonuses['gold_boost'] || 0) + mapModifierBonus + talentBonus + classBonus;
      },

      calculateExpBonus: () => {
        const state = get();
        const mapModifierBonus = get().getMapModifierTotalBonus('exp') * 0.01;
        const talentBonus = get().getTotalTalentBonus('exp').percent;
        const classBonus = get().getClassIdleExpMultiplier() - 1;
        return 1 + (state.rebirthBonuses['exp_boost'] || 0) + mapModifierBonus + talentBonus + classBonus;
      },

      getTotalAttack: () => {
        const state = get();
        const playerAttack = state.player.stats.attack;
        const formationCompanions = get().getFormationCompanions();
        const companionAttack = formationCompanions.reduce(
          (sum, c) => sum + get().getCompanionEffectiveAttack(c),
          0
        );
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('attack');
        const factionBonus = get().getFactionBonus('attack');
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((playerAttack + companionAttack + bondBonus.attack + mapModifierBonus + factionBonus) * affinityMultiplier);
      },

      getTotalDefense: () => {
        const state = get();
        const playerDefense = state.player.stats.defense;
        const formationCompanions = get().getFormationCompanions();
        const companionDefense = formationCompanions.reduce(
          (sum, c) => sum + get().getCompanionEffectiveDefense(c),
          0
        );
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('defense');
        const factionBonus = get().getFactionBonus('defense');
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((playerDefense + companionDefense + bondBonus.defense + mapModifierBonus + factionBonus) * affinityMultiplier);
      },

      getMapModifierTotalBonus: (stat) => {
        const state = get();
        const currentAreaId = state.currentAreaId;
        if (!currentAreaId) return 0;
        return get().getMapAreaModifierBonus(currentAreaId, stat);
      },

      getAffinityTotalBonus: (stat) => {
        const formationCompanions = get().getFormationCompanions();
        return formationCompanions.reduce((sum, c) => {
          const affinity = get().getCompanionAffinity(c.id);
          if (affinity.value >= 60) return sum + (stat === 'attack' || stat === 'defense' ? 5 : 0);
          if (affinity.value >= 30) return sum + (stat === 'attack' || stat === 'defense' ? 2 : 0);
          if (affinity.value >= 10) return sum + (stat === 'attack' || stat === 'defense' ? 1 : 0);
          if (affinity.value < -30) return sum + (stat === 'attack' || stat === 'defense' ? -2 : 0);
          return sum;
        }, 0);
      },

      getCompanionAffinityBonusMultiplier: () => {
        const formationCompanions = get().getFormationCompanions();
        if (formationCompanions.length === 0) return 1.0;
        const totalAffinity = formationCompanions.reduce((sum, c) => {
          const affinity = get().getCompanionAffinity(c.id);
          return sum + affinity.value;
        }, 0);
        const avgAffinity = totalAffinity / formationCompanions.length;
        if (avgAffinity >= 60) return 1.15;
        if (avgAffinity >= 30) return 1.08;
        if (avgAffinity >= 10) return 1.03;
        if (avgAffinity < -30) return 0.92;
        return 1.0;
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
        const affinity = get().getCompanionAffinity(companion.id);
        let affinityDiscount = 0;
        if (affinity.value >= 60) affinityDiscount = 0.25;
        else if (affinity.value >= 30) affinityDiscount = 0.15;
        else if (affinity.value >= 10) affinityDiscount = 0.08;
        else if (affinity.value < -30) affinityDiscount = -0.1;

        let baseDiscount = 0;
        if (companion.areaId) {
          baseDiscount = get().getAreaRecruitDiscount(companion.areaId);
        }

        const totalDiscount = Math.min(0.6, baseDiscount + affinityDiscount);
        return Math.max(1, Math.floor(companion.cost * (1 - totalDiscount)));
      },

      canRecruitCompanion: (companion) => {
        const affinity = get().getCompanionAffinity(companion.id);
        if (affinity.value <= -50) return false;
        if (companion.minReputationLevel && companion.minReputationLevel > 0) {
          if (affinity.value >= 30) return true;
        }
        if (companion.areaId && companion.minReputationLevel) {
          const repLevel = get().getAreaReputationLevel(companion.areaId);
          if (repLevel < companion.minReputationLevel) {
            if (affinity.value < 30) return false;
          }
        }
        return true;
      },

      buyShopItem: (itemId) => {
        const state = get();
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const repLevel = get().getAreaReputationLevel(item.areaId);
        if (repLevel < item.minReputationLevel) return false;

        const stock = get().getItemStock(itemId, item.areaId);
        const inventory = get().getShopInventory(item.areaId);
        if (inventory && inventory.items.length > 0 && stock <= 0) return false;

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

        set((state) => {
          const newInventories = state.shopInventories.map((inv) => {
            if (inv.areaId !== item.areaId) return inv;
            return {
              ...inv,
              items: inv.items.map((invItem) => {
                if (invItem.itemId !== itemId) return invItem;
                return { ...invItem, currentStock: Math.max(0, invItem.currentStock - 1) };
              }),
            };
          });
          return { shopInventories: newInventories };
        });

        get().addBattleLog(`🛒 购买了 ${item.name}！`, 'event');
        get().addAreaReputation(item.areaId, 5);
        return true;
      },

      getShopInventory: (areaId) => {
        return get().shopInventories.find((inv) => inv.areaId === areaId);
      },

      getItemStock: (itemId, areaId) => {
        const inventory = get().getShopInventory(areaId);
        if (!inventory) return 0;
        const invItem = inventory.items.find((i) => i.itemId === itemId);
        return invItem?.currentStock ?? 0;
      },

      shouldRestockShop: (areaId) => {
        const inventory = get().getShopInventory(areaId);
        if (!inventory) return true;
        if (inventory.items.length === 0) return true;
        const RESTOCK_INTERVAL = 5 * 60 * 1000;
        return Date.now() - inventory.lastRestockTime > RESTOCK_INTERVAL;
      },

      getAvailableShopItems: (areaId) => {
        const state = get();
        const playerLevel = state.player.stats.level;
        const repLevel = get().getAreaReputationLevel(areaId);
        const consequenceTags = state.consequenceTags;
        const inventory = get().getShopInventory(areaId);

        return SHOP_ITEMS.filter((item) => {
          if (item.areaId !== areaId) return false;
          if (item.minReputationLevel > repLevel) return false;
          if (item.minPlayerLevel && playerLevel < item.minPlayerLevel) return false;
          if (item.maxPlayerLevel && playerLevel > item.maxPlayerLevel) return false;
          if (item.requiredTags && !item.requiredTags.every((tag) => consequenceTags.includes(tag))) return false;

          const stock = inventory ? get().getItemStock(item.id, areaId) : 0;
          if (inventory && inventory.items.length > 0 && stock <= 0) return false;

          return true;
        });
      },

      restockShop: (areaId, triggerType = 'manual') => {
        const state = get();
        const playerLevel = state.player.stats.level;
        const playerGold = state.player.stats.gold;
        const repLevel = get().getAreaReputationLevel(areaId);
        const consequenceTags = state.consequenceTags;
        const area = state.mapAreas.find((a) => a.id === areaId);
        if (!area) return;

        const areaItems = SHOP_ITEMS.filter((item) => {
          if (item.areaId !== areaId) return false;
          if (item.minReputationLevel > repLevel) return false;
          if (item.minPlayerLevel && playerLevel < item.minPlayerLevel) return false;
          if (item.maxPlayerLevel && playerLevel > item.maxPlayerLevel) return false;
          if (item.requiredTags && !item.requiredTags.every((tag) => consequenceTags.includes(tag))) return false;
          return true;
        });

        const avgItemCost = areaItems.length > 0
          ? areaItems.reduce((sum, item) => sum + item.baseCost, 0) / areaItems.length
          : 100;

        const isGoldRich = playerGold > avgItemCost * 3;
        const isGoldPoor = playerGold < avgItemCost;

        const weightedItems = areaItems.map((item) => {
          let weight = item.weight ?? 1.0;

          if (item.rarity) {
            const RARITY_WEIGHT: Record<string, number> = {
              common: 1.0,
              rare: 0.6,
              epic: 0.3,
              legendary: 0.1,
            };
            weight *= RARITY_WEIGHT[item.rarity] ?? 1.0;
          }

          if (isGoldRich && item.baseCost > avgItemCost * 1.5) {
            weight *= 1.5;
          }
          if (isGoldPoor && item.baseCost < avgItemCost * 0.8) {
            weight *= 1.8;
          }
          if (isGoldPoor && item.baseCost > avgItemCost * 1.2) {
            weight *= 0.4;
          }

          if (triggerType === 'event' && item.requiredTags && item.requiredTags.length > 0) {
            weight *= 2.0;
          }

          if (triggerType === 'map_change') {
            weight *= 1.2;
          }

          return { item, weight: Math.max(0.1, weight) };
        });

        const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0);
        const targetItemCount = Math.min(6, Math.max(3, Math.floor(areaItems.length * 0.6)));
        const selectedItems: typeof areaItems = [];
        const usedIndices = new Set<number>();

        for (let i = 0; i < targetItemCount && usedIndices.size < weightedItems.length; i++) {
          let roll = Math.random() * totalWeight;
          let selectedIndex = 0;

          for (let j = 0; j < weightedItems.length; j++) {
            if (usedIndices.has(j)) continue;
            roll -= weightedItems[j].weight;
            if (roll <= 0) {
              selectedIndex = j;
              break;
            }
          }

          if (!usedIndices.has(selectedIndex)) {
            usedIndices.add(selectedIndex);
            selectedItems.push(weightedItems[selectedIndex].item);
          }
        }

        const now = Date.now();
        const newInventoryItems = selectedItems.map((item) => ({
          itemId: item.id,
          currentStock: item.stock ?? 3,
          maxStock: item.stock ?? 3,
          restockTime: now,
        }));

        set((state) => ({
          shopInventories: state.shopInventories.map((inv) =>
            inv.areaId === areaId
              ? { ...inv, items: newInventoryItems, lastRestockTime: now }
              : inv
          ),
        }));

        const triggerNames: Record<string, string> = {
          map_change: '地图切换',
          event: '事件影响',
          timer: '定时刷新',
          manual: '手动刷新',
        };

        get().addBattleLog(
          `🔄 ${area.name}商店已补货（${triggerNames[triggerType]}），新到 ${selectedItems.length} 种商品`,
          'system'
        );
      },

      calculateOfflineRewards: () => {
        const state = get();
        const now = Date.now();
        const offlineTime = now - state.lastOnlineTime;
        const offlineSeconds = Math.min(offlineTime / 1000, 8 * 60 * 60);
        const offlineMinutes = Math.floor(offlineSeconds / 60);

        const currentArea = state.mapAreas.find((a) => a.id === state.currentAreaId);
        if (!currentArea || offlineSeconds < 60) {
          return { exp: 0, gold: 0, breakdown: null };
        }

        const MAP_DIFFICULTY: Record<string, { multiplier: number; name: string }> = {
          forest: { multiplier: 1.0, name: '简单' },
          cave: { multiplier: 1.5, name: '普通' },
          ruins: { multiplier: 2.2, name: '困难' },
          volcano: { multiplier: 3.0, name: '噩梦' },
        };
        const mapDiff = MAP_DIFFICULTY[currentArea.id] || { multiplier: 1.0, name: '简单' };

        const formationCompanions = get().getFormationCompanions();
        const companionCount = formationCompanions.length;
        const RARITY_BONUS: Record<string, number> = {
          common: 0,
          rare: 0.15,
          epic: 0.30,
          legendary: 0.60,
        };
        const companionRarityBonus = formationCompanions.reduce(
          (sum, c) => sum + (RARITY_BONUS[c.rarity] || 0),
          0
        );
        const companionStarBonus = formationCompanions.reduce(
          (sum, c) => sum + (c.stars - 1) * 0.05,
          0
        );
        const companionCountBonus = companionCount * 0.08;
        const companionPowerBonus = 1 + formationCompanions.reduce(
          (sum, c) => sum + (get().getCompanionEffectiveAttack(c) + get().getCompanionEffectiveDefense(c)) * 0.001,
          0
        );
        const bondBonus = get().getBondBonus();
        const bondPowerBonus = 1 + (bondBonus.attack + bondBonus.defense) * 0.002;
        const totalCompanionBonus = companionCountBonus + companionRarityBonus + companionStarBonus;

        const areaModifiers = get().getMapAreaModifiers(currentArea.id);
        const MODIFIER_BONUS: Record<string, number> = {
          blessing: 0.20,
          hiddenPath: 0.15,
          hazard: -0.10,
          cursed: -0.25,
          locked: 0,
        };
        const eventModifiers = areaModifiers.map((m) => ({
          name: m.name,
          icon: MAP_MODIFIER_ICONS[m.type] || '❓',
          bonus: MODIFIER_BONUS[m.type] || 0,
        }));
        const eventStatusBonus = eventModifiers.reduce((sum, m) => sum + m.bonus, 0);

        const avgMonster = currentArea.monsters.reduce(
          (acc, m) => ({
            attack: acc.attack + m.attack,
            defense: acc.defense + m.defense,
            hp: acc.hp + m.hp,
            expReward: acc.expReward + m.expReward,
            goldReward: acc.goldReward + m.goldReward,
          }),
          { attack: 0, defense: 0, hp: 0, expReward: 0, goldReward: 0 }
        );
        const monsterCount = currentArea.monsters.length;
        const avgMonsterPower = (avgMonster.attack + avgMonster.defense + avgMonster.hp / 10) / monsterCount;
        const playerTotalPower = get().getTotalAttack() + get().getTotalDefense() + state.player.stats.maxHp / 10;
        const powerRatio = avgMonsterPower > 0 ? playerTotalPower / avgMonsterPower : 5;
        
        let deathRiskPercent: number;
        let deathRiskMultiplier: number;
        let deathRiskLevel: string;
        
        if (powerRatio >= 5) {
          deathRiskPercent = 5;
          deathRiskMultiplier = 1.0;
          deathRiskLevel = '安全';
        } else if (powerRatio >= 3) {
          deathRiskPercent = 15;
          deathRiskMultiplier = 1.1;
          deathRiskLevel = '低风险';
        } else if (powerRatio >= 1.5) {
          deathRiskPercent = 35;
          deathRiskMultiplier = 1.25;
          deathRiskLevel = '中风险';
        } else if (powerRatio >= 0.8) {
          deathRiskPercent = 60;
          deathRiskMultiplier = 1.5;
          deathRiskLevel = '高风险';
        } else {
          deathRiskPercent = 85;
          deathRiskMultiplier = 2.0;
          deathRiskLevel = '极高风险';
        }

        const efficiencyMultiplier = 0.5;

        const killsPerSecond = 0.3 * companionPowerBonus * bondPowerBonus;
        const totalKills = Math.floor(offlineSeconds * killsPerSecond);
        const dropBonus = get().getAreaDropBonus(state.currentAreaId);

        const baseExpPerKill = avgMonster.expReward / monsterCount;
        const baseGoldPerKill = avgMonster.goldReward / monsterCount;
        const baseExp = Math.floor(totalKills * baseExpPerKill);
        const baseGold = Math.floor(totalKills * baseGoldPerKill);

        const expBonus = state.calculateExpBonus();
        const goldBonus = state.calculateGoldBonus();

        const expReward = Math.floor(
          baseExp
          * efficiencyMultiplier
          * mapDiff.multiplier
          * (1 + totalCompanionBonus)
          * (1 + eventStatusBonus)
          * deathRiskMultiplier
          * expBonus
          * (1 + dropBonus)
        );
        const goldReward = Math.floor(
          baseGold
          * efficiencyMultiplier
          * mapDiff.multiplier
          * (1 + totalCompanionBonus)
          * (1 + eventStatusBonus)
          * deathRiskMultiplier
          * goldBonus
          * (1 + dropBonus)
        );

        const deathLossRate = 0.10;
        const expectedDeathLossExp = Math.floor(expReward * deathRiskPercent / 100 * deathLossRate);
        const expectedDeathLossGold = Math.floor(goldReward * deathRiskPercent / 100 * deathLossRate);

        const RECOVERY_COSTS: Record<string, { hpPerGold: number; mpPerGold: number }> = {
          forest: { hpPerGold: 1.0, mpPerGold: 0.75 },
          cave: { hpPerGold: 1.0, mpPerGold: 1.0 },
          ruins: { hpPerGold: 0.75, mpPerGold: 0.75 },
          volcano: { hpPerGold: 0.67, mpPerGold: 0.6 },
        };
        const recoveryCost = RECOVERY_COSTS[currentArea.id] || RECOVERY_COSTS.forest;
        const avgHpLossPerDeath = state.player.stats.maxHp * 0.8;
        const avgMpLossPerDeath = state.player.stats.maxMp * 0.6;
        const expectedDeaths = deathRiskPercent / 100 * 2;
        const recoveryHpCost = Math.floor((avgHpLossPerDeath / recoveryCost.hpPerGold) * expectedDeaths);
        const recoveryMpCost = Math.floor((avgMpLossPerDeath / recoveryCost.mpPerGold) * expectedDeaths);
        const totalRecoveryCost = recoveryHpCost + recoveryMpCost;

        const netExpProfit = expReward - expectedDeathLossExp;
        const netGoldProfit = goldReward - expectedDeathLossGold - totalRecoveryCost;

        const baseExpContrib = Math.floor(baseExp * efficiencyMultiplier * expBonus * (1 + dropBonus));
        const mapExpContrib = Math.floor(baseExp * efficiencyMultiplier * (mapDiff.multiplier - 1) * expBonus * (1 + dropBonus));
        const companionExpContrib = Math.floor(baseExp * efficiencyMultiplier * mapDiff.multiplier * totalCompanionBonus * expBonus * (1 + dropBonus));
        const eventExpContrib = Math.floor(baseExp * efficiencyMultiplier * mapDiff.multiplier * (1 + totalCompanionBonus) * eventStatusBonus * expBonus * (1 + dropBonus));
        const riskExpContrib = expReward - baseExpContrib - mapExpContrib - companionExpContrib - eventExpContrib;

        const baseGoldContrib = Math.floor(baseGold * efficiencyMultiplier * goldBonus * (1 + dropBonus));
        const mapGoldContrib = Math.floor(baseGold * efficiencyMultiplier * (mapDiff.multiplier - 1) * goldBonus * (1 + dropBonus));
        const companionGoldContrib = Math.floor(baseGold * efficiencyMultiplier * mapDiff.multiplier * totalCompanionBonus * goldBonus * (1 + dropBonus));
        const eventGoldContrib = Math.floor(baseGold * efficiencyMultiplier * mapDiff.multiplier * (1 + totalCompanionBonus) * eventStatusBonus * goldBonus * (1 + dropBonus));
        const riskGoldContrib = goldReward - baseGoldContrib - mapGoldContrib - companionGoldContrib - eventGoldContrib;

        const rewardComposition = [
          {
            source: '基础收益',
            expContribution: baseExpContrib,
            goldContribution: baseGoldContrib,
            expPercent: expReward > 0 ? baseExpContrib / expReward : 0,
            goldPercent: goldReward > 0 ? baseGoldContrib / goldReward : 0,
          },
          {
            source: '地图难度',
            expContribution: mapExpContrib,
            goldContribution: mapGoldContrib,
            expPercent: expReward > 0 ? mapExpContrib / expReward : 0,
            goldPercent: goldReward > 0 ? mapGoldContrib / goldReward : 0,
          },
          {
            source: '伙伴加成',
            expContribution: companionExpContrib,
            goldContribution: companionGoldContrib,
            expPercent: expReward > 0 ? companionExpContrib / expReward : 0,
            goldPercent: goldReward > 0 ? companionGoldContrib / goldReward : 0,
          },
          {
            source: '事件状态',
            expContribution: eventExpContrib,
            goldContribution: eventGoldContrib,
            expPercent: expReward > 0 ? eventExpContrib / expReward : 0,
            goldPercent: goldReward > 0 ? eventGoldContrib / goldReward : 0,
          },
          {
            source: '风险溢价',
            expContribution: riskExpContrib,
            goldContribution: riskGoldContrib,
            expPercent: expReward > 0 ? riskExpContrib / expReward : 0,
            goldPercent: goldReward > 0 ? riskGoldContrib / goldReward : 0,
          },
        ];

        const mapComparison = state.mapAreas
          .filter((a) => a.unlocked)
          .map((area) => {
            const areaMapDiff = MAP_DIFFICULTY[area.id] || { multiplier: 1.0, name: '简单' };
            const areaAvgMonster = area.monsters.reduce(
              (acc, m) => ({
                attack: acc.attack + m.attack,
                defense: acc.defense + m.defense,
                hp: acc.hp + m.hp,
                expReward: acc.expReward + m.expReward,
                goldReward: acc.goldReward + m.goldReward,
              }),
              { attack: 0, defense: 0, hp: 0, expReward: 0, goldReward: 0 }
            );
            const areaMonsterCount = area.monsters.length;
            const areaAvgPower = (areaAvgMonster.attack + areaAvgMonster.defense + areaAvgMonster.hp / 10) / areaMonsterCount;
            const areaPowerRatio = areaAvgPower > 0 ? playerTotalPower / areaAvgPower : 5;

            let areaDeathRiskPercent: number;
            let areaDeathRiskLevel: string;
            let areaDeathRiskMultiplier: number;

            if (areaPowerRatio >= 5) {
              areaDeathRiskPercent = 5;
              areaDeathRiskMultiplier = 1.0;
              areaDeathRiskLevel = '安全';
            } else if (areaPowerRatio >= 3) {
              areaDeathRiskPercent = 15;
              areaDeathRiskMultiplier = 1.1;
              areaDeathRiskLevel = '低风险';
            } else if (areaPowerRatio >= 1.5) {
              areaDeathRiskPercent = 35;
              areaDeathRiskMultiplier = 1.25;
              areaDeathRiskLevel = '中风险';
            } else if (areaPowerRatio >= 0.8) {
              areaDeathRiskPercent = 60;
              areaDeathRiskMultiplier = 1.5;
              areaDeathRiskLevel = '高风险';
            } else {
              areaDeathRiskPercent = 85;
              areaDeathRiskMultiplier = 2.0;
              areaDeathRiskLevel = '极高风险';
            }

            const areaBaseExpPerKill = areaAvgMonster.expReward / areaMonsterCount;
            const areaBaseGoldPerKill = areaAvgMonster.goldReward / areaMonsterCount;
            const areaBaseExp = Math.floor(totalKills * areaBaseExpPerKill);
            const areaBaseGold = Math.floor(totalKills * areaBaseGoldPerKill);

            const areaExpReward = Math.floor(
              areaBaseExp
              * efficiencyMultiplier
              * areaMapDiff.multiplier
              * (1 + totalCompanionBonus)
              * areaDeathRiskMultiplier
              * expBonus
              * (1 + dropBonus)
            );
            const areaGoldReward = Math.floor(
              areaBaseGold
              * efficiencyMultiplier
              * areaMapDiff.multiplier
              * (1 + totalCompanionBonus)
              * areaDeathRiskMultiplier
              * goldBonus
              * (1 + dropBonus)
            );

            const riskRewardRatio = (areaExpReward + areaGoldReward * 2) / (areaDeathRiskPercent + 1);

            return {
              areaId: area.id,
              areaName: area.name,
              difficultyName: areaMapDiff.name,
              expReward: areaExpReward,
              goldReward: areaGoldReward,
              deathRiskLevel: areaDeathRiskLevel,
              deathRiskPercent: areaDeathRiskPercent,
              riskRewardRatio,
            };
          })
          .sort((a, b) => b.riskRewardRatio - a.riskRewardRatio);

        const breakdown: OfflineRewardBreakdown = {
          baseExp,
          baseGold,
          mapDifficultyMultiplier: mapDiff.multiplier,
          mapDifficultyName: mapDiff.name,
          companionBonus: totalCompanionBonus,
          companionCount,
          eventStatusBonus,
          eventModifiers,
          deathRiskMultiplier,
          deathRiskLevel,
          deathRiskPercent,
          efficiencyMultiplier,
          finalExp: expReward,
          finalGold: goldReward,
          offlineMinutes,
          expectedDeathLossExp,
          expectedDeathLossGold,
          deathLossRate,
          recoveryHpCost,
          recoveryMpCost,
          totalRecoveryCost,
          netExpProfit,
          netGoldProfit,
          rewardComposition,
          mapComparison,
          townRewards: (() => {
            const town = state.calculateOfflineTownRewards();
            return {
              gold: town.gold,
              exp: town.exp,
              soulOrbs: town.soulOrbs,
              buildingRewards: town.breakdown.buildingRewards,
              stationBonus: town.breakdown.stationBonus,
            };
          })(),
        };

        return { exp: expReward, gold: goldReward, breakdown };
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

        if (rewards.breakdown?.townRewards) {
          const town = rewards.breakdown.townRewards;
          if (town.gold > 0 || town.exp > 0 || town.soulOrbs > 0) {
            get().collectOfflineTownRewards();
          }
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
          .reduce((sum, c) => sum + get().getCompanionEffectiveAttack(c) + get().getCompanionEffectiveDefense(c), 0);
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

        get().updateSeasonTaskProgress('expedition', 1);

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

      getPlayerSkills: () => {
        const state = get();
        const playerClass = state.player.class;
        const classMap: Record<string, string> = {
          '战士': 'warrior',
          '法师': 'mage',
          '盗贼': 'rogue',
          '牧师': 'priest',
          '弓箭手': 'archer',
          '骑士': 'knight',
        };
        const classKey = classMap[playerClass] || 'warrior';
        return SKILLS[classKey] || [];
      },

      getTotalSpeed: () => {
        const state = get();
        const baseSpeed = state.player.stats.speed;
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('speed');
        const factionBonus = get().getFactionBonus('speed');
        const rebirthBonus = state.rebirthBonuses['speed_boost'] || 0;
        const talentPct = get().getTotalTalentBonus('speed').percent;
        const talentFlat = get().getTotalTalentBonus('speed').flat;
        return Math.floor((baseSpeed + bondBonus.speed + mapModifierBonus + factionBonus + talentFlat) * (1 + rebirthBonus + talentPct));
      },

      useMp: (amount) => {
        const state = get();
        if (state.player.stats.mp < amount) return false;
        set((s) => ({
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              mp: s.player.stats.mp - amount,
            },
          },
        }));
        return true;
      },

      getMonsterPhases: () => {
        const state = get();
        if (!state.currentMonster) return [];
        return MONSTER_PHASES[state.currentMonster.id] || [];
      },

      getMonsterPhaseMultipliers: () => {
        const state = get();
        if (!state.currentMonster) return { attack: 1, defense: 1, speed: 1 };
        const phases = MONSTER_PHASES[state.currentMonster.id] || [];
        const hpPercent = state.currentMonster.hp / state.currentMonster.maxHp;
        
        let attackMult = 1;
        let defenseMult = 1;
        let speedMult = 1;
        
        for (const phase of phases) {
          if (hpPercent <= phase.hpThreshold) {
            attackMult = phase.attackMultiplier;
            defenseMult = phase.defenseMultiplier;
            speedMult = phase.speedMultiplier;
          }
        }
        
        return { attack: attackMult, defense: defenseMult, speed: speedMult };
      },

      updateMonsterPhase: () => {
        const state = get();
        if (!state.currentMonster) return;
        const phases = MONSTER_PHASES[state.currentMonster.id] || [];
        if (phases.length === 0) return;
        
        const hpPercent = state.currentMonster.hp / state.currentMonster.maxHp;
        let phaseIndex = -1;
        
        for (let i = phases.length - 1; i >= 0; i--) {
          if (hpPercent <= phases[i].hpThreshold) {
            phaseIndex = i;
            break;
          }
        }
        
        if (phaseIndex !== state.currentMonster.currentPhase && phaseIndex >= 0) {
          const phase = phases[phaseIndex];
          const newMonster = {
            ...state.currentMonster,
            currentPhase: phaseIndex,
            attack: Math.floor(state.currentMonster.baseAttack * phase.attackMultiplier),
            defense: Math.floor(state.currentMonster.baseDefense * phase.defenseMultiplier),
            speed: Math.floor(state.currentMonster.baseSpeed * phase.speedMultiplier),
            color: phase.color || state.currentMonster.color,
          };
          set({ currentMonster: newMonster });
          get().addBattleLog(`⚠️ ${state.currentMonster.name} 进入 ${phase.name} 阶段！${phase.description}`, 'phase');
        }
      },

      getTalentLevel: (talentId) => {
        const state = get();
        const node = state.player.inheritedTalents.find((t) => t.talentId === talentId);
        return node?.currentLevel || 0;
      },

      getTalentCost: (talent, currentLevel) => {
        return Math.ceil(talent.baseCost * Math.pow(talent.costMultiplier, currentLevel));
      },

      isTalentUnlocked: (talent) => {
        const state = get();
        if (talent.requiredRebirthCount && state.player.rebirthCount < talent.requiredRebirthCount) {
          return false;
        }
        if (talent.classRestriction && talent.classRestriction.length > 0 && state.player.class) {
          if (!talent.classRestriction.includes(state.player.class)) {
            return false;
          }
        }
        if (talent.raceRestriction && talent.raceRestriction.length > 0 && state.player.race) {
          if (!talent.raceRestriction.includes(state.player.race)) {
            return false;
          }
        }
        if (talent.prerequisiteTalentIds && talent.prerequisiteTalentIds.length > 0) {
          for (const prereqId of talent.prerequisiteTalentIds) {
            const prereq = TALENTS.find((t) => t.id === prereqId);
            if (!prereq) continue;
            const prereqLevel = get().getTalentLevel(prereqId);
            if (prereqLevel < prereq.maxLevel) {
              return false;
            }
          }
        }
        return true;
      },

      canUpgradeTalent: (talent) => {
        const state = get();
        const currentLevel = get().getTalentLevel(talent.id);
        if (currentLevel >= talent.maxLevel) return false;
        if (!get().isTalentUnlocked(talent)) return false;
        const cost = get().getTalentCost(talent, currentLevel);
        return state.player.stats.soulOrbs >= cost;
      },

      upgradeTalent: (talentId) => {
        const talent = TALENTS.find((t) => t.id === talentId);
        if (!talent) return false;

        const currentLevel = get().getTalentLevel(talentId);
        if (!get().canUpgradeTalent(talent)) return false;

        const cost = get().getTalentCost(talent, currentLevel);

        set((state) => {
          const newTalents = [...state.player.inheritedTalents];
          const existingIndex = newTalents.findIndex((t) => t.talentId === talentId);
          if (existingIndex >= 0) {
            newTalents[existingIndex] = {
              ...newTalents[existingIndex],
              currentLevel: newTalents[existingIndex].currentLevel + 1,
            };
          } else {
            newTalents.push({ talentId, currentLevel: 1 });
          }

          let extraTalentPoints = 0;
          if (talentId === 'race_human_wisdom') {
            extraTalentPoints = 3;
          }

          return {
            player: {
              ...state.player,
              stats: {
                ...state.player.stats,
                soulOrbs: state.player.stats.soulOrbs - cost,
              },
              inheritedTalents: newTalents,
              talentPoints: state.player.talentPoints + extraTalentPoints,
            },
          };
        });

        get().addBattleLog(
          `🌟 天赋 ${talent.name} 升至 ${currentLevel + 1} 级！消耗 ${cost} 魂珠`,
          'system'
        );
        return true;
      },

      getTalentBonus: (type) => {
        const state = get();
        let total = 0;
        for (const node of state.player.inheritedTalents) {
          const talent = TALENTS.find((t) => t.id === node.talentId);
          if (!talent) continue;
          for (const effect of talent.effects) {
            if (effect.type === type && effect.isPercent) {
              total += effect.value * node.currentLevel;
            }
          }
        }
        return total;
      },

      getTalentBonusFlat: (type) => {
        const state = get();
        let total = 0;
        for (const node of state.player.inheritedTalents) {
          const talent = TALENTS.find((t) => t.id === node.talentId);
          if (!talent) continue;
          for (const effect of talent.effects) {
            if (effect.type === type && !effect.isPercent) {
              total += effect.value * node.currentLevel;
            }
          }
        }
        return total;
      },

      getActiveSynergies: () => {
        const activeIds: string[] = [];
        for (const synergy of TALENT_SYNERGIES) {
          const allActive = synergy.requiredTalentIds.every((tid) => {
            const talent = TALENTS.find((t) => t.id === tid);
            if (!talent) return false;
            const level = get().getTalentLevel(tid);
            return level >= 1;
          });
          if (allActive) {
            activeIds.push(synergy.id);
          }
        }
        return activeIds;
      },

      getSynergyBonus: (type) => {
        let total = 0;
        const activeSynergies = get().getActiveSynergies();
        for (const synergyId of activeSynergies) {
          const synergy = TALENT_SYNERGIES.find((s) => s.id === synergyId);
          if (!synergy) continue;
          for (const effect of synergy.effects) {
            if (effect.type === type && effect.isPercent) {
              total += effect.value;
            }
          }
        }
        return total;
      },

      getSynergyBonusFlat: (type) => {
        let total = 0;
        const activeSynergies = get().getActiveSynergies();
        for (const synergyId of activeSynergies) {
          const synergy = TALENT_SYNERGIES.find((s) => s.id === synergyId);
          if (!synergy) continue;
          for (const effect of synergy.effects) {
            if (effect.type === type && !effect.isPercent) {
              total += effect.value;
            }
          }
        }
        return total;
      },

      getTotalTalentBonus: (type) => {
        return {
          percent: get().getTalentBonus(type) + get().getSynergyBonus(type),
          flat: get().getTalentBonusFlat(type) + get().getSynergyBonusFlat(type),
        };
      },

      resetTalents: () => {
        const state = get();
        const totalCost = state.player.inheritedTalents.reduce((sum, node) => {
          const talent = TALENTS.find((t) => t.id === node.talentId);
          if (!talent) return sum;
          let cost = 0;
          for (let i = 0; i < node.currentLevel; i++) {
            cost += get().getTalentCost(talent, i);
          }
          return sum + cost;
        }, 0);
        const refund = Math.floor(totalCost * 0.7);

        set((state) => ({
          player: {
            ...state.player,
            inheritedTalents: [],
            talentPoints: 0,
            stats: {
              ...state.player.stats,
              soulOrbs: state.player.stats.soulOrbs + refund,
            },
          },
        }));

        get().addBattleLog(
          `🔄 天赋已重置，返还 ${refund} 魂珠（70%）`,
          'system'
        );
        return true;
      },

      getPowerBreakdown: () => {
        const state = get();
        const formationCompanions = get().getFormationCompanions();
        const bondBonus = get().getBondBonus();
        const rebirthBonuses = state.rebirthBonuses;
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();

        const calcComponent = (
          baseStat: number,
          statType: keyof PlayerStats
        ): PowerComponent => {
          const companionContribution = formationCompanions.reduce((s, c) => {
            if (statType === 'attack') return s + computeEffectiveAttack(c);
            if (statType === 'defense') return s + computeEffectiveDefense(c);
            return s;
          }, 0);

          type BondKey = keyof typeof bondBonus;
          const bondStatKey = statType === 'maxHp' ? 'hp' as const : statType as BondKey;
          const bondContribution = (bondStatKey in bondBonus) ? bondBonus[bondStatKey] : 0;
          const rebirthPct = statType === 'attack' ? (rebirthBonuses['attack_boost'] || 0)
            : statType === 'defense' ? (rebirthBonuses['defense_boost'] || 0)
            : statType === 'maxHp' ? (rebirthBonuses['hp_boost'] || 0)
            : statType === 'speed' ? (rebirthBonuses['speed_boost'] || 0)
            : 0;
          const totalRebirthBonus = state.player.totalRebirthBonus * 0.01;
          const totalRebirthPct = rebirthPct + (statType === 'attack' || statType === 'defense' || statType === 'maxHp' ? totalRebirthBonus : 0);

          const talentBonus = get().getTotalTalentBonus(statType === 'maxHp' ? 'hp' : statType as TalentEffect['type']);
          const mapModifierBonus = get().getMapModifierTotalBonus(statType);
          const affinityBonus = get().getAffinityTotalBonus(statType);

          const preMultiplier = baseStat + talentBonus.flat + mapModifierBonus + affinityBonus;
          const postRebirth = preMultiplier * (1 + totalRebirthPct + talentBonus.percent);
          const withCompanion = postRebirth + companionContribution + bondContribution;
          const total = Math.floor(withCompanion * affinityMultiplier);

          const rebirthValue = Math.floor(preMultiplier * totalRebirthPct);
          const talentValue = Math.floor(preMultiplier * talentBonus.percent);
          const affinityValue = Math.floor(withCompanion * (affinityMultiplier - 1));

          return {
            base: baseStat,
            companion: companionContribution,
            bond: bondContribution,
            rebirthPercent: totalRebirthPct,
            rebirthValue,
            talentPercent: talentBonus.percent,
            talentValue: talentValue + talentBonus.flat,
            mapModifier: mapModifierBonus,
            affinityPercent: affinityMultiplier - 1,
            affinityValue,
            total,
          };
        };

        const attack = calcComponent(state.player.stats.attack, 'attack');
        const defense = calcComponent(state.player.stats.defense, 'defense');
        const hp = calcComponent(state.player.stats.maxHp, 'maxHp');
        const speed = calcComponent(state.player.stats.speed, 'speed');

        const companionDetails = formationCompanions.map((c) => ({
          name: c.name,
          rarity: c.rarity,
          stars: c.stars,
          attack: computeEffectiveAttack(c),
          defense: computeEffectiveDefense(c),
          level: c.level,
        }));

        const rebirthDetails: PowerBreakdown['rebirthDetails'] = [];
        Object.entries(rebirthBonuses).forEach(([id, value]) => {
          if (value > 0) {
            const option = REBIRTH_OPTIONS.find((o) => o.id === id);
            if (option) {
              rebirthDetails.push({
                id,
                name: option.name,
                icon: option.icon,
                value,
              });
            }
          }
        });

        const talentDetails = state.player.inheritedTalents
          .filter((node) => node.currentLevel > 0)
          .map((node) => {
            const talent = TALENTS.find((t) => t.id === node.talentId);
            return {
              name: talent?.name || '未知天赋',
              level: node.currentLevel,
              category: talent?.category || 'combat',
              rarity: talent?.rarity || 'common',
              icon: talent?.icon || '🌟',
            };
          });

        const mapModifierDetails: PowerBreakdown['mapModifierDetails'] = [];
        state.mapAreaModifiers.forEach((mod) => {
          if (mod.effect) {
            const area = state.mapAreas.find((a) => a.id === mod.areaId);
            mapModifierDetails.push({
              areaId: mod.areaId,
              areaName: area?.name || '未知区域',
              type: mod.type,
              name: mod.name,
              description: mod.description,
              stat: mod.effect.stat,
              value: mod.effect.value,
            });
          }
        });

        const affinityDetails = formationCompanions.map((c) => {
          const affinity = get().getCompanionAffinity(c.id);
          return {
            companionId: c.id,
            name: c.name,
            level: AFFINITY_LEVEL_NAMES[affinity.level],
            value: affinity.value,
            color: AFFINITY_LEVEL_COLORS[affinity.level],
          };
        });

        const activeBondIds = state.formation.activeBondIds;
        type BondBonusType = 'attack' | 'defense' | 'hp' | 'speed' | 'luck';
        const bondDetails: PowerBreakdown['bondDetails'] = [];
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

          bondDetails.push({
            id: bond.id,
            name: bond.name,
            icon: bond.icon,
            members: members.map((m) => m.name),
            bonus: bond.bonusPerStar.map((b) => ({ type: b.type as BondBonusType, value: b.value * minStars })),
          });
        });

        return {
          attack,
          defense,
          hp,
          speed,
          companionDetails,
          rebirthDetails,
          talentDetails,
          mapModifierDetails,
          affinityDetails,
          bondDetails,
        };
      },

      initLevelStats: () => {
        set({ currentLevelStats: createEmptyLevelStats() });
      },

      getLevelProgress: (areaId) => {
        const state = get();
        const progress = state.levelProgresses.find((p) => p.areaId === areaId);
        if (progress) return progress;
        return {
          areaId,
          currentStars: 0,
          bestStars: 0,
          firstCleared: false,
          firstClearTime: null,
          bestStats: createEmptyLevelStats(),
          claimedStarRewards: [],
        };
      },

      getCurrentLevelStars: () => {
        const state = get();
        if (!state.currentLevelStats) return 0;
        const starConfigs = LEVEL_STAR_CONFIGS[state.currentAreaId] || [];
        let maxStars = 0;
        for (const config of starConfigs) {
          const allMet = config.conditions.every((cond) =>
            get().checkStarCondition(cond)
          );
          if (allMet) {
            maxStars = Math.max(maxStars, config.stars);
          }
        }
        return maxStars;
      },

      checkStarCondition: (condition) => {
        const state = get();
        const stats = state.currentLevelStats;
        if (!stats) return false;

        const survivalSeconds = (Date.now() - stats.startTime) / 1000;
        const killEfficiency = survivalSeconds > 0 ? stats.totalKills / survivalSeconds : 0;

        switch (condition.type) {
          case 'totalKills':
            return stats.totalKills >= condition.threshold;
          case 'killEfficiency':
            return killEfficiency >= condition.threshold;
          case 'damageTaken':
            return stats.timesHit <= condition.threshold;
          case 'eventChoices':
            return stats.goodEventChoices >= condition.threshold;
          case 'resourceDrop':
            return stats.goldEarned >= condition.threshold;
          case 'survivalTime':
            return survivalSeconds >= condition.threshold;
          case 'comboKills':
            return stats.maxComboKills >= condition.threshold;
          default:
            return false;
        }
      },

      checkAllStarConditions: (areaId) => {
        const starConfigs = LEVEL_STAR_CONFIGS[areaId] || [];
        return starConfigs.map((config) => ({
          stars: config.stars,
          completedConditions: config.conditions.map((cond) =>
            get().checkStarCondition(cond)
          ),
        }));
      },

      updateLevelStatsOnKill: (damageDealt, goldReward, expReward) => {
        set((state) => {
          if (!state.currentLevelStats) return state;
          const newStats = { ...state.currentLevelStats };
          newStats.totalKills += 1;
          newStats.totalDamageDealt += damageDealt;
          newStats.goldEarned += goldReward;
          newStats.expEarned += expReward;
          newStats.currentComboKills += 1;
          newStats.maxComboKills = Math.max(newStats.maxComboKills, newStats.currentComboKills);

          const newProgresses = state.levelProgresses.map((p) => {
            if (p.areaId !== state.currentAreaId) return p;
            const survivalSeconds = (Date.now() - newStats.startTime) / 1000;
            const killEfficiency = survivalSeconds > 0 ? newStats.totalKills / survivalSeconds : 0;
            
            let currentStars = 0;
            const starConfigs = LEVEL_STAR_CONFIGS[state.currentAreaId] || [];
            for (const config of starConfigs) {
              let allMet = true;
              for (const cond of config.conditions) {
                switch (cond.type) {
                  case 'totalKills':
                    allMet = allMet && newStats.totalKills >= cond.threshold;
                    break;
                  case 'killEfficiency':
                    allMet = allMet && killEfficiency >= cond.threshold;
                    break;
                  case 'damageTaken':
                    allMet = allMet && newStats.timesHit <= cond.threshold;
                    break;
                  case 'eventChoices':
                    allMet = allMet && newStats.goodEventChoices >= cond.threshold;
                    break;
                  case 'resourceDrop':
                    allMet = allMet && newStats.goldEarned >= cond.threshold;
                    break;
                  case 'survivalTime':
                    allMet = allMet && survivalSeconds >= cond.threshold;
                    break;
                  case 'comboKills':
                    allMet = allMet && newStats.maxComboKills >= cond.threshold;
                    break;
                }
              }
              if (allMet) {
                currentStars = Math.max(currentStars, config.stars);
              }
            }

            const newBestStars = Math.max(p.bestStars, currentStars);
            const isBetter = 
              newStats.totalKills > p.bestStats.totalKills ||
              newStats.maxComboKills > p.bestStats.maxComboKills ||
              currentStars > p.bestStars;

            return {
              ...p,
              currentStars,
              bestStars: newBestStars,
              bestStats: isBetter ? { ...newStats } : p.bestStats,
            };
          });

          return {
            currentLevelStats: newStats,
            levelProgresses: newProgresses,
          };
        });
      },

      updateLevelStatsOnDamage: (damageTaken) => {
        set((state) => {
          if (!state.currentLevelStats) return state;
          const newStats = { ...state.currentLevelStats };
          newStats.totalDamageTaken += damageTaken;
          newStats.timesHit += 1;
          newStats.currentComboKills = 0;
          return { currentLevelStats: newStats };
        });
      },

      updateLevelStatsOnEvent: (isGoodChoice) => {
        set((state) => {
          if (!state.currentLevelStats) return state;
          const newStats = { ...state.currentLevelStats };
          newStats.eventsTriggered += 1;
          if (isGoodChoice) {
            newStats.goodEventChoices += 1;
          }
          return { currentLevelStats: newStats };
        });
      },

      updateSurvivalTime: () => {
      },

      getStarConfig: (areaId) => {
        return LEVEL_STAR_CONFIGS[areaId] || [];
      },

      getFirstClearConfig: (areaId) => {
        return FIRST_CLEAR_REWARDS[areaId] || null;
      },

      canClaimStarReward: (areaId, stars) => {
        const progress = get().getLevelProgress(areaId);
        if (progress.claimedStarRewards.includes(stars)) return false;
        if (progress.bestStars < stars) return false;
        return true;
      },

      canClaimFirstClearReward: (areaId) => {
        const progress = get().getLevelProgress(areaId);
        return progress.firstCleared === false && progress.bestStars >= 1;
      },

      claimStarReward: (areaId, stars) => {
        if (!get().canClaimStarReward(areaId, stars)) return false;

        const starConfigs = LEVEL_STAR_CONFIGS[areaId] || [];
        const config = starConfigs.find((c) => c.stars === stars);
        if (!config) return false;

        get().applyStarReward(config.rewards, areaId);

        set((state) => ({
          levelProgresses: state.levelProgresses.map((p) =>
            p.areaId === areaId
              ? { ...p, claimedStarRewards: [...p.claimedStarRewards, stars] }
              : p
          ),
        }));

        get().addBattleLog(`⭐ 领取了 ${stars} 星奖励！`, 'levelup');
        return true;
      },

      claimFirstClearReward: (areaId) => {
        if (!get().canClaimFirstClearReward(areaId)) return false;

        const reward = FIRST_CLEAR_REWARDS[areaId];
        if (!reward) return false;

        get().applyStarReward(reward.rewards, areaId);

        set((state) => ({
          levelProgresses: state.levelProgresses.map((p) =>
            p.areaId === areaId
              ? { ...p, firstCleared: true, firstClearTime: Date.now() }
              : p
          ),
        }));

        get().addBattleLog(`🎉 首通奖励已领取！`, 'levelup');
        return true;
      },

      applyStarReward: (rewards, areaId) => {
        rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              get().addGold(reward.value);
              break;
            case 'exp':
              get().addExp(reward.value);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(reward.value);
              break;
            case 'attack':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    attack: state.player.stats.attack + reward.value,
                  },
                },
              }));
              break;
            case 'defense':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    defense: state.player.stats.defense + reward.value,
                  },
                },
              }));
              break;
            case 'hp':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    maxHp: state.player.stats.maxHp + reward.value,
                    hp: state.player.stats.hp + reward.value,
                  },
                },
              }));
              break;
            case 'reputation':
              get().addAreaReputation(areaId, reward.value);
              break;
          }
        });
      },

      getShardCount: (companionId) => {
        const shard = get().companionShards.find((s) => s.companionId === companionId);
        return shard?.count || 0;
      },

      addShards: (companionId, count) => {
        if (count <= 0) return;
        set((state) => {
          const existing = state.companionShards.find((s) => s.companionId === companionId);
          if (existing) {
            return {
              companionShards: state.companionShards.map((s) =>
                s.companionId === companionId ? { ...s, count: s.count + count } : s
              ),
            };
          }
          return {
            companionShards: [...state.companionShards, { companionId, count }],
          };
        });
        const companion = COMPANIONS.find((c) => c.id === companionId);
        if (companion) {
          get().addBattleLog(`💎 获得 ${companion.name} 碎片 ×${count}`, 'event');
        }
      },

      canSynthesizeCompanion: (companionId) => {
        const state = get();
        if (state.ownedCompanions.some((c) => c.id === companionId)) return false;
        const companion = COMPANIONS.find((c) => c.id === companionId);
        if (!companion) return false;
        if (!get().canRecruitCompanion(companion)) return false;
        const shardConfig = getShardConfig(companion.rarity);
        const shardCount = get().getShardCount(companionId);
        const cost = get().getDiscountedRecruitCost(shardConfig.recruitCost);
        return shardCount >= shardConfig.shardsNeeded && state.player.stats.gold >= cost;
      },

      synthesizeCompanion: (companionId) => {
        if (!get().canSynthesizeCompanion(companionId)) return false;

        const companion = COMPANIONS.find((c) => c.id === companionId);
        if (!companion) return false;

        const shardConfig = getShardConfig(companion.rarity);
        const cost = get().getDiscountedRecruitCost(shardConfig.recruitCost);

        set((state) => ({
          companionShards: state.companionShards.map((s) =>
            s.companionId === companionId
              ? { ...s, count: s.count - shardConfig.shardsNeeded }
              : s
          ),
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - cost,
            },
          },
        }));

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
            ownedCompanions: [...state.ownedCompanions, newCompanion],
            formation: newFormation,
          };
        });

        get().unlockCodexEntry(companionId);
        get().addBattleLog(`✨ 合成了新伙伴：${companion.name}！`, 'event');
        get().checkAchievements();
        return true;
      },

      getCodexEntry: (companionId) => {
        const entry = get().companionCodex.find((e) => e.companionId === companionId);
        if (entry) return entry;
        return { companionId, unlocked: false, unlockedAt: null };
      },

      getCodexProgress: () => {
        const codex = get().companionCodex;
        const total = codex.length;
        const unlocked = codex.filter((e) => e.unlocked).length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;
        return { total, unlocked, percentage };
      },

      unlockCodexEntry: (companionId) => {
        set((state) => ({
          companionCodex: state.companionCodex.map((e) =>
            e.companionId === companionId && !e.unlocked
              ? { ...e, unlocked: true, unlockedAt: Date.now() }
              : e
          ),
        }));
      },

      getDiscountedRecruitCost: (baseCost) => {
        const currentAreaId = get().currentAreaId;
        if (!currentAreaId) return baseCost;
        const discount = get().getAreaRecruitDiscount(currentAreaId);
        return Math.max(1, Math.floor(baseCost * (1 - discount)));
      },

      convertDuplicateToShards: (companionId) => {
        const companion = COMPANIONS.find((c) => c.id === companionId);
        if (!companion) return 0;
        const shardConfig = getShardConfig(companion.rarity);
        return shardConfig.duplicateToShards;
      },

      clearLastRecruitResults: () => {
        set({ lastRecruitResults: null });
      },

      recruitFromPool: (poolType, count) => {
        const state = get();
        const pool = RECRUIT_POOLS.find((p) => p.type === poolType);
        if (!pool) return false;

        const totalCost = count === 10 ? pool.tenCost : pool.singleCost * count;
        const discountedCost = get().getDiscountedRecruitCost(totalCost);

        if (state.player.stats.gold < discountedCost) return false;

        const results: { companionId: string; shards: number; isNew: boolean }[] = [];
        let currentCounter = state.recruitPullCounters[poolType] || 0;

        for (let i = 0; i < count; i++) {
          currentCounter += 1;

          let selectedRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
          const weights = pool.rarityWeights;
          const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);

          let useGuarantee = false;
          if (pool.guaranteedRarity && currentCounter % pool.guaranteedRarity.pullCount === 0) {
            useGuarantee = true;
          }

          if (useGuarantee && pool.guaranteedRarity) {
            const guaranteeRarity = pool.guaranteedRarity.rarity;
            const eligibleRarities: ('common' | 'rare' | 'epic' | 'legendary')[] = [];
            if (guaranteeRarity === 'rare') eligibleRarities.push('rare', 'epic', 'legendary');
            else if (guaranteeRarity === 'epic') eligibleRarities.push('epic', 'legendary');
            else if (guaranteeRarity === 'legendary') eligibleRarities.push('legendary');

            const filteredWeights = eligibleRarities.reduce((sum, r) => sum + (weights[r] || 0), 0);
            if (filteredWeights > 0) {
              let roll = Math.random() * filteredWeights;
              for (const rarity of eligibleRarities) {
                roll -= weights[rarity] || 0;
                if (roll <= 0) {
                  selectedRarity = rarity;
                  break;
                }
              }
            } else {
              selectedRarity = guaranteeRarity;
            }
          } else {
            let roll = Math.random() * totalWeight;
            for (const [rarity, weight] of Object.entries(weights)) {
              roll -= weight;
              if (roll <= 0) {
                selectedRarity = rarity as 'common' | 'rare' | 'epic' | 'legendary';
                break;
              }
            }
          }

          const eligibleCompanions = COMPANIONS.filter((c) => c.rarity === selectedRarity);
          if (eligibleCompanions.length === 0) continue;

          const dropBonus = get().getAreaDropBonus(state.currentAreaId);
          const shardConfig = getShardConfig(selectedRarity);
          const baseMin = shardConfig.shardsPerDrop.min;
          const baseMax = shardConfig.shardsPerDrop.max;
          const bonusMultiplier = 1 + dropBonus + get().getTotalTalentBonus('soulOrbs').percent;
          const minShards = Math.max(1, Math.floor(baseMin * bonusMultiplier));
          const maxShards = Math.max(minShards, Math.floor(baseMax * bonusMultiplier));
          const shardCount = minShards + Math.floor(Math.random() * (maxShards - minShards + 1));

          const selectedCompanion = eligibleCompanions[Math.floor(Math.random() * eligibleCompanions.length)];
          const isOwned = state.ownedCompanions.some((c) => c.id === selectedCompanion.id);
          const isNewToCodex = !get().getCodexEntry(selectedCompanion.id).unlocked;

          let actualShards = shardCount;
          if (isOwned) {
            actualShards += get().convertDuplicateToShards(selectedCompanion.id);
          }

          results.push({
            companionId: selectedCompanion.id,
            shards: actualShards,
            isNew: isNewToCodex,
          });

          get().addShards(selectedCompanion.id, actualShards);
          if (isNewToCodex) {
            get().unlockCodexEntry(selectedCompanion.id);
            get().addBattleLog(`📖 图鉴解锁：${selectedCompanion.name}！`, 'event');
          }
        }

        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - discountedCost,
            },
          },
          recruitPullCounters: {
            ...state.recruitPullCounters,
            [poolType]: currentCounter,
          },
          lastRecruitResults: results,
        }));

        get().addBattleLog(
          `🎲 ${pool.name} ${count}连抽完成！`,
          'event'
        );
        get().checkAchievements();
        return true;
      },

      getMonsterTierConfig: (tier) => {
        return MONSTER_TIER_CONFIGS[tier];
      },

      calculateMonsterStats: (monster, tier, playerLevel, _area) => {
        const tierConfig = MONSTER_TIER_CONFIGS[tier];
        const levelBonus = 1 + (playerLevel - 1) * 0.1;

        let hpMultiplier = tierConfig.hpMultiplier;
        let attackMultiplier = tierConfig.attackMultiplier;
        let defenseMultiplier = tierConfig.defenseMultiplier;

        if (tier === 'elite' && monster.eliteHpMultiplier) {
          hpMultiplier = monster.eliteHpMultiplier;
        }
        if (tier === 'elite' && monster.eliteAtkMultiplier) {
          attackMultiplier = monster.eliteAtkMultiplier;
        }
        if (tier === 'boss' && monster.bossHpMultiplier) {
          hpMultiplier = monster.bossHpMultiplier;
        }
        if (tier === 'boss' && monster.bossAtkMultiplier) {
          attackMultiplier = monster.bossAtkMultiplier;
        }

        const baseHp = Math.floor(monster.hp * levelBonus);
        const baseAttack = Math.floor(monster.attack * levelBonus);
        const baseDefense = Math.floor(monster.defense * levelBonus);
        const baseSpeed = Math.floor(monster.speed * levelBonus);
        const baseExp = Math.floor(monster.expReward * levelBonus);
        const baseGold = Math.floor(monster.goldReward * levelBonus);

        const maxHp = Math.floor(baseHp * hpMultiplier);
        const attack = Math.floor(baseAttack * attackMultiplier);
        const defense = Math.floor(baseDefense * defenseMultiplier);
        const speed = baseSpeed;
        const expReward = Math.floor(baseExp * tierConfig.expMultiplier);
        const goldReward = Math.floor(baseGold * tierConfig.goldMultiplier);

        const tierName = MONSTER_TIER_NAMES[tier];
        const displayName = tier === 'normal' ? monster.name : `${tierName}·${monster.name}`;

        return {
          id: monster.id,
          name: displayName,
          hp: maxHp,
          maxHp,
          attack,
          defense,
          speed,
          expReward,
          goldReward,
          color: monster.color,
          baseAttack,
          baseDefense,
          baseSpeed,
          currentPhase: -1,
          tier,
          baseMaxHp: baseHp,
          baseExpReward: baseExp,
          baseGoldReward: baseGold,
        };
      },

      generateMonster: (areaId, forceTier) => {
        const state = get();
        const area = state.mapAreas.find((a) => a.id === areaId);
        if (!area || area.monsters.length === 0) return null;

        const playerLevel = state.player.stats.level;
        const minEliteLevel = area.minLevelForElite || 1;
        const minBossLevel = area.minLevelForBoss || 10;

        let selectedTier: MonsterTier = 'normal';
        if (forceTier) {
          selectedTier = forceTier;
        } else {
          const roll = Math.random();
          const eliteChance = (area.eliteSpawnChance || 0.15) * (playerLevel >= minEliteLevel ? 1 : 0);
          const bossChance = (area.bossSpawnChance || 0.05) * (playerLevel >= minBossLevel ? 1 : 0);

          if (roll < bossChance) {
            selectedTier = 'boss';
          } else if (roll < bossChance + eliteChance) {
            selectedTier = 'elite';
          } else {
            selectedTier = 'normal';
          }
        }

        let availableMonsters: Monster[] = [];
        if (selectedTier === 'boss') {
          const bossMonsters = area.monsters.filter((m) => m.tier === 'boss' || m.isBossSpawnable);
          if (bossMonsters.length > 0) {
            availableMonsters = bossMonsters;
          } else {
            availableMonsters = area.monsters.filter((m) => m.isBossSpawnable !== false);
          }
        } else if (selectedTier === 'elite') {
          const eliteMonsters = area.monsters.filter((m) => m.isEliteSpawnable && m.tier !== 'boss');
          if (eliteMonsters.length > 0) {
            availableMonsters = eliteMonsters;
          } else {
            availableMonsters = area.monsters.filter((m) => m.tier !== 'boss');
          }
        } else {
          availableMonsters = area.monsters.filter((m) => m.tier !== 'boss');
        }

        if (availableMonsters.length === 0) {
          availableMonsters = area.monsters.filter((m) => m.tier !== 'boss');
        }
        if (availableMonsters.length === 0) {
          availableMonsters = area.monsters;
        }

        const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
        const actualTier = monster.tier === 'boss' ? 'boss' : selectedTier;

        return get().calculateMonsterStats(monster, actualTier, playerLevel, area);
      },

      updateKillStats: (monsterTier, areaId, monsterId) => {
        set((state) => {
          const newStats = { ...state.monsterKillStats };
          newStats.totalKills += 1;

          if (monsterTier === 'normal') {
            newStats.normalKills += 1;
          } else if (monsterTier === 'elite') {
            newStats.eliteKills += 1;
          } else if (monsterTier === 'boss') {
            newStats.bossKills += 1;
            if (monsterId && !newStats.bossesDefeated.includes(monsterId)) {
              newStats.bossesDefeated = [...newStats.bossesDefeated, monsterId];
            }
          }

          if (!newStats.killsByArea[areaId]) {
            newStats.killsByArea[areaId] = { normal: 0, elite: 0, boss: 0 };
          }
          newStats.killsByArea[areaId][monsterTier] += 1;

          return { monsterKillStats: newStats };
        });

        if (monsterTier === 'normal') {
          get().updateSeasonTaskProgress('kill', 1);
        } else if (monsterTier === 'elite') {
          get().updateSeasonTaskProgress('battle', 1);
        } else if (monsterTier === 'boss') {
          get().updateSeasonTaskProgress('boss', 1);
        }

        if (areaId) {
          const state = get();
          const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
          if (season) {
            const exploreTasks = season.stages.flatMap((st) => st.tasks).filter((t) => t.type === 'explore');
            if (exploreTasks.length > 0) {
              const foughtAreas = new Set<string>();
              const killStats = state.monsterKillStats;
              Object.keys(killStats.killsByArea).forEach((aid) => {
                const areaKills = killStats.killsByArea[aid];
                if (areaKills.normal > 0 || areaKills.elite > 0 || areaKills.boss > 0) {
                  foughtAreas.add(aid);
                }
              });
              const areaCount = foughtAreas.size;
              exploreTasks.forEach((task) => {
                const tp = state.seasonChallenge.taskProgresses.find((t) => t.taskId === task.id);
                if (tp && !tp.completed && areaCount > tp.progress) {
                  get().updateSeasonTaskProgress('explore', areaCount - tp.progress);
                }
              });
            }
          }
        }

        if (monsterId) {
          get().unlockMonsterCodex(monsterId, monsterTier);
        }

        setTimeout(() => {
          get().checkRebirthChallenges();
          const state = get();
          state.mapAreas.forEach((area) => {
            if (!area.unlocked && get().checkMapUnlockConditions(area.id)) {
              get().unlockMapArea(area.id);
            }
          });
        }, 100);
      },

      getAreaEliteKills: (areaId) => {
        const stats = get().monsterKillStats;
        return stats.killsByArea[areaId]?.elite || 0;
      },

      getAreaBossKills: (areaId) => {
        const stats = get().monsterKillStats;
        return stats.killsByArea[areaId]?.boss || 0;
      },

      getTotalEliteKills: () => {
        return get().monsterKillStats.eliteKills;
      },

      getTotalBossKills: () => {
        return get().monsterKillStats.bossKills;
      },

      checkMapUnlockConditions: (areaId) => {
        const state = get();
        const area = state.mapAreas.find((a) => a.id === areaId);
        if (!area) return false;
        if (area.unlocked) return true;

        const conditions = area.unlockConditions || [];
        if (conditions.length === 0) {
          return state.player.stats.level >= area.minLevel;
        }

        return conditions.every((cond) => {
          switch (cond.type) {
            case 'level':
              return state.player.stats.level >= cond.threshold;
            case 'eliteKills':
              return get().getAreaEliteKills(cond.areaId || areaId) >= cond.threshold;
            case 'bossKills':
              return get().getAreaBossKills(cond.areaId || areaId) >= cond.threshold;
            case 'totalKills':
              const areaKills = state.monsterKillStats.killsByArea[cond.areaId || areaId];
              const total = areaKills ? areaKills.normal + areaKills.elite + areaKills.boss : 0;
              return total >= cond.threshold;
            case 'stars':
              const progress = get().getLevelProgress(cond.areaId || areaId);
              return progress.bestStars >= cond.threshold;
            default:
              return true;
          }
        });
      },

      getUnlockProgress: (areaId) => {
        const state = get();
        const area = state.mapAreas.find((a) => a.id === areaId);
        if (!area) return [];

        const conditions = area.unlockConditions || [];
        if (conditions.length === 0) {
          return [{
            condition: `达到${area.minLevel}级`,
            current: state.player.stats.level,
            target: area.minLevel,
            completed: state.player.stats.level >= area.minLevel,
          }];
        }

        return conditions.map((cond) => {
          let current = 0;
          switch (cond.type) {
            case 'level':
              current = state.player.stats.level;
              break;
            case 'eliteKills':
              current = get().getAreaEliteKills(cond.areaId || areaId);
              break;
            case 'bossKills':
              current = get().getAreaBossKills(cond.areaId || areaId);
              break;
            case 'totalKills':
              const areaKills = state.monsterKillStats.killsByArea[cond.areaId || areaId];
              current = areaKills ? areaKills.normal + areaKills.elite + areaKills.boss : 0;
              break;
            case 'stars':
              const progress = get().getLevelProgress(cond.areaId || areaId);
              current = progress.bestStars;
              break;
          }
          return {
            condition: cond.description,
            current,
            target: cond.threshold,
            completed: current >= cond.threshold,
          };
        });
      },

      getTotalPower: () => {
        const state = get();
        return get().getTotalAttack() + get().getTotalDefense() + Math.floor(state.player.stats.maxHp / 10) + get().getTotalSpeed();
      },

      checkRebirthChallenges: () => {
        const state = get();
        const newChallenges = state.rebirthChallenges.map((challenge) => {
          if (challenge.completed) return challenge;

          let completed = false;
          switch (challenge.type) {
            case 'bossKills':
              if (challenge.areaId) {
                completed = get().getAreaBossKills(challenge.areaId) >= challenge.target;
              } else {
                completed = get().getTotalBossKills() >= challenge.target;
              }
              break;
            case 'eliteKills':
              completed = get().getTotalEliteKills() >= challenge.target;
              break;
            case 'areaClear':
              if (challenge.areaId) {
                const area = state.mapAreas.find((a) => a.id === challenge.areaId);
                completed = area?.unlocked || false;
              }
              break;
            case 'level':
              completed = state.player.stats.level >= challenge.target;
              break;
            case 'totalPower':
              completed = get().getTotalPower() >= challenge.target;
              break;
          }

          if (completed && !challenge.completed) {
            get().addBattleLog(`🏆 挑战目标完成：${challenge.description}`, 'levelup');
          }

          return { ...challenge, completed };
        });

        set({ rebirthChallenges: newChallenges });
      },

      canClaimRebirthChallenge: (challengeId) => {
        const state = get();
        const challenge = state.rebirthChallenges.find((c) => c.id === challengeId);
        if (!challenge) return false;
        return challenge.completed && !challenge.claimed;
      },

      claimRebirthChallengeReward: (challengeId) => {
        const state = get();
        const challenge = state.rebirthChallenges.find((c) => c.id === challengeId);
        if (!challenge || !get().canClaimRebirthChallenge(challengeId)) return false;

        get().applyStarReward(challenge.reward, 'forest');

        set((s) => ({
          rebirthChallenges: s.rebirthChallenges.map((c) =>
            c.id === challengeId ? { ...c, claimed: true } : c
          ),
        }));

        get().addBattleLog(`🎁 领取了挑战奖励：${challenge.description}`, 'levelup');
        return true;
      },

      getMonsterDropReward: (monster) => {
        if (!monster) return { exp: 0, gold: 0, soulOrbs: 0, shardChance: 0 };

        const tierConfig = MONSTER_TIER_CONFIGS[monster.tier];
        const dropBonus = get().getAreaDropBonus(get().currentAreaId);
        const soulOrbChanceBonus = get().getClassSoulOrbChanceBonus();

        let soulOrbs = 0;
        if (Math.random() < tierConfig.soulOrbChance + soulOrbChanceBonus) {
          soulOrbs = tierConfig.soulOrbMin + Math.floor(Math.random() * (tierConfig.soulOrbMax - tierConfig.soulOrbMin + 1));
        }

        return {
          exp: Math.floor(monster.expReward * (1 + dropBonus)),
          gold: Math.floor(monster.goldReward * (1 + dropBonus)),
          soulOrbs,
          shardChance: tierConfig.shardChance,
        };
      },

      getClassPassive: () => {
        const state = get();
        return getClassPassive(state.player.class);
      },

      getClassLevelBonusMultiplier: (stat) => {
        const passive = get().getClassPassive();
        if (!passive) return 1;
        if (passive.levelBonus.stat === stat) {
          return passive.levelBonus.multiplier;
        }
        return 1;
      },

      getClassIdleExpMultiplier: () => {
        const passive = get().getClassPassive();
        return passive ? passive.idleBonus.expMultiplier : 1;
      },

      getClassIdleGoldMultiplier: () => {
        const passive = get().getClassPassive();
        return passive ? passive.idleBonus.goldMultiplier : 1;
      },

      getClassSoulOrbChanceBonus: () => {
        const passive = get().getClassPassive();
        return passive ? passive.idleBonus.soulOrbChanceBonus : 0;
      },

      getClassEventPositiveMultiplier: () => {
        const passive = get().getClassPassive();
        return passive ? passive.eventBonus.positiveEffectMultiplier : 1;
      },

      getClassEventNegativeReduction: () => {
        const passive = get().getClassPassive();
        return passive ? passive.eventBonus.negativeEffectReduction : 0;
      },

      getClassEventWeightBonus: () => {
        const passive = get().getClassPassive();
        return passive ? passive.eventBonus.eventWeightBonus : 0;
      },

      isPreferredCompanion: (companion) => {
        const passive = get().getClassPassive();
        if (!passive) return false;
        const classMatch = passive.companionBonus.preferredClasses.includes(companion.class);
        const raceMatch = !passive.companionBonus.preferredRaces || passive.companionBonus.preferredRaces.length === 0
          ? true
          : passive.companionBonus.preferredRaces.includes(companion.race);
        return classMatch && raceMatch;
      },

      getClassCompanionAffinityBonus: (companion) => {
        if (!get().isPreferredCompanion(companion)) return 0;
        const passive = get().getClassPassive();
        return passive ? passive.companionBonus.affinityBonus : 0;
      },

      getClassCompanionStatMultiplier: (companion) => {
        if (!get().isPreferredCompanion(companion)) return 1;
        const passive = get().getClassPassive();
        return passive ? passive.companionBonus.statBonusMultiplier : 1;
      },

      getSkillNodeLevel: (nodeId) => get().skillNodeLevels[nodeId] || 0,
      canUpgradeSkillNode: (nodeId) => {
        const node = SKILL_TREE_NODES.find(n => n.id === nodeId);
        if (!node) return false;
        const state = get();
        const currentLevel = state.getSkillNodeLevel(nodeId);
        if (currentLevel >= node.maxLevel) return false;
        if (state.getAvailableSkillPoints() < node.pointCostPerLevel) return false;
        return state.isSkillNodeUnlocked(node);
      },
      isSkillNodeUnlocked: (node) => {
        const state = get();
        if (node.minPlayerLevel && state.player.stats.level < node.minPlayerLevel) return false;
        if (node.classRestriction && node.classRestriction.length > 0 && state.player.class) {
          if (!node.classRestriction.includes(state.player.class)) return false;
        }
        if (node.branch === 'special' && state.player.rebirthCount < 1) return false;
        if (node.prerequisiteIds && node.prerequisiteIds.length > 0) {
          for (const prereqId of node.prerequisiteIds) {
            const prereq = SKILL_TREE_NODES.find(n => n.id === prereqId);
            if (!prereq) continue;
            if (state.getSkillNodeLevel(prereqId) < prereq.maxLevel) return false;
          }
        }
        return true;
      },
      upgradeSkillNode: (nodeId) => {
        const node = SKILL_TREE_NODES.find(n => n.id === nodeId);
        if (!node) return false;
        if (!get().canUpgradeSkillNode(nodeId)) return false;
        const state = get();
        set({
          skillNodeLevels: {
            ...state.skillNodeLevels,
            [nodeId]: (state.skillNodeLevels[nodeId] || 0) + 1,
          },
          player: {
            ...state.player,
            skillPoints: state.player.skillPoints - node.pointCostPerLevel,
          },
        });
        return true;
      },
      getAvailableSkillPoints: () => get().player.skillPoints,
      getTotalAllocatedPoints: () => {
        const levels = get().skillNodeLevels;
        return Object.values(levels).reduce((sum, l) => sum + l, 0);
      },
      getBranchPoints: (branchId) => {
        const state = get();
        return SKILL_TREE_NODES
          .filter(n => n.branch === branchId)
          .reduce((sum, n) => sum + (state.skillNodeLevels[n.id] || 0), 0);
      },
      getSkillTreeTotalBonus: (type) => {
        const state = get();
        let total = 0;
        for (const node of SKILL_TREE_NODES) {
          const level = state.skillNodeLevels[node.id] || 0;
          if (level <= 0) continue;
          for (const effect of node.effects) {
            if (effect.type === type) {
              total += effect.value * level;
            }
          }
        }
        return total;
      },
      resetSkillTree: () => {
        const state = get();
        const totalPoints = state.getTotalAllocatedPoints();
        set({
          skillNodeLevels: {},
          player: {
            ...state.player,
            skillPoints: state.player.skillPoints + totalPoints,
          },
        });
        return true;
      },
      getActiveSpec: () => {
        const specId = get().activeSpecId;
        if (!specId) return null;
        return PROFESSION_SPECS.find(s => s.id === specId) || null;
      },
      getSpecCombatMultiplier: () => {
        const spec = get().getActiveSpec();
        if (!spec) return { damage: 1, defense: 1, speed: 1 };
        return {
          damage: spec.combatBonus.damageMultiplier,
          defense: spec.combatBonus.defenseMultiplier,
          speed: spec.combatBonus.speedMultiplier,
        };
      },
      getSpecRebirthInheritRate: () => {
        const spec = get().getActiveSpec();
        return spec ? spec.rebirthInheritRate : 0;
      },
      canActivateProfessionSpec: (specId) => {
        const spec = PROFESSION_SPECS.find(s => s.id === specId);
        if (!spec) return false;
        const state = get();
        if (spec.baseClass !== state.player.class) return false;
        if (state.player.stats.level < spec.minLevel) return false;
        if (state.player.rebirthCount < spec.minRebirthCount) return false;
        if (state.getBranchPoints(spec.requiredBranchId) < spec.requiredBranchPoints) return false;
        return true;
      },
      activateProfessionSpec: (specId) => {
        if (!get().canActivateProfessionSpec(specId)) return false;
        set({ activeSpecId: specId });
        return true;
      },
      deactivateProfessionSpec: () => set({ activeSpecId: null }),

      equipItem: (equipmentUid, companionId) => {
        const state = get();
        const eq = state.equipmentInventory.find(e => e.uid === equipmentUid);
        if (!eq) return false;
        const updatedInventory = state.equipmentInventory.map(e =>
          e.uid === equipmentUid ? { ...e, equippedBy: companionId } : e
        );
        set({ equipmentInventory: updatedInventory });
        return true;
      },
      unequipItem: (equipmentUid) => {
        const state = get();
        const updatedInventory = state.equipmentInventory.map(e =>
          e.uid === equipmentUid ? { ...e, equippedBy: null } : e
        );
        set({ equipmentInventory: updatedInventory });
        return true;
      },
      recycleEquipment: (equipmentUid) => {
        const state = get();
        const eq = state.equipmentInventory.find(e => e.uid === equipmentUid);
        let gold = 0;
        let exp = 0;
        if (eq) {
          gold = 10 * (eq.level + 1);
          exp = 5 * (eq.level + 1);
        }
        set({
          equipmentInventory: state.equipmentInventory.filter(e => e.uid !== equipmentUid),
        });
        state.addGold(gold);
        state.addExp(exp);
        return { gold, exp };
      },
      forgeEquipments: () => null,
      canForge: () => false,
      getEquippedItems: (companionId) => {
        return get().equipmentInventory.filter(e => e.equippedBy === companionId);
      },
      getEquipmentStatBonus: (_companionId, _stat?) => ({ flat: 0, percent: 0 }),
      generateEquipmentDrop: () => null,
      addEquipmentToInventory: (equipment) => {
        const state = get();
        set({ equipmentInventory: [...state.equipmentInventory, equipment] });
      },
      addEquipmentForgeExp: () => {},

      refreshCommissions: () => {},
      shouldRefreshCommissions: () => false,
      startCommission: () => false,
      updateCommissionProgress: () => {},
      resolveCommissionEvent: (_commissionId, _choiceId) => {},
      collectCommissionReward: () => null,
      cancelCommission: () => false,
      getCommissionPower: () => 0,
      getMaterialInfo: (materialId) => RARE_MATERIALS.find(m => m.id === materialId),
      getActiveCommissionCount: () => get().activeCommissions.length,
      canStartCommission: () => true,
      sellMaterial: () => false,

      getGuildMaxStamina: () => 100,
      getGuildLevelConfig: () => ({
        level: 1,
        expRequired: 0,
        unlockFeature: null,
        maxStaminaBonus: 0,
        staminaRegenBonus: 0,
        attackBonus: 0,
        defenseBonus: 0,
        hpBonus: 0,
        goldBonus: 0,
        expBonus: 0,
      }),
      getGuildExpToNextLevel: () => 0,
      getCurrentGuildChapter: () => undefined,
      getNodeProgress: (_chapterId, _nodeId) => ({ cleared: false, stars: 0, claimed: false, bestStars: 0 }),
      isNodeAccessible: (_chapterId, _nodeId) => false,
      enterGuildNode: (_chapterId, _nodeId) => true,
      clearGuildNode: (_chapterId, _nodeId, _stars, _rewards?) => {},
      battleGuildNode: (_chapterId, _nodeId) => ({ won: false, stars: 0, powerRatio: 0 }),
      claimNodeReward: (_chapterId, _nodeId) => false,
      canClaimNodeReward: (_chapterId, _nodeId) => false,
      setCurrentGuildChapter: (chapterId) => set({ currentGuildChapterId: chapterId }),
      setGuildActiveTab: (tab) => set({ guildActiveTab: tab }),
      getGuildTechLevel: () => 0,
      upgradeGuildTech: () => false,
      canUpgradeGuildTech: () => false,
      getDailyStreak: () => 0,
      claimDailyReward: () => false,
      canClaimDailyReward: () => false,
      checkAndResetDailyRewards: () => {},
      setGuildFormation: (formation) => set({ guildFormation: formation }),
      getGuildFormationPower: () => 0,
      regenStamina: () => {},
      getGuildAttackBonus: () => 0,
      getGuildDefenseBonus: () => 0,
      getGuildHpBonus: () => 0,
      getGuildGoldBonus: () => 0,
      getGuildExpBonus: () => 0,

      getChapter: (chapterId) => CHAPTERS.find(c => c.id === chapterId),
      getChapterProgress: () => ({ unlocked: false, completed: false, claimed: false, totalStars: 0, maxStars: 0 }),
      getStageProgress: (_chapterId, _stageId) => ({ cleared: false, stars: 0, firstClearClaimed: false, bestStars: 0 }),
      isChapterUnlocked: () => false,
      isStageAccessible: (_chapterId, _stageId) => false,
      getChapterUnlockProgress: () => [],
      setCurrentChapter: (chapterId) => set({ currentChapterId: chapterId }),
      setChapterActiveTab: (tab) => set({ chapterActiveTab: tab }),
      startStage: (_chapterId, _stageId) => {},
      canClaimStageReward: (_chapterId, _stageId) => false,
      canClaimStageFirstClearReward: (_chapterId, _stageId) => false,
      claimChapterReward: () => false,
      canClaimChapterReward: () => false,
      advanceDialogue: (_choiceId?) => {},
      closeDialogue: () => set({ currentDialogue: null }),

      getAvailableTradeItems: (_areaId?) => [],
      shouldRefreshTrade: (_areaId?) => false,
      refreshTradeInventory: (_areaId?) => {},
      buyTradeItem: (_itemId, _areaId, _quantity) => false,
      sellTradeItem: (_itemId, _areaId, _quantity) => false,
      getMaterialCount: (materialId) => {
        const item = get().materialInventory.find(m => m.materialId === materialId);
        return item ? item.count : 0;
      },
      getActiveTradeEvents: (_areaId?) => [],
      checkTradeEvents: () => {},

      isBlackMarketUnlocked: () => get().player.stats.level >= 20,
      shouldRefreshBlackMarket: () => false,
      refreshBlackMarket: () => {},
      buyBlackMarketItem: (_itemId, _quantity?) => false,
      getBlackMarketItems: () => [],
      dismissCompanion: (companionId) => {
        const state = get();
        const companion = state.ownedCompanions.find(c => c.id === companionId);
        if (!companion) return false;
        state.addShards(companionId, 5);
        set({
          ownedCompanions: state.ownedCompanions.filter(c => c.id !== companionId),
        });
        return true;
      },
      exchangeGoldToSoulOrbs: (goldAmount) => {
        const state = get();
        if (state.player.stats.gold < goldAmount) return false;
        const soulOrbs = Math.floor(goldAmount / 100);
        set({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - goldAmount,
              soulOrbs: state.player.stats.soulOrbs + soulOrbs,
            },
          },
        });
        return true;
      },
      exchangeShardsToSoulOrbs: () => false,
      getUnclaimedRewards: () => ({
        gold: 0,
        exp: 0,
        soulOrbs: 0,
        starRewards: [],
        firstClearRewards: [],
        rebirthChallengeRewards: [],
      }),

      getRelic: (relicId) => RELICS.find((r) => r.id === relicId),

      getOwnedRelic: (relicId) => get().ownedRelics.find((r) => r.relicId === relicId),

      getRelicSet: (setId) => RELIC_SETS.find((s) => s.id === setId),

      getActiveRelicSets: () => {
        const state = get();
        const equippedRelicIds = state.ownedRelics
          .filter((r) => r.equippedBy !== null)
          .map((r) => r.relicId);
        return RELIC_SETS.filter((set) =>
          set.relicIds.some((id) => equippedRelicIds.includes(id))
        );
      },

      getRelicCodexEntry: (relicId) => {
        const entry = get().relicCodex.find((e) => e.relicId === relicId);
        return entry || { relicId, unlocked: false, unlockedAt: null, levelReached: 0, awakened: false };
      },

      getRelicCodexProgress: () => {
        const codex = get().relicCodex;
        const total = codex.length;
        const unlocked = codex.filter((e) => e.unlocked).length;
        return {
          total,
          unlocked,
          percentage: total > 0 ? unlocked / total : 0,
        };
      },

      getRelicLevel: (relicId) => {
        const owned = get().getOwnedRelic(relicId);
        return owned?.level || 0;
      },

      getRelicExpToNext: (relicId) => {
        const owned = get().getOwnedRelic(relicId);
        if (!owned) return { current: 0, next: RELIC_LEVEL_EXP[1] };
        const totalExp = getRelicTotalExp(owned.level);
        const expNeededForNext = owned.level < RELIC_MAX_LEVEL ? RELIC_LEVEL_EXP[owned.level + 1] - totalExp : 0;
        return { current: 0, next: expNeededForNext };
      },

      getRelicStatBonus: (relicId, includeAwakened) => {
        const relic = get().getRelic(relicId);
        const owned = get().getOwnedRelic(relicId);
        if (!relic) return [];

        const level = owned?.level || 0;
        const awakened = owned?.awakened || false;
        const levelMultiplier = 1 + level * RELIC_LEVEL_STAT_MULTIPLIER;

        const stats: RelicStatBonus[] = relic.baseStats.map((s) => ({
          ...s,
          value: s.isPercent ? s.value * levelMultiplier : Math.floor(s.value * levelMultiplier),
        }));

        if (includeAwakened && awakened) {
          relic.awakenedStats.forEach((s) => {
            stats.push({
              ...s,
              value: s.isPercent ? s.value * levelMultiplier : Math.floor(s.value * levelMultiplier),
            });
          });
        }

        return stats;
      },

      getEquippedRelics: (companionId) => {
        return get().ownedRelics.filter((r) => r.equippedBy === companionId);
      },

      getRelicTotalStats: (companionId) => {
        const state = get();
        const equipped = state.getEquippedRelics(companionId);
        const allStats: RelicStatBonus[] = [];

        equipped.forEach((owned) => {
          const compatMultiplier = state.getCompatibleBonusMultiplier(owned.relicId, companionId);
          const stats = state.getRelicStatBonus(owned.relicId, true);
          stats.forEach((s) => {
            allStats.push({
              ...s,
              value: s.isPercent ? s.value * compatMultiplier : Math.floor(s.value * compatMultiplier),
            });
          });
        });

        const setBonus = state.getRelicSetBonus(companionId);
        setBonus.forEach((s) => allStats.push(s));

        return mergeRelicStats(allStats);
      },

      getRelicSetBonus: (companionId) => {
        const state = get();
        const equippedRelicIds = state.ownedRelics
          .filter((r) => r.equippedBy === companionId)
          .map((r) => r.relicId);

        const bonuses: RelicStatBonus[] = [];
        RELIC_SETS.forEach((set) => {
          const equippedCount = set.relicIds.filter((id) => equippedRelicIds.includes(id)).length;
          set.setBonuses.forEach((sb) => {
            if (equippedCount >= sb.count) {
              sb.effects.forEach((e) => bonuses.push(e));
            }
          });
        });

        return bonuses;
      },

      isRelicCompatible: (relicId, companionId) => {
        const relic = get().getRelic(relicId);
        if (!relic || !companionId) return true;

        const companion = get().ownedCompanions.find((c) => c.id === companionId);
        if (!companion) return false;

        if (relic.compatibleCompanionIds.length > 0 && relic.compatibleCompanionIds.includes(companionId)) {
          return true;
        }
        if (relic.compatibleClasses.length > 0 && relic.compatibleClasses.includes(companion.class)) {
          return true;
        }
        if (relic.compatibleRaces.length > 0 && relic.compatibleRaces.includes(companion.race)) {
          return true;
        }
        return relic.compatibleCompanionIds.length === 0 && relic.compatibleClasses.length === 0 && relic.compatibleRaces.length === 0;
      },

      getCompatibleBonusMultiplier: (relicId, companionId) => {
        if (!companionId) return 1;
        return get().isRelicCompatible(relicId, companionId) ? 1 + RELIC_COMPAT_BONUS : 1;
      },

      addRelic: (relicId) => {
        const state = get();
        const relic = state.getRelic(relicId);
        if (!relic) return false;

        const existing = state.getOwnedRelic(relicId);
        if (existing) {
          const shardsToAdd = Math.max(5, Math.floor(relic.awakenCost.shards / 3));
          state.addRelicShards(relicId, shardsToAdd);
          get().addBattleLog(`✨ 获得神器碎片：${relic.name} x${shardsToAdd}`, 'drop');
          return false;
        }

        const newOwned: OwnedRelic = {
          relicId,
          level: 1,
          awakened: false,
          equippedBy: null,
          shards: 0,
          acquiredAt: Date.now(),
        };

        set((s) => ({
          ownedRelics: [...s.ownedRelics, newOwned],
          relicCodex: s.relicCodex.map((e) =>
            e.relicId === relicId
              ? { ...e, unlocked: true, unlockedAt: Date.now(), levelReached: Math.max(e.levelReached, 1) }
              : e
          ),
        }));

        get().addBattleLog(`🏆 获得神器：${relic.icon} ${relic.name}（${RELIC_RARITY_NAMES[relic.rarity]}）`, 'drop');
        return true;
      },

      addRelicShards: (relicId, count) => {
        set((state) => ({
          ownedRelics: state.ownedRelics.map((r) =>
            r.relicId === relicId ? { ...r, shards: r.shards + count } : r
          ),
        }));
      },

      upgradeRelic: (relicId, exp) => {
        const state = get();
        const owned = state.getOwnedRelic(relicId);
        const relic = state.getRelic(relicId);
        if (!owned || !relic || owned.level >= RELIC_MAX_LEVEL) return false;

        const currentTotalExp = getRelicTotalExp(owned.level);
        const newTotalExp = currentTotalExp + exp;
        const { level } = getRelicLevelFromExp(newTotalExp);

        if (level > owned.level) {
          set((s) => ({
            ownedRelics: s.ownedRelics.map((r) =>
              r.relicId === relicId ? { ...r, level } : r
            ),
            relicCodex: s.relicCodex.map((e) =>
              e.relicId === relicId ? { ...e, levelReached: Math.max(e.levelReached, level) } : e
            ),
          }));
          get().addBattleLog(`⬆️ ${relic.name} 升至 Lv.${level}！`, 'levelup');
        } else {
          set((s) => ({
            ownedRelics: s.ownedRelics.map((r) =>
              r.relicId === relicId ? r : r
            ),
          }));
        }

        return true;
      },

      awakenRelic: (relicId) => {
        const state = get();
        const owned = state.getOwnedRelic(relicId);
        const relic = state.getRelic(relicId);
        if (!owned || !relic || owned.awakened) return false;
        if (owned.shards < relic.awakenCost.shards) return false;
        if (state.player.stats.soulOrbs < relic.awakenCost.soulOrbs) return false;
        if (owned.level < RELIC_MAX_LEVEL) return false;

        set((s) => ({
          ownedRelics: s.ownedRelics.map((r) =>
            r.relicId === relicId
              ? { ...r, awakened: true, shards: r.shards - relic.awakenCost.shards }
              : r
          ),
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              soulOrbs: s.player.stats.soulOrbs - relic.awakenCost.soulOrbs,
            },
          },
          relicCodex: s.relicCodex.map((e) =>
            e.relicId === relicId ? { ...e, awakened: true } : e
          ),
        }));

        get().addBattleLog(`🌟 ${relic.name} 觉醒成功！解锁隐藏属性！`, 'system');
        return true;
      },

      equipRelic: (relicId, companionId) => {
        const state = get();
        const owned = state.getOwnedRelic(relicId);
        const relic = state.getRelic(relicId);
        if (!owned || !relic) return false;
        if (companionId && !state.ownedCompanions.find((c) => c.id === companionId)) return false;

        set((s) => ({
          ownedRelics: s.ownedRelics.map((r) =>
            r.relicId === relicId ? { ...r, equippedBy: companionId } : r
          ),
        }));

        if (companionId) {
          const companion = state.ownedCompanions.find((c) => c.id === companionId);
          get().addBattleLog(`📿 ${relic.name} 装备给 ${companion?.name || '伙伴'}`, 'system');
        } else {
          get().addBattleLog(`📿 ${relic.name} 已卸下`, 'system');
        }
        return true;
      },

      unequipRelic: (relicId) => get().equipRelic(relicId, null),

      synthesizeRelic: (relicId) => {
        const state = get();
        const relic = state.getRelic(relicId);
        const owned = state.getOwnedRelic(relicId);
        if (!relic || owned) return false;

        const shardsNeeded = relic.awakenCost.shards * 2;
        const shardEntry = state.ownedRelics.find((r) => r.relicId === relicId);
        if (!shardEntry || shardEntry.shards < shardsNeeded) return false;

        set((s) => ({
          ownedRelics: s.ownedRelics.map((r) =>
            r.relicId === relicId ? { ...r, shards: r.shards - shardsNeeded } : r
          ),
        }));

        return state.addRelic(relicId);
      },

      getDroppableRelics: (monsterTier, areaId, playerLevel) => {
        return RELICS.filter((r) => {
          if (r.requiredPlayerLevel > playerLevel) return false;
          if (!r.dropAreas.includes(areaId)) return false;
          if (!r.dropMonsterTiers.includes(monsterTier)) return false;
          return true;
        });
      },

      tryDropRelic: (monsterTier, areaId) => {
        const state = get();
        const playerLevel = state.player.stats.level;
        const dropConfig = RELIC_DROP_CONFIG[monsterTier];
        if (!dropConfig) return { relic: null, shards: null };

        const droppable = state.getDroppableRelics(monsterTier, areaId, playerLevel);
        if (droppable.length === 0) return { relic: null, shards: null };

        const totalWeight = droppable.reduce((sum, r) => sum + r.dropChance, 0);
        const roll = Math.random() * totalWeight;

        let accumulated = 0;
        let selectedRelic: Relic | null = null;
        for (const r of droppable) {
          accumulated += r.dropChance * dropConfig.dropChanceMultiplier;
          if (roll <= accumulated) {
            selectedRelic = r;
            break;
          }
        }

        if (selectedRelic && Math.random() < 0.3 * dropConfig.dropChanceMultiplier) {
          return { relic: selectedRelic.id, shards: null };
        }

        if (Math.random() < dropConfig.shardDropChance) {
          const shardRelic = droppable[Math.floor(Math.random() * droppable.length)];
          const shardCount = Math.floor(
            Math.random() * (dropConfig.maxShards - dropConfig.minShards + 1) + dropConfig.minShards
          );
          return { relic: null, shards: { relicId: shardRelic.id, count: shardCount } };
        }

        return { relic: null, shards: null };
      },

      ownedBuildings: [],
      activeMerchantEvents: [],
      townActiveTab: 'overview',
      lastTownProductionTime: Date.now(),

      worldBossState: {
        currentSession: null,
        rotationIndex: 0,
        nextBossTime: Date.now() + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
        isActive: false,
        totalBossesDefeated: 0,
        history: [],
      },

      getCurrentWorldBoss: () => {
        const state = get();
        if (!state.worldBossState.currentSession) return undefined;
        return WORLD_BOSSES.find((b) => b.id === state.worldBossState.currentSession!.bossId);
      },

      getWorldBossSession: () => {
        return get().worldBossState.currentSession;
      },

      startWorldBossSession: () => {
        const state = get();
        if (state.worldBossState.currentSession) return;

        const bossId = WORLD_BOSS_ROTATION.bossIds[state.worldBossState.rotationIndex % WORLD_BOSS_ROTATION.bossIds.length];
        const boss = WORLD_BOSSES.find((b) => b.id === bossId);
        if (!boss) return;

        if (state.player.stats.level < boss.minPlayerLevel) return;

        const simulatedRanking: WorldBossRankingEntry[] = [];
        const participantCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < participantCount; i++) {
          const name = WORLD_BOSS_SIMULATED_PARTICIPANTS[Math.floor(Math.random() * WORLD_BOSS_SIMULATED_PARTICIPANTS.length)];
          simulatedRanking.push({
            name,
            damage: Math.floor(Math.random() * boss.baseHp * 0.15),
            timestamp: Date.now() - Math.floor(Math.random() * 60000),
          });
        }

        const session: WorldBossSession = {
          bossId,
          currentHp: boss.baseHp,
          maxHp: boss.baseHp,
          phaseIndex: 0,
          startTime: Date.now(),
          endTime: null,
          isDefeated: false,
          playerDamage: 0,
          playerDeaths: 0,
          reviveCount: 0,
          isDead: false,
          lastDamageTime: Date.now(),
          mechanicActive: null,
          ranking: simulatedRanking,
          damageLog: [],
          rewardsClaimed: false,
        };

        set({
          worldBossState: {
            ...state.worldBossState,
            currentSession: session,
            isActive: true,
          },
        });

        get().addBattleLog(`⚔️ 世界Boss ${boss.icon} ${boss.name} 降临！限时${boss.timeLimitSeconds / 60}分钟讨伐！`, 'system');
      },

      dealWorldBossDamage: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || session.isDefeated || session.isDead) return 0;

        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return 0;

        const playerAttack = get().getTotalAttack();
        const companionAttack = get().getFormationCompanions().reduce((sum, c) => sum + get().getCompanionEffectiveAttack(c), 0);
        const totalDamage = playerAttack + companionAttack;

        const phase = boss.phaseThresholds[session.phaseIndex];
        const phaseAtkMult = phase ? phase.attackMultiplier : 1;
        const phaseDefMult = phase ? phase.defenseMultiplier : 1;

        const defense = boss.defense * phaseDefMult;
        const actualDamage = Math.max(1, Math.floor(totalDamage / phaseAtkMult - defense * 0.5));

        const isCritical = Math.random() < (state.player.stats.luck * 0.01 + 0.05);
        const finalDamage = isCritical ? Math.floor(actualDamage * 1.5) : actualDamage;

        const mechanic = session.mechanicActive
          ? boss.mechanics.find((m) => m.id === session.mechanicActive)
          : null;
        const mechanicDamage = mechanic && mechanic.type !== 'shield' && mechanic.type !== 'heal'
          ? Math.floor(finalDamage * (mechanic.damageMultiplier - 1))
          : 0;
        const totalFinalDamage = finalDamage + mechanicDamage;

        const newHp = Math.max(0, session.currentHp - totalFinalDamage);
        let newPhaseIndex = session.phaseIndex;
        const hpPercent = newHp / session.maxHp;
        for (let i = boss.phaseThresholds.length - 1; i >= 0; i--) {
          if (hpPercent <= boss.phaseThresholds[i].hpPercent) {
            newPhaseIndex = i;
            break;
          }
        }

        if (newPhaseIndex > session.phaseIndex) {
          const newPhase = boss.phaseThresholds[newPhaseIndex];
          get().addBattleLog(`📊 ${boss.name}进入【${newPhase.name}】阶段！${newPhase.description}`, 'phase');
        }

        let newMechanicActive = session.mechanicActive;
        for (const m of boss.mechanics) {
          if (hpPercent <= m.hpPercent && (!session.mechanicActive || session.mechanicActive !== m.id)) {
            const alreadyTriggered = session.damageLog.some(
              (l) => l.mechanic === m.id
            );
            if (!alreadyTriggered) {
              newMechanicActive = m.id;
              get().addBattleLog(`${m.icon} ${boss.name}释放【${m.name}】！${m.description}`, 'skill');
              if (m.type === 'shield') {
                get().addBattleLog(`🛡️ ${boss.name}激活护盾，防御力大幅提升！`, 'system');
              } else if (m.type === 'heal') {
                const healAmount = Math.floor(session.maxHp * 0.05);
                const healedHp = Math.min(session.maxHp, newHp + healAmount);
                set({
                  worldBossState: {
                    ...get().worldBossState,
                    currentSession: {
                      ...get().worldBossState.currentSession!,
                      currentHp: healedHp,
                      mechanicActive: m.id,
                    },
                  },
                });
                get().addBattleLog(`💚 ${boss.name}恢复了${healAmount}点生命！`, 'heal');
              }
              break;
            }
          }
        }

        const logEntry: WorldBossDamageLogEntry = {
          timestamp: Date.now(),
          source: state.player.name || '你',
          damage: totalFinalDamage,
          mechanic: newMechanicActive || undefined,
          isCritical,
        };

        const isDefeated = newHp <= 0;

        const updatedRanking = [...session.ranking];
        const existingEntry = updatedRanking.find((e) => e.name === (state.player.name || '你'));
        if (existingEntry) {
          existingEntry.damage += totalFinalDamage;
          existingEntry.timestamp = Date.now();
        } else {
          updatedRanking.push({
            name: state.player.name || '你',
            damage: session.playerDamage + totalFinalDamage,
            timestamp: Date.now(),
          });
        }
        updatedRanking.sort((a, b) => b.damage - a.damage);

        if (Math.random() < 0.3) {
          const randomName = WORLD_BOSS_SIMULATED_PARTICIPANTS[Math.floor(Math.random() * WORLD_BOSS_SIMULATED_PARTICIPANTS.length)];
          const existingSim = updatedRanking.find((e) => e.name === randomName);
          if (existingSim) {
            existingSim.damage += Math.floor(Math.random() * totalDamage * 1.5);
          }
          updatedRanking.sort((a, b) => b.damage - a.damage);
        }

        set({
          worldBossState: {
            ...state.worldBossState,
            currentSession: {
              ...session,
              currentHp: newHp,
              phaseIndex: newPhaseIndex,
              isDefeated,
              playerDamage: session.playerDamage + totalFinalDamage,
              lastDamageTime: Date.now(),
              mechanicActive: newMechanicActive,
              endTime: isDefeated ? Date.now() : null,
              ranking: updatedRanking,
              damageLog: [...session.damageLog, logEntry],
            },
          },
        });

        if (isDefeated) {
          get().addBattleLog(`🎉 世界Boss ${boss.icon} ${boss.name} 已被击败！`, 'levelup');
          boss.killBonus.forEach((effect) => {
            switch (effect.type) {
              case 'soulOrbs': get().addSoulOrbs(effect.value); break;
              case 'attack': set((s) => ({ player: { ...s.player, stats: { ...s.player.stats, attack: s.player.stats.attack + effect.value } } })); break;
              case 'defense': set((s) => ({ player: { ...s.player, stats: { ...s.player.stats, defense: s.player.stats.defense + effect.value } } })); break;
              case 'hp': get().healHp(effect.value); break;
            }
          });

          const playerRank = updatedRanking.findIndex((e) => e.name === (state.player.name || '你')) + 1;
          const historyEntry: WorldBossHistoryEntry = {
            bossId: boss.id,
            defeatedAt: Date.now(),
            playerDamage: session.playerDamage + totalFinalDamage,
            playerRank,
            totalParticipants: updatedRanking.length,
            rewardsClaimed: false,
          };
          set((s) => ({
            worldBossState: {
              ...s.worldBossState,
              totalBossesDefeated: s.worldBossState.totalBossesDefeated + 1,
              history: [...s.worldBossState.history, historyEntry],
            },
          }));
        }

        return totalFinalDamage;
      },

      reviveInWorldBoss: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || !session.isDead) return false;
        if (session.reviveCount >= WORLD_BOSS_MAX_REVIVES) return false;
        if (state.player.stats.gold < WORLD_BOSS_REVIVE_COST_GOLD) return false;
        if (state.player.stats.soulOrbs < WORLD_BOSS_REVIVE_COST_SOUL_ORBS) return false;

        set((s) => ({
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              gold: s.player.stats.gold - WORLD_BOSS_REVIVE_COST_GOLD,
              soulOrbs: s.player.stats.soulOrbs - WORLD_BOSS_REVIVE_COST_SOUL_ORBS,
              hp: Math.floor(s.player.stats.maxHp * 0.5),
            },
          },
          worldBossState: {
            ...s.worldBossState,
            currentSession: session
              ? {
                  ...session,
                  isDead: false,
                  reviveCount: session.reviveCount + 1,
                }
              : null,
          },
        }));

        get().addBattleLog(`💫 你已复活！消耗💰${WORLD_BOSS_REVIVE_COST_GOLD} 💎${WORLD_BOSS_REVIVE_COST_SOUL_ORBS}`, 'heal');
        return true;
      },

      canReviveInWorldBoss: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || !session.isDead) return false;
        if (session.reviveCount >= WORLD_BOSS_MAX_REVIVES) return false;
        if (state.player.stats.gold < WORLD_BOSS_REVIVE_COST_GOLD) return false;
        if (state.player.stats.soulOrbs < WORLD_BOSS_REVIVE_COST_SOUL_ORBS) return false;
        return true;
      },

      checkWorldBossRotation: () => {
        const state = get();
        const now = Date.now();

        if (state.worldBossState.isActive && state.worldBossState.currentSession) {
          const boss = WORLD_BOSSES.find((b) => b.id === state.worldBossState.currentSession!.bossId);
          if (boss) {
            const elapsed = (now - state.worldBossState.currentSession.startTime) / 1000;
            if (elapsed >= boss.timeLimitSeconds && !state.worldBossState.currentSession.isDefeated) {
              get().addBattleLog(`⏰ 世界Boss ${boss.icon} ${boss.name} 讨伐时间结束，Boss撤退了！`, 'system');

              const playerRank = state.worldBossState.currentSession.ranking.findIndex(
                (e) => e.name === (state.player.name || '你')
              ) + 1;

              const historyEntry: WorldBossHistoryEntry = {
                bossId: boss.id,
                defeatedAt: now,
                playerDamage: state.worldBossState.currentSession.playerDamage,
                playerRank,
                totalParticipants: state.worldBossState.currentSession.ranking.length,
                rewardsClaimed: false,
              };

              set({
                worldBossState: {
                  ...state.worldBossState,
                  currentSession: null,
                  isActive: false,
                  rotationIndex: (state.worldBossState.rotationIndex + 1) % WORLD_BOSS_ROTATION.bossIds.length,
                  nextBossTime: now + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
                  history: [...state.worldBossState.history, historyEntry],
                },
              });
              return;
            }
          }

          if (state.worldBossState.currentSession.isDefeated) {
            const timeSinceDefeat = now - (state.worldBossState.currentSession.endTime || now);
            if (timeSinceDefeat >= 10000) {
              set({
                worldBossState: {
                  ...state.worldBossState,
                  currentSession: null,
                  isActive: false,
                  rotationIndex: (state.worldBossState.rotationIndex + 1) % WORLD_BOSS_ROTATION.bossIds.length,
                  nextBossTime: now + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
                },
              });
            }
          }
          return;
        }

        if (!state.worldBossState.isActive && now >= state.worldBossState.nextBossTime) {
          const nextBossId = WORLD_BOSS_ROTATION.bossIds[state.worldBossState.rotationIndex % WORLD_BOSS_ROTATION.bossIds.length];
          const nextBoss = WORLD_BOSSES.find((b) => b.id === nextBossId);

          if (nextBoss && state.player.stats.level >= nextBoss.minPlayerLevel) {
            get().addBattleLog(`📢 世界Boss即将降临：${nextBoss.icon} ${nextBoss.name}！`, 'system');
            get().startWorldBossSession();
          } else {
            set({
              worldBossState: {
                ...state.worldBossState,
                rotationIndex: (state.worldBossState.rotationIndex + 1) % WORLD_BOSS_ROTATION.bossIds.length,
                nextBossTime: now + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
              },
            });
          }
        }
      },

      claimWorldBossRewards: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || session.rewardsClaimed) return false;
        if (session.playerDamage <= 0) return false;

        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return false;

        const damagePercent = session.playerDamage / session.maxHp;
        let bestTier = boss.rewardTiers[boss.rewardTiers.length - 1];
        for (const tier of boss.rewardTiers) {
          if (damagePercent >= tier.minDamagePercent) {
            bestTier = tier;
            break;
          }
        }

        bestTier.rewards.forEach((effect) => {
          switch (effect.type) {
            case 'gold': get().addGold(effect.value); break;
            case 'exp': get().addExp(effect.value); break;
            case 'soulOrbs': get().addSoulOrbs(effect.value); break;
            case 'attack': set((s) => ({ player: { ...s.player, stats: { ...s.player.stats, attack: s.player.stats.attack + effect.value } } })); break;
            case 'defense': set((s) => ({ player: { ...s.player, stats: { ...s.player.stats, defense: s.player.stats.defense + effect.value } } })); break;
            case 'hp': get().healHp(effect.value); break;
            case 'speed': set((s) => ({ player: { ...s.player, stats: { ...s.player.stats, speed: s.player.stats.speed + effect.value } } })); break;
          }
        });

        get().addBattleLog(`🎁 获得世界Boss【${bestTier.title}】奖励！`, 'drop');

        set((s) => ({
          worldBossState: {
            ...s.worldBossState,
            currentSession: session ? { ...session, rewardsClaimed: true } : null,
            history: s.worldBossState.history.map((h, i) =>
              i === s.worldBossState.history.length - 1 ? { ...h, rewardsClaimed: true } : h
            ),
          },
        }));

        return true;
      },

      canClaimWorldBossRewards: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || session.rewardsClaimed) return false;
        return session.playerDamage > 0;
      },

      getPlayerWorldBossRank: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session) return 0;
        const idx = session.ranking.findIndex((e) => e.name === (state.player.name || '你'));
        return idx >= 0 ? idx + 1 : session.ranking.length + 1;
      },

      getPlayerDamagePercent: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || session.maxHp === 0) return 0;
        return session.playerDamage / session.maxHp;
      },

      getWorldBossPhaseInfo: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session) return null;
        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss || session.phaseIndex >= boss.phaseThresholds.length) return null;
        const phase = boss.phaseThresholds[session.phaseIndex];
        return { index: session.phaseIndex, name: phase.name, color: phase.color, description: phase.description };
      },

      getWorldBossActiveMechanic: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || !session.mechanicActive) return null;
        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return null;
        const mechanic = boss.mechanics.find((m) => m.id === session.mechanicActive);
        if (!mechanic) return null;
        return { id: mechanic.id, name: mechanic.name, description: mechanic.description, icon: mechanic.icon };
      },

      getWorldBossTimeRemaining: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session) {
          if (!state.worldBossState.isActive) {
            return Math.max(0, state.worldBossState.nextBossTime - Date.now());
          }
          return 0;
        }
        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return 0;
        const elapsed = (Date.now() - session.startTime) / 1000;
        return Math.max(0, (boss.timeLimitSeconds - elapsed) * 1000);
      },

      isWorldBossAvailable: () => {
        const state = get();
        if (!state.worldBossState.isActive) return false;
        const session = state.worldBossState.currentSession;
        if (!session || session.isDefeated) return false;
        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return false;
        return state.player.stats.level >= boss.minPlayerLevel;
      },

      tickWorldBoss: () => {
        const state = get();
        const session = state.worldBossState.currentSession;
        if (!session || session.isDefeated || session.isDead) return;

        const boss = WORLD_BOSSES.find((b) => b.id === session.bossId);
        if (!boss) return;

        if (Math.random() < boss.speed * 0.08) {
          const phase = boss.phaseThresholds[session.phaseIndex];
          const atkMult = phase ? phase.attackMultiplier : 1;
          const bossDamage = Math.floor(boss.attack * atkMult * (0.5 + Math.random() * 0.5));
          const playerDef = get().getTotalDefense();
          const mitigated = Math.max(1, bossDamage - Math.floor(playerDef * 0.3));

          const mechanic = session.mechanicActive
            ? boss.mechanics.find((m) => m.id === session.mechanicActive)
            : null;
          const mechanicExtra = mechanic && mechanic.type !== 'shield' && mechanic.type !== 'heal'
            ? Math.floor(mitigated * (mechanic.damageMultiplier - 1) * 0.3)
            : 0;

          const totalDamage = mitigated + mechanicExtra;
          get().takeDamage(totalDamage);

          const newHp = state.player.stats.hp - totalDamage;
          if (newHp <= 0) {
            set((s) => ({
              worldBossState: {
                ...s.worldBossState,
                currentSession: session ? { ...session, isDead: true, playerDeaths: session.playerDeaths + 1 } : null,
              },
            }));
            get().addBattleLog(`💀 你被${boss.icon} ${boss.name}击倒了！需要复活才能继续战斗`, 'death');
          }
        }
      },

      getBuilding: (buildingId) => BUILDINGS.find((b) => b.id === buildingId),

      getOwnedBuilding: (buildingId) => {
        const state = get();
        return state.ownedBuildings.find((b) => b.buildingId === buildingId);
      },

      getBuildingLevel: (buildingId) => {
        const state = get();
        const owned = state.ownedBuildings.find((b) => b.buildingId === buildingId);
        return owned?.level || 0;
      },

      getBuildingProduction: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        const level = state.getBuildingLevel(buildingId);
        if (!building || level === 0) {
          return { rate: 0, currency: 'gold', capacity: 0 };
        }
        const levelConfig = building.levels[level - 1];
        const stationBonus = state.getStationBonus(buildingId);
        const warehouseBonus = state.getWarehouseCapacityBonus();
        return {
          rate: Math.floor(levelConfig.productionRate * (1 + stationBonus)),
          currency: levelConfig.productionCurrency,
          capacity: Math.floor(levelConfig.capacity * (1 + warehouseBonus)),
        };
      },

      getWarehouseCapacityBonus: () => {
        const state = get();
        const warehouse = state.ownedBuildings.find((b) => b.buildingId === 'warehouse');
        if (!warehouse || warehouse.level === 0) return 0;
        return warehouse.level * 0.05;
      },

      getBuildingUpgradeCost: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        const currentLevel = state.getBuildingLevel(buildingId);
        if (!building) return null;
        if (currentLevel >= building.maxLevel) return null;
        const nextLevelConfig = building.levels[currentLevel];
        return { cost: nextLevelConfig.upgradeCost, currency: nextLevelConfig.upgradeCurrency };
      },

      canUpgradeBuilding: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        if (!building) return false;
        if (!state.isBuildingUnlocked(buildingId)) return false;
        const cost = state.getBuildingUpgradeCost(buildingId);
        if (!cost) return false;
        if (cost.currency === 'gold') {
          return state.player.stats.gold >= cost.cost;
        } else {
          return state.player.stats.soulOrbs >= cost.cost;
        }
      },

      upgradeBuilding: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        if (!building) return false;
        if (!state.canUpgradeBuilding(buildingId)) return false;

        const cost = state.getBuildingUpgradeCost(buildingId);
        if (!cost) return false;

        const currentLevel = state.getBuildingLevel(buildingId);

        if (cost.currency === 'gold') {
          set((s) => ({
            player: {
              ...s.player,
              stats: { ...s.player.stats, gold: s.player.stats.gold - cost.cost },
            },
          }));
        } else {
          set((s) => ({
            player: {
              ...s.player,
              stats: { ...s.player.stats, soulOrbs: s.player.stats.soulOrbs - cost.cost },
            },
          }));
        }

        if (currentLevel === 0) {
          set((s) => ({
            ownedBuildings: [
              ...s.ownedBuildings,
              {
                buildingId,
                level: 1,
                currentResources: 0,
                lastCollectTime: Date.now(),
                stationedCompanionIds: [],
              },
            ],
          }));
          get().addBattleLog(`🏗️ 建造了 ${building.name}！`, 'system');
        } else {
          set((s) => ({
            ownedBuildings: s.ownedBuildings.map((b) =>
              b.buildingId === buildingId ? { ...b, level: b.level + 1 } : b
            ),
          }));
          get().addBattleLog(`⬆️ ${building.name} 升级到 ${currentLevel + 1} 级！`, 'system');
        }

        return true;
      },

      getBuildingCurrentResources: (buildingId) => {
        const state = get();
        const owned = state.getOwnedBuilding(buildingId);
        const production = state.getBuildingProduction(buildingId);
        if (!owned || production.rate === 0) return 0;

        const now = Date.now();
        const elapsedMs = now - owned.lastCollectTime;
        const elapsedMinutes = elapsedMs / 60000;
        const produced = production.rate * elapsedMinutes;

        return Math.min(produced, production.capacity);
      },

      collectBuildingResources: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        const owned = state.getOwnedBuilding(buildingId);
        if (!building || !owned) return { gold: 0, exp: 0, soulOrbs: 0 };

        const resources = state.getBuildingCurrentResources(buildingId);
        const production = state.getBuildingProduction(buildingId);

        if (resources <= 0) return { gold: 0, exp: 0, soulOrbs: 0 };

        const result = { gold: 0, exp: 0, soulOrbs: 0 };

        if (production.currency === 'gold') {
          result.gold = Math.floor(resources);
          get().addGold(Math.floor(resources));
        } else if (production.currency === 'exp') {
          result.exp = Math.floor(resources);
          get().addExp(Math.floor(resources));
        } else if (production.currency === 'soulOrbs') {
          result.soulOrbs = Math.floor(resources);
          get().addSoulOrbs(Math.floor(resources));
        }

        set((s) => ({
          ownedBuildings: s.ownedBuildings.map((b) =>
            b.buildingId === buildingId ? { ...b, lastCollectTime: Date.now() } : b
          ),
        }));

        get().addBattleLog(
          `💰 从 ${building.name} 收集了 ${Math.floor(resources)} ${
            production.currency === 'gold' ? '金币' : production.currency === 'exp' ? '经验' : '魂珠'
          }`,
          'gold'
        );

        return result;
      },

      collectAllBuildingResources: () => {
        const state = get();
        let totalGold = 0;
        let totalExp = 0;
        let totalSoulOrbs = 0;

        state.ownedBuildings.forEach((owned) => {
          const result = state.collectBuildingResources(owned.buildingId);
          totalGold += result.gold;
          totalExp += result.exp;
          totalSoulOrbs += result.soulOrbs;
        });

        return { gold: totalGold, exp: totalExp, soulOrbs: totalSoulOrbs };
      },

      getTotalBuildingProduction: () => {
        const state = get();
        let goldPerMinute = 0;
        let expPerMinute = 0;
        let soulOrbsPerMinute = 0;

        state.ownedBuildings.forEach((owned) => {
          const production = state.getBuildingProduction(owned.buildingId);
          if (production.currency === 'gold') {
            goldPerMinute += production.rate;
          } else if (production.currency === 'exp') {
            expPerMinute += production.rate;
          } else if (production.currency === 'soulOrbs') {
            soulOrbsPerMinute += production.rate;
          }
        });

        return { goldPerMinute, expPerMinute, soulOrbsPerMinute };
      },

      getUnlockedBuildings: () => {
        const state = get();
        const playerLevel = state.player.stats.level;
        return BUILDINGS.filter((b) => b.unlockLevel <= playerLevel);
      },

      isBuildingUnlocked: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        if (!building) return false;
        return state.player.stats.level >= building.unlockLevel;
      },

      getStationedCompanions: (buildingId) => {
        const state = get();
        const owned = state.getOwnedBuilding(buildingId);
        if (!owned) return [];
        return owned.stationedCompanionIds
          .map((id) => state.ownedCompanions.find((c) => c.id === id))
          .filter((c): c is Companion => c !== undefined);
      },

      getAvailableCompanionsForStation: () => {
        const state = get();
        const stationedIds = new Set<string>();
        state.ownedBuildings.forEach((b) => {
          b.stationedCompanionIds.forEach((id) => stationedIds.add(id));
        });
        return state.ownedCompanions.filter((c) => !stationedIds.has(c.id));
      },

      getStationBonus: (buildingId) => {
        const state = get();
        const companions = state.getStationedCompanions(buildingId);
        if (companions.length === 0) return 0;

        let totalBonus = 0;
        companions.forEach((c) => {
          const rarityBonus: Record<string, number> = {
            common: 0.05,
            rare: 0.1,
            epic: 0.2,
            legendary: 0.35,
          };
          const levelBonus = c.level * 0.005;
          const starBonus = c.stars * 0.02;
          totalBonus += (rarityBonus[c.rarity] || 0.05) + levelBonus + starBonus;
        });

        return totalBonus;
      },

      canStationCompanion: (buildingId, companionId) => {
        const state = get();
        const owned = state.getOwnedBuilding(buildingId);
        if (!owned || owned.level === 0) return false;
        const slots = state.getBuildingStationSlots(buildingId);
        if (owned.stationedCompanionIds.length >= slots) return false;
        if (owned.stationedCompanionIds.includes(companionId)) return false;
        const available = state.getAvailableCompanionsForStation();
        return available.some((c) => c.id === companionId);
      },

      stationCompanion: (buildingId, companionId) => {
        const state = get();
        if (!state.canStationCompanion(buildingId, companionId)) return false;

        set((s) => ({
          ownedBuildings: s.ownedBuildings.map((b) =>
            b.buildingId === buildingId
              ? { ...b, stationedCompanionIds: [...b.stationedCompanionIds, companionId] }
              : b
          ),
        }));

        const companion = state.ownedCompanions.find((c) => c.id === companionId);
        const building = state.getBuilding(buildingId);
        if (companion && building) {
          get().addBattleLog(`👥 ${companion.name} 驻守到了 ${building.name}`, 'system');
        }

        return true;
      },

      unstationCompanion: (buildingId, companionId) => {
        const state = get();
        const owned = state.getOwnedBuilding(buildingId);
        if (!owned) return false;
        if (!owned.stationedCompanionIds.includes(companionId)) return false;

        set((s) => ({
          ownedBuildings: s.ownedBuildings.map((b) =>
            b.buildingId === buildingId
              ? {
                  ...b,
                  stationedCompanionIds: b.stationedCompanionIds.filter((id) => id !== companionId),
                }
              : b
          ),
        }));

        const companion = state.ownedCompanions.find((c) => c.id === companionId);
        const building = state.getBuilding(buildingId);
        if (companion && building) {
          get().addBattleLog(`👤 ${companion.name} 离开了 ${building.name}`, 'system');
        }

        return true;
      },

      getBuildingStationSlots: (buildingId) => {
        const state = get();
        const building = state.getBuilding(buildingId);
        const level = state.getBuildingLevel(buildingId);
        if (!building || level === 0) return 0;
        const levelConfig = building.levels[level - 1];
        return levelConfig.stationSlots;
      },

      getActiveMerchantEvents: () => {
        const state = get();
        const now = Date.now();
        return state.activeMerchantEvents.filter((e) => e.endTime > now);
      },

      getMerchantEvent: (eventId) => MERCHANT_EVENTS.find((e) => e.id === eventId),

      getMerchantItemStock: (eventId, itemId) => {
        const state = get();
        const event = state.getMerchantEvent(eventId);
        const activeEvent = state.activeMerchantEvents.find((e) => e.eventId === eventId);
        if (!event || !activeEvent) return 0;
        const item = event.items.find((i) => i.id === itemId);
        if (!item) return 0;
        const purchased = activeEvent.purchasedItems[itemId] || 0;
        return Math.max(0, (item.stock || 1) - purchased);
      },

      canBuyMerchantItem: (eventId, itemId) => {
        const state = get();
        const event = state.getMerchantEvent(eventId);
        if (!event) return false;
        const stock = state.getMerchantItemStock(eventId, itemId);
        if (stock <= 0) return false;
        const item = event.items.find((i) => i.id === itemId);
        if (!item) return false;
        if (item.priceCurrency === 'gold') {
          return state.player.stats.gold >= item.price;
        } else {
          return state.player.stats.soulOrbs >= item.price;
        }
      },

      buyMerchantItem: (eventId, itemId) => {
        const state = get();
        const event = state.getMerchantEvent(eventId);
        if (!event) return false;
        if (!state.canBuyMerchantItem(eventId, itemId)) return false;

        const item = event.items.find((i) => i.id === itemId);
        if (!item) return false;

        if (item.priceCurrency === 'gold') {
          set((s) => ({
            player: {
              ...s.player,
              stats: { ...s.player.stats, gold: s.player.stats.gold - item.price },
            },
          }));
        } else {
          set((s) => ({
            player: {
              ...s.player,
              stats: { ...s.player.stats, soulOrbs: s.player.stats.soulOrbs - item.price },
            },
          }));
        }

        set((s) => ({
          activeMerchantEvents: s.activeMerchantEvents.map((e) =>
            e.eventId === eventId
              ? {
                  ...e,
                  purchasedItems: {
                    ...e.purchasedItems,
                    [itemId]: (e.purchasedItems[itemId] || 0) + 1,
                  },
                }
              : e
          ),
        }));

        switch (item.rewardType) {
          case 'gold':
            get().addGold(item.rewardValue);
            break;
          case 'exp':
            get().addExp(item.rewardValue);
            break;
          case 'soulOrbs':
            get().addSoulOrbs(item.rewardValue);
            break;
          case 'attack':
            set((s) => ({
              player: {
                ...s.player,
                stats: { ...s.player.stats, attack: s.player.stats.attack + item.rewardValue },
              },
            }));
            break;
          case 'defense':
            set((s) => ({
              player: {
                ...s.player,
                stats: { ...s.player.stats, defense: s.player.stats.defense + item.rewardValue },
              },
            }));
            break;
          case 'hp':
            set((s) => ({
              player: {
                ...s.player,
                stats: {
                  ...s.player.stats,
                  maxHp: s.player.stats.maxHp + item.rewardValue,
                  hp: s.player.stats.hp + item.rewardValue,
                },
              },
            }));
            break;
        }

        get().addBattleLog(`🛒 从 ${event.merchantName} 购买了 ${item.name}`, 'system');
        return true;
      },

      checkMerchantEvents: () => {
        const state = get();
        const now = Date.now();

        set((s) => ({
          activeMerchantEvents: s.activeMerchantEvents.filter((e) => e.endTime > now),
        }));

        const activeEvents = state.getActiveMerchantEvents();
        if (activeEvents.length >= 3) return;

        const chance = state.getMerchantEventChance();
        if (Math.random() > chance) return;

        const availableEvents = MERCHANT_EVENTS.filter(
          (e) => !state.activeMerchantEvents.some((ae) => ae.eventId === e.id)
        );

        if (availableEvents.length === 0) return;

        const weightedEvents = availableEvents.map((e) => {
          const rarityWeights: Record<string, number> = {
            common: 40,
            rare: 25,
            epic: 10,
            legendary: 3,
          };
          return { event: e, weight: rarityWeights[e.rarity] || 10 };
        });

        const totalWeight = weightedEvents.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;
        let selectedEvent = weightedEvents[0].event;

        for (const w of weightedEvents) {
          roll -= w.weight;
          if (roll <= 0) {
            selectedEvent = w.event;
            break;
          }
        }

        const newEvent: ActiveMerchantEvent = {
          eventId: selectedEvent.id,
          startTime: now,
          endTime: now + selectedEvent.durationSeconds * 1000,
          purchasedItems: {},
        };

        set((s) => ({
          activeMerchantEvents: [...s.activeMerchantEvents, newEvent],
        }));

        get().addBattleLog(`🎪 ${selectedEvent.title}！`, 'event');
      },

      getMerchantEventChance: () => {
        const state = get();
        let chance = TOWN_MERCHANT_EVENT_BASE_CHANCE;

        const tavern = state.ownedBuildings.find((b) => b.buildingId === 'tavern');
        if (tavern && tavern.level > 0) {
          chance += tavern.level * 0.005;
        }

        const market = state.ownedBuildings.find((b) => b.buildingId === 'market');
        if (market && market.level > 0) {
          chance += market.level * 0.008;
        }

        return Math.min(chance, 0.5);
      },

      calculateOfflineTownRewards: () => {
        const state = get();
        const now = Date.now();
        const offlineMs = now - state.lastOnlineTime;
        const offlineMinutes = Math.min(
          offlineMs / 60000,
          TOWN_MAX_OFFLINE_HOURS * 60
        );

        let totalGold = 0;
        let totalExp = 0;
        let totalSoulOrbs = 0;
        const buildingRewards: OfflineTownRewards['breakdown']['buildingRewards'] = [];

        state.ownedBuildings.forEach((owned) => {
          const building = state.getBuilding(owned.buildingId);
          const production = state.getBuildingProduction(owned.buildingId);
          if (!building || production.rate === 0) return;

          const produced = production.rate * offlineMinutes * TOWN_OFFLINE_EFFICIENCY;
          const capped = Math.min(produced, production.capacity);

          const reward = Math.floor(capped);
          if (reward <= 0) return;

          const buildingReward = {
            buildingId: owned.buildingId,
            name: building.name,
            gold: 0,
            exp: 0,
            soulOrbs: 0,
          };

          if (production.currency === 'gold') {
            buildingReward.gold = reward;
            totalGold += reward;
          } else if (production.currency === 'exp') {
            buildingReward.exp = reward;
            totalExp += reward;
          } else if (production.currency === 'soulOrbs') {
            buildingReward.soulOrbs = reward;
            totalSoulOrbs += reward;
          }

          buildingRewards.push(buildingReward);
        });

        let stationBonus = 0;
        state.ownedBuildings.forEach((owned) => {
          if (owned.stationedCompanionIds.length > 0) {
            stationBonus += state.getStationBonus(owned.buildingId);
          }
        });

        return {
          gold: totalGold,
          exp: totalExp,
          soulOrbs: totalSoulOrbs,
          breakdown: {
            buildingRewards,
            stationBonus,
            totalOfflineMinutes: Math.floor(offlineMinutes),
          },
        };
      },

      collectOfflineTownRewards: () => {
        const state = get();
        const rewards = state.calculateOfflineTownRewards();

        if (rewards.gold > 0) {
          get().addGold(rewards.gold);
        }
        if (rewards.exp > 0) {
          get().addExp(rewards.exp);
        }
        if (rewards.soulOrbs > 0) {
          get().addSoulOrbs(rewards.soulOrbs);
        }

        set((s) => ({
          ownedBuildings: s.ownedBuildings.map((b) => ({
            ...b,
            lastCollectTime: Date.now(),
          })),
        }));

        get().addBattleLog(
          `🏘️ 城镇离线收益：💰 ${rewards.gold} ⭐ ${rewards.exp} 💎 ${rewards.soulOrbs}`,
          'system'
        );
      },

      updateTownProduction: () => {
        const state = get();
        set({ lastTownProductionTime: Date.now() });
        state.checkMerchantEvents();
      },

      setTownActiveTab: (tab) => set({ townActiveTab: tab }),

      getAlchemyLevelConfig: () => {
        const level = get().alchemyLevel;
        return ALCHEMY_LEVEL_CONFIGS.find(c => c.level === level) || ALCHEMY_LEVEL_CONFIGS[0];
      },

      getAlchemyExpToNext: () => {
        const level = get().alchemyLevel;
        const config = ALCHEMY_LEVEL_CONFIGS.find(c => c.level === level);
        const nextConfig = ALCHEMY_LEVEL_CONFIGS.find(c => c.level === level + 1);
        if (!nextConfig) return 0;
        return (nextConfig.expRequired || 0) - (config?.expRequired || 0);
      },

      addAlchemyExp: (exp) => {
        set((state) => {
          let newExp = state.alchemyExp + exp;
          let newLevel = state.alchemyLevel;
          const maxLevel = ALCHEMY_LEVEL_CONFIGS.length;

          while (newLevel < maxLevel) {
            const nextConfig = ALCHEMY_LEVEL_CONFIGS.find(c => c.level === newLevel + 1);
            if (!nextConfig) break;
            const currentConfigExp = ALCHEMY_LEVEL_CONFIGS.find(c => c.level === newLevel)?.expRequired || 0;
            const needed = nextConfig.expRequired - currentConfigExp;
            if (newExp >= needed) {
              newExp -= needed;
              newLevel += 1;
              get().addBattleLog(`⚗️ 炼金等级提升至 ${newLevel} 级！`, 'levelup');
            } else {
              break;
            }
          }

          const newUnlocked = ALCHEMY_RECIPES.filter(r => r.requiredAlchemyLevel <= newLevel).map(r => r.id);
          const mergedUnlocked = [...new Set([...state.unlockedRecipeIds, ...newUnlocked])];

          return { alchemyExp: newExp, alchemyLevel: newLevel, unlockedRecipeIds: mergedUnlocked };
        });
      },

      getAlchemySuccessRate: (recipe) => {
        const config = get().getAlchemyLevelConfig();
        return Math.min(1.0, recipe.successRate + config.successRateBonus);
      },

      getAlchemyEffectMultiplier: () => {
        const config = get().getAlchemyLevelConfig();
        return config.bonusEffectMultiplier;
      },

      canCraftPotion: (recipeId) => {
        const state = get();
        const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;
        if (state.alchemyLevel < recipe.requiredAlchemyLevel) return false;
        if (!state.unlockedRecipeIds.includes(recipeId)) return false;
        if (state.player.stats.gold < recipe.goldCost) return false;

        for (const input of recipe.inputs) {
          const count = get().getMaterialCount(input.materialId);
          if (count < input.count) return false;
        }

        return true;
      },

      craftPotion: (recipeId) => {
        const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
        if (!recipe || !get().canCraftPotion(recipeId)) {
          return { success: false, potionId: null, count: 0 };
        }

        const successRate = get().getAlchemySuccessRate(recipe);
        const roll = Math.random();
        const success = roll <= successRate;

        set((s) => ({
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              gold: s.player.stats.gold - recipe.goldCost,
            },
          },
        }));

        for (const input of recipe.inputs) {
          const currentCount = get().getMaterialCount(input.materialId);
          const newCount = success ? currentCount - input.count : currentCount - Math.ceil(input.count * (1 - ALCHEMY_CRAFT_FAIL_REFUND_RATE));
          set((s) => ({
            materialInventory: newCount <= 0
              ? s.materialInventory.filter(m => m.materialId !== input.materialId)
              : s.materialInventory.map(m => m.materialId === input.materialId ? { ...m, count: newCount } : m),
          }));
        }

        const expGain = ALCHEMY_EXP_PER_CRAFT[recipe.rarity] || 10;
        get().addAlchemyExp(expGain);

        if (success) {
          const multiplier = get().getAlchemyEffectMultiplier();
          const outputCount = Math.max(1, Math.floor(recipe.outputCount * multiplier));
          get().addPotion(recipe.outputPotionId, outputCount);

          const potion = POTIONS.find(p => p.id === recipe.outputPotionId);
          get().addBattleLog(
            `⚗️ 炼制成功！获得 ${potion?.icon || '🧪'} ${potion?.name || recipe.outputPotionId} ×${outputCount}`,
            'event'
          );

          set({ lastCraftTime: Date.now() });
          return { success: true, potionId: recipe.outputPotionId, count: outputCount };
        } else {
          get().addBattleLog('⚗️ 炼制失败...部分材料已消耗', 'system');
          set({ lastCraftTime: Date.now() });
          return { success: false, potionId: null, count: 0 };
        }
      },

      usePotion: (potionId) => {
        const state = get();
        const owned = state.ownedPotions.find(p => p.potionId === potionId);
        if (!owned || owned.count <= 0) return false;

        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion) return false;

        if (potion.combatUsable && potion.duration !== 'instant') return false;

        if (potion.duration === 'instant') {
          const multiplier = get().getAlchemyEffectMultiplier();
          for (const effect of potion.effects) {
            const value = effect.isPercent ? effect.value : Math.floor(effect.value * multiplier);
            switch (effect.type) {
              case 'hp':
                if (effect.isPercent) get().healHp(Math.floor(state.player.stats.maxHp * value / 100));
                else get().healHp(value);
                break;
              case 'mp':
                if (effect.isPercent) get().healMp(Math.floor(state.player.stats.maxMp * value / 100));
                else get().healMp(value);
                break;
              case 'maxHp':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, maxHp: s.player.stats.maxHp + value, hp: s.player.stats.hp + value } } }));
                break;
              case 'maxMp':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, maxMp: s.player.stats.maxMp + value, mp: s.player.stats.mp + value } } }));
                break;
              case 'attack':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, attack: s.player.stats.attack + value } } }));
                break;
              case 'defense':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, defense: s.player.stats.defense + value } } }));
                break;
              case 'speed':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, speed: s.player.stats.speed + value } } }));
                break;
              case 'luck':
                set(s => ({ player: { ...s.player, stats: { ...s.player.stats, luck: s.player.stats.luck + value } } }));
                break;
            }
          }
          get().addBattleLog(`${potion.icon} 使用了 ${potion.name}`, 'heal');
        } else {
          get().applyAlchemyBuffs(potionId);
        }

        set((s) => ({
          ownedPotions: s.ownedPotions.map(p =>
            p.potionId === potionId ? { ...p, count: p.count - 1 } : p
          ).filter(p => p.count > 0),
        }));

        return true;
      },

      usePotionInCombat: (potionId) => {
        const state = get();
        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion || !potion.combatUsable) return false;

        const owned = state.ownedPotions.find(p => p.potionId === potionId);
        if (!owned || owned.count <= 0) return false;

        const multiplier = get().getAlchemyEffectMultiplier();
        for (const effect of potion.effects) {
          const value = effect.isPercent ? effect.value : Math.floor(effect.value * multiplier);
          switch (effect.type) {
            case 'hp':
              if (effect.isPercent) get().healHp(Math.floor(state.player.stats.maxHp * value / 100));
              else get().healHp(value);
              break;
            case 'mp':
              if (effect.isPercent) get().healMp(Math.floor(state.player.stats.maxMp * value / 100));
              else get().healMp(value);
              break;
            case 'damageReduction':
              get().applyAlchemyBuffs(potionId);
              break;
          }
        }

        get().addBattleLog(`${potion.icon} 使用了 ${potion.name}`, 'heal');

        set((s) => ({
          ownedPotions: s.ownedPotions.map(p =>
            p.potionId === potionId ? { ...p, count: p.count - 1 } : p
          ).filter(p => p.count > 0),
        }));

        return true;
      },

      applyAlchemyBuffs: (potionId) => {
        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion) return;

        const existing = get().activeAlchemyBuffs.find(b => b.potionId === potionId);
        if (existing) {
          if (existing.duration === 'battle' && existing.remainingBattles !== undefined) {
            set((s) => ({
              activeAlchemyBuffs: s.activeAlchemyBuffs.map(b =>
                b.potionId === potionId
                  ? { ...b, remainingBattles: (b.remainingBattles || 0) + ALCHEMY_BATTLE_BUFF_DURATION }
                  : b
              ),
            }));
          } else if (existing.duration === 'timed' && existing.expiresAt !== null) {
            set((s) => ({
              activeAlchemyBuffs: s.activeAlchemyBuffs.map(b =>
                b.potionId === potionId
                  ? { ...b, expiresAt: b.expiresAt! + (potion.durationSeconds || 600) * 1000 }
                  : b
              ),
            }));
          }
        } else {
          const buff: ActiveAlchemyBuff = {
            potionId: potion.id,
            potionName: potion.name,
            icon: potion.icon,
            effects: potion.effects,
            appliedAt: Date.now(),
            expiresAt: potion.duration === 'timed' ? Date.now() + (potion.durationSeconds || 600) * 1000 : null,
            duration: potion.duration,
            remainingBattles: potion.duration === 'battle' ? ALCHEMY_BATTLE_BUFF_DURATION : undefined,
          };
          set((s) => ({ activeAlchemyBuffs: [...s.activeAlchemyBuffs, buff] }));
        }

        get().addBattleLog(`${potion.icon} 获得了 ${potion.name} 的增益效果`, 'event');
      },

      tickAlchemyBuffs: () => {
        const now = Date.now();
        set((s) => ({
          activeAlchemyBuffs: s.activeAlchemyBuffs.filter(b => {
            if (b.duration === 'timed' && b.expiresAt !== null) {
              return b.expiresAt > now;
            }
            if (b.duration === 'battle' && b.remainingBattles !== undefined) {
              return b.remainingBattles > 0;
            }
            return true;
          }),
        }));
      },

      consumeBattleBuff: () => {
        set((s) => ({
          activeAlchemyBuffs: s.activeAlchemyBuffs.map(b => {
            if (b.duration === 'battle' && b.remainingBattles !== undefined && b.remainingBattles > 0) {
              return { ...b, remainingBattles: b.remainingBattles - 1 };
            }
            return b;
          }),
        }));
        get().tickAlchemyBuffs();
      },

      getActiveAlchemyBonus: (type) => {
        const buffs = get().activeAlchemyBuffs;
        let flat = 0;
        let percent = 0;
        const multiplier = get().getAlchemyEffectMultiplier();

        for (const buff of buffs) {
          for (const effect of buff.effects) {
            if (effect.type === type) {
              if (effect.isPercent) {
                percent += effect.value * multiplier;
              } else {
                flat += Math.floor(effect.value * multiplier);
              }
            }
          }
        }
        return { flat, percent };
      },

      getAlchemyBuffDamageReduction: () => get().getActiveAlchemyBonus('damageReduction').percent / 100,

      getAlchemyBuffCritRate: () => get().getActiveAlchemyBonus('critRate').percent,

      getAlchemyBuffCritDamage: () => get().getActiveAlchemyBonus('critDamage').percent,

      getAlchemyBuffExpBonus: () => get().getActiveAlchemyBonus('expBonus').percent / 100,

      getAlchemyBuffGoldBonus: () => get().getActiveAlchemyBonus('goldBonus').percent / 100,

      getAlchemyBuffSoulOrbBonus: () => get().getActiveAlchemyBonus('soulOrbBonus').percent / 100,

      getPotionInfo: (potionId) => POTIONS.find(p => p.id === potionId),

      getOwnedPotionCount: (potionId) => {
        const owned = get().ownedPotions.find(p => p.potionId === potionId);
        return owned?.count || 0;
      },

      addPotion: (potionId, count) => {
        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion) return;
        const stackLimit = potion.stackLimit;

        set((s) => {
          const existing = s.ownedPotions.find(p => p.potionId === potionId);
          if (existing) {
            return {
              ownedPotions: s.ownedPotions.map(p =>
                p.potionId === potionId
                  ? { ...p, count: Math.min(p.count + count, stackLimit) }
                  : p
              ),
            };
          }
          return { ownedPotions: [...s.ownedPotions, { potionId, count: Math.min(count, stackLimit) }] };
        });
      },

      sellPotion: (potionId, count) => {
        const state = get();
        const owned = state.ownedPotions.find(p => p.potionId === potionId);
        if (!owned || owned.count < count) return false;

        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion) return false;

        const goldGained = potion.sellPrice * count;
        get().addGold(goldGained);

        set((s) => ({
          ownedPotions: s.ownedPotions.map(p =>
            p.potionId === potionId ? { ...p, count: p.count - count } : p
          ).filter(p => p.count > 0),
        }));

        get().addBattleLog(`💰 出售 ${potion.icon} ${potion.name} ×${count}，获得 ${goldGained} 金币`, 'gold');
        return true;
      },

      unlockRecipe: (recipeId) => {
        const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return;
        set((s) => {
          if (s.unlockedRecipeIds.includes(recipeId)) return s;
          return { unlockedRecipeIds: [...s.unlockedRecipeIds, recipeId] };
        });
        get().addBattleLog(`📜 解锁了新配方：${recipe.name}`, 'event');
      },

      isRecipeUnlocked: (recipeId) => get().unlockedRecipeIds.includes(recipeId),

      setAlchemyActiveTab: (tab) => set({ alchemyActiveTab: tab }),

      unlockMonsterCodex: (monsterId, tier) => {
        const state = get();
        const entry = state.monsterCodex.find((e) => e.monsterId === monsterId);
        if (!entry) return;

        const now = Date.now();
        const tierOrder: MonsterTier[] = ['normal', 'elite', 'boss'];
        const currentTierIndex = entry.maxTierDefeated ? tierOrder.indexOf(entry.maxTierDefeated) : -1;
        const newTierIndex = tier ? tierOrder.indexOf(tier) : 0;
        const newMaxTier: MonsterTier | null = newTierIndex > currentTierIndex
          ? (tier || 'normal')
          : entry.maxTierDefeated;

        set((s) => ({
          monsterCodex: s.monsterCodex.map((e) => {
            if (e.monsterId !== monsterId) return e;
            return {
              ...e,
              unlocked: true,
              unlockedAt: e.unlockedAt || now,
              firstDefeatedAt: e.firstDefeatedAt || now,
              killCount: e.killCount + 1,
              maxTierDefeated: newMaxTier,
            };
          }),
        }));

        get().checkAchievements();
      },

      encounterMonsterCodex: (monsterId, tier) => {
        const state = get();
        const entry = state.monsterCodex.find((e) => e.monsterId === monsterId);
        if (!entry || entry.unlocked) return;

        const now = Date.now();
        const newTier: MonsterTier | null = tier || null;

        set((s) => ({
          monsterCodex: s.monsterCodex.map((e) => {
            if (e.monsterId !== monsterId) return e;
            return {
              ...e,
              unlocked: true,
              unlockedAt: now,
              firstDefeatedAt: null,
              killCount: 0,
              maxTierDefeated: newTier && (!e.maxTierDefeated || (tier && ['normal', 'elite', 'boss'].indexOf(tier) > ['normal', 'elite', 'boss'].indexOf(e.maxTierDefeated)))
                ? newTier
                : e.maxTierDefeated,
            };
          }),
        }));

        get().checkAchievements();
      },

      getMonsterCodexEntry: (monsterId) => {
        const entry = get().monsterCodex.find((e) => e.monsterId === monsterId);
        return entry || { monsterId, unlocked: false, unlockedAt: null, firstDefeatedAt: null, killCount: 0, maxTierDefeated: null };
      },

      getMonsterCodexProgress: () => {
        const codex = get().monsterCodex;
        const total = codex.length;
        const unlocked = codex.filter((e) => e.unlocked).length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;
        return { total, unlocked, percentage };
      },

      unlockEventCodex: (eventId, choiceId) => {
        const state = get();
        const entry = state.eventCodex.find((e) => e.eventId === eventId);
        if (!entry) return;

        const now = Date.now();
        set((s) => ({
          eventCodex: s.eventCodex.map((e) => {
            if (e.eventId !== eventId) return e;
            const newChoices = { ...e.choicesMade };
            if (choiceId) {
              newChoices[choiceId] = (newChoices[choiceId] || 0) + 1;
            }
            return {
              ...e,
              unlocked: true,
              unlockedAt: e.unlockedAt || now,
              triggerCount: e.triggerCount + 1,
              choicesMade: newChoices,
            };
          }),
        }));

        get().checkAchievements();
      },

      getEventCodexEntry: (eventId) => {
        const entry = get().eventCodex.find((e) => e.eventId === eventId);
        return entry || { eventId, unlocked: false, unlockedAt: null, triggerCount: 0, choicesMade: {} };
      },

      getEventCodexProgress: () => {
        const codex = get().eventCodex;
        const total = codex.length;
        const unlocked = codex.filter((e) => e.unlocked).length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;
        return { total, unlocked, percentage };
      },

      addRebirthRecord: (record) => {
        set((s) => ({
          rebirthRecords: [
            ...s.rebirthRecords,
            { ...record, id: s.rebirthRecords.length + 1 },
          ],
        }));
        get().checkAchievements();
      },

      getRebirthRecords: () => {
        return get().rebirthRecords;
      },

      getAchievementProgress: (achievementId) => {
        const progress = get().achievementProgresses.find((p) => p.achievementId === achievementId);
        return progress || { achievementId, unlocked: false, unlockedAt: null, claimed: false, claimedAt: null, progress: 0 };
      },

      getAchievementsByCategory: (category) => {
        const state = get();
        return ACHIEVEMENTS
          .filter((a) => a.category === category)
          .map((achievement) => ({
            achievement,
            progress: state.achievementProgresses.find((p) => p.achievementId === achievement.id) || {
              achievementId: achievement.id,
              unlocked: false,
              unlockedAt: null,
              claimed: false,
              claimedAt: null,
              progress: 0,
            },
          }));
      },

      getAchievementProgressValue: (achievement) => {
        const state = get();
        let minProgress = Infinity;

        for (const condition of achievement.conditions) {
          let progress = 0;

          switch (condition.type) {
            case 'monster_kills':
              progress = state.monsterKillStats.totalKills;
              break;
            case 'monster_tier_kills':
              if (condition.monsterTier === 'elite') {
                progress = state.monsterKillStats.eliteKills;
              } else if (condition.monsterTier === 'boss') {
                progress = state.monsterKillStats.bossKills;
              } else {
                progress = state.monsterKillStats.normalKills;
              }
              break;
            case 'monster_codex_unlocked':
              progress = state.monsterCodex.filter((e) => e.unlocked).length;
              break;
            case 'event_triggered':
              progress = state.eventCodex.reduce((sum, e) => sum + e.triggerCount, 0);
              break;
            case 'event_choices':
              progress = state.eventCodex.reduce((sum, e) => sum + Object.values(e.choicesMade).reduce((s, c) => s + c, 0), 0);
              break;
            case 'event_codex_unlocked':
              progress = state.eventCodex.filter((e) => e.unlocked).length;
              break;
            case 'companion_recruited':
              progress = state.ownedCompanions.length;
              break;
            case 'companion_codex_unlocked':
              progress = state.companionCodex.filter((e) => e.unlocked).length;
              break;
            case 'companion_stars':
              progress = state.ownedCompanions.length > 0 ? Math.max(...state.ownedCompanions.map((c) => c.stars)) : 0;
              break;
            case 'rebirth_count':
              progress = state.player.rebirthCount;
              break;
            case 'rebirth_bonus_total':
              progress = state.player.totalRebirthBonus;
              break;
            case 'level_reached':
              progress = state.player.stats.level;
              break;
            case 'gold_earned':
              progress = state.totalGoldEarned;
              break;
            case 'soul_orbs_earned':
              progress = state.totalSoulOrbsEarned;
              break;
            case 'area_unlocked':
              progress = state.mapAreas.filter((a) => a.unlocked).length;
              break;
            case 'total_power':
              progress = get().getTotalPower();
              break;
            default:
              progress = 0;
          }

          minProgress = Math.min(minProgress, progress);
        }

        return minProgress === Infinity ? 0 : minProgress;
      },

      checkAchievements: () => {
        const state = get();
        let hasNewUnlocks = false;

        const newProgresses = state.achievementProgresses.map((progress) => {
          if (progress.unlocked) return progress;

          const achievement = ACHIEVEMENTS.find((a) => a.id === progress.achievementId);
          if (!achievement) return progress;

          const currentProgress = get().getAchievementProgressValue(achievement);
          const target = Math.min(...achievement.conditions.map((c) => c.target));

          if (currentProgress >= target) {
            hasNewUnlocks = true;
            get().addBattleLog(`🏆 达成成就：${achievement.name}！`, 'system');
            return {
              ...progress,
              unlocked: true,
              unlockedAt: Date.now(),
              progress: currentProgress,
            };
          }

          return { ...progress, progress: currentProgress };
        });

        if (hasNewUnlocks) {
          set({ achievementProgresses: newProgresses });
        }
      },

      claimAchievementReward: (achievementId) => {
        const state = get();
        const progress = state.achievementProgresses.find((p) => p.achievementId === achievementId);
        if (!progress || !progress.unlocked || progress.claimed) return false;

        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return false;

        achievement.rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              get().addGold(reward.value);
              break;
            case 'exp':
              get().addExp(reward.value);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(reward.value);
              break;
            case 'attack':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, attack: s.player.stats.attack + reward.value },
                },
              }));
              break;
            case 'defense':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, defense: s.player.stats.defense + reward.value },
                },
              }));
              break;
            case 'hp':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: {
                    ...s.player.stats,
                    maxHp: s.player.stats.maxHp + reward.value,
                    hp: s.player.stats.hp + reward.value,
                  },
                },
              }));
              break;
            case 'speed':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, speed: s.player.stats.speed + reward.value },
                },
              }));
              break;
            case 'luck':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, luck: s.player.stats.luck + reward.value },
                },
              }));
              break;
            case 'reputation':
              if (reward.areaId) {
                get().addAreaReputation(reward.areaId, reward.value);
              }
              break;
          }
        });

        set((s) => ({
          achievementProgresses: s.achievementProgresses.map((p) =>
            p.achievementId === achievementId ? { ...p, claimed: true, claimedAt: Date.now() } : p
          ),
        }));

        get().addBattleLog(`🎁 领取了成就奖励：${achievement.name}`, 'system');
        return true;
      },

      canClaimAchievement: (achievementId) => {
        const progress = get().getAchievementProgress(achievementId);
        return progress.unlocked && !progress.claimed;
      },

      getAchievementSummary: () => {
        const progresses = get().achievementProgresses;
        const total = progresses.length;
        const unlocked = progresses.filter((p) => p.unlocked).length;
        const claimed = progresses.filter((p) => p.claimed).length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;
        return { total, unlocked, claimed, percentage };
      },

      getUnclaimedAchievementCount: () => {
        return get().achievementProgresses.filter((p) => p.unlocked && !p.claimed).length;
      },

      startRelicDungeon: (difficulty) => {
        const state = get();
        const config = RELIC_DUNGEON_DIFFICULTY_CONFIG[difficulty];
        if (state.player.stats.level < config.minPlayerLevel) return false;
        if (!state.relicDungeon.unlockedDifficulties.includes(difficulty)) return false;

        const totalFloors = config.totalFloors;
        const floors: RelicDungeonFloor[] = [];
        for (let f = 1; f <= totalFloors; f++) {
          floors.push(state.generateRelicDungeonFloor(f, difficulty));
        }

        const playerMaxHp = state.player.stats.maxHp;
        const playerMaxMp = state.player.stats.maxMp;

        const newState: Partial<GameState> = {
          relicDungeon: {
            ...state.relicDungeon,
            isActive: true,
            currentFloor: 1,
            maxFloor: totalFloors,
            totalFloors,
            difficulty,
            floors,
            currentRoomId: floors[0]?.startRoomId || null,
            activeBuffs: [],
            playerHp: playerMaxHp,
            playerMaxHp,
            playerMp: playerMaxMp,
            playerMaxMp,
            currentBoss: null,
            bossLog: [],
            settlement: null,
            tempGold: 0,
            tempSoulOrbs: 0,
            tempExp: 0,
            visitedRoomIds: floors[0]?.startRoomId ? [floors[0].startRoomId] : [],
            replayBuffer: [],
            currentShopInventory: [],
            totalRuns: state.relicDungeon.totalRuns + 1,
          },
        };
        set(newState);

        get().addRelicDungeonReplayEvent({
          type: 'room_enter',
          floor: 1,
          roomId: floors[0]?.startRoomId,
          roomType: 'rest',
          description: `遗物秘境开始！难度:${RELIC_DUNGEON_DIFFICULTY_CONFIG[difficulty].name}`,
        });
        get().addBattleLog(`🏛️ 进入遗物秘境 [${RELIC_DUNGEON_DIFFICULTY_CONFIG[difficulty].name}]`, 'system');
        return true;
      },

      generateRelicDungeonFloor: (floor, difficulty) => {
        const state = get();
        const config = RELIC_DUNGEON_DIFFICULTY_CONFIG[difficulty];
        const isBossFloor = floor === config.totalFloors || (floor > 0 && floor % 5 === 0);
        const distKey = Math.min(4, Math.ceil(floor / (config.totalFloors / 4)));
        const distribution = RELIC_DUNGEON_ROOM_DISTRIBUTION[distKey] || RELIC_DUNGEON_ROOM_DISTRIBUTION[1];

        const rooms: RelicDungeonRoom[] = [];
        const roomCount = isBossFloor ? 3 : 4 + Math.floor(Math.random() * 3);

        const startRoom: RelicDungeonRoom = {
          id: `floor_${floor}_start`,
          type: 'rest',
          floor,
          name: RELIC_DUNGEON_ROOM_NAMES['rest'][Math.floor(Math.random() * RELIC_DUNGEON_ROOM_NAMES['rest'].length)],
          description: '一个安全的休息点，准备开始新的一层探索',
          cleared: true,
          connections: [],
          position: { x: 0, y: 0 },
        };
        rooms.push(startRoom);

        const availableTypes: Array<RelicDungeonRoom['type']> = [];
        Object.entries(distribution).forEach(([type, weight]) => {
          const count = Math.ceil((weight as number) * roomCount);
          for (let i = 0; i < count; i++) availableTypes.push(type as RelicDungeonRoom['type']);
        });

        for (let i = 1; i < roomCount; i++) {
          const tIdx = Math.floor(Math.random() * availableTypes.length);
          let type = availableTypes[tIdx] || 'combat';
          availableTypes.splice(tIdx, 1);

          if (Math.random() < config.eliteChance && type === 'combat') type = 'elite';
          if (Math.random() < config.mysteryChance) type = 'mystery';

          const typeNames = RELIC_DUNGEON_ROOM_NAMES[type] || RELIC_DUNGEON_ROOM_NAMES['combat'];
          const room: RelicDungeonRoom = {
            id: `floor_${floor}_room_${i}`,
            type,
            floor,
            name: typeNames[Math.floor(Math.random() * typeNames.length)],
            description: `第${floor}层的${RELIC_DUNGEON_ROOM_TYPE_NAMES[type]}`,
            cleared: false,
            connections: [],
            position: { x: i * 180 + 90, y: 80 + (i % 2) * 60 },
          };

          if (type === 'combat' || type === 'elite') {
            room.monsterTier = type === 'elite' ? 'elite' : 'normal';
            room.rewards = [
              { type: 'gold', value: (50 + floor * 20) * (type === 'elite' ? 3 : 1) },
              { type: 'exp', value: (30 + floor * 15) * (type === 'elite' ? 3 : 1) },
            ];
          } else if (type === 'treasure') {
            room.rewards = [
              { type: 'gold', value: 200 + floor * 80 },
              { type: 'soulOrbs', value: 1 + Math.floor(floor / 5) },
            ];
          } else if (type === 'shrine') {
            room.buffChoices = state.getRandomRelicDungeonBuff(config.buffRarityBonus, 3);
          } else if (type === 'rest') {
            room.rewards = [
              { type: 'hp', value: Math.floor(state.player.stats.maxHp * 0.3) },
              { type: 'mp', value: Math.floor(state.player.stats.maxMp * 0.3) },
            ];
          } else if (type === 'shop') {
            room.shopItems = state.generateRelicDungeonShop();
          } else if (type === 'event') {
            const eventPool = RANDOM_EVENTS.filter(e => !e.areaId);
            room.eventId = eventPool[Math.floor(Math.random() * eventPool.length)]?.id;
          } else if (type === 'mystery') {
            const mysteryTypes: RelicDungeonRoom['type'][] = ['treasure', 'shrine', 'combat', 'elite', 'event'];
            const resolved = mysteryTypes[Math.floor(Math.random() * mysteryTypes.length)];
            room.type = resolved;
            room.name = `神秘：${typeNames[0]}`;
            if (resolved === 'shrine') {
              room.buffChoices = state.getRandomRelicDungeonBuff(config.buffRarityBonus + 0.1, 3);
            }
          }

          rooms.push(room);
        }

        if (isBossFloor) {
          const bossRoom: RelicDungeonRoom = {
            id: `floor_${floor}_boss`,
            type: 'boss',
            floor,
            name: RELIC_DUNGEON_ROOM_NAMES['boss'][0],
            description: '强大的守护者正在等待着你...',
            cleared: false,
            isBoss: true,
            connections: [],
            position: { x: roomCount * 180 + 90, y: 110 },
          };
          rooms.push(bossRoom);
        }

        rooms.forEach((r, idx) => {
          if (idx < rooms.length - 1) {
            const next = rooms[idx + 1];
            r.connections.push(next.id);
            next.connections.push(r.id);
          }
          if (idx < rooms.length - 2 && Math.random() < 0.3) {
            const skipNext = rooms[idx + 2];
            if (!r.connections.includes(skipNext.id)) {
              r.connections.push(skipNext.id);
              skipNext.connections.push(r.id);
            }
          }
        });

        const bossRoomId = isBossFloor ? rooms[rooms.length - 1].id : rooms[rooms.length - 1].id;
        return { floor, rooms, startRoomId: startRoom.id, bossRoomId };
      },

      getRandomRelicDungeonBuff: (rarityBonus = 0, count = 3) => {
        const result: RelicDungeonBuff[] = [];
        const used = new Set<string>();

        while (result.length < count && used.size < RELIC_DUNGEON_BUFFS.length) {
          const rarityRoll = Math.random() + rarityBonus;
          let targetRarity: RelicDungeonBuff['rarity'];
          if (rarityRoll >= 0.97) targetRarity = 'legendary';
          else if (rarityRoll >= 0.85) targetRarity = 'epic';
          else if (rarityRoll >= 0.6) targetRarity = 'rare';
          else targetRarity = 'common';

          const candidates = RELIC_DUNGEON_BUFFS.filter(b => b.rarity === targetRarity && !used.has(b.id));
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            used.add(pick.id);
            result.push({ ...pick });
          } else {
            const fallback = RELIC_DUNGEON_BUFFS.filter(b => !used.has(b.id));
            if (fallback.length > 0) {
              const pick = fallback[Math.floor(Math.random() * fallback.length)];
              used.add(pick.id);
              result.push({ ...pick });
            }
          }
        }
        return result;
      },

      enterRelicDungeonRoom: (roomId) => {
        const state = get();
        if (!state.relicDungeon.isActive) return;
        const floor = state.getRelicDungeonCurrentFloor();
        const room = floor?.rooms.find(r => r.id === roomId);
        if (!room) return;

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            currentRoomId: roomId,
            visitedRoomIds: s.relicDungeon.visitedRoomIds.includes(roomId)
              ? s.relicDungeon.visitedRoomIds
              : [...s.relicDungeon.visitedRoomIds, roomId],
          },
        }));

        get().addRelicDungeonReplayEvent({
          type: 'room_enter',
          floor: state.relicDungeon.currentFloor,
          roomId,
          roomType: room.type,
          description: `进入${RELIC_DUNGEON_ROOM_TYPE_NAMES[room.type]}: ${room.name}`,
        });

        if (room.type === 'boss' && !room.cleared) {
          const boss = state.getBossForFloor(state.relicDungeon.currentFloor, state.relicDungeon.difficulty);
          if (boss) {
            const dConfig = RELIC_DUNGEON_DIFFICULTY_CONFIG[state.relicDungeon.difficulty];
            const floorMultiplier = 1 + (state.relicDungeon.currentFloor - 1) * 0.15;
            set(s => ({
              relicDungeon: {
                ...s.relicDungeon,
                currentBoss: {
                  id: boss.id,
                  name: boss.name,
                  hp: Math.floor(boss.hp * dConfig.monsterHpMultiplier * floorMultiplier),
                  maxHp: Math.floor(boss.hp * dConfig.monsterHpMultiplier * floorMultiplier),
                  attack: Math.floor(boss.attack * dConfig.monsterAtkMultiplier * floorMultiplier),
                  defense: Math.floor(boss.defense * dConfig.monsterDefMultiplier * floorMultiplier),
                  currentPhase: 0,
                  mechanicActive: null,
                },
                bossLog: [`⚔️ ${boss.name} 出现了！`],
              },
            }));
          }
        }
      },

      clearRelicDungeonRoom: (roomId) => {
        const state = get();
        if (!state.relicDungeon.isActive) return;
        const floor = state.getRelicDungeonCurrentFloor();
        if (!floor) return;

        const newRooms = floor.rooms.map(r =>
          r.id === roomId ? { ...r, cleared: true } : r
        );
        const room = newRooms.find(r => r.id === roomId);

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            floors: s.relicDungeon.floors.map(f =>
              f.floor === floor.floor ? { ...f, rooms: newRooms } : f
            ),
          },
        }));

        if (room?.rewards) {
          room.rewards.forEach(rew => {
            if (rew.type === 'gold') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempGold: s.relicDungeon.tempGold + (rew.value || 0) } }));
            } else if (rew.type === 'exp') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempExp: s.relicDungeon.tempExp + (rew.value || 0) } }));
            } else if (rew.type === 'soulOrbs') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempSoulOrbs: s.relicDungeon.tempSoulOrbs + (rew.value || 0) } }));
            } else if (rew.type === 'hp') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, playerHp: Math.min(s.relicDungeon.playerMaxHp, s.relicDungeon.playerHp + (rew.value || 0)) } }));
            } else if (rew.type === 'mp') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, playerMp: Math.min(s.relicDungeon.playerMaxMp, s.relicDungeon.playerMp + (rew.value || 0)) } }));
            }
          });
        }

        get().addRelicDungeonReplayEvent({
          type: 'room_clear',
          floor: state.relicDungeon.currentFloor,
          roomId,
          roomType: room?.type,
          description: `通关${RELIC_DUNGEON_ROOM_TYPE_NAMES[room?.type || 'combat']}: ${room?.name}`,
          details: { rewards: room?.rewards },
        });

        if (room?.type === 'boss') {
          state.completeRelicDungeonBoss();
        }
      },

      collectRelicDungeonBuff: (buff) => {
        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            activeBuffs: [...s.relicDungeon.activeBuffs, { ...buff }],
          },
        }));
        get().addRelicDungeonReplayEvent({
          type: 'buff_gain',
          floor: get().relicDungeon.currentFloor,
          description: `获得增益: ${buff.name}`,
          details: { buff },
        });
        get().addBattleLog(`✨ 获得秘境增益 [${buff.name}]`, 'event');
      },

      getRelicDungeonBuffBonus: (stat) => {
        const state = get();
        let flat = 0;
        let percent = 0;
        state.relicDungeon.activeBuffs.forEach(buff => {
          buff.effects.forEach(e => {
            if (e.stat === stat) {
              if (e.isPercent) percent += e.value / 100;
              else flat += e.value;
            }
          });
        });
        return { flat, percent };
      },

      getRelicDungeonTotalAttack: () => {
        const state = get();
        const base = state.getTotalAttack();
        const bonus = state.getRelicDungeonBuffBonus('attack');
        return Math.floor((base + bonus.flat) * (1 + bonus.percent));
      },

      getRelicDungeonTotalDefense: () => {
        const state = get();
        const base = state.getTotalDefense();
        const bonus = state.getRelicDungeonBuffBonus('defense');
        return Math.floor((base + bonus.flat) * (1 + bonus.percent));
      },

      getRelicDungeonCurrentFloor: () => {
        const state = get();
        return state.relicDungeon.floors.find(f => f.floor === state.relicDungeon.currentFloor) || null;
      },

      getRelicDungeonCurrentRoom: () => {
        const state = get();
        const floor = state.getRelicDungeonCurrentFloor();
        if (!floor || !state.relicDungeon.currentRoomId) return null;
        return floor.rooms.find(r => r.id === state.relicDungeon.currentRoomId) || null;
      },

      getAccessibleRelicDungeonRooms: () => {
        const state = get();
        const floor = state.getRelicDungeonCurrentFloor();
        if (!floor) return [];
        const current = state.getRelicDungeonCurrentRoom();
        if (!current) return [floor.rooms[0]].filter(Boolean) as RelicDungeonRoom[];
        return current.connections
          .map(id => floor.rooms.find(r => r.id === id))
          .filter((r): r is RelicDungeonRoom => !!r);
      },

      advanceToNextRelicDungeonFloor: () => {
        const state = get();
        if (!state.relicDungeon.isActive) return;
        if (state.relicDungeon.currentFloor >= state.relicDungeon.totalFloors) {
          state.settleRelicDungeon(true);
          return;
        }
        const nextFloor = state.relicDungeon.currentFloor + 1;
        const floorData = state.relicDungeon.floors.find(f => f.floor === nextFloor);
        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            currentFloor: nextFloor,
            currentRoomId: floorData?.startRoomId || null,
            visitedRoomIds: floorData?.startRoomId ? [floorData.startRoomId] : [],
            currentBoss: null,
            bossLog: [],
            highestFloorReached: Math.max(s.relicDungeon.highestFloorReached, nextFloor),
          },
        }));
        get().addBattleLog(`📍 进入遗物秘境第 ${nextFloor} 层`, 'system');
      },

      completeRelicDungeonBoss: () => {
        const state = get();
        const floor = state.relicDungeon.currentFloor;
        const boss = state.getBossForFloor(floor, state.relicDungeon.difficulty);

        if (boss) {
          boss.rewards.forEach(r => {
            if (r.type === 'gold') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempGold: s.relicDungeon.tempGold + (r.value || 0) } }));
            } else if (r.type === 'exp') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempExp: s.relicDungeon.tempExp + (r.value || 0) } }));
            } else if (r.type === 'soulOrbs') {
              set(s => ({ relicDungeon: { ...s.relicDungeon, tempSoulOrbs: s.relicDungeon.tempSoulOrbs + (r.value || 0) } }));
            }
          });

          if (Math.random() < boss.uniqueBuffDropChance && boss.uniqueBuffId) {
            const ub = RELIC_DUNGEON_BUFFS.find(b => b.id === boss.uniqueBuffId);
            if (ub) {
              set(s => ({
                relicDungeon: { ...s.relicDungeon, activeBuffs: [...s.relicDungeon.activeBuffs, { ...ub }] }
              }));
              if (ub !== undefined) {
                get().addRelicDungeonReplayEvent({
                  type: 'buff_gain',
                  floor,
                  description: `BOSS掉落独特增益: ${ub.name}`,
                  details: { buff: ub },
                });
                get().addBattleLog(`🎁 获得BOSS独特增益 [${ub.name}]`, 'event');
              }
            }
          }
          set(s => ({
            relicDungeon: { ...s.relicDungeon, totalBossesDefeated: s.relicDungeon.totalBossesDefeated + 1 },
          }));
        }

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            currentBoss: null,
          },
        }));

        get().addRelicDungeonReplayEvent({
          type: 'reward_gain',
          floor,
          description: `击败BOSS: ${boss?.name || '守护者'}`,
          details: { rewards: boss?.rewards },
        });
        get().addBattleLog(`👑 击败了BOSS [${boss?.name || '守护者'}]！`, 'event');

        (Object.keys(RELIC_DUNGEON_DIFFICULTY_CONFIG) as RelicDungeonDifficulty[]).forEach((diffKey) => {
          const cfg = RELIC_DUNGEON_DIFFICULTY_CONFIG[diffKey];
          if (!state.relicDungeon.unlockedDifficulties.includes(diffKey)
            && cfg.unlockFloor <= floor) {
            set(s => ({
              relicDungeon: {
                ...s.relicDungeon,
                unlockedDifficulties: [...s.relicDungeon.unlockedDifficulties, diffKey],
              },
            }));
            get().addBattleLog(`🔓 解锁新难度: ${cfg.name}`, 'system');
          }
        });
      },

      dealRelicDungeonBossDamage: () => {
        const state = get();
        const boss = state.relicDungeon.currentBoss;
        if (!boss) return 0;
        const playerAtk = state.getRelicDungeonTotalAttack();
        const critBonus = state.getRelicDungeonBuffBonus('critRate');
        const critDmgBonus = state.getRelicDungeonBuffBonus('critDamage');
        const isCrit = Math.random() < (0.05 + critBonus.percent);
        let damage = Math.max(1, playerAtk - boss.defense * 0.5);
        if (isCrit) damage = Math.floor(damage * (1.5 + critDmgBonus.percent));
        damage = Math.floor(damage);

        const lifesteal = state.getRelicDungeonBuffBonus('lifesteal');
        if (lifesteal.percent > 0) {
          const heal = Math.floor(damage * lifesteal.percent);
          if (heal > 0) {
            set(s => ({
              relicDungeon: {
                ...s.relicDungeon,
                playerHp: Math.min(s.relicDungeon.playerMaxHp, s.relicDungeon.playerHp + heal),
              },
            }));
          }
        }

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            currentBoss: boss.hp - damage <= 0
              ? null
              : { ...boss, hp: Math.max(0, boss.hp - damage) },
            bossLog: [
              ...s.relicDungeon.bossLog.slice(-20),
              `${isCrit ? '💥暴击!' : '⚔️'}对${boss.name}造成 ${damage} 伤害${boss.hp - damage > 0 ? `(剩余${boss.hp - damage}HP)` : '，BOSS被击败!'}`,
            ],
          },
        }));

        get().addRelicDungeonReplayEvent({
          type: 'damage_dealt',
          floor: state.relicDungeon.currentFloor,
          description: `对BOSS造成 ${damage} 伤害${isCrit ? ' (暴击!)' : ''}`,
          details: { damage, isCrit, bossHp: Math.max(0, boss.hp - damage) },
        });

        if (boss.hp - damage <= 0) {
          const floorRooms = state.getRelicDungeonCurrentFloor();
          const bossRoom = floorRooms?.rooms.find(r => r.type === 'boss');
          if (bossRoom) state.clearRelicDungeonRoom(bossRoom.id);
        } else {
          state.updateRelicDungeonBossPhase();
        }
        return damage;
      },

      takeRelicDungeonBossDamage: () => {
        const state = get();
        const boss = state.relicDungeon.currentBoss;
        if (!boss) return 0;
        const playerDef = state.getRelicDungeonTotalDefense();
        const drBonus = state.getRelicDungeonBuffBonus('damageReduction');
        const dodgeBonus = state.getRelicDungeonBuffBonus('dodge');
        if (Math.random() < dodgeBonus.percent) {
          set(s => ({
            relicDungeon: {
              ...s.relicDungeon,
              bossLog: [...s.relicDungeon.bossLog.slice(-20), '💨你闪避了攻击!'],
            },
          }));
          return 0;
        }
        let damage = Math.max(1, boss.attack - playerDef * 0.5);
        damage = Math.floor(damage * (1 - drBonus.percent));

        const thorns = state.getRelicDungeonBuffBonus('thorns');
        if (thorns.percent > 0) {
          const thornDmg = Math.floor(damage * thorns.percent);
          set(s => s.relicDungeon.currentBoss ? {
            relicDungeon: {
              ...s.relicDungeon,
              currentBoss: {
                ...s.relicDungeon.currentBoss,
                hp: Math.max(1, s.relicDungeon.currentBoss.hp - thornDmg),
              },
            },
          } : s);
        }

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            playerHp: Math.max(0, s.relicDungeon.playerHp - damage),
            bossLog: [...s.relicDungeon.bossLog.slice(-20), `🩸${boss.name}对你造成 ${damage} 伤害(剩余${Math.max(0, s.relicDungeon.playerHp - damage)}HP)`],
          },
        }));

        get().addRelicDungeonReplayEvent({
          type: 'damage_taken',
          floor: state.relicDungeon.currentFloor,
          description: `受到BOSS ${damage} 伤害`,
          details: { damage, playerHp: Math.max(0, state.relicDungeon.playerHp - damage) },
        });

        if (state.relicDungeon.playerHp - damage <= 0) {
          state.settleRelicDungeon(false);
        }
        return damage;
      },

      updateRelicDungeonBossPhase: () => {
        const state = get();
        const boss = state.relicDungeon.currentBoss;
        const bossData = state.getBossForFloor(state.relicDungeon.currentFloor, state.relicDungeon.difficulty);
        if (!boss || !bossData) return;

        const hpPercent = boss.hp / boss.maxHp;
        let newPhase = boss.currentPhase;
        for (let i = bossData.phases.length - 1; i >= 0; i--) {
          if (hpPercent <= bossData.phases[i].hpThreshold && hpPercent > 0) {
            newPhase = i;
            break;
          }
        }

        if (newPhase !== boss.currentPhase && bossData.phases[newPhase]?.specialMechanic) {
          const mechanic = bossData.phases[newPhase].specialMechanic!;
          set(s => ({
            relicDungeon: {
              ...s.relicDungeon,
              currentBoss: s.relicDungeon.currentBoss ? {
                ...s.relicDungeon.currentBoss,
                currentPhase: newPhase,
                attack: Math.floor(s.relicDungeon.currentBoss.attack * bossData.phases[newPhase].attackMultiplier),
                defense: Math.floor(s.relicDungeon.currentBoss.defense * bossData.phases[newPhase].defenseMultiplier),
                mechanicActive: mechanic,
              } : null,
              bossLog: [...s.relicDungeon.bossLog.slice(-20), `⚠️ ${bossData.phases[newPhase].name} - ${mechanic.description}`],
            },
          }));
          get().addRelicDungeonReplayEvent({
            type: 'boss_phase',
            floor: state.relicDungeon.currentFloor,
            description: `BOSS进入阶段: ${bossData.phases[newPhase].name}`,
            details: { phase: newPhase, mechanic },
          });
        } else if (newPhase !== boss.currentPhase) {
          set(s => ({
            relicDungeon: {
              ...s.relicDungeon,
              currentBoss: s.relicDungeon.currentBoss ? {
                ...s.relicDungeon.currentBoss,
                currentPhase: newPhase,
                attack: Math.floor(s.relicDungeon.currentBoss.attack * bossData.phases[newPhase].attackMultiplier),
                defense: Math.floor(s.relicDungeon.currentBoss.defense * bossData.phases[newPhase].defenseMultiplier),
              } : null,
              bossLog: [...s.relicDungeon.bossLog.slice(-20), `进入 ${bossData.phases[newPhase].name}`],
            },
          }));
        }
      },

      abandonRelicDungeon: () => {
        get().settleRelicDungeon(false);
        get().addBattleLog('🏳️ 放弃了本次遗物秘境探索', 'system');
      },

      settleRelicDungeon: (survival) => {
        const state = get();
        if (!state.relicDungeon.isActive) return;

        const dConfig = RELIC_DUNGEON_DIFFICULTY_CONFIG[state.relicDungeon.difficulty];
        const goldMult = dConfig.goldMultiplier;
        const expMult = dConfig.expMultiplier;

        const goldEarned = Math.floor(state.relicDungeon.tempGold * goldMult);
        const expEarned = Math.floor(state.relicDungeon.tempExp * expMult);
        const soulOrbsEarned = state.relicDungeon.tempSoulOrbs;

        let totalDamageDealt = 0;
        let totalDamageTaken = 0;
        let monstersKilled = 0;
        let roomsCleared = 0;
        state.relicDungeon.floors.forEach(f => {
          roomsCleared += f.rooms.filter(r => r.cleared).length;
          f.rooms.forEach(r => {
            if (r.cleared && (r.type === 'combat' || r.type === 'elite' || r.type === 'boss')) {
              monstersKilled++;
              totalDamageDealt += 500 + f.floor * 100;
              totalDamageTaken += 100 + f.floor * 20;
            }
          });
        });

        const floorsCleared = Math.max(0, state.relicDungeon.currentFloor - (survival ? 0 : 1));
        const floorRatio = floorsCleared / state.relicDungeon.totalFloors;
        const hpRatio = state.relicDungeon.playerHp / state.relicDungeon.playerMaxHp;

        let rank: RelicDungeonSettlement['rank'];
        if (survival && floorRatio >= 1 && hpRatio >= 0.7) rank = 'S';
        else if (survival && floorRatio >= 0.8) rank = 'A';
        else if (floorRatio >= 0.5) rank = 'B';
        else if (floorRatio >= 0.2) rank = 'C';
        else rank = 'D';

        const rankMultiplier: Record<string, number> = { S: 2.0, A: 1.5, B: 1.2, C: 1.0, D: 0.5 };
        const finalGold = Math.floor(goldEarned * rankMultiplier[rank]);
        const finalExp = Math.floor(expEarned * rankMultiplier[rank]);
        const finalSoulOrbs = Math.ceil(soulOrbsEarned * rankMultiplier[rank]);

        const settlement: RelicDungeonSettlement = {
          runId: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          startTime: Date.now() - 60000,
          endTime: Date.now(),
          difficulty: state.relicDungeon.difficulty,
          totalFloors: state.relicDungeon.totalFloors,
          floorsCleared,
          roomsCleared,
          totalDamageDealt,
          totalDamageTaken,
          monstersKilled,
          bossesDefeated: state.relicDungeon.floors.filter(f => f.rooms.some(r => r.type === 'boss' && r.cleared)).length,
          buffsCollected: state.relicDungeon.activeBuffs.length,
          goldEarned: finalGold,
          expEarned: finalExp,
          soulOrbsEarned: finalSoulOrbs,
          relicsFound: 0,
          survival,
          rank,
          rewards: [
            { type: 'gold', value: finalGold },
            { type: 'exp', value: finalExp },
            { type: 'soulOrbs', value: finalSoulOrbs },
          ],
          replay: state.relicDungeon.replayBuffer,
        };

        if (survival) {
          get().addRelicDungeonReplayEvent({
            type: 'reward_gain',
            floor: state.relicDungeon.currentFloor,
            description: `成功通关！获得评级 [${rank}]`,
            details: { rank, rewards: settlement.rewards },
          });
        } else {
          get().addRelicDungeonReplayEvent({
            type: 'player_death',
            floor: state.relicDungeon.currentFloor,
            description: `探索失败... 获得评级 [${rank}]`,
            details: { rank },
          });
        }
        settlement.replay = [...state.relicDungeon.replayBuffer];

        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            isActive: false,
            settlement,
            history: [settlement, ...s.relicDungeon.history].slice(0, 50),
            currentFloor: 0,
            currentRoomId: null,
            floors: [],
            activeBuffs: [],
          },
        }));
      },

      claimRelicDungeonRewards: () => {
        const state = get();
        const s = state.relicDungeon.settlement;
        if (!s) return;
        state.addGold(s.goldEarned);
        state.addExp(s.expEarned);
        state.addSoulOrbs(s.soulOrbsEarned);
        get().addBattleLog(`🎁 领取遗物秘境奖励：💰${s.goldEarned} ⭐${s.expEarned} 💎${s.soulOrbsEarned}`, 'event');
        set(st => ({
          relicDungeon: { ...st.relicDungeon, settlement: null },
        }));
        state.checkAchievements();
      },

      addRelicDungeonReplayEvent: (event) => {
        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            replayBuffer: [
              ...s.relicDungeon.replayBuffer,
              {
                ...event,
                id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                timestamp: Date.now(),
              },
            ].slice(-500),
          },
        }));
      },

      getRelicDungeonHistory: () => {
        return get().relicDungeon.history;
      },

      viewRelicDungeonReplay: (runId) => {
        const state = get();
        const record = state.relicDungeon.history.find(h => h.runId === runId);
        if (!record) return;
        set(s => ({
          relicDungeon: {
            ...s.relicDungeon,
            viewingReplay: record,
            replayIndex: 0,
            replayPlaying: false,
          },
        }));
      },

      closeRelicDungeonReplay: () => {
        set(s => ({
          relicDungeon: { ...s.relicDungeon, viewingReplay: null, replayPlaying: false },
        }));
      },

      stepRelicDungeonReplay: (direction) => {
        const state = get();
        if (!state.relicDungeon.viewingReplay) return;
        const total = state.relicDungeon.viewingReplay.replay.length;
        let idx = state.relicDungeon.replayIndex;
        if (direction === 'first') idx = 0;
        else if (direction === 'last') idx = total - 1;
        else if (direction === 'prev') idx = Math.max(0, idx - 1);
        else idx = Math.min(total - 1, idx + 1);
        set(s => ({ relicDungeon: { ...s.relicDungeon, replayIndex: idx } }));
      },

      gotoRelicDungeonReplayIndex: (index) => {
        const state = get();
        if (!state.relicDungeon.viewingReplay) return;
        const total = state.relicDungeon.viewingReplay.replay.length;
        const idx = Math.max(0, Math.min(total - 1, index));
        set(s => ({ relicDungeon: { ...s.relicDungeon, replayIndex: idx } }));
      },

      toggleRelicDungeonReplayPlaying: () => {
        set(s => ({
          relicDungeon: { ...s.relicDungeon, replayPlaying: !s.relicDungeon.replayPlaying },
        }));
      },

      generateRelicDungeonShop: () => {
        const buffs = get().getRandomRelicDungeonBuff(0.15, 3);
        const items: RelicDungeonShopItem[] = [
          {
            id: 'shop_heal',
            name: '秘境治疗药水',
            description: '恢复50%最大生命值',
            icon: '🧪',
            cost: 300,
            currency: 'gold',
            effect: { type: 'hp', value: 50, isPercent: true } as EventEffect,
            rarity: 'common',
          },
          {
            id: 'shop_mana',
            name: '秘境魔力药水',
            description: '恢复50%最大魔力值',
            icon: '💧',
            cost: 250,
            currency: 'gold',
            effect: { type: 'mp', value: 50, isPercent: true } as EventEffect,
            rarity: 'common',
          },
          {
            id: 'shop_soul',
            name: '精炼魂珠',
            description: '立即获得2颗魂珠',
            icon: '💎',
            cost: 800,
            currency: 'gold',
            effect: { type: 'soulOrbs', value: 2 } as EventEffect,
            rarity: 'rare',
          },
          ...buffs.map((b, i) => ({
            id: `shop_buff_${i}`,
            name: `增益: ${b.name}`,
            description: b.description,
            icon: b.icon,
            cost: b.rarity === 'legendary' ? 5 : b.rarity === 'epic' ? 3 : b.rarity === 'rare' ? 1 : 0,
            currency: 'soulOrbs' as const,
            effect: b,
            isBuff: true,
            rarity: b.rarity,
          })),
        ];
        return items;
      },

      buyRelicDungeonShopItem: (itemId) => {
        const state = get();
        const room = state.getRelicDungeonCurrentRoom();
        if (!room || room.type !== 'shop') return false;
        const item = (room.shopItems || state.relicDungeon.currentShopInventory).find(i => i.id === itemId);
        if (!item) return false;

        if (item.currency === 'gold') {
          if (state.relicDungeon.tempGold < item.cost) return false;
          set(s => ({ relicDungeon: { ...s.relicDungeon, tempGold: s.relicDungeon.tempGold - item.cost } }));
        } else {
          if (state.relicDungeon.tempSoulOrbs < item.cost) return false;
          set(s => ({ relicDungeon: { ...s.relicDungeon, tempSoulOrbs: s.relicDungeon.tempSoulOrbs - item.cost } }));
        }

        if (item.isBuff && 'effects' in item.effect) {
          get().collectRelicDungeonBuff(item.effect);
        } else if ('type' in item.effect) {
          const eff = item.effect as EventEffect;
          if (eff.type === 'hp') {
            set(s => ({
              relicDungeon: {
                ...s.relicDungeon,
                playerHp: Math.min(s.relicDungeon.playerMaxHp, s.relicDungeon.playerHp +
                  (eff.isPercent ? Math.floor(s.relicDungeon.playerMaxHp * (eff.value || 0) / 100) : (eff.value || 0))),
              },
            }));
          } else if (eff.type === 'mp') {
            set(s => ({
              relicDungeon: {
                ...s.relicDungeon,
                playerMp: Math.min(s.relicDungeon.playerMaxMp, s.relicDungeon.playerMp +
                  (eff.isPercent ? Math.floor(s.relicDungeon.playerMaxMp * (eff.value || 0) / 100) : (eff.value || 0))),
              },
            }));
          } else if (eff.type === 'soulOrbs') {
            set(s => ({ relicDungeon: { ...s.relicDungeon, tempSoulOrbs: s.relicDungeon.tempSoulOrbs + (eff.value || 0) } }));
          }
        }

        const newShop = (room.shopItems || state.relicDungeon.currentShopInventory).filter(i => i.id !== itemId);
        const floor = state.getRelicDungeonCurrentFloor();
        if (floor) {
          set(s => ({
            relicDungeon: {
              ...s.relicDungeon,
              floors: s.relicDungeon.floors.map(f =>
                f.floor === floor.floor ? {
                  ...f,
                  rooms: f.rooms.map(r => r.id === room.id ? { ...r, shopItems: newShop } : r),
                } : f
              ),
              currentShopInventory: newShop,
            },
          }));
        }
        return true;
      },

      getBossForFloor: (floor, difficulty) => {
        const dConfig = RELIC_DUNGEON_DIFFICULTY_CONFIG[difficulty];
        const ratio = floor / dConfig.totalFloors;
        const available = RELIC_DUNGEON_BOSSES.filter(b => b.minFloor <= floor);
        if (available.length === 0) return RELIC_DUNGEON_BOSSES[0];
        if (ratio >= 1) return available[available.length - 1];
        if (ratio >= 0.8 && available[3]) return available[3];
        if (ratio >= 0.6 && available[2]) return available[2];
        if (ratio >= 0.4 && available[1]) return available[1];
        return available[0];
      },

      getCurrentSeason: () => {
        const state = get();
        const seasonId = state.seasonChallenge.currentSeasonId;
        return SEASON_CHALLENGE_SEASONS.find((s) => s.id === seasonId);
      },

      getSeasonTaskProgress: (taskId) => {
        const state = get();
        return state.seasonChallenge.taskProgresses.find((t) => t.taskId === taskId) || {
          taskId,
          progress: 0,
          completed: false,
          claimed: false,
        };
      },

      isStageUnlocked: (stageId) => {
        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return false;
        const stage = season.stages.find((st) => st.id === stageId);
        if (!stage) return false;
        return state.seasonChallenge.seasonScore >= stage.unlockScore;
      },

      claimSeasonTaskReward: (taskId) => {
        const state = get();
        const taskProgress = state.seasonChallenge.taskProgresses.find((t) => t.taskId === taskId);
        if (!taskProgress || !taskProgress.completed || taskProgress.claimed) return false;

        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return false;

        const task = season.stages.flatMap((st) => st.tasks).find((t) => t.id === taskId);
        if (!task) return false;

        task.rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              get().addGold(reward.value);
              break;
            case 'exp':
              get().addExp(reward.value);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(reward.value);
              break;
            case 'attack':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    attack: state.player.stats.attack + reward.value,
                  },
                },
              }));
              break;
            case 'defense':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    defense: state.player.stats.defense + reward.value,
                  },
                },
              }));
              break;
            case 'hp':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    maxHp: state.player.stats.maxHp + reward.value,
                    hp: state.player.stats.hp + reward.value,
                  },
                },
              }));
              break;
            case 'speed':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    speed: state.player.stats.speed + reward.value,
                  },
                },
              }));
              break;
            case 'luck':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    luck: state.player.stats.luck + reward.value,
                  },
                },
              }));
              break;
            default:
              break;
          }
        });

        set((state) => ({
          seasonChallenge: {
            ...state.seasonChallenge,
            seasonScore: state.seasonChallenge.seasonScore + task.scoreReward,
            taskProgresses: state.seasonChallenge.taskProgresses.map((t) =>
              t.taskId === taskId ? { ...t, claimed: true } : t
            ),
          },
        }));

        return true;
      },

      canClaimSeasonTaskReward: (taskId) => {
        const state = get();
        const taskProgress = state.seasonChallenge.taskProgresses.find((t) => t.taskId === taskId);
        return !!taskProgress && taskProgress.completed && !taskProgress.claimed;
      },

      getSeasonLeaderboard: () => {
        const state = get();
        const playerEntry: SeasonChallengeLeaderboardEntry = {
          rank: 0,
          name: state.player.name || '勇者',
          score: state.seasonChallenge.seasonScore,
          title: '',
          avatarColor: '#3b82f6',
        };

        const allEntries = [...state.seasonChallenge.leaderboard, playerEntry]
          .sort((a, b) => b.score - a.score)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        return allEntries;
      },

      getPlayerSeasonRank: () => {
        const leaderboard = get().getSeasonLeaderboard();
        const state = get();
        const playerEntry = leaderboard.find((e) => e.name === (state.player.name || '勇者'));
        return playerEntry?.rank || leaderboard.length;
      },

      isLimitedPartnerUnlocked: (companionId) => {
        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return false;
        const partner = season.limitedPartners.find((p) => p.companionId === companionId);
        if (!partner) return false;
        return state.seasonChallenge.seasonScore >= partner.unlockScore;
      },

      canClaimCrossWeekReward: (weekNumber) => {
        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return false;
        const reward = season.crossWeekRewards.find((r) => r.weekNumber === weekNumber);
        if (!reward) return false;
        const rewardKey = `week_${weekNumber}`;
        if (state.seasonChallenge.crossWeekRewardClaimed.includes(rewardKey)) return false;
        return state.seasonChallenge.seasonScore >= reward.minScore;
      },

      claimCrossWeekReward: (weekNumber) => {
        if (!get().canClaimCrossWeekReward(weekNumber)) return false;

        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return false;
        const reward = season.crossWeekRewards.find((r) => r.weekNumber === weekNumber);
        if (!reward) return false;

        reward.rewards.forEach((r) => {
          switch (r.type) {
            case 'gold':
              get().addGold(r.value);
              break;
            case 'exp':
              get().addExp(r.value);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(r.value);
              break;
            case 'attack':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    attack: state.player.stats.attack + r.value,
                  },
                },
              }));
              break;
            case 'defense':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    defense: state.player.stats.defense + r.value,
                  },
                },
              }));
              break;
            case 'hp':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    maxHp: state.player.stats.maxHp + r.value,
                    hp: state.player.stats.hp + r.value,
                  },
                },
              }));
              break;
            case 'speed':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    speed: state.player.stats.speed + r.value,
                  },
                },
              }));
              break;
            case 'luck':
              set((state) => ({
                player: {
                  ...state.player,
                  stats: {
                    ...state.player.stats,
                    luck: state.player.stats.luck + r.value,
                  },
                },
              }));
              break;
            default:
              break;
          }
        });

        set((state) => ({
          seasonChallenge: {
            ...state.seasonChallenge,
            crossWeekRewardClaimed: [...state.seasonChallenge.crossWeekRewardClaimed, `week_${weekNumber}`],
          },
        }));

        return true;
      },

      getSeasonHistory: () => {
        return get().seasonChallenge.history;
      },

      setSeasonChallengeTab: (tab) => {
        set((state) => ({
          seasonChallenge: {
            ...state.seasonChallenge,
            activeTab: tab,
          },
        }));
      },

      addSeasonScore: (score) => {
        set((state) => ({
          seasonChallenge: {
            ...state.seasonChallenge,
            seasonScore: state.seasonChallenge.seasonScore + score,
          },
        }));
      },

      updateSeasonTaskProgress: (type, value, mode = 'add') => {
        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return;

        const tasksToUpdate = season.stages
          .flatMap((st) => st.tasks)
          .filter((t) => t.type === type);

        if (tasksToUpdate.length === 0) return;

        set((state) => ({
          seasonChallenge: {
            ...state.seasonChallenge,
            taskProgresses: state.seasonChallenge.taskProgresses.map((tp) => {
              const task = tasksToUpdate.find((t) => t.id === tp.taskId);
              if (!task || tp.completed) return tp;
              const newProgress = mode === 'set' ? value : tp.progress + value;
              const completed = newProgress >= task.target;
              return {
                ...tp,
                progress: Math.min(Math.max(newProgress, 0), task.target),
                completed,
              };
            }),
          },
        }));
      },

      syncSeasonChallengeProgress: () => {
        const state = get();
        const season = SEASON_CHALLENGE_SEASONS.find((s) => s.id === state.seasonChallenge.currentSeasonId);
        if (!season) return;

        const playerLevel = state.player.stats.level;
        if (playerLevel > 0) {
          get().updateSeasonTaskProgress('level', playerLevel, 'set');
        }

        const unlockedAreas = state.mapAreas.filter((a) => a.unlocked).length;
        if (unlockedAreas > 0) {
          get().updateSeasonTaskProgress('area', unlockedAreas, 'set');
        }

        const companionCount = state.ownedCompanions.length;
        if (companionCount > 0) {
          get().updateSeasonTaskProgress('social', companionCount, 'set');
        }

        const killStats = state.monsterKillStats;
        const foughtAreas = new Set<string>();
        Object.keys(killStats.killsByArea).forEach((aid) => {
          const areaKills = killStats.killsByArea[aid];
          if (areaKills.normal > 0 || areaKills.elite > 0 || areaKills.boss > 0) {
            foughtAreas.add(aid);
          }
        });
        if (foughtAreas.size > 0) {
          get().updateSeasonTaskProgress('explore', foughtAreas.size, 'set');
        }

        if (killStats.normalKills > 0) {
          get().updateSeasonTaskProgress('kill', killStats.normalKills, 'set');
        }

        if (killStats.eliteKills > 0) {
          get().updateSeasonTaskProgress('battle', killStats.eliteKills, 'set');
        }

        if (killStats.bossKills > 0) {
          get().updateSeasonTaskProgress('boss', killStats.bossKills, 'set');
        }

        if (state.totalGoldEarned > 0) {
          get().updateSeasonTaskProgress('collect', state.totalGoldEarned, 'set');
        }
      },

      getFactionById: (factionId) => {
        return FACTIONS.find((f) => f.id === factionId);
      },

      getPlayerFaction: () => {
        const state = get();
        if (!state.faction.playerFaction) return undefined;
        return FACTIONS.find((f) => f.id === state.faction.playerFaction);
      },

      joinFaction: (factionId) => {
        const state = get();
        if (state.faction.playerFaction) return false;
        const faction = FACTIONS.find((f) => f.id === factionId);
        if (!faction) return false;

        set((state) => ({
          faction: {
            ...state.faction,
            playerFaction: faction.id,
            joinedAt: Date.now(),
            reputations: state.faction.reputations.map((r) =>
              r.faction === faction.id ? { ...r, points: r.points + 100, level: getFactionReputationLevel(r.points + 100) } : r
            ),
          },
        }));

        get().addBattleLog(`加入了${faction.name}！`, 'event');
        return true;
      },

      leaveFaction: () => {
        const state = get();
        if (!state.faction.playerFaction) return false;

        set((state) => ({
          faction: {
            ...state.faction,
            playerFaction: null,
            joinedAt: null,
          },
        }));

        get().addBattleLog('退出了阵营', 'event');
        return true;
      },

      addFactionReputation: (factionId, points) => {
        set((state) => ({
          faction: {
            ...state.faction,
            reputations: state.faction.reputations.map((r) => {
              if (r.faction === factionId) {
                const newPoints = Math.max(0, r.points + points);
                return {
                  ...r,
                  points: newPoints,
                  level: getFactionReputationLevel(newPoints),
                  title: FACTION_REPUTATION_LEVELS.find((l) => l.level === getFactionReputationLevel(newPoints))?.name || r.title,
                };
              }
              return r;
            }),
            totalContribution:
              state.faction.playerFaction === factionId
                ? state.faction.totalContribution + Math.max(0, points)
                : state.faction.totalContribution,
          },
        }));
      },

      getFactionReputation: (factionId) => {
        const state = get();
        const rep = state.faction.reputations.find((r) => r.faction === factionId);
        if (rep) return rep;
        return {
          faction: factionId as FactionType,
          points: 0,
          level: 0,
          title: FACTION_REPUTATION_LEVELS[0]?.name || '外人',
        };
      },

      getStrongholdById: (strongholdId) => {
        const state = get();
        return state.faction.strongholds.find((s) => s.id === strongholdId);
      },

      canCaptureStronghold: (strongholdId) => {
        const state = get();
        if (!state.faction.playerFaction) return false;
        const stronghold = state.faction.strongholds.find((s) => s.id === strongholdId);
        if (!stronghold) return false;
        if (stronghold.controlFaction === state.faction.playerFaction) return false;
        if (state.player.stats.level < stronghold.unlockLevel) return false;
        return true;
      },

      captureStronghold: (strongholdId) => {
        const state = get();
        if (!state.faction.playerFaction) return false;
        if (!get().canCaptureStronghold(strongholdId)) return false;

        const stronghold = state.faction.strongholds.find((s) => s.id === strongholdId);
        if (!stronghold) return false;

        const playerPower = get().getTotalPower();
        const strongholdPower = stronghold.difficulty * 500;
        const repMultiplier = get().getFactionReputationMultiplier();

        if (playerPower < strongholdPower * 0.8) {
          get().addBattleLog(`战力不足，无法攻占${stronghold.name}`, 'damage');
          return false;
        }

        const baseChance = playerPower / (strongholdPower * 2);
        const successChance = Math.min(0.95, baseChance * repMultiplier);
        const success = Math.random() < successChance;

        if (success) {
          const logId = Date.now();
          const newLog: FactionBattleLog = {
            id: logId,
            type: 'capture',
            strongholdId,
            strongholdName: stronghold.name,
            faction: state.faction.playerFaction!,
            result: 'victory',
            timestamp: Date.now(),
            description: `成功攻占了${stronghold.name}！`,
          };
          set((state) => ({
            faction: {
              ...state.faction,
              strongholds: state.faction.strongholds.map((s) =>
                s.id === strongholdId
                  ? { ...s, controlFaction: state.faction.playerFaction! }
                  : s
              ),
              battleLogs: [newLog, ...state.faction.battleLogs].slice(0, FACTION_MAX_BATTLE_LOGS),
            },
          }));

          const reputationReward = Math.floor(50 * repMultiplier);
          get().addFactionReputation(state.faction.playerFaction, reputationReward);
          get().addBattleLog(`成功攻占${stronghold.name}！获得${reputationReward}点声望`, 'event');
          return true;
        } else {
          const logId = Date.now() - 1;
          const newLog: FactionBattleLog = {
            id: logId,
            type: 'capture',
            strongholdId,
            strongholdName: stronghold.name,
            faction: state.faction.playerFaction!,
            result: 'defeat',
            timestamp: Date.now(),
            description: `攻占${stronghold.name}失败`,
          };
          set((state) => ({
            faction: {
              ...state.faction,
              battleLogs: [newLog, ...state.faction.battleLogs].slice(0, FACTION_MAX_BATTLE_LOGS),
            },
          }));

          get().addBattleLog(`攻占${stronghold.name}失败`, 'damage');
          return false;
        }
      },

      garrisonCompanion: (strongholdId, companionId) => {
        const state = get();
        if (!state.faction.playerFaction) return false;

        const stronghold = state.faction.strongholds.find((s) => s.id === strongholdId);
        if (!stronghold || stronghold.controlFaction !== state.faction.playerFaction) {
          return false;
        }

        const companion = state.ownedCompanions.find((c) => c.id === companionId);
        if (!companion) return false;

        const alreadyGarrisoned = state.faction.garrisons.some(
          (g) => g.companionId === companionId
        );
        if (alreadyGarrisoned) return false;

        const currentGarrison = state.faction.garrisons.filter(
          (g) => g.strongholdId === strongholdId
        );
        if (currentGarrison.length >= stronghold.maxGarrison) return false;

        set((state) => ({
          faction: {
            ...state.faction,
            garrisons: [
              ...state.faction.garrisons,
              {
                companionId,
                strongholdId,
                deployedAt: Date.now(),
                contribution: 0,
              },
            ],
          },
        }));

        return true;
      },

      ungarrisonCompanion: (strongholdId, companionId) => {
        set((state) => ({
          faction: {
            ...state.faction,
            garrisons: state.faction.garrisons.filter(
              (g) => !(g.strongholdId === strongholdId && g.companionId === companionId)
            ),
          },
        }));
        return true;
      },

      getGarrisonedCompanions: (strongholdId) => {
        const state = get();
        return state.faction.garrisons.filter((g) => g.strongholdId === strongholdId);
      },

      getStrongholdPower: (strongholdId) => {
        const state = get();
        const garrisons = state.faction.garrisons.filter((g) => g.strongholdId === strongholdId);
        let power = 0;
        garrisons.forEach((g) => {
          const companion = state.ownedCompanions.find((c) => c.id === g.companionId);
          if (companion) {
            const factionBonus = get().getCompanionFactionBonus(companion);
            const atk = state.getCompanionEffectiveAttack(companion) * factionBonus.attackMultiplier;
            const def = state.getCompanionEffectiveDefense(companion) * factionBonus.defenseMultiplier;
            power += atk + def;
          }
        });
        const repMultiplier = get().getFactionReputationMultiplier();
        return Math.floor(power * repMultiplier);
      },

      triggerFactionEvent: () => {
        const state = get();
        if (!state.faction.playerFaction) return;
        if (state.faction.currentFactionEvent) return;

        const availableEvents = FACTION_EVENTS.filter(
          (e) => e.minPlayerLevel <= state.player.stats.level
        );

        if (availableEvents.length === 0) return;

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        set((state) => ({
          faction: {
            ...state.faction,
            currentFactionEvent: event,
          },
        }));
      },

      handleFactionEventChoice: (choiceId) => {
        const state = get();
        const event = state.faction.currentFactionEvent;
        if (!event) return false;

        const choice = event.choices.find((c) => c.id === choiceId);
        if (!choice) return false;

        const canChoose = get().canChooseFactionEventOption(choiceId);
        if (!canChoose.canChoose) {
          if (canChoose.reason) {
            get().addBattleLog(canChoose.reason, 'damage');
          }
          return false;
        }

        if (choice.reputationChanges) {
          if (choice.reputationChanges.light) {
            get().addFactionReputation('light', choice.reputationChanges.light);
          }
          if (choice.reputationChanges.shadow) {
            get().addFactionReputation('shadow', choice.reputationChanges.shadow);
          }
        }

        choice.effects.forEach((effect) => {
          switch (effect.type) {
            case 'gold':
              get().addGold(effect.value);
              break;
            case 'exp':
              get().addExp(effect.value);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(effect.value);
              break;
            case 'hp':
              if (effect.value > 0) {
                get().healHp(effect.value);
              } else {
                get().takeDamage(Math.abs(effect.value));
              }
              break;
          }
        });

        set((state) => ({
          faction: {
            ...state.faction,
            currentFactionEvent: null,
          },
        }));

        get().addBattleLog(`${event.title}: ${choice.text}`, 'event');
        return true;
      },

      canChooseFactionEventOption: (choiceId) => {
        const state = get();
        const event = state.faction.currentFactionEvent;
        if (!event) return { canChoose: false, reason: '没有进行中的事件' };

        const choice = event.choices.find((c) => c.id === choiceId);
        if (!choice) return { canChoose: false, reason: '选项不存在' };

        if (choice.requiredReputation) {
          const rep = get().getFactionReputation(choice.requiredReputation.faction);
          if (rep.level < choice.requiredReputation.minLevel) {
            const factionName = choice.requiredReputation.faction === 'light' ? '光明联盟' : '暗影部落';
            const reqLevelName = FACTION_REPUTATION_LEVELS.find(
              (l) => l.level === choice.requiredReputation!.minLevel
            )?.name || `等级${choice.requiredReputation.minLevel}`;
            return {
              canChoose: false,
              reason: `需要${factionName}声望达到${reqLevelName}（当前：${rep.title}）`,
            };
          }
        }

        return { canChoose: true };
      },

      closeFactionEvent: () => {
        set((state) => ({
          faction: {
            ...state.faction,
            currentFactionEvent: null,
          },
        }));
      },

      canSettle: () => {
        const state = get();
        if (!state.faction.playerFaction) return false;
        return Date.now() - state.faction.lastSettlementTime >= FACTION_SETTLEMENT_INTERVAL * 1000;
      },

      performFactionSettlement: () => {
        const state = get();
        if (!state.faction.playerFaction) return null;
        if (!get().canSettle()) return null;

        const controlledStrongholds = state.faction.strongholds.filter(
          (s) => s.controlFaction === state.faction.playerFaction
        );

        let totalGold = 0;
        let totalSoulOrbs = 0;
        let totalExp = 0;
        let totalReputation = 0;
        const breakdown: FactionIncomeBreakdown[] = [];
        const repMultiplier = get().getFactionReputationMultiplier();

        controlledStrongholds.forEach((sh) => {
          const garrisonPower = get().getStrongholdPower(sh.id);
          const efficiencyBonus = 1 + garrisonPower / 1000;

          const goldReward = Math.floor(sh.baseIncome.gold * efficiencyBonus * repMultiplier);
          const expReward = Math.floor(sh.baseIncome.exp * efficiencyBonus * repMultiplier);
          const soulOrbsReward = Math.floor(sh.baseIncome.soulOrbs * efficiencyBonus * repMultiplier);
          const repReward = Math.floor(sh.baseIncome.reputation * efficiencyBonus * repMultiplier);

          totalGold += goldReward;
          totalSoulOrbs += soulOrbsReward;
          totalExp += expReward;
          totalReputation += repReward;

          breakdown.push({
            strongholdId: sh.id,
            strongholdName: sh.name,
            gold: goldReward,
            exp: expReward,
            soulOrbs: soulOrbsReward,
            reputation: repReward,
            garrisonBonus: Math.floor(garrisonPower / 1000 * 100),
          });
        });

        if (totalGold > 0) get().addGold(totalGold);
        if (totalSoulOrbs > 0) get().addSoulOrbs(totalSoulOrbs);
        if (totalExp > 0) get().addExp(totalExp);
        if (totalReputation > 0) get().addFactionReputation(state.faction.playerFaction, totalReputation);

        const settlement: FactionSettlement = {
          periodStart: state.faction.lastSettlementTime,
          periodEnd: Date.now(),
          totalGold,
          totalExp,
          totalSoulOrbs,
          totalReputation,
          breakdown,
          strongholdsHeld: controlledStrongholds.length,
          factionRank: state.faction.factionRank,
        };

        set((state) => ({
          faction: {
            ...state.faction,
            lastSettlementTime: Date.now(),
            settlementHistory: [settlement, ...state.faction.settlementHistory].slice(0, 20),
          },
        }));

        get().addBattleLog(`阵营结算完成！获得${totalGold}金币，${totalSoulOrbs}魂珠`, 'event');

        return settlement;
      },

      getStrongholdsByFaction: (factionId) => {
        const state = get();
        return state.faction.strongholds.filter((s) => s.controlFaction === factionId);
      },

      getControlledStrongholds: () => {
        const state = get();
        if (!state.faction.playerFaction) return [];
        return state.faction.strongholds.filter(
          (s) => s.controlFaction === state.faction.playerFaction
        );
      },

      getFactionShopItems: () => {
        return FACTION_SHOP_ITEMS;
      },

      buyFactionShopItem: (itemId) => {
        const state = get();
        if (!state.faction.playerFaction) return false;

        const item = FACTION_SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const reputation = get().getFactionReputation(state.faction.playerFaction);
        if (reputation.points < item.cost) return false;
        if (reputation.level < item.requiredLevel) return false;

        if (item.rewards.gold) {
          get().addGold(item.rewards.gold);
        }
        if (item.rewards.soulOrbs) {
          get().addSoulOrbs(item.rewards.soulOrbs);
        }
        if (item.rewards.exp) {
          get().addExp(item.rewards.exp);
        }
        if (item.rewards.attack) {
          get().upgradeStat('attack', item.rewards.attack);
        }
        if (item.rewards.defense) {
          get().upgradeStat('defense', item.rewards.defense);
        }
        if (item.rewards.maxHp) {
          get().upgradeStat('maxHp', item.rewards.maxHp);
        }
        if (item.rewards.speed) {
          get().upgradeStat('speed', item.rewards.speed);
        }

        set((state) => ({
          faction: {
            ...state.faction,
            reputations: state.faction.reputations.map((r) => {
              if (r.faction === state.faction.playerFaction) {
                const newPoints = r.points - item.cost;
                return {
                  ...r,
                  points: newPoints,
                  level: getFactionReputationLevel(newPoints),
                };
              }
              return r;
            }),
          },
        }));

        get().addBattleLog(`兑换了${item.name}`, 'event');
        return true;
      },

      setFactionTab: (tab) => {
        set((state) => ({
          faction: {
            ...state.faction,
            activeTab: tab,
          },
        }));
      },

      getFactionBonusStats: () => {
        const state = get();
        const faction = get().getPlayerFaction();
        if (!faction) return [];

        const isPreferredRace = faction.preferredRaces.includes(state.player.race);
        const isPreferredClass = faction.preferredClasses.includes(state.player.class);

        const multiplier = (isPreferredRace ? 1.5 : 1) * (isPreferredClass ? 1.5 : 1);
        const repMultiplier = get().getFactionReputationMultiplier();

        return faction.bonusStats.map((bs) => ({
          stat: bs.stat,
          value: Math.floor(bs.value * multiplier * repMultiplier),
        }));
      },

      getFactionBonus: (stat) => {
        const bonusStats = get().getFactionBonusStats();
        const found = bonusStats.find((bs) => bs.stat === stat);
        return found ? found.value : 0;
      },

      getFactionReputationMultiplier: () => {
        const state = get();
        if (!state.faction.playerFaction) return 1;
        const rep = get().getFactionReputation(state.faction.playerFaction);
        const level = rep.level;
        return 1 + level * 0.1;
      },

      getCompanionFactionBonus: (companion) => {
        const faction = get().getPlayerFaction();
        if (!faction) return { attackMultiplier: 1, defenseMultiplier: 1 };

        let attackMultiplier = 1;
        let defenseMultiplier = 1;

        if (faction.preferredRaces.includes(companion.race)) {
          attackMultiplier *= 1.2;
          defenseMultiplier *= 1.2;
        }
        if (faction.preferredClasses.includes(companion.class)) {
          attackMultiplier *= 1.2;
          defenseMultiplier *= 1.2;
        }

        return { attackMultiplier, defenseMultiplier };
      },
    }),
    {
      name: 'isekai-idle-game',
      version: 14,
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
        if (version < 5) {
          const player = state.player as Player || {
            name: '', race: '', class: '',
            stats: { ...INITIAL_STATS },
            skillPoints: 0, rebirthCount: 0, totalRebirthBonus: 0,
          };
          state.player = {
            ...player,
            talentPoints: 0,
            inheritedTalents: [],
          };
        }
        if (version < 6) {
          state.levelProgresses = initLevelProgresses();
          if (state.screen === 'game') {
            state.currentLevelStats = createEmptyLevelStats();
          } else {
            state.currentLevelStats = null;
          }
        }
        if (version < 7) {
          state.companionShards = [];
          state.companionCodex = initCompanionCodex();
          state.recruitPullCounters = initRecruitCounters();
          state.lastRecruitResults = null;

          const ownedCompanions = (state.ownedCompanions as Companion[]) || [];
          ownedCompanions.forEach((c) => {
            state.companionCodex = (state.companionCodex as CompanionCodexEntry[]).map((entry) =>
              entry.companionId === c.id
                ? { ...entry, unlocked: true, unlockedAt: Date.now() }
                : entry
            );
          });
        }
        if (version < 8) {
          state.monsterKillStats = initMonsterKillStats();
          state.rebirthChallenges = initRebirthChallenges();
          state.currentMonster = null;

          const ownedCompanions = (state.ownedCompanions as Companion[]) || [];
          if (ownedCompanions.length > 0) {
            state.monsterKillStats = {
              ...initMonsterKillStats(),
              eliteKills: Math.floor(ownedCompanions.length * 0.5),
              bossKills: Math.floor(ownedCompanions.length * 0.2),
            };
          }
        }
        if (version < 9) {
          state.ownedRelics = [];
          state.relicCodex = initRelicCodex();
        }
        if (version < 10) {
          state.worldBossState = {
            currentSession: null,
            rotationIndex: 0,
            nextBossTime: Date.now() + WORLD_BOSS_ROTATION.restIntervalSeconds * 1000,
            isActive: false,
            totalBossesDefeated: 0,
            history: [],
          };
        }
        if (version < 11) {
          state.alchemyLevel = 1;
          state.alchemyExp = 0;
          state.ownedPotions = [];
          state.activeAlchemyBuffs = [];
          state.unlockedRecipeIds = ALCHEMY_RECIPES.filter(r => r.requiredAlchemyLevel <= 1).map(r => r.id);
          state.alchemyActiveTab = 'recipes';
          state.craftingInProgress = false;
          state.lastCraftTime = 0;
        }
        if (version < 12) {
          state.monsterCodex = initMonsterCodex();
          state.eventCodex = initEventCodex();
          state.rebirthRecords = [];
          state.achievementProgresses = initAchievementProgresses();
          state.totalGoldEarned = 0;
          state.totalSoulOrbsEarned = 0;
        }
        if (version < 13) {
          state.seasonChallenge = {
            currentSeasonId: SEASON_CHALLENGE_SEASONS[0]?.id || null,
            seasonScore: 0,
            taskProgresses: SEASON_CHALLENGE_SEASONS.flatMap((s) =>
              s.stages.flatMap((st) =>
                st.tasks.map((t) => ({
                  taskId: t.id,
                  progress: 0,
                  completed: false,
                  claimed: false,
                }))
              )
            ),
            leaderboard: SEASON_CHALLENGE_SIMULATED_LEADERBOARD,
            crossWeekRewardClaimed: [],
            history: [],
            activeTab: 'tasks',
          };
        }
        if (version < 14) {
          state.faction = getInitialFactionState();
        }
        return state as unknown as GameState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.screen === 'game' && !state.currentLevelStats) {
          state.currentLevelStats = createEmptyLevelStats();
        }
      },
    }
  )
);
