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
  GuildChapter,
  GuildMapProgress,
  GuildLevelConfig,
  GuildDailyReward,
  GuildTechProgress,
  GuildTab,
  Equipment,
  EquipmentSlotType,
  EquipmentRarity,
  AffixStat,
  EquipmentAffixInstance,
  Chapter,
  ChapterProgress,
  StageProgress,
  StoryDialogue,
  ActiveStageBattle,
  BattleMonster,
  ChapterTab,
  Commission,
  ActiveCommission,
  CommissionRewardResult,
  InventoryMaterial,
  RareMaterial,
  TradeItem,
  TradeInventory,
  TradeInventoryItem,
  TradeRecord,
  ActiveTradeEvent,
  TradeEvent,
  SkillTreeAllocation,
  SkillTreeNode,
  SkillTreeBranchId,
  ProfessionSpec,
  ProfessionSpecId,
  ActiveProfessionSpec,
  SkillNodeEffectType,
} from './types';
import { getAffinityLevel, MAP_MODIFIER_ICONS, AFFINITY_LEVEL_NAMES, AFFINITY_LEVEL_COLORS, MONSTER_TIER_CONFIGS, MONSTER_TIER_NAMES } from './types';
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
  RESOURCE_EXCHANGE_RATES,
  COMPANION_DISMISS_SOUL_ORBS,
  GUILD_LEVEL_CONFIGS,
  GUILD_CHAPTERS,
  GUILD_TECH_TREE,
  GUILD_DAILY_REWARDS,
  EQUIPMENT_BASES,
  EQUIPMENT_AFFIXES,
  EQUIPMENT_DROP_CONFIGS,
  FORGE_RECIPES,
  EQUIPMENT_MAX_LEVEL,
  getEquipmentRarityConfig,
  getEquipmentForgeExpToNext,
  CHAPTERS,
  STORY_DIALOGUES,
  RARE_MATERIALS,
  COMMISSION_TEMPLATES,
  COMMISSION_EVENTS,
  COMMISSION_REFRESH_INTERVAL,
  COMMISSION_MAX_ACTIVE,
  COMMISSION_DAILY_REFRESH_COUNT,
  TRADE_ITEMS,
  PRICE_FLUCTUATION_CONFIG,
  TRADE_REFRESH_INTERVAL,
  TRADE_ITEMS_PER_REFRESH,
  BLACK_MARKET_ITEMS_PER_REFRESH,
  BLACK_MARKET_CONFIG,
  TRADE_EVENTS,
  SKILL_TREE_NODES,
  PROFESSION_SPECS,
  SKILL_TREE_COMPANION_SYNERGIES,
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
  currentMonster: BattleMonster | null;

  monsterKillStats: MonsterKillStats;
  rebirthChallenges: RebirthChallengeTarget[];

  generateMonster: (areaId: string, forceTier?: MonsterTier) => BattleMonster | null;
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
  calculateMonsterStats: (monster: Monster, tier: MonsterTier, playerLevel: number, area: MapArea) => BattleMonster;
  getMonsterDropReward: (monster: BattleMonster) => { exp: number; gold: number; soulOrbs: number; shardChance: number };

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
  setCurrentMonster: (monster: BattleMonster) => void;
  calculateDamage: () => number;
  calculateDefense: () => number;
  calculateGoldBonus: () => number;
  calculateExpBonus: () => number;
  calculateOfflineRewards: () => { exp: number; gold: number; breakdown: OfflineRewardBreakdown | null };
  collectOfflineRewards: () => void;
  updateLastOnlineTime: () => void;
  getTotalAttack: () => number;
  getTotalDefense: () => number;
  getTotalMaxHp: () => number;
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

  dismissCompanion: (companionId: string) => boolean;
  exchangeGoldToSoulOrbs: (goldAmount: number) => boolean;
  exchangeShardsToSoulOrbs: (companionId: string, shardAmount: number) => boolean;
  getUnclaimedRewards: () => {
    starRewards: { areaId: string; stars: number }[];
    firstClearRewards: string[];
    rebirthChallengeRewards: string[];
  };

  guildLevel: number;
  guildExp: number;
  guildContribution: number;
  currentStamina: number;
  maxStamina: number;
  lastStaminaRegen: number;
  guildChapterProgress: Record<string, GuildMapProgress[]>;
  currentGuildChapterId: string;
  currentGuildNodeId: string | null;
  guildTechProgress: GuildTechProgress[];
  guildDailyRewards: GuildDailyReward[];
  lastDailyRewardDate: string | null;
  guildActiveTab: GuildTab;
  guildFormation: string[];

  getGuildLevelConfig: () => GuildLevelConfig;
  getGuildExpToNextLevel: () => number;
  addGuildExp: (amount: number) => void;
  addGuildContribution: (amount: number) => void;
  regenStamina: () => void;
  consumeStamina: (amount: number) => boolean;
  getGuildAttackBonus: () => number;
  getGuildDefenseBonus: () => number;
  getGuildHpBonus: () => number;
  getGuildGoldBonus: () => number;
  getGuildExpBonus: () => number;
  getGuildMaxStamina: () => number;

  getCurrentGuildChapter: () => GuildChapter | undefined;
  getGuildChapterProgress: (chapterId: string) => GuildMapProgress[];
  getNodeProgress: (chapterId: string, nodeId: string) => GuildMapProgress | undefined;
  isNodeAccessible: (chapterId: string, nodeId: string) => boolean;
  enterGuildNode: (chapterId: string, nodeId: string) => boolean;
  clearGuildNode: (chapterId: string, nodeId: string, stars: number) => void;
  battleGuildNode: (chapterId: string, nodeId: string) => { won: boolean; stars: number; powerRatio: number };
  claimNodeReward: (chapterId: string, nodeId: string) => boolean;
  canClaimNodeReward: (chapterId: string, nodeId: string) => boolean;
  setCurrentGuildChapter: (chapterId: string) => void;

  getGuildTechLevel: (techId: string) => number;
  upgradeGuildTech: (techId: string) => boolean;
  canUpgradeGuildTech: (techId: string) => boolean;
  getTotalTechBonus: (effectType: string) => number;

  getDailyStreak: () => number;
  claimDailyReward: (day: number) => boolean;
  canClaimDailyReward: (day: number) => boolean;
  checkAndResetDailyRewards: () => void;

  setGuildActiveTab: (tab: GuildTab) => void;
  setGuildFormation: (companionIds: string[]) => void;
  getGuildFormationPower: () => number;

  equipmentInventory: Equipment[];
  companionEquipments: Record<string, Record<EquipmentSlotType, string | null>>;
  equipmentUidCounter: number;

  generateEquipmentDrop: (monsterTier: MonsterTier, areaMinLevel: number) => Equipment | null;
  addEquipmentToInventory: (equipment: Equipment) => void;
  removeEquipment: (uid: string) => void;
  equipItem: (uid: string, companionId: string) => boolean;
  unequipItem: (uid: string) => void;
  unequipSlot: (companionId: string, slot: EquipmentSlotType) => void;
  getEquippedItems: (companionId: string) => Equipment[];
  getEquipmentStatBonus: (companionId: string, stat: AffixStat) => { flat: number; percent: number };
  getPlayerEquipmentStatBonus: (stat: AffixStat) => { flat: number; percent: number };
  recycleEquipment: (uid: string) => number;
  forgeEquipments: (recipeId: string, inputUids: string[]) => Equipment | null;
  getForgeRecipe: (recipeId: string) => typeof FORGE_RECIPES[number] | undefined;
  canForge: (recipeId: string, inputUids: string[]) => boolean;
  addEquipmentForgeExp: (uid: string, exp: number) => void;

  chapterProgresses: ChapterProgress[];
  currentChapterId: string;
  activeStageBattle: ActiveStageBattle | null;
  currentDialogue: { dialogueId: string; currentIndex: number } | null;
  chapterActiveTab: ChapterTab;

  getChapter: (chapterId: string) => Chapter | undefined;
  getChapterProgress: (chapterId: string) => ChapterProgress;
  getStageProgress: (chapterId: string, stageId: string) => StageProgress;
  isChapterUnlocked: (chapterId: string) => boolean;
  isStageAccessible: (chapterId: string, stageId: string) => boolean;
  checkChapterUnlockConditions: (chapterId: string) => boolean;
  getChapterUnlockProgress: (chapterId: string) => { condition: string; current: number; target: number; completed: boolean }[];
  unlockChapter: (chapterId: string) => void;
  setCurrentChapter: (chapterId: string) => void;
  setChapterActiveTab: (tab: ChapterTab) => void;

  startStage: (chapterId: string, stageId: string) => boolean;
  completeStage: (chapterId: string, stageId: string, stars: number) => void;
  claimStageReward: (chapterId: string, stageId: string) => boolean;
  claimStageFirstClearReward: (chapterId: string, stageId: string) => boolean;
  canClaimStageReward: (chapterId: string, stageId: string) => boolean;
  canClaimStageFirstClearReward: (chapterId: string, stageId: string) => boolean;
  claimChapterReward: (chapterId: string) => boolean;
  canClaimChapterReward: (chapterId: string) => boolean;

  startDialogue: (dialogueId: string) => void;
  advanceDialogue: (choiceId?: string) => void;
  closeDialogue: () => void;
  getCurrentDialogue: () => StoryDialogue | null;
  getDialogueChoices: () => StoryDialogue['choices'] | null;

  applyStageRewards: (rewards: StarReward[], areaId: string) => void;

  getTotalChapterStars: () => number;
  getChapterMaxStars: (chapterId: string) => number;

  startStageBattle: (chapterId: string, stageId: string) => boolean;
  endStageBattle: (victory: boolean) => void;

  availableCommissions: Commission[];
  activeCommissions: ActiveCommission[];
  materialInventory: InventoryMaterial[];
  lastCommissionRefresh: number;

  refreshCommissions: () => void;
  shouldRefreshCommissions: () => boolean;
  getCommissionPower: (companionIds: string[]) => number;
  startCommission: (commissionId: string, companionIds: string[]) => boolean;
  updateCommissionProgress: () => void;
  triggerCommissionEvent: (commissionId: string) => void;
  resolveCommissionEvent: (commissionId: string, choiceId: string) => void;
  completeCommission: (commissionId: string) => CommissionRewardResult[];
  failCommission: (commissionId: string) => void;
  cancelCommission: (commissionId: string) => void;
  collectCommissionReward: (commissionId: string) => CommissionRewardResult[] | null;
  getMaterialCount: (materialId: string) => number;
  addMaterial: (materialId: string, count: number) => void;
  sellMaterial: (materialId: string, count: number) => boolean;
  getMaterialInfo: (materialId: string) => RareMaterial | undefined;
  getActiveCommissionCount: () => number;
  canStartCommission: () => boolean;

  tradeInventories: TradeInventory[];
  blackMarketInventory: TradeInventory | null;
  tradeRecords: TradeRecord[];
  activeTradeEvents: ActiveTradeEvent[];
  lastTradeEventCheck: number;

  initTradeInventories: () => TradeInventory[];
  getTradeInventory: (areaId: string) => TradeInventory | undefined;
  getTradeItemStock: (itemId: string, areaId: string) => number;
  getTradeItemPrice: (itemId: string, areaId: string) => number;
  getAvailableTradeItems: (areaId: string) => { item: TradeItem; inventory: TradeInventoryItem }[];
  shouldRefreshTrade: (areaId: string) => boolean;
  refreshTradeInventory: (areaId: string, _triggerType?: 'timer' | 'event' | 'manual') => void;
  calculatePriceModifier: (item: TradeItem, areaId: string) => number;
  buyTradeItem: (itemId: string, areaId: string, quantity?: number) => boolean;
  sellTradeItem: (itemId: string, areaId: string, quantity?: number) => boolean;
  addTradeRecord: (record: Omit<TradeRecord, 'id' | 'timestamp'>) => void;

  isBlackMarketUnlocked: () => boolean;
  getBlackMarketInventory: () => TradeInventory | null;
  shouldRefreshBlackMarket: () => boolean;
  refreshBlackMarket: () => boolean;
  buyBlackMarketItem: (itemId: string, quantity?: number) => boolean;
  getBlackMarketItems: () => { item: TradeItem; inventory: TradeInventoryItem }[];

  checkTradeEvents: () => void;
  getActiveTradeEvents: () => TradeEvent[];
  getTradeEventPriceModifier: (item: TradeItem) => number;
  triggerRandomTradeEvent: () => void;

  skillTreeAllocations: SkillTreeAllocation[];
  activeProfessionSpec: ActiveProfessionSpec | null;

  getSkillNodeLevel: (nodeId: string) => number;
  canUpgradeSkillNode: (nodeId: string) => boolean;
  isSkillNodeUnlocked: (node: SkillTreeNode) => boolean;
  upgradeSkillNode: (nodeId: string) => boolean;
  resetSkillTree: () => boolean;
  getSkillTreeBonus: (type: SkillNodeEffectType) => number;
  getBranchPoints: (branchId: SkillTreeBranchId) => number;
  getTotalAllocatedPoints: () => number;
  getAvailableSkillPoints: () => number;
  canActivateProfessionSpec: (specId: ProfessionSpecId) => boolean;
  activateProfessionSpec: (specId: ProfessionSpecId) => boolean;
  deactivateProfessionSpec: () => void;
  getActiveSpec: () => ProfessionSpec | null;
  getSpecCombatMultiplier: () => { damage: number; defense: number; speed: number };
  getSpecRebirthInheritRate: () => number;
  getSpecPassiveBonus: (type: SkillNodeEffectType) => number;
  getCompanionSynergyBonus: (type: SkillNodeEffectType) => number;
  getSkillTreeTotalBonus: (type: SkillNodeEffectType) => number;
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

function initGuildChapterProgress(): Record<string, GuildMapProgress[]> {
  const progress: Record<string, GuildMapProgress[]> = {};
  GUILD_CHAPTERS.forEach((chapter) => {
    progress[chapter.id] = chapter.nodes.map((node) => ({
      nodeId: node.id,
      cleared: false,
      bestStars: 0,
      claimed: false,
      firstClearedAt: null,
    }));
  });
  return progress;
}

function initGuildTechProgress(): GuildTechProgress[] {
  return GUILD_TECH_TREE.map((tech) => ({
    techId: tech.id,
    level: 0,
  }));
}

function initGuildDailyRewards(): GuildDailyReward[] {
  return GUILD_DAILY_REWARDS.map((reward) => ({
    ...reward,
    claimed: false,
  }));
}

function createEmptyLevelStatsForStage(): LevelStats {
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

function initChapterProgresses(): ChapterProgress[] {
  return CHAPTERS.map((chapter) => {
    const stageProgresses: StageProgress[] = chapter.stages.map((stage) => ({
      stageId: stage.id,
      chapterId: chapter.id,
      cleared: false,
      firstClearedAt: null,
      bestStars: 0,
      currentStars: 0,
      claimedRewards: false,
      claimedFirstClear: false,
      bestStats: createEmptyLevelStatsForStage(),
      attempts: 0,
    }));

    const maxStars = chapter.stages.reduce((sum, stage) => {
      return sum + (stage.starConditions?.length || 0);
    }, 0);

    return {
      chapterId: chapter.id,
      unlocked: chapter.chapterNumber === 1,
      unlockedAt: chapter.chapterNumber === 1 ? Date.now() : null,
      completed: false,
      completedAt: null,
      stageProgresses,
      currentStageId: null,
      totalStars: 0,
      maxStars,
      claimedChapterReward: false,
      storyProgress: [],
    };
  });
}

let tradeRecordIdCounter = 0;

function initTradeInventories(): TradeInventory[] {
  return MAP_AREAS.map((area) => ({
    areaId: area.id,
    items: [],
    lastRefreshTime: 0,
    refreshCount: 0,
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
      guildLevel: 1,
      guildExp: 0,
      guildContribution: 0,
      currentStamina: 100,
      maxStamina: 100,
      lastStaminaRegen: Date.now(),
      guildChapterProgress: initGuildChapterProgress(),
      currentGuildChapterId: 'chapter_forest',
      currentGuildNodeId: null,
      guildTechProgress: initGuildTechProgress(),
      guildDailyRewards: initGuildDailyRewards(),
      lastDailyRewardDate: null,
      guildActiveTab: 'map',
      guildFormation: [],

      equipmentInventory: [],
      companionEquipments: {},
      equipmentUidCounter: 0,

      chapterProgresses: initChapterProgresses(),
      currentChapterId: 'chapter_1',
      activeStageBattle: null,
      currentDialogue: null,
      chapterActiveTab: 'chapters',

      availableCommissions: [],
      activeCommissions: [],
      materialInventory: [],
      lastCommissionRefresh: 0,

      tradeInventories: initTradeInventories(),
      blackMarketInventory: null,
      tradeRecords: [],
      activeTradeEvents: [],
      lastTradeEventCheck: 0,

      skillTreeAllocations: [],
      activeProfessionSpec: null,

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
        const classMultiplier = get().getClassCompanionStatMultiplier(companion);
        const baseAtk = computeEffectiveAttack(companion, classMultiplier);
        const eqBonus = get().getEquipmentStatBonus(companion.id, 'attack');
        const critBonus = get().getEquipmentStatBonus(companion.id, 'critRate');
        return Math.floor((baseAtk + eqBonus.flat) * (1 + eqBonus.percent / 100) * (1 + critBonus.percent / 200));
      },

      getCompanionEffectiveDefense: (companion) => {
        const classMultiplier = get().getClassCompanionStatMultiplier(companion);
        const baseDef = computeEffectiveDefense(companion, classMultiplier);
        const eqBonus = get().getEquipmentStatBonus(companion.id, 'defense');
        return Math.floor((baseDef + eqBonus.flat) * (1 + eqBonus.percent / 100));
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

        const currentAreaId = state.currentAreaId;
        const posMultiplier = get().getClassEventPositiveMultiplier();
        const negReduction = get().getClassEventNegativeReduction();
        const guildGoldBonus = state.getGuildGoldBonus();
        const guildExpBonus = state.getGuildExpBonus();
        const areaEventBonus = get().getAreaEventBonus(currentAreaId || 'forest');

        choice.effects.forEach((effect) => {
          let adjustedValue = effect.value;
          if (adjustedValue > 0) {
            adjustedValue = Math.floor(adjustedValue * posMultiplier);
            if (effect.type === 'gold') {
              adjustedValue = Math.floor(adjustedValue * (1 + guildGoldBonus + areaEventBonus * 0.01));
            } else if (effect.type === 'exp') {
              adjustedValue = Math.floor(adjustedValue * (1 + guildExpBonus + areaEventBonus * 0.01));
            }
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
            case 'guildExp':
              if (adjustedValue > 0) {
                get().addGuildExp(adjustedValue);
                get().addBattleLog(`🏰 公会经验 +${adjustedValue}`, 'levelup');
              }
              break;
            case 'guildContribution':
              if (adjustedValue > 0) {
                get().addGuildContribution(adjustedValue);
                get().addBattleLog(`🎖️ 公会贡献 +${adjustedValue}`, 'drop');
              }
              break;
            case 'stamina':
              if (adjustedValue !== 0) {
                const maxStamina = get().getGuildMaxStamina();
                set((s) => ({
                  currentStamina: Math.max(0, Math.min(maxStamina, s.currentStamina + adjustedValue)),
                }));
                if (adjustedValue > 0) {
                  get().addBattleLog(`⚡ 体力 +${adjustedValue}`, 'drop');
                } else {
                  get().addBattleLog(`⚡ 体力 ${adjustedValue}`, 'event');
                }
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
            case 'guildExp':
            case 'guildContribution':
            case 'stamina':
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

        const activeSpec = state.activeProfessionSpec
          ? PROFESSION_SPECS.find((s) => s.id === state.activeProfessionSpec!.specId)
          : null;
        const inheritRate = activeSpec?.rebirthInheritRate || 0;
        const inheritedAllocations = inheritRate > 0
          ? state.skillTreeAllocations.map((alloc) => ({
              nodeId: alloc.nodeId,
              level: Math.max(0, Math.floor(alloc.level * inheritRate)),
            })).filter((a) => a.level > 0)
          : [];

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
          equipmentInventory: [],
          companionEquipments: {},
          equipmentUidCounter: 0,
          skillTreeAllocations: inheritedAllocations,
          activeProfessionSpec: null,
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
        const guildBonus = state.getGuildGoldBonus();
        const eqBonus = get().getPlayerEquipmentStatBonus('goldBonus').percent / 100;
        return 1 + (state.rebirthBonuses['gold_boost'] || 0) + mapModifierBonus + talentBonus + classBonus + guildBonus + eqBonus;
      },

      calculateExpBonus: () => {
        const state = get();
        const mapModifierBonus = get().getMapModifierTotalBonus('exp') * 0.01;
        const talentBonus = get().getTotalTalentBonus('exp').percent;
        const classBonus = get().getClassIdleExpMultiplier() - 1;
        const guildBonus = state.getGuildExpBonus();
        const eqBonus = get().getPlayerEquipmentStatBonus('expBonus').percent / 100;
        return 1 + (state.rebirthBonuses['exp_boost'] || 0) + mapModifierBonus + talentBonus + classBonus + guildBonus + eqBonus;
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
        const guildBonus = state.getGuildAttackBonus();
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((playerAttack + companionAttack + bondBonus.attack + mapModifierBonus + guildBonus) * affinityMultiplier);
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
        const guildBonus = state.getGuildDefenseBonus();
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((playerDefense + companionDefense + bondBonus.defense + mapModifierBonus + guildBonus) * affinityMultiplier);
      },

      getTotalMaxHp: () => {
        const state = get();
        const playerMaxHp = state.player.stats.maxHp;
        const bondBonus = get().getBondBonus();
        const mapModifierBonus = get().getMapModifierTotalBonus('maxHp');
        const guildBonus = state.getGuildHpBonus();
        const affinityMultiplier = get().getCompanionAffinityBonusMultiplier();
        return Math.floor((playerMaxHp + bondBonus.hp + mapModifierBonus + guildBonus) * affinityMultiplier);
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
        const playerTotalPower = get().getTotalAttack() + get().getTotalDefense() + get().getTotalMaxHp() / 10;
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
        };

        return { exp: expReward, gold: goldReward, breakdown };
      },

      collectOfflineRewards: () => {
        const rewards = get().calculateOfflineRewards();
        const state = get();
        const now = Date.now();
        const offlineTime = now - state.lastOnlineTime;
        const offlineSeconds = Math.min(offlineTime / 1000, 8 * 60 * 60);

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

        if (state.activeCommissions.length > 0 && offlineSeconds > 0) {
          let completedCount = 0;
          let eventCount = 0;

          const updatedCommissions = state.activeCommissions.map((ac) => {
            if (ac.status !== 'in_progress') return ac;

            const template = COMMISSION_TEMPLATES.find((t) => t.title === ac.title);

            if (!template) return ac;

            const elapsed = (now - ac.startTime) / 1000;
            const progress = Math.min(1, elapsed / ac.durationSeconds);

            let newStatus = ac.status as ActiveCommission['status'];
            let newEvent = ac.currentEvent;
            let newEventLog = [...ac.eventLog];

            if (progress >= 1) {
              newStatus = 'completed';
              newEventLog.push('✅ 委托完成！');
              completedCount++;
            } else if (
              ac.currentEvent === null &&
              Math.random() < template.eventChance * Math.min(1, offlineSeconds / 300) &&
              progress > 0.1 &&
              progress < 0.9
            ) {
              const randomEvent = COMMISSION_EVENTS[
                Math.floor(Math.random() * COMMISSION_EVENTS.length)
              ];
              newEvent = { ...randomEvent };
              newStatus = 'event';
              newEventLog.push(`✨ 触发事件：${randomEvent.title}`);
              eventCount++;
            }

            return {
              ...ac,
              progress,
              status: newStatus,
              currentEvent: newEvent,
              eventLog: newEventLog,
            };
          });

          set({ activeCommissions: updatedCommissions });

          if (completedCount > 0) {
            get().addBattleLog(`📜 离线期间完成了 ${completedCount} 个委托`, 'event');
          }
          if (eventCount > 0) {
            get().addBattleLog(`✨ 离线期间触发了 ${eventCount} 个委托事件`, 'event');
          }
        }

        get().updateLastOnlineTime();
      },

      updateLastOnlineTime: () => {
        get().regenStamina();
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
        const rebirthBonus = state.rebirthBonuses['speed_boost'] || 0;
        const talentPct = get().getTotalTalentBonus('speed').percent;
        const talentFlat = get().getTotalTalentBonus('speed').flat;
        return Math.floor((baseSpeed + bondBonus.speed + mapModifierBonus + talentFlat) * (1 + rebirthBonus + talentPct));
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
        return get().getTotalAttack() + get().getTotalDefense() + Math.floor(get().getTotalMaxHp() / 10) + get().getTotalSpeed();
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
            case 'chapterClear':
              if (challenge.chapterId) {
                const progress = get().getChapterProgress(challenge.chapterId);
                completed = progress.completed;
              } else {
                const clearedCount = state.chapterProgresses.filter((p) => p.completed).length;
                completed = clearedCount >= challenge.target;
              }
              break;
            case 'chapterStars':
              if (challenge.chapterId) {
                const progress = get().getChapterProgress(challenge.chapterId);
                completed = progress.totalStars >= challenge.target;
              }
              break;
            case 'bossDefeated':
              if (challenge.bossId) {
                completed = state.monsterKillStats.bossesDefeated.includes(challenge.bossId);
              }
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

      dismissCompanion: (companionId) => {
        const state = get();
        const companion = state.ownedCompanions.find((c) => c.id === companionId);
        if (!companion) return false;

        const soulOrbsReward = COMPANION_DISMISS_SOUL_ORBS[companion.rarity] || 1;

        set((s) => ({
          ownedCompanions: s.ownedCompanions.filter((c) => c.id !== companionId),
          formation: {
            ...s.formation,
            slots: s.formation.slots.map((slot) =>
              slot.companionId === companionId ? { ...slot, companionId: null } : slot
            ),
            activeBondIds: [],
          },
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              soulOrbs: s.player.stats.soulOrbs + soulOrbsReward,
            },
          },
        }));

        get().addBattleLog(`💔 遣散了 ${companion.name}，获得 💎 ${soulOrbsReward} 魂珠`, 'event');
        return true;
      },

      exchangeGoldToSoulOrbs: (goldAmount) => {
        const state = get();
        if (goldAmount <= 0 || state.player.stats.gold < goldAmount) return false;

        const soulOrbsGained = Math.floor(goldAmount / RESOURCE_EXCHANGE_RATES.goldToSoulOrbs);
        if (soulOrbsGained <= 0) return false;

        const actualGoldCost = soulOrbsGained * RESOURCE_EXCHANGE_RATES.goldToSoulOrbs;

        set((s) => ({
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              gold: s.player.stats.gold - actualGoldCost,
              soulOrbs: s.player.stats.soulOrbs + soulOrbsGained,
            },
          },
        }));

        get().addBattleLog(
          `💰 兑换了 ${actualGoldCost.toLocaleString()} 金币，获得 💎 ${soulOrbsGained} 魂珠`,
          'event'
        );
        return true;
      },

      exchangeShardsToSoulOrbs: (companionId, shardAmount) => {
        const state = get();
        const shardCount = state.getShardCount(companionId);
        if (shardAmount <= 0 || shardCount < shardAmount) return false;

        const soulOrbsGained = Math.floor(shardAmount / RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs);
        if (soulOrbsGained <= 0) return false;

        const actualShardCost = soulOrbsGained * RESOURCE_EXCHANGE_RATES.companionShardsToSoulOrbs;

        set((s) => ({
          companionShards: s.companionShards.map((shard) =>
            shard.companionId === companionId
              ? { ...shard, count: shard.count - actualShardCost }
              : shard
          ),
          player: {
            ...s.player,
            stats: {
              ...s.player.stats,
              soulOrbs: s.player.stats.soulOrbs + soulOrbsGained,
            },
          },
        }));

        const companion = COMPANIONS.find((c) => c.id === companionId);
        get().addBattleLog(
          `💎 消耗 ${actualShardCost} ${companion?.name || '伙伴'}碎片，获得 💎 ${soulOrbsGained} 魂珠`,
          'event'
        );
        return true;
      },

      getUnclaimedRewards: () => {
        const state = get();
        const starRewards: { areaId: string; stars: number }[] = [];
        const firstClearRewards: string[] = [];
        const rebirthChallengeRewards: string[] = [];

        state.levelProgresses.forEach((progress) => {
          for (let stars = 1; stars <= 3; stars++) {
            if (
              progress.bestStars >= stars &&
              !progress.claimedStarRewards.includes(stars)
            ) {
              starRewards.push({ areaId: progress.areaId, stars });
            }
          }

          if (progress.firstCleared && !state.canClaimFirstClearReward(progress.areaId)) {
          } else if (progress.firstCleared && state.canClaimFirstClearReward(progress.areaId)) {
            firstClearRewards.push(progress.areaId);
          }
        });

        state.rebirthChallenges.forEach((challenge) => {
          if (challenge.completed && !challenge.claimed) {
            rebirthChallengeRewards.push(challenge.id);
          }
        });

        return { starRewards, firstClearRewards, rebirthChallengeRewards };
      },

      getGuildLevelConfig: () => {
        const state = get();
        return GUILD_LEVEL_CONFIGS.find(c => c.level === state.guildLevel) || GUILD_LEVEL_CONFIGS[0];
      },

      getGuildExpToNextLevel: () => {
        const state = get();
        const currentConfig = GUILD_LEVEL_CONFIGS.find(c => c.level === state.guildLevel);
        const nextConfig = GUILD_LEVEL_CONFIGS.find(c => c.level === state.guildLevel + 1);
        if (!nextConfig) return 0;
        return nextConfig.expRequired - (currentConfig?.expRequired || 0);
      },

      addGuildExp: (amount) => {
        const state = get();
        let newExp = state.guildExp + amount;
        let newLevel = state.guildLevel;
        
        while (true) {
          const nextConfig = GUILD_LEVEL_CONFIGS.find(c => c.level === newLevel + 1);
          if (!nextConfig) break;
          if (newExp < nextConfig.expRequired) break;
          newLevel += 1;
          get().addBattleLog(`🎉 公会升级了！当前等级：${newLevel}`, 'levelup');
        }

        set({ guildExp: newExp, guildLevel: newLevel });
      },

      addGuildContribution: (amount) => {
        set((state) => ({ guildContribution: state.guildContribution + amount }));
      },

      regenStamina: () => {
        const state = get();
        const now = Date.now();
        const elapsed = now - state.lastStaminaRegen;
        const levelConfig = state.getGuildLevelConfig();
        const baseRegenRate = 1 / 60000;
        const regenRate = baseRegenRate * (1 + levelConfig.staminaRegenBonus);
        const maxStamina = state.getGuildMaxStamina();
        
        const regenAmount = Math.floor(elapsed * regenRate);
        
        if (regenAmount > 0 && state.currentStamina < maxStamina) {
          set({
            currentStamina: Math.min(maxStamina, state.currentStamina + regenAmount),
            lastStaminaRegen: now,
          });
        } else if (regenAmount > 0) {
          set({ lastStaminaRegen: now });
        }
      },

      consumeStamina: (amount) => {
        const state = get();
        state.regenStamina();
        if (state.currentStamina < amount) return false;
        set((s) => ({ currentStamina: s.currentStamina - amount }));
        return true;
      },

      getGuildAttackBonus: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('attack');
        return levelConfig.attackBonus + techBonus;
      },

      getGuildDefenseBonus: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('defense');
        return levelConfig.defenseBonus + techBonus;
      },

      getGuildHpBonus: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('hp');
        return levelConfig.hpBonus + techBonus;
      },

      getGuildGoldBonus: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('gold');
        return levelConfig.goldBonus + techBonus;
      },

      getGuildExpBonus: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('exp');
        return levelConfig.expBonus + techBonus;
      },

      getGuildMaxStamina: () => {
        const state = get();
        const levelConfig = state.getGuildLevelConfig();
        const techBonus = state.getTotalTechBonus('stamina');
        return 100 + levelConfig.maxStaminaBonus + techBonus;
      },

      getCurrentGuildChapter: () => {
        const state = get();
        return GUILD_CHAPTERS.find(c => c.id === state.currentGuildChapterId);
      },

      getGuildChapterProgress: (chapterId) => {
        const state = get();
        return state.guildChapterProgress[chapterId] || [];
      },

      getNodeProgress: (chapterId, nodeId) => {
        const state = get();
        const progress = state.guildChapterProgress[chapterId];
        return progress?.find(p => p.nodeId === nodeId);
      },

      isNodeAccessible: (chapterId, nodeId) => {
        const state = get();
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        if (!chapter) return false;
        
        const node = chapter.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        if (node.type === 'start') return true;
        
        const progress = state.guildChapterProgress[chapterId];
        if (!progress) return false;
        
        for (const otherNode of chapter.nodes) {
          if (otherNode.connections.includes(nodeId)) {
            const otherProgress = progress.find(p => p.nodeId === otherNode.id);
            if (otherProgress?.cleared) return true;
          }
        }
        
        return false;
      },

      enterGuildNode: (chapterId, nodeId) => {
        const state = get();
        if (!state.isNodeAccessible(chapterId, nodeId)) return false;
        
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        const node = chapter?.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        if (!state.consumeStamina(node.staminaCost)) return false;
        
        set({ currentGuildNodeId: nodeId, currentGuildChapterId: chapterId });
        return true;
      },

      clearGuildNode: (chapterId, nodeId, stars) => {
        const state = get();
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        const node = chapter?.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const progress = [...state.guildChapterProgress[chapterId]];
        const nodeIndex = progress.findIndex(p => p.nodeId === nodeId);
        
        if (nodeIndex >= 0) {
          const oldProgress = progress[nodeIndex];
          const isFirstClear = !oldProgress.cleared;
          progress[nodeIndex] = {
            ...oldProgress,
            cleared: true,
            bestStars: Math.max(oldProgress.bestStars, stars),
            firstClearedAt: oldProgress.firstClearedAt || Date.now(),
          };
          
          set({
            guildChapterProgress: {
              ...state.guildChapterProgress,
              [chapterId]: progress,
            },
          });
          
          const expGain = Math.floor((stars + 1) * 10);
          get().addGuildExp(expGain);
          get().addGuildContribution(stars * 5 + (isFirstClear ? 10 : 0));
          
          get().addBattleLog(`🏰 公会据点 ${node.name} 通关！获得 ${stars} 星评价${isFirstClear ? '（首次通关！）' : ''}`, 'event');
        }
      },

      battleGuildNode: (chapterId, nodeId) => {
        const state = get();
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        const node = chapter?.nodes.find(n => n.id === nodeId);
        if (!node) return { won: false, stars: 0, powerRatio: 0 };

        const formationPower = state.getGuildFormationPower();
        const basePower = (state.getTotalAttack() + state.getTotalDefense() + state.getTotalMaxHp() / 10) * 0.3;
        const totalPower = formationPower > 0 ? formationPower : basePower;

        const levelMultiplier = 1 + (node.minLevel - 1) * 0.15;
        const typeMultiplier =
          node.type === 'boss' ? 2.5 :
          node.type === 'elite' ? 1.8 :
          node.type === 'normal' ? 1.2 :
          node.type === 'treasure' ? 0.8 :
          node.type === 'shrine' ? 0.6 :
          node.type === 'shop' ? 0.5 :
          node.type === 'rest' ? 0.3 :
          node.type === 'start' ? 0.1 : 1.0;
        const nodePower = Math.floor(80 * levelMultiplier * typeMultiplier);

        const powerRatio = totalPower / Math.max(1, nodePower);

        if (powerRatio >= 3.0) {
          return { won: true, stars: 3, powerRatio };
        } else if (powerRatio >= 1.5) {
          return { won: true, stars: 2, powerRatio };
        } else if (powerRatio >= 0.8) {
          return { won: true, stars: 1, powerRatio };
        } else {
          const winChance = powerRatio * 0.5;
          const won = Math.random() < winChance;
          return { won, stars: won ? 1 : 0, powerRatio };
        }
      },

      claimNodeReward: (chapterId, nodeId) => {
        const state = get();
        if (!state.canClaimNodeReward(chapterId, nodeId)) return false;
        
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        const node = chapter?.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        const progress = [...state.guildChapterProgress[chapterId]];
        const nodeIndex = progress.findIndex(p => p.nodeId === nodeId);
        
        if (nodeIndex >= 0) {
          const nodeProgress = progress[nodeIndex];
          const stars = nodeProgress.bestStars;
          const starMultiplier = 1 + (stars - 1) * 0.3;

          node.rewards.forEach(reward => {
            const finalValue = Math.floor(reward.value * starMultiplier);
            switch (reward.type) {
              case 'gold':
                get().addGold(finalValue);
                get().addBattleLog(`💰 获得金币 +${finalValue}`, 'drop');
                break;
              case 'exp':
                get().addExp(finalValue);
                get().addBattleLog(`⚡ 获得经验 +${finalValue}`, 'levelup');
                break;
              case 'soulOrbs':
                get().addSoulOrbs(finalValue);
                get().addBattleLog(`💎 获得魂珠 +${finalValue}`, 'drop');
                break;
              case 'attack':
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      attack: s.player.stats.attack + finalValue,
                    },
                  },
                }));
                get().addBattleLog(`⚔️ 攻击力永久 +${finalValue}`, 'levelup');
                break;
              case 'defense':
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      defense: s.player.stats.defense + finalValue,
                    },
                  },
                }));
                get().addBattleLog(`🛡️ 防御力永久 +${finalValue}`, 'levelup');
                break;
              case 'hp':
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      maxHp: s.player.stats.maxHp + finalValue,
                      hp: Math.min(s.player.stats.hp + finalValue, s.player.stats.maxHp + finalValue),
                    },
                  },
                }));
                get().addBattleLog(`❤️ 最大生命永久 +${finalValue}`, 'levelup');
                break;
              case 'speed':
                set((s) => ({
                  player: {
                    ...s.player,
                    stats: {
                      ...s.player.stats,
                      speed: s.player.stats.speed + finalValue,
                    },
                  },
                }));
                get().addBattleLog(`💨 速度永久 +${finalValue}`, 'levelup');
                break;
              case 'reputation':
                if (chapter?.areaId) {
                  get().addAreaReputation(chapter.areaId, finalValue);
                  get().addBattleLog(`🏛️ 区域声望 +${finalValue}`, 'event');
                }
                break;
              case 'guildExp':
                get().addGuildExp(finalValue);
                get().addBattleLog(`🏰 公会经验 +${finalValue}`, 'levelup');
                break;
              case 'guildContribution':
                get().addGuildContribution(finalValue);
                get().addBattleLog(`🎖️ 公会贡献 +${finalValue}`, 'drop');
                break;
              case 'stamina':
                const maxStam = get().getGuildMaxStamina();
                set((s) => ({
                  currentStamina: Math.min(maxStam, s.currentStamina + finalValue),
                }));
                get().addBattleLog(`⚡ 体力 +${finalValue}`, 'drop');
                break;
            }
          });

          const extraContribution = Math.floor(stars * 15 * starMultiplier);
          get().addGuildContribution(extraContribution);

          progress[nodeIndex] = {
            ...nodeProgress,
            claimed: true,
          };
          
          set({
            guildChapterProgress: {
              ...state.guildChapterProgress,
              [chapterId]: progress,
            },
          });

          get().addBattleLog(`🎁 已领取据点「${node.name}」奖励，倍率 x${starMultiplier.toFixed(1)}`, 'drop');
          
          return true;
        }
        return false;
      },

      canClaimNodeReward: (chapterId, nodeId) => {
        const state = get();
        const progress = state.guildChapterProgress[chapterId];
        const nodeProgress = progress?.find(p => p.nodeId === nodeId);
        return !!(nodeProgress?.cleared && !nodeProgress.claimed);
      },

      setCurrentGuildChapter: (chapterId) => {
        const chapter = GUILD_CHAPTERS.find(c => c.id === chapterId);
        if (chapter) {
          set({ currentGuildChapterId: chapterId });
        }
      },

      getGuildTechLevel: (techId) => {
        const state = get();
        const tech = state.guildTechProgress.find(t => t.techId === techId);
        return tech?.level || 0;
      },

      upgradeGuildTech: (techId) => {
        const state = get();
        if (!state.canUpgradeGuildTech(techId)) return false;
        
        const tech = GUILD_TECH_TREE.find(t => t.id === techId);
        if (!tech) return false;
        
        const currentLevel = state.getGuildTechLevel(techId);
        const cost = tech.costPerLevel * (currentLevel + 1);
        
        if (state.guildContribution < cost) return false;
        
        const newProgress = state.guildTechProgress.map(t => 
          t.techId === techId 
            ? { ...t, level: t.level + 1 }
            : t
        );
        
        set({
          guildTechProgress: newProgress,
          guildContribution: state.guildContribution - cost,
        });
        
        get().addBattleLog(`🔧 公会科技 ${tech.name} 升至 ${currentLevel + 1} 级！`, 'event');
        return true;
      },

      canUpgradeGuildTech: (techId) => {
        const state = get();
        const tech = GUILD_TECH_TREE.find(t => t.id === techId);
        if (!tech) return false;
        
        const currentLevel = state.getGuildTechLevel(techId);
        if (currentLevel >= tech.maxLevel) return false;
        
        const prereqsMet = tech.prerequisites.every(
          prereqId => state.getGuildTechLevel(prereqId) > 0
        );
        
        return prereqsMet;
      },

      getTotalTechBonus: (effectType) => {
        const state = get();
        let total = 0;
        
        GUILD_TECH_TREE.forEach(tech => {
          if (tech.effectType === effectType) {
            const level = state.getGuildTechLevel(tech.id);
            total += tech.effectValuePerLevel * level;
          }
        });
        
        return total;
      },

      getDailyStreak: () => {
        const state = get();
        if (!state.lastDailyRewardDate) return 0;
        
        const claimedDays = state.guildDailyRewards.filter(r => r.claimed).length;
        return claimedDays;
      },

      claimDailyReward: (day) => {
        const state = get();
        if (!state.canClaimDailyReward(day)) return false;
        
        const reward = state.guildDailyRewards.find(r => r.day === day);
        if (!reward) return false;
        
        reward.rewards.forEach(r => {
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
          }
        });
        
        const newRewards = state.guildDailyRewards.map(r => 
          r.day === day ? { ...r, claimed: true } : r
        );
        
        const today = new Date().toDateString();
        
        set({
          guildDailyRewards: newRewards,
          lastDailyRewardDate: today,
        });
        
        get().addBattleLog(`🎁 领取了第 ${day} 天每日奖励！`, 'event');
        return true;
      },

      canClaimDailyReward: (day) => {
        const state = get();
        const reward = state.guildDailyRewards.find(r => r.day === day);
        if (!reward || reward.claimed) return false;
        
        const streak = state.getDailyStreak();
        return day === streak + 1;
      },

      checkAndResetDailyRewards: () => {
        const state = get();
        const today = new Date().toDateString();
        
        if (state.lastDailyRewardDate && state.lastDailyRewardDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (state.lastDailyRewardDate !== yesterdayStr) {
            set({
              guildDailyRewards: initGuildDailyRewards(),
              lastDailyRewardDate: null,
            });
          }
        }
      },

      setGuildActiveTab: (tab) => {
        set({ guildActiveTab: tab });
      },

      setGuildFormation: (companionIds) => {
        set({ guildFormation: companionIds });
      },

      getGuildFormationPower: () => {
        const state = get();
        let totalPower = 0;
        
        state.guildFormation.forEach(companionId => {
          const companion = state.ownedCompanions.find(c => c.id === companionId);
          if (companion) {
            const atk = state.getCompanionEffectiveAttack(companion);
            const def = state.getCompanionEffectiveDefense(companion);
            totalPower += atk + def;
          }
        });
        
        return totalPower + state.getTotalAttack() + state.getTotalDefense();
      },

      generateEquipmentDrop: (monsterTier, areaMinLevel) => {
        const dropConfig = EQUIPMENT_DROP_CONFIGS.find((c) => c.monsterTier === monsterTier);
        if (!dropConfig) return null;

        const dropBonus = get().getAreaDropBonus(get().currentAreaId);
        if (Math.random() > dropConfig.dropChance * (1 + dropBonus)) return null;

        const availableBases = EQUIPMENT_BASES.filter((b) => b.minAreaLevel <= areaMinLevel + 10);
        if (availableBases.length === 0) return null;

        const base = availableBases[Math.floor(Math.random() * availableBases.length)];

        let rarity: EquipmentRarity = 'common';
        const rarityRoll = Math.random();
        const rarityBonus = dropConfig.rarityBonus + dropBonus * 0.5;
        const adjustedWeights = { ...base.rarityWeights };
        if (rarityBonus > 0) {
          adjustedWeights.rare = (adjustedWeights.rare || 0) + rarityBonus * 30;
          adjustedWeights.epic = (adjustedWeights.epic || 0) + rarityBonus * 15;
          adjustedWeights.legendary = (adjustedWeights.legendary || 0) + rarityBonus * 5;
        }
        const totalWeight = Object.values(adjustedWeights).reduce((s, w) => s + w, 0);
        let cumulative = 0;
        const rarityOrder: EquipmentRarity[] = ['common', 'rare', 'epic', 'legendary'];
        for (const r of rarityOrder) {
          cumulative += (adjustedWeights[r] || 0);
          if (rarityRoll <= cumulative / totalWeight) {
            rarity = r;
            break;
          }
        }

        const rarityConfig = getEquipmentRarityConfig(rarity);
        const affixCount = rarityConfig.minAffixes + Math.floor(Math.random() * (rarityConfig.maxAffixes - rarityConfig.minAffixes + 1));
        const affixes: EquipmentAffixInstance[] = [];

        const eligibleAffixes = EQUIPMENT_AFFIXES.filter((a) => {
          if (a.slotRestrictions && !a.slotRestrictions.includes(base.slot)) return false;
          if ((a.rarityWeights[rarity] || 0) <= 0) return false;
          return true;
        });

        const shuffledAffixes = [...eligibleAffixes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(affixCount, shuffledAffixes.length); i++) {
          const affix = shuffledAffixes[i];
          const stats = affix.stats.map((s) => {
            const range = s.maxValue - s.minValue;
            const rarityMultiplier = rarityConfig.statMultiplier;
            const value = Math.floor((s.minValue + Math.random() * range) * rarityMultiplier);
            return { stat: s.stat, value, isPercent: s.isPercent };
          });
          affixes.push({ affixId: affix.id, name: affix.name, stats });
        }

        const uid = `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const levelScale = Math.max(1, Math.floor(areaMinLevel / 5));
        const scaledBaseStats = base.baseStats.map((s) => ({
          stat: s.stat,
          value: Math.floor(s.value * (1 + levelScale * 0.1) * rarityConfig.statMultiplier),
          isPercent: s.isPercent,
        }));

        const equipName = affixes.length > 0
          ? `${affixes.filter((a) => { const af = EQUIPMENT_AFFIXES.find((aa) => aa.id === a.affixId); return af?.type === 'prefix'; }).map((a) => a.name).join('')}${base.name}${affixes.filter((a) => { const af = EQUIPMENT_AFFIXES.find((aa) => aa.id === a.affixId); return af?.type === 'suffix'; }).map((a) => a.name).join('')}`
          : base.name;

        return {
          uid,
          baseId: base.id,
          name: equipName,
          slot: base.slot,
          rarity,
          level: 1,
          icon: base.icon,
          baseStats: scaledBaseStats,
          affixes,
          equippedBy: null,
          forgeExp: 0,
          forgeExpToNext: getEquipmentForgeExpToNext(1),
        };
      },

      addEquipmentToInventory: (equipment) => {
        set((state) => ({
          equipmentInventory: [...state.equipmentInventory, equipment],
        }));
      },

      removeEquipment: (uid) => {
        const state = get();
        const eq = state.equipmentInventory.find((e) => e.uid === uid);
        if (!eq) return;
        if (eq.equippedBy) {
          get().unequipItem(uid);
        }
        set((state) => ({
          equipmentInventory: state.equipmentInventory.filter((e) => e.uid !== uid),
        }));
      },

      equipItem: (uid, companionId) => {
        const state = get();
        const eq = state.equipmentInventory.find((e) => e.uid === uid);
        if (!eq) return false;
        if (eq.equippedBy) return false;
        const companion = state.ownedCompanions.find((c) => c.id === companionId);
        if (!companion) return false;

        const currentEquipped = state.companionEquipments[companionId];
        const slotItem = currentEquipped?.[eq.slot];
        if (slotItem) {
          get().unequipSlot(companionId, eq.slot);
        }

        set((state) => {
          const newCompanionEquipments = { ...state.companionEquipments };
          if (!newCompanionEquipments[companionId]) {
            newCompanionEquipments[companionId] = {
              weapon: null, helmet: null, armor: null, boots: null, accessory: null,
            };
          }
          newCompanionEquipments[companionId] = {
            ...newCompanionEquipments[companionId],
            [eq.slot]: uid,
          };

          return {
            companionEquipments: newCompanionEquipments,
            equipmentInventory: state.equipmentInventory.map((e) =>
              e.uid === uid ? { ...e, equippedBy: companionId } : e
            ),
          };
        });

        return true;
      },

      unequipItem: (uid) => {
        const state = get();
        const eq = state.equipmentInventory.find((e) => e.uid === uid);
        if (!eq || !eq.equippedBy) return;

        const companionId = eq.equippedBy;
        set((state) => {
          const newCompanionEquipments = { ...state.companionEquipments };
          if (newCompanionEquipments[companionId]) {
            newCompanionEquipments[companionId] = {
              ...newCompanionEquipments[companionId],
              [eq.slot]: null,
            };
          }

          return {
            companionEquipments: newCompanionEquipments,
            equipmentInventory: state.equipmentInventory.map((e) =>
              e.uid === uid ? { ...e, equippedBy: null } : e
            ),
          };
        });
      },

      unequipSlot: (companionId, slot) => {
        const state = get();
        const equipped = state.companionEquipments[companionId];
        if (!equipped) return;
        const uid = equipped[slot];
        if (!uid) return;
        get().unequipItem(uid);
      },

      getEquippedItems: (companionId) => {
        const state = get();
        const equipped = state.companionEquipments[companionId];
        if (!equipped) return [];
        const uids = Object.values(equipped).filter((u): u is string => u !== null);
        return uids
          .map((uid) => state.equipmentInventory.find((e) => e.uid === uid))
          .filter((e): e is Equipment => e !== undefined);
      },

      getEquipmentStatBonus: (companionId, stat) => {
        const items = get().getEquippedItems(companionId);
        let flat = 0;
        let percent = 0;
        for (const item of items) {
          for (const s of item.baseStats) {
            if (s.stat === stat) {
              if (s.isPercent) percent += s.value;
              else flat += s.value;
            }
          }
          for (const affix of item.affixes) {
            for (const s of affix.stats) {
              if (s.stat === stat) {
                if (s.isPercent) percent += s.value;
                else flat += s.value;
              }
            }
          }
        }
        return { flat, percent };
      },

      getPlayerEquipmentStatBonus: (stat) => {
        const state = get();
        const formationCompanions = state.getFormationCompanions();
        let flat = 0;
        let percent = 0;
        for (const companion of formationCompanions) {
          const bonus = get().getEquipmentStatBonus(companion.id, stat);
          flat += bonus.flat;
          percent += bonus.percent;
        }
        return { flat, percent };
      },

      recycleEquipment: (uid) => {
        const state = get();
        const eq = state.equipmentInventory.find((e) => e.uid === uid);
        if (!eq) return 0;
        if (eq.equippedBy) return 0;

        const rarityConfig = getEquipmentRarityConfig(eq.rarity);
        const goldReward = rarityConfig.recycleGoldBase + rarityConfig.recycleGoldPerLevel * eq.level;

        get().removeEquipment(uid);
        get().addGold(goldReward);
        get().addBattleLog(`♻️ 回收了 ${eq.name}，获得 ${goldReward} 金币`, 'drop');

        return goldReward;
      },

      forgeEquipments: (recipeId, inputUids) => {
        const state = get();
        const recipe = FORGE_RECIPES.find((r) => r.id === recipeId);
        if (!recipe) return null;

        if (!get().canForge(recipeId, inputUids)) return null;

        if (recipe.currency === 'gold' && state.player.stats.gold < recipe.cost) return null;
        if (recipe.currency === 'soulOrbs' && state.player.stats.soulOrbs < recipe.cost) return null;

        const inputItems = inputUids.map((uid) => state.equipmentInventory.find((e) => e.uid === uid)).filter((e): e is Equipment => e !== undefined);
        if (inputItems.length !== recipe.inputSlots) return null;

        const bestItem = inputItems.reduce((best, item) => {
          const order: EquipmentRarity[] = ['common', 'rare', 'epic', 'legendary'];
          return order.indexOf(item.rarity) > order.indexOf(best.rarity) ? item : best;
        });

        const rarityOrder: EquipmentRarity[] = ['common', 'rare', 'epic', 'legendary'];
        const currentIdx = rarityOrder.indexOf(bestItem.rarity);
        const newRarityIdx = Math.min(rarityOrder.length - 1, currentIdx + recipe.outputRarityBoost);
        const newRarity = recipe.outputRarityBoost > 0 ? rarityOrder[newRarityIdx] : bestItem.rarity;

        const base = EQUIPMENT_BASES.find((b) => b.id === bestItem.baseId) || EQUIPMENT_BASES[0];
        const rarityConfig = getEquipmentRarityConfig(newRarity);
        const affixCount = rarityConfig.minAffixes + Math.floor(Math.random() * (rarityConfig.maxAffixes - rarityConfig.minAffixes + 1));
        const newAffixes: EquipmentAffixInstance[] = [];

        if (recipe.rerollAffixes) {
          const eligibleAffixes = EQUIPMENT_AFFIXES.filter((a) => {
            if (a.slotRestrictions && !a.slotRestrictions.includes(base.slot)) return false;
            if ((a.rarityWeights[newRarity] || 0) <= 0) return false;
            return true;
          });
          const shuffled = [...eligibleAffixes].sort(() => Math.random() - 0.5);
          for (let i = 0; i < Math.min(affixCount, shuffled.length); i++) {
            const affix = shuffled[i];
            const stats = affix.stats.map((s) => {
              const range = s.maxValue - s.minValue;
              const value = Math.floor((s.minValue + Math.random() * range) * rarityConfig.statMultiplier);
              return { stat: s.stat, value, isPercent: s.isPercent };
            });
            newAffixes.push({ affixId: affix.id, name: affix.name, stats });
          }
        } else {
          newAffixes.push(...bestItem.affixes);
        }

        const scaledBaseStats = base.baseStats.map((s) => ({
          stat: s.stat,
          value: Math.floor(s.value * (1 + (bestItem.level - 1) * 0.1) * rarityConfig.statMultiplier),
          isPercent: s.isPercent,
        }));

        const equipName = newAffixes.length > 0
          ? `${newAffixes.filter((a) => { const af = EQUIPMENT_AFFIXES.find((aa) => aa.id === a.affixId); return af?.type === 'prefix'; }).map((a) => a.name).join('')}${base.name}${newAffixes.filter((a) => { const af = EQUIPMENT_AFFIXES.find((aa) => aa.id === a.affixId); return af?.type === 'suffix'; }).map((a) => a.name).join('')}`
          : base.name;

        const uid = `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newEquipment: Equipment = {
          uid,
          baseId: base.id,
          name: equipName,
          slot: base.slot,
          rarity: newRarity,
          level: bestItem.level,
          icon: base.icon,
          baseStats: scaledBaseStats,
          affixes: newAffixes,
          equippedBy: null,
          forgeExp: bestItem.forgeExp,
          forgeExpToNext: getEquipmentForgeExpToNext(bestItem.level),
        };

        inputUids.forEach((uid) => get().removeEquipment(uid));

        if (recipe.currency === 'gold') {
          set((s) => ({
            player: { ...s.player, stats: { ...s.player.stats, gold: s.player.stats.gold - recipe.cost } },
          }));
        } else {
          set((s) => ({
            player: { ...s.player, stats: { ...s.player.stats, soulOrbs: s.player.stats.soulOrbs - recipe.cost } },
          }));
        }

        get().addEquipmentToInventory(newEquipment);
        get().addBattleLog(`🔨 锻造成功！获得 ${equipName}（${rarityConfig.name}）`, 'levelup');

        return newEquipment;
      },

      getForgeRecipe: (recipeId) => {
        return FORGE_RECIPES.find((r) => r.id === recipeId);
      },

      canForge: (recipeId, inputUids) => {
        const state = get();
        const recipe = FORGE_RECIPES.find((r) => r.id === recipeId);
        if (!recipe) return false;

        if (inputUids.length !== recipe.inputSlots) return false;

        const rarityOrder: EquipmentRarity[] = ['common', 'rare', 'epic', 'legendary'];
        const minIdx = rarityOrder.indexOf(recipe.minRarity);

        for (const uid of inputUids) {
          const eq = state.equipmentInventory.find((e) => e.uid === uid);
          if (!eq) return false;
          if (eq.equippedBy) return false;
          if (rarityOrder.indexOf(eq.rarity) < minIdx) return false;
        }

        if (recipe.currency === 'gold' && state.player.stats.gold < recipe.cost) return false;
        if (recipe.currency === 'soulOrbs' && state.player.stats.soulOrbs < recipe.cost) return false;

        return true;
      },

      addEquipmentForgeExp: (uid, exp) => {
        set((state) => ({
          equipmentInventory: state.equipmentInventory.map((eq) => {
            if (eq.uid !== uid) return eq;
            if (eq.level >= EQUIPMENT_MAX_LEVEL) return eq;
            let newExp = eq.forgeExp + exp;
            let newLevel = eq.level;
            let newExpToNext = eq.forgeExpToNext;
            while (newLevel < EQUIPMENT_MAX_LEVEL && newExp >= newExpToNext) {
              newExp -= newExpToNext;
              newLevel += 1;
              newExpToNext = getEquipmentForgeExpToNext(newLevel);
            }
            if (newLevel > eq.level) {
              const levelBonus = 1 + (newLevel - eq.level) * 0.1;
              return {
                ...eq,
                level: newLevel,
                forgeExp: newExp,
                forgeExpToNext: newExpToNext,
                baseStats: eq.baseStats.map((s) => ({
                  ...s,
                  value: Math.floor(s.value * levelBonus),
                })),
              };
            }
            return { ...eq, forgeExp: newExp };
          }),
        }));
      },

      getChapter: (chapterId) => {
        return CHAPTERS.find((c) => c.id === chapterId);
      },

      getChapterProgress: (chapterId) => {
        const state = get();
        const progress = state.chapterProgresses.find((p) => p.chapterId === chapterId);
        return progress || {
          chapterId,
          unlocked: false,
          unlockedAt: null,
          completed: false,
          completedAt: null,
          stageProgresses: [],
          currentStageId: null,
          totalStars: 0,
          maxStars: 0,
          claimedChapterReward: false,
          storyProgress: [],
        };
      },

      getStageProgress: (chapterId, stageId) => {
        const chapterProgress = get().getChapterProgress(chapterId);
        const stageProgress = chapterProgress.stageProgresses.find((s) => s.stageId === stageId);
        return stageProgress || {
          stageId,
          chapterId,
          cleared: false,
          firstClearedAt: null,
          bestStars: 0,
          currentStars: 0,
          claimedRewards: false,
          claimedFirstClear: false,
          bestStats: createEmptyLevelStatsForStage(),
          attempts: 0,
        };
      },

      isChapterUnlocked: (chapterId) => {
        return get().getChapterProgress(chapterId).unlocked;
      },

      isStageAccessible: (chapterId, stageId) => {
        const state = get();
        const chapter = state.getChapter(chapterId);
        const chapterProgress = state.getChapterProgress(chapterId);

        if (!chapter || !chapterProgress.unlocked) return false;

        const stage = chapter.stages.find((s) => s.id === stageId);
        if (!stage) return false;

        if (state.player.stats.level < stage.minLevel) return false;

        if (stage.requiredStageIds && stage.requiredStageIds.length > 0) {
          const allRequiredCleared = stage.requiredStageIds.every((reqId) => {
            const reqProgress = chapterProgress.stageProgresses.find((s) => s.stageId === reqId);
            return reqProgress?.cleared;
          });
          if (!allRequiredCleared) return false;
        }

        return true;
      },

      checkChapterUnlockConditions: (chapterId) => {
        const state = get();
        const chapter = state.getChapter(chapterId);
        if (!chapter) return false;

        return chapter.unlockConditions.every((condition) => {
          switch (condition.type) {
            case 'level':
              return state.player.stats.level >= condition.threshold;
            case 'bossKills':
              if (condition.areaId) {
                return state.getAreaBossKills(condition.areaId) >= condition.threshold;
              }
              return state.getTotalBossKills() >= condition.threshold;
            case 'eliteKills':
              if (condition.areaId) {
                return state.getAreaEliteKills(condition.areaId) >= condition.threshold;
              }
              return state.getTotalEliteKills() >= condition.threshold;
            case 'totalKills':
              return state.monsterKillStats.totalKills >= condition.threshold;
            case 'stars':
              if (condition.areaId) {
                const areaProgress = state.getLevelProgress(condition.areaId);
                return areaProgress.bestStars >= condition.threshold;
              }
              return state.getTotalChapterStars() >= condition.threshold;
            default:
              return false;
          }
        });
      },

      getChapterUnlockProgress: (chapterId) => {
        const state = get();
        const chapter = state.getChapter(chapterId);
        if (!chapter) return [];

        return chapter.unlockConditions.map((condition) => {
          let current = 0;
          switch (condition.type) {
            case 'level':
              current = state.player.stats.level;
              break;
            case 'bossKills':
              if (condition.areaId) {
                current = state.getAreaBossKills(condition.areaId);
              } else {
                current = state.getTotalBossKills();
              }
              break;
            case 'eliteKills':
              if (condition.areaId) {
                current = state.getAreaEliteKills(condition.areaId);
              } else {
                current = state.getTotalEliteKills();
              }
              break;
            case 'totalKills':
              current = state.monsterKillStats.totalKills;
              break;
            case 'stars':
              if (condition.areaId) {
                const areaProgress = state.getLevelProgress(condition.areaId);
                current = areaProgress.bestStars;
              } else {
                current = state.getTotalChapterStars();
              }
              break;
          }
          return {
            condition: condition.description,
            current,
            target: condition.threshold,
            completed: current >= condition.threshold,
          };
        });
      },

      unlockChapter: (chapterId) => {
        const state = get();
        const chapterProgress = state.getChapterProgress(chapterId);
        if (chapterProgress.unlocked) return;

        set((state) => ({
          chapterProgresses: state.chapterProgresses.map((p) =>
            p.chapterId === chapterId
              ? { ...p, unlocked: true, unlockedAt: Date.now() }
              : p
          ),
        }));

        const chapter = state.getChapter(chapterId);
        if (chapter) {
          get().addBattleLog(`📖 解锁了新章节：${chapter.name}！`, 'system');
        }
      },

      setCurrentChapter: (chapterId) => {
        const state = get();
        if (state.isChapterUnlocked(chapterId)) {
          set({ currentChapterId: chapterId });
        }
      },

      setChapterActiveTab: (tab) => set({ chapterActiveTab: tab }),

      startStage: (chapterId, stageId) => {
        const state = get();
        if (!state.isStageAccessible(chapterId, stageId)) return false;

        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        if (!chapter || !stage) return false;

        if (stage.type === 'story' && stage.storyDialogueId) {
          state.startDialogue(stage.storyDialogueId);
          state.completeStage(chapterId, stageId, 0);
          return true;
        }

        if (stage.type === 'treasure' || stage.type === 'shrine' || stage.type === 'rest') {
          state.applyStageRewards(stage.rewards, stage.areaId);
          state.completeStage(chapterId, stageId, 0);
          get().addBattleLog(`🎁 在 ${stage.name} 获得了奖励！`, 'event');
          return true;
        }

        return state.startStageBattle(chapterId, stageId);
      },

      completeStage: (chapterId, stageId, stars) => {
        const state = get();
        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        if (!chapter || !stage) return;

        set((state) => {
          const newChapterProgresses = state.chapterProgresses.map((cp) => {
            if (cp.chapterId !== chapterId) return cp;

            const newStageProgresses = cp.stageProgresses.map((sp) => {
              if (sp.stageId !== stageId) return sp;

              const isFirstClear = !sp.cleared;
              const newBestStars = Math.max(sp.bestStars, stars);

              return {
                ...sp,
                cleared: true,
                firstClearedAt: isFirstClear ? Date.now() : sp.firstClearedAt,
                bestStars: newBestStars,
                currentStars: stars,
                attempts: sp.attempts + 1,
              };
            });

            const totalStars = newStageProgresses.reduce((sum, sp) => sum + sp.bestStars, 0);
            const bossProgress = newStageProgresses.find((sp) => sp.stageId === chapter.bossStageId);
            const isCompleted = bossProgress?.cleared || false;

            return {
              ...cp,
              stageProgresses: newStageProgresses,
              totalStars,
              completed: isCompleted,
              completedAt: isCompleted && !cp.completed ? Date.now() : cp.completedAt,
            };
          });

          return { chapterProgresses: newChapterProgresses };
        });

        const chapterProgress = get().getChapterProgress(chapterId);
        if (chapterProgress.completed && chapter.epilogueDialogueId) {
          const hasSeenEpilogue = chapterProgress.storyProgress.includes(chapter.epilogueDialogueId);
          if (!hasSeenEpilogue) {
            set((state) => ({
              chapterProgresses: state.chapterProgresses.map((cp) =>
                cp.chapterId === chapterId
                  ? { ...cp, storyProgress: [...cp.storyProgress, chapter.epilogueDialogueId!] }
                  : cp
              ),
            }));
            get().startDialogue(chapter.epilogueDialogueId);
          }
        }

        state.checkRebirthChallenges();

        state.chapterProgresses.forEach((cp) => {
          if (!cp.unlocked && get().checkChapterUnlockConditions(cp.chapterId)) {
            get().unlockChapter(cp.chapterId);
          }
        });
      },

      claimStageReward: (chapterId, stageId) => {
        const state = get();
        if (!state.canClaimStageReward(chapterId, stageId)) return false;

        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        if (!chapter || !stage) return false;

        state.applyStageRewards(stage.rewards, stage.areaId);

        set((state) => ({
          chapterProgresses: state.chapterProgresses.map((cp) =>
            cp.chapterId === chapterId
              ? {
                  ...cp,
                  stageProgresses: cp.stageProgresses.map((sp) =>
                    sp.stageId === stageId ? { ...sp, claimedRewards: true } : sp
                  ),
                }
              : cp
          ),
        }));

        return true;
      },

      claimStageFirstClearReward: (chapterId, stageId) => {
        const state = get();
        if (!state.canClaimStageFirstClearReward(chapterId, stageId)) return false;

        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        if (!chapter || !stage || !stage.firstClearRewards) return false;

        state.applyStageRewards(stage.firstClearRewards, stage.areaId);

        set((state) => ({
          chapterProgresses: state.chapterProgresses.map((cp) =>
            cp.chapterId === chapterId
              ? {
                  ...cp,
                  stageProgresses: cp.stageProgresses.map((sp) =>
                    sp.stageId === stageId ? { ...sp, claimedFirstClear: true } : sp
                  ),
                }
              : cp
          ),
        }));

        return true;
      },

      canClaimStageReward: (chapterId, stageId) => {
        const stageProgress = get().getStageProgress(chapterId, stageId);
        return stageProgress.cleared && !stageProgress.claimedRewards;
      },

      canClaimStageFirstClearReward: (chapterId, stageId) => {
        const stageProgress = get().getStageProgress(chapterId, stageId);
        const chapter = get().getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        return stageProgress.cleared && !stageProgress.claimedFirstClear && (stage?.firstClearRewards?.length || 0) > 0;
      },

      claimChapterReward: (chapterId) => {
        const state = get();
        if (!state.canClaimChapterReward(chapterId)) return false;

        const chapter = state.getChapter(chapterId);
        if (!chapter) return false;

        state.applyStageRewards(chapter.chapterRewards, chapter.areaId);

        set((state) => ({
          chapterProgresses: state.chapterProgresses.map((cp) =>
            cp.chapterId === chapterId ? { ...cp, claimedChapterReward: true } : cp
          ),
        }));

        get().addBattleLog(`🏆 领取了章节通关奖励！`, 'event');
        return true;
      },

      canClaimChapterReward: (chapterId) => {
        const chapterProgress = get().getChapterProgress(chapterId);
        return chapterProgress.completed && !chapterProgress.claimedChapterReward;
      },

      startDialogue: (dialogueId) => {
        const dialogues = STORY_DIALOGUES[dialogueId];
        if (!dialogues || dialogues.length === 0) return;

        set({
          currentDialogue: {
            dialogueId,
            currentIndex: 0,
          },
        });
      },

      advanceDialogue: (choiceId) => {
        const state = get();
        if (!state.currentDialogue) return;

        const { dialogueId, currentIndex } = state.currentDialogue;
        const dialogues = STORY_DIALOGUES[dialogueId];
        if (!dialogues) return;

        const currentDialogue = dialogues[currentIndex];
        if (!currentDialogue) {
          state.closeDialogue();
          return;
        }

        let nextIndex = currentIndex + 1;

        if (choiceId && currentDialogue.choices) {
          const choice = currentDialogue.choices.find((c) => c.id === choiceId);
          if (choice) {
            if (choice.effects) {
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
                    }
                    break;
                  case 'hp':
                    if (effect.value > 0) {
                      get().healHp(effect.value);
                    } else {
                      get().takeDamage(Math.abs(effect.value));
                    }
                    break;
                  case 'soulOrbs':
                    get().addSoulOrbs(effect.value);
                    break;
                }
              });
            }

            if (choice.nextDialogueId) {
              const nextDialogueIndex = dialogues.findIndex((d) => d.id === choice.nextDialogueId);
              if (nextDialogueIndex !== -1) {
                nextIndex = nextDialogueIndex;
              }
            }
          }
        } else if (currentDialogue.nextDialogueId) {
          const nextDialogueIndex = dialogues.findIndex((d) => d.id === currentDialogue.nextDialogueId);
          if (nextDialogueIndex !== -1) {
            nextIndex = nextDialogueIndex;
          }
        }

        if (nextIndex >= dialogues.length) {
          state.closeDialogue();
        } else {
          set({
            currentDialogue: {
              dialogueId,
              currentIndex: nextIndex,
            },
          });
        }
      },

      closeDialogue: () => set({ currentDialogue: null }),

      getCurrentDialogue: () => {
        const state = get();
        if (!state.currentDialogue) return null;

        const { dialogueId, currentIndex } = state.currentDialogue;
        const dialogues = STORY_DIALOGUES[dialogueId];
        if (!dialogues || currentIndex >= dialogues.length) return null;

        return dialogues[currentIndex];
      },

      getDialogueChoices: () => {
        const dialogue = get().getCurrentDialogue();
        return dialogue?.choices || null;
      },

      applyStageRewards: (rewards, areaId) => {
        const state = get();
        rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              state.addGold(reward.value);
              break;
            case 'exp':
              state.addExp(reward.value);
              break;
            case 'soulOrbs':
              state.addSoulOrbs(reward.value);
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
            case 'maxHp':
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
              if (areaId) {
                state.addAreaReputation(areaId, reward.value);
              }
              break;
          }
        });
      },

      getTotalChapterStars: () => {
        return get().chapterProgresses.reduce((sum, cp) => sum + cp.totalStars, 0);
      },

      getChapterMaxStars: (chapterId) => {
        const chapter = get().getChapter(chapterId);
        if (!chapter) return 0;
        return chapter.stages.reduce((sum, stage) => sum + (stage.starConditions?.length || 0), 0);
      },

      startStageBattle: (chapterId, stageId) => {
        const state = get();
        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);
        if (!chapter || !stage) return false;

        set({
          activeStageBattle: {
            chapterId,
            stageId,
            phase: 'preparing',
            currentWave: 0,
            totalWaves: stage.monsterCount || 5,
            currentMonster: null,
            battleStats: createEmptyLevelStatsForStage(),
          },
        });

        return true;
      },

      endStageBattle: (victory) => {
        const state = get();
        if (!state.activeStageBattle) return;

        const { chapterId, stageId, battleStats } = state.activeStageBattle;
        const chapter = state.getChapter(chapterId);
        const stage = chapter?.stages.find((s) => s.id === stageId);

        if (victory && stage) {
          let stars = 0;
          if (stage.starConditions) {
            stage.starConditions.forEach((condition) => {
              let satisfied = false;
              switch (condition.type) {
                case 'totalKills':
                  satisfied = battleStats.totalKills >= condition.threshold;
                  break;
                case 'survivalTime':
                  satisfied = battleStats.survivalTime >= condition.threshold;
                  break;
                case 'damageTaken':
                  satisfied = battleStats.timesHit <= condition.threshold;
                  break;
                case 'killEfficiency':
                  const time = Math.max(1, battleStats.survivalTime);
                  satisfied = battleStats.totalKills / time >= condition.threshold;
                  break;
                case 'comboKills':
                  satisfied = battleStats.maxComboKills >= condition.threshold;
                  break;
              }
              if (satisfied) stars++;
            });
          }

          state.completeStage(chapterId, stageId, stars);
          state.applyStageRewards(stage.rewards, stage.areaId);

          get().addBattleLog(`🎉 通关了 ${stage.name}！获得 ${stars} 颗星`, 'event');
        }

        set({ activeStageBattle: null });
      },

      refreshCommissions: () => {
        const state = get();
        const playerLevel = state.player.stats.level;
        const now = Date.now();

        const eligibleTemplates = COMMISSION_TEMPLATES.filter(
          (t) => t.minLevel <= playerLevel
        );

        const shuffled = [...eligibleTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, COMMISSION_DAILY_REFRESH_COUNT);

        const commissions: Commission[] = selected.map((template, idx) => ({
          ...template,
          id: `commission_${now}_${idx}`,
          generatedAt: now,
        }));

        set({
          availableCommissions: commissions,
          lastCommissionRefresh: now,
        });
      },

      shouldRefreshCommissions: () => {
        const state = get();
        const now = Date.now();
        const timeSinceRefresh = (now - state.lastCommissionRefresh) / 1000;
        return (
          state.availableCommissions.length === 0 ||
          timeSinceRefresh >= COMMISSION_REFRESH_INTERVAL
        );
      },

      getCommissionPower: (companionIds) => {
        const state = get();
        let totalPower = 0;

        companionIds.forEach((id) => {
          const companion = state.ownedCompanions.find((c) => c.id === id);
          if (companion) {
            const atk = state.getCompanionEffectiveAttack(companion);
            const def = state.getCompanionEffectiveDefense(companion);
            totalPower += atk + def;
          }
        });

        const playerAtk = state.getTotalAttack();
        const playerDef = state.getTotalDefense();
        totalPower += playerAtk + playerDef;

        return Math.floor(totalPower);
      },

      startCommission: (commissionId, companionIds) => {
        const state = get();
        const commission = state.availableCommissions.find(
          (c) => c.id === commissionId
        );
        if (!commission) return false;

        const activeCount = state.activeCommissions.filter(
          (c) => c.status === 'in_progress' || c.status === 'event'
        ).length;
        if (activeCount >= COMMISSION_MAX_ACTIVE) return false;

        if (
          companionIds.length < commission.minCompanions ||
          companionIds.length > commission.maxCompanions
        ) {
          return false;
        }

        const busyCompanionIds = state.activeCommissions
          .filter((c) => c.status === 'in_progress' || c.status === 'event')
          .flatMap((c) => c.companionIds);
        const hasBusy = companionIds.some((id) => busyCompanionIds.includes(id));
        if (hasBusy) return false;

        const now = Date.now();
        const activeCommission: ActiveCommission = {
          commissionId,
          title: commission.title,
          type: commission.type,
          companionIds,
          startTime: now,
          durationSeconds: commission.durationSeconds,
          currentEvent: null,
          eventLog: [`📜 接受了委托：${commission.title}`],
          rewards: [],
          status: 'in_progress',
          progress: 0,
          generatedAt: commission.generatedAt,
        };

        set((state) => ({
          availableCommissions: state.availableCommissions.filter(
            (c) => c.id !== commissionId
          ),
          activeCommissions: [...state.activeCommissions, activeCommission],
        }));

        get().addBattleLog(`📜 接受了委托：${commission.title}`, 'event');
        return true;
      },

      updateCommissionProgress: () => {
        const state = get();
        const now = Date.now();

        const updatedCommissions = state.activeCommissions.map((ac) => {
          if (ac.status !== 'in_progress') return ac;

          const template = COMMISSION_TEMPLATES.find((t) => t.title === ac.title);

          if (!template) return ac;

          const elapsed = (now - ac.startTime) / 1000;
          const progress = Math.min(1, elapsed / ac.durationSeconds);

          let newStatus = ac.status as ActiveCommission['status'];
          let newEvent = ac.currentEvent;
          let newEventLog = [...ac.eventLog];

          if (progress >= 1) {
            newStatus = 'completed';
            newEventLog.push('✅ 委托完成！');
          } else if (
            ac.currentEvent === null &&
            Math.random() < template.eventChance * 0.02 &&
            progress > 0.1 &&
            progress < 0.9
          ) {
            const randomEvent = COMMISSION_EVENTS[
              Math.floor(Math.random() * COMMISSION_EVENTS.length)
            ];
            newEvent = { ...randomEvent };
            newStatus = 'event';
            newEventLog.push(`✨ 触发事件：${randomEvent.title}`);
          }

          return {
            ...ac,
            progress,
            status: newStatus,
            currentEvent: newEvent,
            eventLog: newEventLog,
          };
        });

        set({ activeCommissions: updatedCommissions });
      },

      triggerCommissionEvent: (commissionId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac || ac.status !== 'in_progress') return;

        const randomEvent = COMMISSION_EVENTS[
          Math.floor(Math.random() * COMMISSION_EVENTS.length)
        ];

        set((state) => ({
          activeCommissions: state.activeCommissions.map((c) =>
            c.commissionId === commissionId
              ? {
                  ...c,
                  currentEvent: { ...randomEvent },
                  status: 'event',
                  eventLog: [...c.eventLog, `✨ 触发事件：${randomEvent.title}`],
                }
              : c
          ),
        }));
      },

      resolveCommissionEvent: (commissionId, choiceId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac || !ac.currentEvent || ac.status !== 'event') return;

        const choice = ac.currentEvent.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        let newRewards = [...ac.rewards];
        let newEventLog = [...ac.eventLog];
        let bonusSuccessRate = 0;
        let bonusFailureRate = 0;

        choice.effects.forEach((effect) => {
          if (effect.type === 'gold') {
            if (effect.isPercent) {
              newRewards.push({ type: 'gold', amount: Math.floor(100 * (effect.value / 100)) });
            } else if (effect.value > 0) {
              newRewards.push({ type: 'gold', amount: effect.value });
            }
          } else if (effect.type === 'exp') {
            if (effect.isPercent) {
              newRewards.push({ type: 'exp', amount: Math.floor(50 * (effect.value / 100)) });
            } else if (effect.value > 0) {
              newRewards.push({ type: 'exp', amount: effect.value });
            }
          } else if (effect.type === 'soulOrbs' && effect.value > 0) {
            newRewards.push({ type: 'soulOrbs', amount: effect.value });
          } else if (effect.type === 'material' && effect.materialId && effect.value > 0) {
            newRewards.push({
              type: 'material',
              materialId: effect.materialId,
              amount: effect.value,
            });
          } else if (effect.type === 'success_rate') {
            bonusSuccessRate += effect.value;
          } else if (effect.type === 'failure_rate') {
            bonusFailureRate += effect.value;
          }
        });

        newEventLog.push(`📝 选择了：${choice.text}`);

        set((state) => ({
          activeCommissions: state.activeCommissions.map((c) =>
            c.commissionId === commissionId
              ? {
                  ...c,
                  currentEvent: null,
                  status: 'in_progress',
                  rewards: newRewards,
                  eventLog: newEventLog,
                }
              : c
          ),
        }));
      },

      completeCommission: (commissionId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac) return [];

        const template = COMMISSION_TEMPLATES.find((t) => t.title === ac.title);

        if (!template) return [];

        const results: CommissionRewardResult[] = [...ac.rewards];

        template.rewards.forEach((reward) => {
          if (Math.random() < reward.chance) {
            const amount = Math.floor(
              reward.minAmount + Math.random() * (reward.maxAmount - reward.minAmount)
            );
            if (amount > 0) {
              results.push({
                type: reward.type,
                materialId: reward.materialId,
                amount,
              });
            }
          }
        });

        results.forEach((result) => {
          switch (result.type) {
            case 'gold':
              get().addGold(result.amount);
              break;
            case 'exp':
              get().addExp(result.amount);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(result.amount);
              break;
            case 'material':
              if (result.materialId) {
                get().addMaterial(result.materialId, result.amount);
              }
              break;
            case 'reputation':
              if (template.areaId) {
                get().addAreaReputation(template.areaId, result.amount);
              }
              break;
          }
        });

        set((state) => ({
          activeCommissions: state.activeCommissions.filter(
            (c) => c.commissionId !== commissionId
          ),
        }));

        get().addBattleLog(`🎉 完成了委托：${template.title}`, 'event');

        const expReward = results.find((r) => r.type === 'exp');
        const companionExp = expReward ? Math.floor(expReward.amount * 0.1) : 10;
        ac.companionIds.forEach((cid) => {
          get().addCompanionStarExp(cid, companionExp);
        });

        return results;
      },

      failCommission: (commissionId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac) return;

        const template = COMMISSION_TEMPLATES.find((t) => t.title === ac.title);

        set((state) => ({
          activeCommissions: state.activeCommissions.filter(
            (c) => c.commissionId !== commissionId
          ),
        }));

        get().addBattleLog(`💔 委托失败：${template?.title || ac.title}`, 'event');
      },

      cancelCommission: (commissionId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac) return;

        set((state) => ({
          activeCommissions: state.activeCommissions.filter(
            (c) => c.commissionId !== commissionId
          ),
        }));

        get().addBattleLog('📜 取消了委托', 'event');
      },

      collectCommissionReward: (commissionId) => {
        const state = get();
        const ac = state.activeCommissions.find((c) => c.commissionId === commissionId);
        if (!ac || ac.status !== 'completed') return null;

        return get().completeCommission(commissionId);
      },

      getMaterialCount: (materialId) => {
        const state = get();
        const material = state.materialInventory.find((m) => m.materialId === materialId);
        return material?.count || 0;
      },

      addMaterial: (materialId, count) => {
        set((state) => {
          const existing = state.materialInventory.find(
            (m) => m.materialId === materialId
          );
          if (existing) {
            return {
              materialInventory: state.materialInventory.map((m) =>
                m.materialId === materialId
                  ? { ...m, count: m.count + count }
                  : m
              ),
            };
          } else {
            return {
              materialInventory: [
                ...state.materialInventory,
                { materialId, count },
              ],
            };
          }
        });
      },

      sellMaterial: (materialId, count) => {
        const state = get();
        const material = state.materialInventory.find(
          (m) => m.materialId === materialId
        );
        if (!material || material.count < count) return false;

        const materialInfo = RARE_MATERIALS.find((m) => m.id === materialId);
        if (!materialInfo) return false;

        const goldEarned = materialInfo.sellPrice * count;

        set((state) => ({
          materialInventory: state.materialInventory
            .map((m) =>
              m.materialId === materialId ? { ...m, count: m.count - count } : m
            )
            .filter((m) => m.count > 0),
        }));

        get().addGold(goldEarned);
        get().addBattleLog(`💰 出售了 ${count} 个${materialInfo.name}，获得 ${goldEarned} 金币`, 'gold');

        return true;
      },

      getMaterialInfo: (materialId) => {
        return RARE_MATERIALS.find((m) => m.id === materialId);
      },

      getActiveCommissionCount: () => {
        const state = get();
        return state.activeCommissions.filter(
          (c) => c.status === 'in_progress' || c.status === 'event'
        ).length;
      },

      canStartCommission: () => {
        const state = get();
        return state.getActiveCommissionCount() < COMMISSION_MAX_ACTIVE;
      },

      initTradeInventories: () => initTradeInventories(),

      getTradeInventory: (areaId) => {
        return get().tradeInventories.find((inv) => inv.areaId === areaId);
      },

      getTradeItemStock: (itemId, areaId) => {
        const inventory = get().getTradeInventory(areaId);
        const invItem = inventory?.items.find((i) => i.itemId === itemId);
        return invItem?.currentStock ?? 0;
      },

      getTradeItemPrice: (itemId, areaId) => {
        const inventory = get().getTradeInventory(areaId);
        const invItem = inventory?.items.find((i) => i.itemId === itemId);
        return invItem?.currentPrice ?? 0;
      },

      getAvailableTradeItems: (areaId) => {
        const state = get();
        const inventory = state.getTradeInventory(areaId);
        if (!inventory) return [];

        return inventory.items
          .filter((invItem) => invItem.currentStock > 0)
          .map((invItem) => {
            const item = TRADE_ITEMS.find((t) => t.id === invItem.itemId);
            return item ? { item, inventory: invItem } : null;
          })
          .filter((v): v is { item: TradeItem; inventory: TradeInventoryItem } => v !== null);
      },

      shouldRefreshTrade: (areaId) => {
        const inventory = get().getTradeInventory(areaId);
        if (!inventory || inventory.items.length === 0) return true;
        return Date.now() - inventory.lastRefreshTime > TRADE_REFRESH_INTERVAL * 1000;
      },

      calculatePriceModifier: (item, areaId) => {
        const state = get();
        const config = PRICE_FLUCTUATION_CONFIG;

        let baseModifier = 1.0;

        const eventModifier = state.getTradeEventPriceModifier(item);
        baseModifier += eventModifier - 1;

        const areaLevel = state.mapAreas.find((a) => a.id === areaId)?.minLevel || 1;
        const playerLevel = state.player.stats.level;
        const levelRatio = playerLevel / Math.max(1, areaLevel);
        const demandModifier = 1 + (levelRatio - 1) * config.areaDemandMultiplier;

        const randomFactor = 1 + (Math.random() - 0.5) * config.volatility;

        const meanReversion = 1 - config.meanReversionRate * 0.5;

        let finalModifier = baseModifier * demandModifier * randomFactor * meanReversion;
        finalModifier = Math.max(config.minModifier, Math.min(config.maxModifier, finalModifier));

        return finalModifier;
      },

      refreshTradeInventory: (areaId, _triggerType = 'manual') => {
        const state = get();
        const playerLevel = state.player.stats.level;
        const repLevel = state.getAreaReputationLevel(areaId);
        const consequenceTags = state.consequenceTags;

        const eligibleItems = TRADE_ITEMS.filter((item) => {
          if (item.isBlackMarketOnly) return false;
          if (item.minPlayerLevel > playerLevel) return false;
          if (item.areaId && item.areaId !== areaId) {
            return false;
          }
          if (item.minReputationLevel && item.minReputationLevel > repLevel) return false;
          if (item.requiredTags && !item.requiredTags.every((tag) => consequenceTags.includes(tag))) return false;
          return true;
        });

        const selectedItems: TradeInventoryItem[] = [];
        const itemCount = Math.min(TRADE_ITEMS_PER_REFRESH, eligibleItems.length);

        const totalWeight = eligibleItems.reduce((sum, item) => sum + item.weight, 0);

        for (let i = 0; i < itemCount; i++) {
          const remaining = eligibleItems.filter((item) => !selectedItems.some((si) => si.itemId === item.id));
          if (remaining.length === 0) break;

          let roll = Math.random() * totalWeight;
          let selected = remaining[0];

          for (const item of remaining) {
            roll -= item.weight;
            if (roll <= 0) {
              selected = item;
              break;
            }
          }

          const priceModifier = state.calculatePriceModifier(selected, areaId);
          const currentPrice = Math.max(1, Math.floor(selected.basePrice * priceModifier));
          const stock = Math.max(1, Math.floor(Math.random() * selected.maxStockPerRefresh) + 1);

          selectedItems.push({
            itemId: selected.id,
            currentStock: stock,
            currentPrice,
            priceModifier,
            lastPriceChange: Date.now(),
          });
        }

        set((s) => ({
          tradeInventories: s.tradeInventories.map((inv) =>
            inv.areaId === areaId
              ? {
                  ...inv,
                  items: selectedItems,
                  lastRefreshTime: Date.now(),
                  refreshCount: inv.refreshCount + 1,
                }
              : inv
          ),
        }));

        state.addBattleLog(`🔄 交易行商品已刷新`, 'system');
      },

      buyTradeItem: (itemId, areaId, quantity = 1) => {
        const state = get();
        const item = TRADE_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const stock = state.getTradeItemStock(itemId, areaId);
        if (stock < quantity) return false;

        const unitPrice = state.getTradeItemPrice(itemId, areaId);
        const totalCost = unitPrice * quantity;

        if (item.currency === 'gold' && state.player.stats.gold < totalCost) return false;
        if (item.currency === 'soulOrbs' && state.player.stats.soulOrbs < totalCost) return false;

        set((s) => {
          const newStats = { ...s.player.stats };
          if (item.currency === 'gold') {
            newStats.gold -= totalCost;
          } else {
            newStats.soulOrbs -= totalCost;
          }

          return {
            player: { ...s.player, stats: newStats },
            tradeInventories: s.tradeInventories.map((inv) =>
              inv.areaId === areaId
                ? {
                    ...inv,
                    items: inv.items.map((invItem) =>
                      invItem.itemId === itemId
                        ? { ...invItem, currentStock: invItem.currentStock - quantity }
                        : invItem
                    ),
                  }
                : inv
            ),
          };
        });

        if (item.effect) {
          const effect = item.effect;
          const totalValue = effect.value * quantity;
          switch (effect.type) {
            case 'hp':
              get().healHp(totalValue);
              break;
            case 'mp':
              get().healMp(totalValue);
              break;
            case 'attack':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, attack: s.player.stats.attack + totalValue },
                },
              }));
              break;
            case 'defense':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, defense: s.player.stats.defense + totalValue },
                },
              }));
              break;
            case 'speed':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, speed: s.player.stats.speed + totalValue },
                },
              }));
              break;
            case 'luck':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, luck: s.player.stats.luck + totalValue },
                },
              }));
              break;
            case 'exp':
              get().addExp(totalValue);
              break;
            case 'gold':
              get().addGold(totalValue);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(totalValue);
              break;
          }
        }

        if (item.materialId) {
          get().addMaterial(item.materialId, quantity);
        }

        get().addTradeRecord({
          itemId,
          itemName: item.name,
          type: 'buy',
          quantity,
          unitPrice,
          totalPrice: totalCost,
          currency: item.currency,
          areaId,
        });

        get().addBattleLog(
          `💰 购买了 ${quantity} 个 ${item.name}，花费 ${totalCost} ${item.currency === 'gold' ? '金币' : '魂珠'}`,
          'event'
        );

        return true;
      },

      sellTradeItem: (itemId, areaId, quantity = 1) => {
        const state = get();
        const item = TRADE_ITEMS.find((i) => i.id === itemId);
        if (!item || !item.materialId) return false;

        const materialCount = state.getMaterialCount(item.materialId);
        if (materialCount < quantity) return false;

        const sellPrice = Math.floor(item.basePrice * 0.5);
        const totalGold = sellPrice * quantity;

        set((s) => ({
          materialInventory: s.materialInventory
            .map((m) =>
              m.materialId === item.materialId ? { ...m, count: m.count - quantity } : m
            )
            .filter((m) => m.count > 0),
        }));

        get().addGold(totalGold);

        get().addTradeRecord({
          itemId,
          itemName: item.name,
          type: 'sell',
          quantity,
          unitPrice: sellPrice,
          totalPrice: totalGold,
          currency: 'gold',
          areaId,
        });

        get().addBattleLog(
          `💰 出售了 ${quantity} 个 ${item.name}，获得 ${totalGold} 金币`,
          'gold'
        );

        return true;
      },

      addTradeRecord: (record) => {
        tradeRecordIdCounter += 1;
        const newRecord: TradeRecord = {
          ...record,
          id: tradeRecordIdCounter,
          timestamp: Date.now(),
        };
        set((state) => ({
          tradeRecords: [newRecord, ...state.tradeRecords].slice(0, 50),
        }));
      },

      isBlackMarketUnlocked: () => {
        return get().player.stats.level >= BLACK_MARKET_CONFIG.unlockLevel;
      },

      getBlackMarketInventory: () => {
        return get().blackMarketInventory;
      },

      shouldRefreshBlackMarket: () => {
        const state = get();
        const inventory = state.blackMarketInventory;
        if (!inventory || inventory.items.length === 0) return true;
        return Date.now() - inventory.lastRefreshTime > TRADE_REFRESH_INTERVAL * 1000 * 2;
      },

      refreshBlackMarket: () => {
        const state = get();
        if (!state.isBlackMarketUnlocked()) return false;

        const playerLevel = state.player.stats.level;
        const consequenceTags = state.consequenceTags;

        const cost = BLACK_MARKET_CONFIG.refreshCost;
        const currency = BLACK_MARKET_CONFIG.refreshCurrency;

        if (state.blackMarketInventory && state.blackMarketInventory.items.length > 0) {
          if (currency === 'gold' && state.player.stats.gold < cost) return false;
          if (currency === 'soulOrbs' && state.player.stats.soulOrbs < cost) return false;

          set((s) => {
            const newStats = { ...s.player.stats };
            if (currency === 'gold') {
              newStats.gold -= cost;
            } else {
              newStats.soulOrbs -= cost;
            }
            return { player: { ...s.player, stats: newStats } };
          });
        }

        const eligibleItems = TRADE_ITEMS.filter((item) => {
          if (item.minPlayerLevel > playerLevel) return false;
          if (item.requiredTags && !item.requiredTags.every((tag) => consequenceTags.includes(tag))) return false;
          return true;
        });

        const selectedItems: TradeInventoryItem[] = [];
        const itemCount = Math.min(BLACK_MARKET_ITEMS_PER_REFRESH, eligibleItems.length);

        const weightedItems = eligibleItems.map((item) => {
          let weight = item.weight;
          if (item.rarity === 'rare') weight *= BLACK_MARKET_CONFIG.rareItemChance * 3;
          if (item.rarity === 'epic') weight *= BLACK_MARKET_CONFIG.rareItemChance * 2;
          if (item.rarity === 'legendary') weight *= BLACK_MARKET_CONFIG.legendaryItemChance * 10;
          return { item, weight };
        });

        const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0);

        for (let i = 0; i < itemCount; i++) {
          const remaining = weightedItems.filter((w) => !selectedItems.some((si) => si.itemId === w.item.id));
          if (remaining.length === 0) break;

          let roll = Math.random() * totalWeight;
          let selected = remaining[0].item;

          for (const w of remaining) {
            roll -= w.weight;
            if (roll <= 0) {
              selected = w.item;
              break;
            }
          }

          const isDiscount = Math.random() < 0.4;
          let priceMultiplier: number;
          if (isDiscount) {
            priceMultiplier =
              BLACK_MARKET_CONFIG.priceDiscountRange.min +
              Math.random() * (BLACK_MARKET_CONFIG.priceDiscountRange.max - BLACK_MARKET_CONFIG.priceDiscountRange.min);
          } else {
            priceMultiplier =
              BLACK_MARKET_CONFIG.pricePremiumRange.min +
              Math.random() * (BLACK_MARKET_CONFIG.pricePremiumRange.max - BLACK_MARKET_CONFIG.pricePremiumRange.min);
          }

          const eventModifier = state.getTradeEventPriceModifier(selected);
          const finalPrice = Math.max(1, Math.floor(selected.basePrice * priceMultiplier * eventModifier));
          const stock = Math.max(1, Math.floor(Math.random() * Math.max(1, selected.maxStockPerRefresh * 0.5)) + 1);

          selectedItems.push({
            itemId: selected.id,
            currentStock: stock,
            currentPrice: finalPrice,
            priceModifier: priceMultiplier,
            lastPriceChange: Date.now(),
          });
        }

        set({
          blackMarketInventory: {
            areaId: 'blackmarket',
            items: selectedItems,
            lastRefreshTime: Date.now(),
            refreshCount: (state.blackMarketInventory?.refreshCount || 0) + 1,
          },
        });

        get().addBattleLog(`🌑 黑市商品已刷新`, 'system');
        return true;
      },

      getBlackMarketItems: () => {
        const state = get();
        const inventory = state.blackMarketInventory;
        if (!inventory) return [];

        return inventory.items
          .filter((invItem) => invItem.currentStock > 0)
          .map((invItem) => {
            const item = TRADE_ITEMS.find((t) => t.id === invItem.itemId);
            return item ? { item, inventory: invItem } : null;
          })
          .filter((v): v is { item: TradeItem; inventory: TradeInventoryItem } => v !== null);
      },

      buyBlackMarketItem: (itemId, quantity = 1) => {
        const state = get();
        if (!state.isBlackMarketUnlocked()) return false;

        const inventory = state.blackMarketInventory;
        if (!inventory) return false;

        const item = TRADE_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        const invItem = inventory.items.find((i) => i.itemId === itemId);
        if (!invItem || invItem.currentStock < quantity) return false;

        const totalCost = invItem.currentPrice * quantity;

        if (item.currency === 'gold' && state.player.stats.gold < totalCost) return false;
        if (item.currency === 'soulOrbs' && state.player.stats.soulOrbs < totalCost) return false;

        set((s) => {
          const newStats = { ...s.player.stats };
          if (item.currency === 'gold') {
            newStats.gold -= totalCost;
          } else {
            newStats.soulOrbs -= totalCost;
          }

          const newBmInventory = s.blackMarketInventory
            ? {
                ...s.blackMarketInventory,
                items: s.blackMarketInventory.items.map((inv) =>
                  inv.itemId === itemId ? { ...inv, currentStock: inv.currentStock - quantity } : inv
                ),
              }
            : null;

          return {
            player: { ...s.player, stats: newStats },
            blackMarketInventory: newBmInventory,
          };
        });

        if (item.effect) {
          const effect = item.effect;
          const totalValue = effect.value * quantity;
          switch (effect.type) {
            case 'hp':
              get().healHp(totalValue);
              break;
            case 'mp':
              get().healMp(totalValue);
              break;
            case 'attack':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, attack: s.player.stats.attack + totalValue },
                },
              }));
              break;
            case 'defense':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, defense: s.player.stats.defense + totalValue },
                },
              }));
              break;
            case 'speed':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, speed: s.player.stats.speed + totalValue },
                },
              }));
              break;
            case 'luck':
              set((s) => ({
                player: {
                  ...s.player,
                  stats: { ...s.player.stats, luck: s.player.stats.luck + totalValue },
                },
              }));
              break;
            case 'exp':
              get().addExp(totalValue);
              break;
            case 'gold':
              get().addGold(totalValue);
              break;
            case 'soulOrbs':
              get().addSoulOrbs(totalValue);
              break;
          }
        }

        if (item.materialId) {
          get().addMaterial(item.materialId, quantity);
        }

        get().addTradeRecord({
          itemId,
          itemName: item.name,
          type: 'buy',
          quantity,
          unitPrice: invItem.currentPrice,
          totalPrice: totalCost,
          currency: item.currency,
          areaId: 'blackmarket',
        });

        get().addBattleLog(
          `🌑 从黑市购买了 ${quantity} 个 ${item.name}，花费 ${totalCost} ${item.currency === 'gold' ? '金币' : '魂珠'}`,
          'event'
        );

        return true;
      },

      checkTradeEvents: () => {
        const state = get();
        const now = Date.now();

        const activeEvents = state.activeTradeEvents.filter(
          (e) => e.endTime > now
        );

        const expiredEvents = state.activeTradeEvents.filter(
          (e) => e.endTime <= now
        );

        if (expiredEvents.length > 0) {
          expiredEvents.forEach((e) => {
            const event = TRADE_EVENTS.find((ev) => ev.id === e.eventId);
            if (event) {
              state.addBattleLog(`📈 市场事件结束：${event.title}`, 'system');
            }
          });
        }

        const eventChance = 0.02;
        if (Math.random() < eventChance && activeEvents.length < 3) {
          get().triggerRandomTradeEvent();
        }

        set({
          activeTradeEvents: activeEvents,
          lastTradeEventCheck: now,
        });
      },

      triggerRandomTradeEvent: () => {
        const state = get();
        const randomIndex = Math.floor(Math.random() * TRADE_EVENTS.length);
        const event = TRADE_EVENTS[randomIndex];

        const startTime = Date.now();
        const endTime = startTime + event.durationSeconds * 1000;

        const newActiveEvent: ActiveTradeEvent = {
          eventId: event.id,
          startTime,
          endTime,
        };

        set((s) => ({
          activeTradeEvents: [...s.activeTradeEvents, newActiveEvent],
        }));

        state.addBattleLog(
          `${event.isPositive ? '📈' : '📉'} 市场事件：${event.title} - ${event.description}`,
          'system'
        );
      },

      getActiveTradeEvents: () => {
        const state = get();
        const now = Date.now();
        return state.activeTradeEvents
          .filter((e) => e.endTime > now)
          .map((e) => TRADE_EVENTS.find((ev) => ev.id === e.eventId))
          .filter((e): e is TradeEvent => e !== undefined);
      },

      getTradeEventPriceModifier: (item) => {
        const state = get();
        let modifier = 1.0;

        state.activeTradeEvents.forEach((activeEvent) => {
          const event = TRADE_EVENTS.find((e) => e.id === activeEvent.eventId);
          if (!event) return;

          const categoryMod = event.categoryModifiers[item.category] || 0;
          const rarityMod = event.rarityModifiers[item.rarity] || 0;
          const itemMod = event.priceModifiers[item.id] || 0;

          modifier += categoryMod + rarityMod + itemMod;
        });

        return Math.max(0.1, modifier);
      },

      getSkillNodeLevel: (nodeId) => {
        const alloc = get().skillTreeAllocations.find((a) => a.nodeId === nodeId);
        return alloc?.level || 0;
      },

      isSkillNodeUnlocked: (node) => {
        const state = get();
        if (node.minPlayerLevel && state.player.stats.level < node.minPlayerLevel) return false;
        if (node.classRestriction && node.classRestriction.length > 0 && state.player.class) {
          if (!node.classRestriction.includes(state.player.class)) return false;
        }
        if (node.branch === 'special' && state.player.rebirthCount < 1) return false;
        if (node.prerequisiteIds && node.prerequisiteIds.length > 0) {
          for (const preId of node.prerequisiteIds) {
            const preNode = SKILL_TREE_NODES.find((n) => n.id === preId);
            if (!preNode) continue;
            const preLevel = get().getSkillNodeLevel(preId);
            if (preLevel < preNode.maxLevel) return false;
          }
        }
        return true;
      },

      canUpgradeSkillNode: (nodeId) => {
        const state = get();
        const node = SKILL_TREE_NODES.find((n) => n.id === nodeId);
        if (!node) return false;
        const currentLevel = get().getSkillNodeLevel(nodeId);
        if (currentLevel >= node.maxLevel) return false;
        if (!get().isSkillNodeUnlocked(node)) return false;
        const availablePoints = get().getAvailableSkillPoints();
        return availablePoints >= node.pointCostPerLevel;
      },

      upgradeSkillNode: (nodeId) => {
        const state = get();
        const node = SKILL_TREE_NODES.find((n) => n.id === nodeId);
        if (!node) return false;
        if (!get().canUpgradeSkillNode(nodeId)) return false;

        const currentLevel = get().getSkillNodeLevel(nodeId);
        const cost = node.pointCostPerLevel;

        if (state.player.skillPoints < cost) return false;

        set((s) => {
          const existing = s.skillTreeAllocations.find((a) => a.nodeId === nodeId);
          let newAllocations: SkillTreeAllocation[];
          if (existing) {
            newAllocations = s.skillTreeAllocations.map((a) =>
              a.nodeId === nodeId ? { ...a, level: a.level + 1 } : a
            );
          } else {
            newAllocations = [...s.skillTreeAllocations, { nodeId, level: 1 }];
          }
          return {
            skillTreeAllocations: newAllocations,
            player: {
              ...s.player,
              skillPoints: s.player.skillPoints - cost,
            },
          };
        });

        const newLevel = get().getSkillNodeLevel(nodeId);
        get().addBattleLog(`🌳 技能树：${node.name} 升至 ${newLevel} 级`, 'levelup');
        return true;
      },

      resetSkillTree: () => {
        const state = get();
        const totalRefund = state.skillTreeAllocations.reduce((sum, a) => {
          const node = SKILL_TREE_NODES.find((n) => n.id === a.nodeId);
          return sum + (node ? node.pointCostPerLevel * a.level : 0);
        }, 0);
        const refundedPoints = Math.floor(totalRefund * 0.7);

        set((s) => ({
          skillTreeAllocations: [],
          activeProfessionSpec: null,
          player: {
            ...s.player,
            skillPoints: s.player.skillPoints + refundedPoints,
          },
        }));

        get().addBattleLog(`🌳 技能树已重置，返还 ${refundedPoints} 技能点（70%）`, 'system');
        return true;
      },

      getSkillTreeBonus: (type) => {
        const state = get();
        let total = 0;
        for (const alloc of state.skillTreeAllocations) {
          const node = SKILL_TREE_NODES.find((n) => n.id === alloc.nodeId);
          if (!node) continue;
          for (const effect of node.effects) {
            if (effect.type === type) {
              total += effect.value * alloc.level;
            }
          }
        }
        return total;
      },

      getBranchPoints: (branchId) => {
        const state = get();
        return state.skillTreeAllocations.reduce((sum, a) => {
          const node = SKILL_TREE_NODES.find((n) => n.id === a.nodeId);
          if (node && node.branch === branchId) return sum + a.level;
          return sum;
        }, 0);
      },

      getTotalAllocatedPoints: () => {
        const state = get();
        return state.skillTreeAllocations.reduce((sum, a) => sum + a.level, 0);
      },

      getAvailableSkillPoints: () => {
        return get().player.skillPoints;
      },

      canActivateProfessionSpec: (specId) => {
        const state = get();
        const spec = PROFESSION_SPECS.find((s) => s.id === specId);
        if (!spec) return false;
        if (spec.baseClass !== state.player.class) return false;
        if (state.player.stats.level < spec.minLevel) return false;
        if (state.player.rebirthCount < spec.minRebirthCount) return false;
        const branchPoints = get().getBranchPoints(spec.requiredBranchId);
        if (branchPoints < spec.requiredBranchPoints) return false;
        return true;
      },

      activateProfessionSpec: (specId) => {
        if (!get().canActivateProfessionSpec(specId)) return false;
        const spec = PROFESSION_SPECS.find((s) => s.id === specId);
        if (!spec) return false;

        set({ activeProfessionSpec: { specId, activatedAt: Date.now() } });
        get().addBattleLog(`🌟 激活职业专精：${spec.name}！${spec.description}`, 'levelup');
        return true;
      },

      deactivateProfessionSpec: () => {
        const spec = get().getActiveSpec();
        set({ activeProfessionSpec: null });
        if (spec) {
          get().addBattleLog(`🌟 取消职业专精：${spec.name}`, 'system');
        }
      },

      getActiveSpec: () => {
        const state = get();
        if (!state.activeProfessionSpec) return null;
        return PROFESSION_SPECS.find((s) => s.id === state.activeProfessionSpec!.specId) || null;
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
        return spec?.rebirthInheritRate || 0;
      },

      getSpecPassiveBonus: (type) => {
        const spec = get().getActiveSpec();
        if (!spec) return 0;
        let total = 0;
        for (const effect of spec.passiveEffects) {
          if (effect.type === type) {
            total += effect.value;
          }
        }
        return total;
      },

      getCompanionSynergyBonus: (type) => {
        const state = get();
        const spec = get().getActiveSpec();
        if (!spec) return 0;

        const formationCompanions = get().getFormationCompanions();
        const synergyCount = formationCompanions.filter(
          (c) => spec.companionSynergy.preferredClasses.includes(c.class)
        ).length;

        let total = 0;
        if (synergyCount > 0) {
          for (const effect of spec.companionSynergy.bonusPerCompanion) {
            if (effect.type === type) {
              total += effect.value * synergyCount;
            }
          }
        }

        for (const synergy of SKILL_TREE_COMPANION_SYNERGIES) {
          const matchingCompanions = formationCompanions.filter((c) => c.class === synergy.companionClass);
          for (const comp of matchingCompanions) {
            for (const effect of synergy.bonusPerStar) {
              if (effect.type === type) {
                total += effect.value * comp.stars;
              }
            }
          }
        }

        return total;
      },

      getSkillTreeTotalBonus: (type) => {
        const skillTreeBonus = get().getSkillTreeBonus(type);
        const specPassive = get().getSpecPassiveBonus(type);
        const companionSynergy = get().getCompanionSynergyBonus(type);
        return skillTreeBonus + specPassive + companionSynergy;
      },
    }),
    {
      name: 'isekai-idle-game',
      version: 12,
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
          state.guildLevel = 1;
          state.guildExp = 0;
          state.guildContribution = 0;
          state.currentStamina = 100;
          state.maxStamina = 100;
          state.lastStaminaRegen = Date.now();
          state.guildChapterProgress = initGuildChapterProgress();
          state.currentGuildChapterId = 'chapter_forest';
          state.currentGuildNodeId = null;
          state.guildTechProgress = initGuildTechProgress();
          state.guildDailyRewards = initGuildDailyRewards();
          state.lastDailyRewardDate = null;
          state.guildActiveTab = 'map';
          state.guildFormation = [];
        }
        if (version < 10) {
          state.availableCommissions = [];
          state.activeCommissions = [];
          state.materialInventory = [];
          state.lastCommissionRefresh = 0;
        }
        if (version < 11) {
          state.tradeInventories = initTradeInventories();
          state.blackMarketInventory = null;
          state.tradeRecords = [];
          state.activeTradeEvents = [];
          state.lastTradeEventCheck = 0;
        }
        if (version < 12) {
          state.skillTreeAllocations = [];
          state.activeProfessionSpec = null;
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
