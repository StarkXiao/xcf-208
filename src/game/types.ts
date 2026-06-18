export interface PlayerStats {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  gold: number;
  soulOrbs: number;
}

export interface Player {
  name: string;
  race: string;
  class: string;
  stats: PlayerStats;
  skillPoints: number;
  rebirthCount: number;
  totalRebirthBonus: number;
  talentPoints: number;
  inheritedTalents: TalentNode[];
}

export interface Companion {
  id: string;
  name: string;
  race: string;
  class: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  attack: number;
  defense: number;
  cost: number;
  description: string;
  areaId?: string;
  minReputationLevel?: number;
  bondId?: string;
  stars: number;
  starExp: number;
  starExpToNext: number;
}

export interface Bond {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberIds: string[];
  bonusPerStar: { type: 'attack' | 'defense' | 'hp' | 'speed' | 'luck'; value: number }[];
}

export interface FormationSlot {
  index: number;
  companionId: string | null;
  unlocked: boolean;
  unlockLevel: number;
}

export interface Formation {
  slots: FormationSlot[];
  activeBondIds: string[];
}

export interface StarUpConfig {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  maxStars: number;
  starExpToNext: number[];
  attackMultiplier: number[];
  defenseMultiplier: number[];
}

export interface MapArea {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  baseExp: number;
  baseGold: number;
  monsters: Monster[];
  bgColor: string;
  unlocked: boolean;
}

export type StarConditionType = 'totalKills' | 'killEfficiency' | 'damageTaken' | 'eventChoices' | 'resourceDrop' | 'survivalTime' | 'comboKills';

export interface StarCondition {
  type: StarConditionType;
  threshold: number;
  description: string;
  icon: string;
}

export interface StarReward {
  type: 'gold' | 'exp' | 'soulOrbs' | 'attack' | 'defense' | 'hp' | 'reputation' | 'speed' | 'luck';
  value: number;
}

export interface LevelStarConfig {
  stars: number;
  conditions: StarCondition[];
  rewards: StarReward[];
  title: string;
}

export interface LevelProgress {
  areaId: string;
  currentStars: number;
  bestStars: number;
  firstCleared: boolean;
  firstClearTime: number | null;
  bestStats: LevelStats;
  claimedStarRewards: number[];
}

export interface LevelStats {
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  timesHit: number;
  eventsTriggered: number;
  goodEventChoices: number;
  goldEarned: number;
  expEarned: number;
  soulOrbsEarned: number;
  survivalTime: number;
  maxComboKills: number;
  currentComboKills: number;
  startTime: number;
}

export interface FirstClearReward {
  areaId: string;
  rewards: StarReward[];
  title: string;
}

export type MonsterTier = 'normal' | 'elite' | 'boss';

export interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  color: string;
  phases?: MonsterPhase[];
  tier?: MonsterTier;
  eliteHpMultiplier?: number;
  eliteAtkMultiplier?: number;
  bossHpMultiplier?: number;
  bossAtkMultiplier?: number;
  isEliteSpawnable?: boolean;
  isBossSpawnable?: boolean;
}

export interface MonsterTierConfig {
  tier: MonsterTier;
  name: string;
  color: string;
  spawnChance: number;
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  expMultiplier: number;
  goldMultiplier: number;
  soulOrbChance: number;
  soulOrbMin: number;
  soulOrbMax: number;
  shardChance: number;
}

export interface AreaUnlockCondition {
  type: 'level' | 'eliteKills' | 'bossKills' | 'totalKills' | 'stars';
  threshold: number;
  areaId?: string;
  description: string;
}

export interface MapArea {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  baseExp: number;
  baseGold: number;
  monsters: Monster[];
  bgColor: string;
  unlocked: boolean;
  unlockConditions?: AreaUnlockCondition[];
  eliteKillCount?: number;
  bossKillCount?: number;
  eliteSpawnChance?: number;
  bossSpawnChance?: number;
  minLevelForElite?: number;
  minLevelForBoss?: number;
}

export interface RebirthChallengeTarget {
  id: string;
  type: 'bossKills' | 'eliteKills' | 'areaClear' | 'totalPower' | 'level' | 'totalKills' | 'chapterClear' | 'commissionsDone' | 'rebirthCount' | 'bossDefeated' | 'chapterStars';
  target: number;
  areaId?: string;
  chapterId?: string;
  bossId?: string;
  description: string;
  reward: StarReward[];
  completed: boolean;
  claimed: boolean;
}

export interface MonsterKillStats {
  normalKills: number;
  eliteKills: number;
  bossKills: number;
  totalKills: number;
  killsByArea: Record<string, { normal: number; elite: number; boss: number }>;
  bossesDefeated: string[];
}

export const MONSTER_TIER_CONFIGS: Record<MonsterTier, MonsterTierConfig> = {
  normal: {
    tier: 'normal',
    name: '普通',
    color: '#9ca3af',
    spawnChance: 0.75,
    hpMultiplier: 1.0,
    attackMultiplier: 1.0,
    defenseMultiplier: 1.0,
    expMultiplier: 1.0,
    goldMultiplier: 1.0,
    soulOrbChance: 0.02,
    soulOrbMin: 0,
    soulOrbMax: 0,
    shardChance: 0.05,
  },
  elite: {
    tier: 'elite',
    name: '精英',
    color: '#3b82f6',
    spawnChance: 0.20,
    hpMultiplier: 2.5,
    attackMultiplier: 1.8,
    defenseMultiplier: 1.5,
    expMultiplier: 3.0,
    goldMultiplier: 3.0,
    soulOrbChance: 0.15,
    soulOrbMin: 0,
    soulOrbMax: 1,
    shardChance: 0.25,
  },
  boss: {
    tier: 'boss',
    name: '首领',
    color: '#ef4444',
    spawnChance: 0.05,
    hpMultiplier: 8.0,
    attackMultiplier: 3.0,
    defenseMultiplier: 2.5,
    expMultiplier: 10.0,
    goldMultiplier: 10.0,
    soulOrbChance: 0.6,
    soulOrbMin: 1,
    soulOrbMax: 3,
    shardChance: 0.5,
  },
};

export const MONSTER_TIER_NAMES: Record<MonsterTier, string> = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
};

export const MONSTER_TIER_COLORS: Record<MonsterTier, string> = {
  normal: '#9ca3af',
  elite: '#3b82f6',
  boss: '#ef4444',
};

export interface MonsterPhase {
  name: string;
  hpThreshold: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  speedMultiplier: number;
  color?: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  damageMultiplier: number;
  cooldown: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  icon: string;
}

export interface BattleState {
  playerSkillCooldowns: Record<string, number>;
  playerAttackCharge: number;
  monsterAttackCharge: number;
  currentPhaseIndex: number;
  combatLog: string[];
}

export interface AreaReputation {
  areaId: string;
  points: number;
  level: number;
}

export interface ReputationLevel {
  level: number;
  name: string;
  minPoints: number;
  dropBonus: number;
  eventBonus: number;
  shopDiscount: number;
  recruitDiscount: number;
  color: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currency: 'gold' | 'soulOrbs';
  areaId: string;
  minReputationLevel: number;
  effect: ShopItemEffect;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  minPlayerLevel?: number;
  maxPlayerLevel?: number;
  isDynamic?: boolean;
  weight?: number;
  stock?: number;
  requiredTags?: string[];
}

export interface ShopInventoryItem {
  itemId: string;
  currentStock: number;
  maxStock: number;
  restockTime: number;
}

export interface ShopInventory {
  areaId: string;
  items: ShopInventoryItem[];
  lastRestockTime: number;
}

export interface ShopItemEffect {
  type: 'hp' | 'mp' | 'attack' | 'defense' | 'speed' | 'luck' | 'exp' | 'gold' | 'soulOrbs';
  value: number;
}

export type MapModifierType = 'hazard' | 'blessing' | 'hiddenPath' | 'locked' | 'cursed';

export interface MapAreaModifier {
  areaId: string;
  type: MapModifierType;
  name: string;
  description: string;
  effect: { stat: keyof PlayerStats; value: number } | null;
}

export interface CompanionAffinityChange {
  companionId: string;
  value: number;
}

export interface EventWeightMod {
  eventId: string;
  delta: number;
  reason: string;
}

export interface EventConsequence {
  tags?: string[];
  companionAffinity?: CompanionAffinityChange[];
  mapModifiers?: MapAreaModifier[];
  eventWeights?: EventWeightMod[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  areaId?: string;
  minReputationLevel?: number;
  requiredTags?: string[];
  blockedByTags?: string[];
  baseWeight?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
  consequences?: EventConsequence;
}

export interface EventEffect {
  type: 'gold' | 'exp' | 'hp' | 'mp' | 'attack' | 'defense' | 'soulOrbs' | 'reputation' | 'speed' | 'luck' | 'maxHp' | 'guildExp' | 'guildContribution' | 'stamina' | 'material' | 'success_rate' | 'failure_rate';
  value: number;
  isPercent?: boolean;
  materialId?: string;
}

export interface RebirthOption {
  id: string;
  name: string;
  description: string;
  bonus: number;
  cost: number;
  icon: string;
}

export interface BattleLog {
  id: number;
  message: string;
  type: 'damage' | 'heal' | 'exp' | 'gold' | 'levelup' | 'event' | 'system' | 'reputation' | 'skill' | 'phase' | 'mp' | 'dodge' | 'critical' | 'drop' | 'death';
  timestamp: number;
}

export type GameScreen = 'rebirth' | 'game';
export type GameTab = 'stats' | 'map' | 'companions' | 'events' | 'expedition' | 'talents' | 'equipment' | 'trade' | 'chapters' | 'commissions' | 'blackmarket' | 'guild' | 'skilltree' | 'relics' | 'town' | 'worldboss' | 'alchemy' | 'codex' | 'achievements' | 'relicdungeon' | 'season' | 'faction';

export type ExpeditionDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export interface ExpeditionMission {
  id: string;
  name: string;
  description: string;
  difficulty: ExpeditionDifficulty;
  areaId: string;
  minLevel: number;
  durationSeconds: number;
  stages: number;
  baseExp: number;
  baseGold: number;
  soulOrbChance: number;
  icon: string;
  bgColor: string;
}

export interface ExpeditionEvent {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'treasure' | 'trap' | 'shrine' | 'ambush' | 'merchant' | 'boss';
  difficulty: number;
  rewards: ExpeditionEventReward[];
  icon: string;
}

export interface ExpeditionEventReward {
  type: 'gold' | 'exp' | 'hp' | 'soulOrbs';
  min: number;
  max: number;
}

export interface ExpeditionCasualty {
  companionId: string;
  companionName: string;
  status: 'healthy' | 'injured' | 'critical';
  hpLost: number;
}

export interface ExpeditionLoot {
  gold: number;
  exp: number;
  soulOrbs: number;
  reputation: number;
}

export type ExpeditionPhase = 'idle' | 'formation' | 'progress' | 'event' | 'settlement';

export interface ActiveExpedition {
  missionId: string;
  selectedCompanionIds: string[];
  startTime: number;
  currentStage: number;
  totalStages: number;
  phase: ExpeditionPhase;
  currentEvent: ExpeditionEvent | null;
  accumulatedLoot: ExpeditionLoot;
  casualties: ExpeditionCasualty[];
  eventLog: string[];
  completed: boolean;
}

export type AffinityLevel = 'hostile' | 'neutral' | 'friendly' | 'trusted' | 'bonded';

export interface CompanionAffinityRecord {
  companionId: string;
  value: number;
  level: AffinityLevel;
}

export function getAffinityLevel(value: number): AffinityLevel {
  if (value <= -50) return 'hostile';
  if (value < 10) return 'neutral';
  if (value < 30) return 'friendly';
  if (value < 60) return 'trusted';
  return 'bonded';
}

export const AFFINITY_LEVEL_NAMES: Record<AffinityLevel, string> = {
  hostile: '敌对',
  neutral: '中立',
  friendly: '友好',
  trusted: '信赖',
  bonded: '羁绊',
};

export const AFFINITY_LEVEL_COLORS: Record<AffinityLevel, string> = {
  hostile: '#ef4444',
  neutral: '#9ca3af',
  friendly: '#4ade80',
  trusted: '#60a5fa',
  bonded: '#fbbf24',
};

export const MAP_MODIFIER_ICONS: Record<MapModifierType, string> = {
  hazard: '⚠️',
  blessing: '✨',
  hiddenPath: '🚪',
  locked: '🔒',
  cursed: '💀',
};

export interface OfflineRewardMapComparison {
  areaId: string;
  areaName: string;
  difficultyName: string;
  expReward: number;
  goldReward: number;
  deathRiskLevel: string;
  deathRiskPercent: number;
  riskRewardRatio: number;
}

export interface OfflineRewardBreakdown {
  baseExp: number;
  baseGold: number;
  mapDifficultyMultiplier: number;
  mapDifficultyName: string;
  companionBonus: number;
  companionCount: number;
  eventStatusBonus: number;
  eventModifiers: { name: string; icon: string; bonus: number }[];
  deathRiskMultiplier: number;
  deathRiskLevel: string;
  deathRiskPercent: number;
  efficiencyMultiplier: number;
  finalExp: number;
  finalGold: number;
  offlineMinutes: number;
  expectedDeathLossExp: number;
  expectedDeathLossGold: number;
  deathLossRate: number;
  recoveryHpCost: number;
  recoveryMpCost: number;
  totalRecoveryCost: number;
  netExpProfit: number;
  netGoldProfit: number;
  rewardComposition: {
    source: string;
    expContribution: number;
    goldContribution: number;
    expPercent: number;
    goldPercent: number;
  }[];
  mapComparison: OfflineRewardMapComparison[];
  townRewards: {
    gold: number;
    exp: number;
    soulOrbs: number;
    buildingRewards: { buildingId: string; name: string; gold: number; exp: number; soulOrbs: number }[];
    stationBonus: number;
  };
}

export type TalentCategory = 'combat' | 'survival' | 'growth' | 'fortune' | 'class_special' | 'race_special';
export type TalentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TalentEffect {
  type: 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'luck' | 'exp' | 'gold' | 'soulOrbs' | 'critRate' | 'critDamage' | 'dodge' | 'skillDamage' | 'companionAttack' | 'companionDefense' | 'companionHp' | 'expBonus' | 'goldBonus';
  value: number;
  isPercent: boolean;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  category: TalentCategory;
  rarity: TalentRarity;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effects: TalentEffect[];
  classRestriction?: string[];
  raceRestriction?: string[];
  requiredRebirthCount?: number;
  prerequisiteTalentIds?: string[];
  icon: string;
}

export interface TalentNode {
  talentId: string;
  currentLevel: number;
}

export interface TalentTree {
  id: TalentCategory;
  name: string;
  description: string;
  icon: string;
}

export type TalentSynergyType = 'warrior_path' | 'mage_path' | 'rogue_path' | 'holy_path' | 'nature_path' | 'dragon_path';

export interface TalentSynergy {
  id: TalentSynergyType;
  name: string;
  description: string;
  requiredTalentIds: string[];
  effects: TalentEffect[];
  icon: string;
}

export interface PowerComponent {
  base: number;
  companion: number;
  bond: number;
  rebirthPercent: number;
  rebirthValue: number;
  talentPercent: number;
  talentValue: number;
  mapModifier: number;
  affinityPercent: number;
  affinityValue: number;
  total: number;
}

export interface CompanionShard {
  companionId: string;
  count: number;
}

export interface CompanionCodexEntry {
  companionId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface ShardRecruitConfig {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  shardsNeeded: number;
  recruitCost: number;
  dropWeight: number;
  shardsPerDrop: { min: number; max: number };
  duplicateToShards: number;
}

export type RecruitPoolType = 'basic' | 'advanced' | 'legendary';

export interface RecruitPool {
  type: RecruitPoolType;
  name: string;
  description: string;
  singleCost: number;
  tenCost: number;
  icon: string;
  rarityWeights: Record<string, number>;
  guaranteedRarity?: { rarity: 'rare' | 'epic' | 'legendary'; pullCount: number };
}

export interface PowerBreakdown {
  attack: PowerComponent;
  defense: PowerComponent;
  hp: PowerComponent;
  speed: PowerComponent;
  companionDetails: { name: string; rarity: string; stars: number; attack: number; defense: number; level: number }[];
  rebirthDetails: { id: string; name: string; icon: string; value: number }[];
  talentDetails: { name: string; level: number; category: string; rarity: string; icon: string }[];
  mapModifierDetails: { areaId: string; areaName: string; type: string; name: string; description: string; stat: string; value: number }[];
  affinityDetails: { companionId: string; name: string; level: string; value: number; color: string }[];
  bondDetails: { id: string; name: string; icon: string; members: string[]; bonus: { type: 'attack' | 'defense' | 'hp' | 'speed' | 'luck'; value: number }[] }[];
}

export interface ClassPassiveLevelBonus {
  stat: 'attack' | 'defense' | 'maxHp' | 'maxMp' | 'speed' | 'luck';
  multiplier: number;
  description: string;
}

export interface ClassPassiveIdleBonus {
  expMultiplier: number;
  goldMultiplier: number;
  soulOrbChanceBonus: number;
  description: string;
}

export interface ClassPassiveEventBonus {
  positiveEffectMultiplier: number;
  negativeEffectReduction: number;
  eventWeightBonus: number;
  description: string;
}

export interface ClassPassiveCompanionBonus {
  preferredClasses: string[];
  preferredRaces?: string[];
  affinityBonus: number;
  statBonusMultiplier: number;
  extraBondBonus?: { type: 'attack' | 'defense' | 'hp' | 'speed' | 'luck'; value: number };
  description: string;
}

export interface ClassPassive {
  classId: string;
  className: string;
  icon: string;
  tagline: string;
  levelBonus: ClassPassiveLevelBonus;
  idleBonus: ClassPassiveIdleBonus;
  eventBonus: ClassPassiveEventBonus;
  companionBonus: ClassPassiveCompanionBonus;
}

export type EquipmentSlotType = 'weapon' | 'helmet' | 'armor' | 'boots' | 'accessory';
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface EquipmentRarityConfig {
  rarity: EquipmentRarity;
  name: string;
  color: string;
  minAffixes: number;
  maxAffixes: number;
  statMultiplier: number;
  recycleGoldBase: number;
  recycleGoldPerLevel: number;
  forgeCostMultiplier: number;
}

export interface EquipmentStat {
  stat: 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'luck' | 'critRate' | 'critDamage' | 'dodge' | 'goldBonus' | 'expBonus';
  value?: number;
  minValue?: number;
  maxValue?: number;
  isPercent: boolean;
  stats?: EquipmentStat[];
}

export interface EquipmentBase {
  id: string;
  name: string;
  slot: EquipmentSlotType;
  icon: string;
  baseStats: EquipmentStat[];
  minAreaLevel: number;
  rarityWeights: Record<EquipmentRarity, number>;
}

export interface EquipmentAffix {
  id: string;
  name: string;
  type: 'prefix' | 'suffix';
  stats: EquipmentStat[];
  rarityWeights: Record<EquipmentRarity, number>;
  slotRestrictions?: EquipmentSlotType[];
}

export interface EquipmentDropConfig {
  monsterTier: MonsterTier;
  dropChance: number;
  rarityBonus: number;
}

export interface ForgeRecipe {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'gold' | 'soulOrbs';
  inputSlots: number;
  minRarity: EquipmentRarity;
  outputRarityBoost: number;
  rerollAffixes: boolean;
}

export interface StoryDialogueChoice {
  id: string;
  text: string;
  nextDialogueId?: string;
  effects?: EventEffect[];
}

export interface StoryDialogue {
  id: string;
  speaker: string;
  speakerAvatar?: string;
  text: string;
  nextDialogueId?: string;
  choices?: StoryDialogueChoice[];
}

export interface DialogueState {
  dialogueId: string;
  currentIndex: number;
}

export interface ChapterUnlockCondition {
  type: 'level' | 'stage' | 'quest' | 'reputation' | 'bossKills';
  threshold: number;
  description: string;
  areaId?: string;
}

export type ChapterStageType = 'story' | 'normal' | 'elite' | 'boss' | 'treasure' | 'shrine' | 'rest';

export interface ChapterStage {
  id: string;
  name: string;
  description: string;
  type: ChapterStageType;
  chapterId: string;
  position: { x: number; y: number };
  connections: string[];
  minLevel: number;
  areaId: string;
  monsterIds?: string[];
  monsterCount?: number;
  eliteChance?: number;
  bossMonsterId?: string;
  bossMechanics?: BossMechanic[];
  storyDialogueId?: string;
  rewards: EventEffect[];
  firstClearRewards?: EventEffect[];
  starConditions?: StarCondition[];
  staminaCost: number;
  requiredStageIds?: string[];
  icon: string;
  bgColor: string;
}

export interface BossMechanic {
  id: string;
  name: string;
  description: string;
  type: 'phase_transition' | 'heal' | 'attack' | 'buff' | 'shield' | 'summon' | 'berserk';
  hpThreshold?: number;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  speedMultiplier?: number;
  healAmount?: number;
  shieldAmount?: number;
  cooldown?: number;
  summonMonsterIds?: string[];
  icon: string;
  [key: string]: unknown;
}

export interface Chapter {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  chapterNumber: number;
  areaId: string;
  minLevel: number;
  icon: string;
  bgColor: string;
  unlockConditions: ChapterUnlockCondition[];
  prologueDialogueId?: string;
  epilogueDialogueId?: string;
  startStageId: string;
  bossStageId: string;
  chapterRewards?: EventEffect[];
  stages: ChapterStage[];
}

export interface RareMaterial {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: TalentRarity;
  sellPrice: number;
  categories: string[];
}

export type CommissionType = 'gather' | 'combat' | 'explore' | 'escort' | 'hunt' | 'mystery';
export type CommissionRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CommissionReward {
  type: 'gold' | 'exp' | 'material' | 'soulOrbs' | 'reputation';
  minAmount?: number;
  maxAmount?: number;
  value?: number;
  chance: number;
  materialId?: string;
}

export interface Commission {
  id: string;
  title: string;
  description: string;
  type: CommissionType;
  rarity: CommissionRarity;
  areaId: string;
  minLevel: number;
  durationSeconds: number;
  minCompanions: number;
  maxCompanions: number;
  requiredPower: number;
  rewards: CommissionReward[];
  eventChance: number;
  failureChance: number;
  icon: string;
  bgColor: string;
  generatedAt?: number;
}

export interface CommissionEventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
}

export interface CommissionEvent {
  id: string;
  title: string;
  description: string;
  type: 'treasure' | 'trap' | 'shrine' | 'merchant' | 'ambush' | 'mystery';
  icon: string;
  choices: CommissionEventChoice[];
}

export type TradeItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type TradeItemCategory = 'material' | 'consumable' | 'equipment' | 'companion_shard' | 'rare_resource';

export interface TradeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TradeItemCategory;
  rarity: TradeItemRarity;
  basePrice: number;
  minStock?: number;
  maxStock?: number;
  maxStockPerRefresh?: number;
  weight?: number;
  areaId?: string;
  minPlayerLevel?: number;
  effects?: EventEffect[];
  effect?: EventEffect;
  materialId?: string;
  currency?: 'gold' | 'soulOrbs';
  isBlackMarketOnly?: boolean;
}

export interface PriceFluctuationConfig {
  minModifier: number;
  maxModifier: number;
  volatility: number;
  meanReversionRate: number;
  eventImpactMultiplier: number;
  areaDemandMultiplier: number;
}

export interface TradeEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  durationSeconds: number;
  priceModifiers: Record<string, number>;
  categoryModifiers: Partial<Record<TradeItemCategory, number>>;
  rarityModifiers: Partial<Record<TradeItemRarity, number>>;
  icon: string;
  isPositive: boolean;
}

export interface BlackMarketConfig {
  unlockLevel: number;
  priceDiscountRange: { min: number; max: number };
  pricePremiumRange: { min: number; max: number };
  rareItemChance: number;
  legendaryItemChance: number;
  refreshCost: number;
  refreshCurrency: 'gold' | 'soulOrbs';
  riskEventChance: number;
}

export interface GuildLevelConfig {
  level: number;
  expRequired: number;
  maxStaminaBonus: number;
  staminaRegenBonus: number;
  attackBonus: number;
  defenseBonus: number;
  hpBonus: number;
  goldBonus: number;
  expBonus: number;
  unlockFeature: string | null;
}

export type GuildNodeType = 'start' | 'normal' | 'elite' | 'boss' | 'treasure' | 'shrine' | 'shop' | 'rest';

export interface GuildNode {
  id: string;
  name: string;
  type: GuildNodeType;
  description: string;
  x: number;
  y: number;
  connections: string[];
  minLevel: number;
  rewards: EventEffect[];
  icon: string;
  bgColor: string;
  staminaCost: number;
}

export interface GuildChapter {
  id: string;
  name: string;
  description: string;
  chapterNumber: number;
  areaId: string;
  nodes: GuildNode[];
  startNodeId: string;
  bossNodeId: string;
  minLevel: number;
  bgColor: string;
  icon: string;
}

export type GuildTechCategory = 'combat' | 'economy' | 'support';

export interface GuildTechTree {
  id: string;
  name: string;
  description: string;
  category: GuildTechCategory;
  maxLevel: number;
  costPerLevel: number;
  effectType: 'attack' | 'defense' | 'hp' | 'gold' | 'exp' | 'stamina' | 'luck';
  effectValuePerLevel: number;
  icon: string;
  prerequisites: string[];
}

export interface GuildDailyReward {
  day: number;
  rewards: EventEffect[];
  claimed?: boolean;
}

export interface SkillTreeBranch {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  branch: string;
  rarity: TalentRarity;
  maxLevel: number;
  pointCostPerLevel: number;
  effects: TalentEffect[];
  prerequisiteIds?: string[];
  classRestriction?: string[];
  minPlayerLevel?: number;
  icon: string;
  row: number;
  col: number;
}

export interface ProfessionSpec {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseClass: string;
  minLevel: number;
  minRebirthCount: number;
  requiredBranchId: string;
  requiredBranchPoints: number;
  passiveEffects: TalentEffect[];
  combatBonus: {
    damageMultiplier: number;
    defenseMultiplier: number;
    speedMultiplier: number;
  };
  rebirthInheritRate: number;
  companionSynergy: {
    preferredClasses: string[];
    bonusPerCompanion: TalentEffect[];
    description: string;
  };
  color: string;
}

export interface SkillTreeCompanionSynergy {
  companionClass: string;
  bonusPerStar: TalentEffect[];
  description: string;
}

export type SkillTreeBranchId = 'offense' | 'defense' | 'utility' | 'special' | string;
export type SkillNodeEffect = TalentEffect;

export const SKILL_NODE_RARITY_COLORS: Record<TalentRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export const SKILL_NODE_RARITY_NAMES: Record<TalentRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export interface Equipment {
  uid: string;
  baseId: string;
  name: string;
  slot: EquipmentSlotType;
  rarity: EquipmentRarity;
  level: number;
  baseStats: EquipmentStat[];
  affixes: EquipmentStat[];
  icon: string;
  equippedBy: string | null;
  forgeExp: number;
  forgeExpToNext?: number;
  [key: string]: unknown;
}

export type StageType = ChapterStageType;

export interface ActiveCommission {
  commissionId: string;
  title: string;
  type: CommissionType;
  rarity: CommissionRarity;
  durationSeconds: number;
  progressSeconds: number;
  selectedCompanionIds: string[];
  companionIds: string[];
  eventLog: string[];
  currentEvent: CommissionEvent | null;
  status: 'in_progress' | 'event_pending' | 'completed' | 'failed' | 'event';
  startedAt: number;
  startTime: number;
  progress: number;
}

export interface CommissionRewardResult {
  type: 'gold' | 'exp' | 'material' | 'soulOrbs' | 'reputation';
  value: number;
  amount: number;
  materialId?: string;
}

export type GuildTab = 'chapter' | 'tech' | 'daily' | 'formation' | 'map';
export type GuildMapNode = GuildNode;

export interface TradeRecord {
  id: string;
  type: 'buy' | 'sell';
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  currency: 'gold' | 'soulOrbs';
  areaId: string;
  timestamp: number;
}

export interface TradeInventoryItem {
  itemId: string;
  currentStock: number;
  averageCost: number;
  currentPrice: number;
  priceModifier: number;
}

export interface TradeInventory {
  gold: number;
  items: TradeInventoryItem[];
}

export interface MaterialInventoryItem {
  materialId: string;
  count: number;
}

export type RelicRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type RelicElement = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark';

export type RelicCategory = 'weapon' | 'armor' | 'accessory' | 'treasure' | 'rune';

export interface RelicStatBonus {
  stat: 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'luck' | 'critRate' | 'critDamage' | 'dodge' | 'goldBonus' | 'expBonus' | 'soulOrbBonus';
  value: number;
  isPercent: boolean;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  lore: string;
  icon: string;
  rarity: RelicRarity;
  element: RelicElement;
  category: RelicCategory;
  baseStats: RelicStatBonus[];
  awakenedStats: RelicStatBonus[];
  compatibleCompanionIds: string[];
  compatibleClasses: string[];
  compatibleRaces: string[];
  dropAreas: string[];
  dropMonsterTiers: MonsterTier[];
  dropChance: number;
  requiredPlayerLevel: number;
  awakenCost: { shards: number; soulOrbs: number };
}

export interface OwnedRelic {
  relicId: string;
  level: number;
  awakened: boolean;
  equippedBy: string | null;
  shards: number;
  acquiredAt: number;
}

export interface RelicSet {
  id: string;
  name: string;
  description: string;
  icon: string;
  relicIds: string[];
  setBonuses: {
    count: number;
    effects: RelicStatBonus[];
  }[];
}

export interface RelicCodexEntry {
  relicId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  levelReached: number;
  awakened: boolean;
}

export const RELIC_RARITY_NAMES: Record<RelicRarity, string> = {
  common: '凡品',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  mythic: '神话',
};

export const RELIC_RARITY_COLORS: Record<RelicRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
  mythic: '#ef4444',
};

export const RELIC_RARITY_STAR_COUNTS: Record<RelicRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

export const RELIC_ELEMENT_NAMES: Record<RelicElement, string> = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '风',
  light: '光',
  dark: '暗',
};

export const RELIC_ELEMENT_ICONS: Record<RelicElement, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🪨',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

export const RELIC_ELEMENT_COLORS: Record<RelicElement, string> = {
  fire: '#ef4444',
  water: '#3b82f6',
  earth: '#a16207',
  wind: '#22c55e',
  light: '#fbbf24',
  dark: '#7c3aed',
};

export const RELIC_CATEGORY_NAMES: Record<RelicCategory, string> = {
  weapon: '神兵',
  armor: '宝甲',
  accessory: '灵饰',
  treasure: '异宝',
  rune: '符文',
};

export const RELIC_CATEGORY_ICONS: Record<RelicCategory, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  treasure: '🏺',
  rune: '📜',
};

export type BuildingType = 'gold_mine' | 'lumber_mill' | 'stone_quarry' | 'farm' | 'tavern' | 'forge' | 'warehouse' | 'market' | 'barracks' | 'temple';

export interface BuildingLevelConfig {
  level: number;
  upgradeCost: number;
  upgradeCurrency: 'gold' | 'soulOrbs';
  productionRate: number;
  productionCurrency: 'gold' | 'exp' | 'soulOrbs';
  capacity: number;
  defenseBonus?: number;
  attackBonus?: number;
  stationSlots: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  maxLevel: number;
  unlockLevel: number;
  levels: BuildingLevelConfig[];
}

export interface OwnedBuilding {
  buildingId: string;
  level: number;
  currentResources: number;
  lastCollectTime: number;
  stationedCompanionIds: string[];
}

export interface MerchantEvent {
  id: string;
  title: string;
  description: string;
  merchantName: string;
  merchantAvatar: string;
  type: 'buy' | 'sell' | 'trade' | 'special';
  items: MerchantItem[];
  durationSeconds: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface MerchantItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  priceCurrency: 'gold' | 'soulOrbs';
  rewardType: 'gold' | 'exp' | 'soulOrbs' | 'attack' | 'defense' | 'hp' | 'material';
  rewardValue: number;
  stock?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  materialId?: string;
}

export interface ActiveMerchantEvent {
  eventId: string;
  startTime: number;
  endTime: number;
  purchasedItems: Record<string, number>;
}

export interface StationBonus {
  type: 'production' | 'defense' | 'attack' | 'capacity';
  value: number;
  isPercent: boolean;
}

export interface OfflineTownRewards {
  gold: number;
  exp: number;
  soulOrbs: number;
  breakdown: {
    buildingRewards: { buildingId: string; name: string; gold: number; exp: number; soulOrbs: number }[];
    stationBonus: number;
    totalOfflineMinutes: number;
  };
}

export type TownTab = 'buildings' | 'merchant' | 'station' | 'overview';

export interface WorldBoss {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseHp: number;
  attack: number;
  defense: number;
  speed: number;
  areaId: string;
  minPlayerLevel: number;
  phaseThresholds: WorldBossPhase[];
  mechanics: WorldBossMechanic[];
  timeLimitSeconds: number;
  rewardTiers: WorldBossRewardTier[];
  participationReward: EventEffect[];
  killBonus: EventEffect[];
}

export interface WorldBossPhase {
  hpPercent: number;
  name: string;
  attackMultiplier: number;
  defenseMultiplier: number;
  color: string;
  description: string;
}

export interface WorldBossMechanic {
  id: string;
  name: string;
  description: string;
  type: 'aoe' | 'dot' | 'summon' | 'shield' | 'berserk' | 'heal';
  hpPercent: number;
  damageMultiplier: number;
  icon: string;
}

export interface WorldBossRewardTier {
  minDamagePercent: number;
  rewards: EventEffect[];
  title: string;
}

export interface WorldBossRankingEntry {
  name: string;
  damage: number;
  timestamp: number;
}

export interface WorldBossSession {
  bossId: string;
  currentHp: number;
  maxHp: number;
  phaseIndex: number;
  startTime: number;
  endTime: number | null;
  isDefeated: boolean;
  playerDamage: number;
  playerDeaths: number;
  reviveCount: number;
  isDead: boolean;
  lastDamageTime: number;
  mechanicActive: string | null;
  ranking: WorldBossRankingEntry[];
  damageLog: WorldBossDamageLogEntry[];
  rewardsClaimed: boolean;
}

export interface WorldBossDamageLogEntry {
  timestamp: number;
  source: string;
  damage: number;
  mechanic?: string;
  isCritical: boolean;
}

export interface WorldBossRotation {
  bossIds: string[];
  rotationIntervalSeconds: number;
  restIntervalSeconds: number;
}

export interface WorldBossState {
  currentSession: WorldBossSession | null;
  rotationIndex: number;
  nextBossTime: number;
  isActive: boolean;
  totalBossesDefeated: number;
  history: WorldBossHistoryEntry[];
}

export interface WorldBossHistoryEntry {
  bossId: string;
  defeatedAt: number;
  playerDamage: number;
  playerRank: number;
  totalParticipants: number;
  rewardsClaimed: boolean;
}

export type AlchemyRecipeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type PotionType = 'healing' | 'mana' | 'buff' | 'cure' | 'special';

export type PotionRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BuffDuration = 'instant' | 'battle' | 'timed';

export interface AlchemyRecipeInput {
  materialId: string;
  count: number;
}

export interface AlchemyRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AlchemyRecipeRarity;
  inputs: AlchemyRecipeInput[];
  goldCost: number;
  outputPotionId: string;
  outputCount: number;
  requiredAlchemyLevel: number;
  successRate: number;
  areaId?: string;
  unlockCondition?: string;
  category: string;
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: PotionRarity;
  type: PotionType;
  effects: AlchemyPotionEffect[];
  duration: BuffDuration;
  durationSeconds?: number;
  sellPrice: number;
  combatUsable: boolean;
  stackLimit: number;
}

export interface AlchemyPotionEffect {
  type: 'hp' | 'mp' | 'attack' | 'defense' | 'speed' | 'luck' | 'critRate' | 'critDamage' | 'dodge' | 'expBonus' | 'goldBonus' | 'soulOrbBonus' | 'maxHp' | 'maxMp' | 'damageReduction';
  value: number;
  isPercent: boolean;
}

export interface OwnedPotion {
  potionId: string;
  count: number;
}

export interface ActiveAlchemyBuff {
  potionId: string;
  potionName: string;
  icon: string;
  effects: AlchemyPotionEffect[];
  appliedAt: number;
  expiresAt: number | null;
  duration: BuffDuration;
  remainingBattles?: number;
}

export interface AlchemyLevelConfig {
  level: number;
  expRequired: number;
  successRateBonus: number;
  unlockSlotCount: number;
  bonusEffectMultiplier: number;
  title: string;
}

export type AlchemyTab = 'recipes' | 'inventory' | 'potions' | 'buffs' | 'cauldron';

export interface MonsterCodexEntry {
  monsterId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  firstDefeatedAt: number | null;
  killCount: number;
  maxTierDefeated: MonsterTier | null;
}

export interface EventCodexEntry {
  eventId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  triggerCount: number;
  choicesMade: Record<string, number>;
}

export interface RebirthRecord {
  id: number;
  timestamp: number;
  level: number;
  rebirthCount: number;
  soulOrbsGained: number;
  bonusesPurchased: string[];
  totalRebirthBonus: number;
}

export type AchievementCategory = 'monster' | 'event' | 'companion' | 'rebirth' | 'exploration' | 'combat' | 'collection';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementConditionType =
  | 'monster_kills'
  | 'monster_tier_kills'
  | 'monster_codex_unlocked'
  | 'event_triggered'
  | 'event_choices'
  | 'event_codex_unlocked'
  | 'companion_recruited'
  | 'companion_codex_unlocked'
  | 'companion_stars'
  | 'rebirth_count'
  | 'rebirth_bonus_total'
  | 'level_reached'
  | 'gold_earned'
  | 'soul_orbs_earned'
  | 'area_unlocked'
  | 'total_power';

export interface AchievementCondition {
  type: AchievementConditionType;
  target: number;
  monsterId?: string;
  monsterTier?: MonsterTier;
  eventId?: string;
  choiceId?: string;
  companionId?: string;
  areaId?: string;
  description: string;
}

export interface AchievementReward {
  type: 'gold' | 'exp' | 'soulOrbs' | 'attack' | 'defense' | 'hp' | 'speed' | 'luck' | 'reputation';
  value: number;
  areaId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  conditions: AchievementCondition[];
  rewards: AchievementReward[];
  hidden?: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  claimed: boolean;
  claimedAt: number | null;
  progress: number;
}

export type CodexCategory = 'monsters' | 'events' | 'companions' | 'rebirth';

export const ACHIEVEMENT_RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export const ACHIEVEMENT_RARITY_NAMES: Record<AchievementRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, string> = {
  monster: '怪物',
  event: '事件',
  companion: '伙伴',
  rebirth: '转生',
  exploration: '探索',
  combat: '战斗',
  collection: '收集',
};

export const ACHIEVEMENT_CATEGORY_ICONS: Record<AchievementCategory, string> = {
  monster: '👹',
  event: '✨',
  companion: '🤝',
  rebirth: '🔄',
  exploration: '🗺️',
  combat: '⚔️',
  collection: '📚',
};

export type RelicDungeonRoomType = 'combat' | 'elite' | 'treasure' | 'event' | 'shrine' | 'rest' | 'boss' | 'shop' | 'mystery';
export type RelicDungeonDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export interface RelicDungeonBuff {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effects: RelicDungeonBuffEffect[];
  remainingRooms?: number;
}

export interface RelicDungeonBuffEffect {
  stat: 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'luck' | 'critRate' | 'critDamage' | 'dodge' | 'goldBonus' | 'expBonus' | 'damageReduction' | 'lifesteal' | 'thorns';
  value: number;
  isPercent: boolean;
}

export const RELIC_DUNGEON_ROOM_TYPE_NAMES: Record<RelicDungeonRoomType, string> = {
  combat: '战斗房',
  elite: '精英房',
  treasure: '宝藏房',
  event: '事件房',
  shrine: '神龛房',
  rest: '休息房',
  boss: 'BOSS房',
  shop: '商店房',
  mystery: '神秘房',
};

export const RELIC_DUNGEON_ROOM_TYPE_ICONS: Record<RelicDungeonRoomType, string> = {
  combat: '⚔️',
  elite: '💀',
  treasure: '💰',
  event: '✨',
  shrine: '⛩️',
  rest: '🏕️',
  boss: '👑',
  shop: '🛒',
  mystery: '❓',
};

export const RELIC_DUNGEON_ROOM_TYPE_COLORS: Record<RelicDungeonRoomType, string> = {
  combat: '#6b7280',
  elite: '#3b82f6',
  treasure: '#f59e0b',
  event: '#8b5cf6',
  shrine: '#22c55e',
  rest: '#14b8a6',
  boss: '#ef4444',
  shop: '#eab308',
  mystery: '#a855f7',
};

export const RELIC_DUNGEON_DIFFICULTY_NAMES: Record<RelicDungeonDifficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
  nightmare: '噩梦',
};

export const RELIC_DUNGEON_DIFFICULTY_COLORS: Record<RelicDungeonDifficulty, string> = {
  easy: '#22c55e',
  normal: '#3b82f6',
  hard: '#f59e0b',
  nightmare: '#ef4444',
};

export interface RelicDungeonRoom {
  id: string;
  type: RelicDungeonRoomType;
  floor: number;
  name: string;
  description: string;
  cleared: boolean;
  rewards?: EventEffect[];
  monsterId?: string;
  monsterTier?: MonsterTier;
  eventId?: string;
  buffChoices?: RelicDungeonBuff[];
  isBoss?: boolean;
  shopItems?: RelicDungeonShopItem[];
  connections: string[];
  position: { x: number; y: number };
}

export interface RelicDungeonFloor {
  floor: number;
  rooms: RelicDungeonRoom[];
  startRoomId: string;
  bossRoomId: string;
}

export interface RelicDungeonShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  currency: 'gold' | 'soulOrbs';
  effect: EventEffect | RelicDungeonBuff;
  isBuff?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RelicDungeonBoss {
  id: string;
  name: string;
  description: string;
  icon: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  minFloor: number;
  phases: RelicDungeonBossPhase[];
  rewards: EventEffect[];
  uniqueBuffDropChance: number;
  uniqueBuffId?: string;
}

export interface RelicDungeonBossPhase {
  name: string;
  hpThreshold: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  specialMechanic?: RelicDungeonBossMechanic;
}

export interface RelicDungeonBossMechanic {
  type: 'summon' | 'aoe' | 'heal' | 'shield' | 'berserk' | 'curse';
  value: number;
  description: string;
}

export interface RelicDungeonReplayEvent {
  id: string;
  timestamp: number;
  type: 'room_enter' | 'room_clear' | 'buff_gain' | 'buff_lose' | 'damage_dealt' | 'damage_taken' | 'reward_gain' | 'player_death' | 'boss_phase' | 'choice_made';
  floor: number;
  roomId?: string;
  roomType?: RelicDungeonRoomType;
  description: string;
  details?: Record<string, unknown>;
}

export interface RelicDungeonSettlement {
  runId: string;
  startTime: number;
  endTime: number;
  difficulty: RelicDungeonDifficulty;
  totalFloors: number;
  floorsCleared: number;
  roomsCleared: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  monstersKilled: number;
  bossesDefeated: number;
  buffsCollected: number;
  goldEarned: number;
  expEarned: number;
  soulOrbsEarned: number;
  relicsFound: number;
  survival: boolean;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  rewards: EventEffect[];
  replay: RelicDungeonReplayEvent[];
}

export interface RelicDungeonState {
  isActive: boolean;
  currentFloor: number;
  maxFloor: number;
  totalFloors: number;
  difficulty: RelicDungeonDifficulty;
  floors: RelicDungeonFloor[];
  currentRoomId: string | null;
  activeBuffs: RelicDungeonBuff[];
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  currentBoss: {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    currentPhase: number;
    mechanicActive: RelicDungeonBossMechanic | null;
  } | null;
  bossLog: string[];
  settlement: RelicDungeonSettlement | null;
  history: RelicDungeonSettlement[];
  highestFloorReached: number;
  totalRuns: number;
  totalBossesDefeated: number;
  unlockedDifficulties: RelicDungeonDifficulty[];
  tempGold: number;
  tempSoulOrbs: number;
  tempExp: number;
  visitedRoomIds: string[];
  replayBuffer: RelicDungeonReplayEvent[];
  currentShopInventory: RelicDungeonShopItem[];
  viewingReplay: RelicDungeonSettlement | null;
  replayIndex: number;
  replayPlaying: boolean;
}

export const RELIC_DUNGEON_BUFF_RARITY_COLORS: Record<RelicDungeonBuff['rarity'], string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export const RELIC_DUNGEON_BUFF_RARITY_NAMES: Record<RelicDungeonBuff['rarity'], string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const RELIC_DUNGEON_RANK_COLORS: Record<RelicDungeonSettlement['rank'], string> = {
  S: '#ef4444',
  A: '#f59e0b',
  B: '#3b82f6',
  C: '#22c55e',
  D: '#9ca3af',
};

export type SeasonChallengeTab = 'tasks' | 'leaderboard' | 'partners' | 'rewards' | 'history';

export type SeasonTaskType = 'kill' | 'collect' | 'explore' | 'battle' | 'social' | 'boss' | 'level' | 'area' | 'commission' | 'expedition' | 'guild' | 'alchemy';

export interface SeasonChallengeTask {
  id: string;
  name: string;
  description: string;
  type: SeasonTaskType;
  target: number;
  scoreReward: number;
  rewards: StarReward[];
  icon: string;
}

export interface SeasonChallengeStage {
  id: string;
  name: string;
  description: string;
  weekNumber: number;
  tasks: SeasonChallengeTask[];
  unlockScore: number;
  icon: string;
}

export interface SeasonChallengeTaskProgress {
  taskId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface SeasonChallengeLeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  title: string;
  avatarColor: string;
}

export interface SeasonChallengeLimitedPartner {
  companionId: string;
  seasonId: string;
  unlockScore: number;
  bonusStats: { stat: 'attack' | 'defense' | 'hp' | 'speed' | 'luck'; value: number }[];
  description: string;
}

export interface SeasonChallengeCrossWeekReward {
  weekNumber: number;
  minScore: number;
  rewards: StarReward[];
  title: string;
  icon: string;
}

export interface SeasonChallengeSeason {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  color: string;
  totalWeeks: number;
  stages: SeasonChallengeStage[];
  limitedPartners: SeasonChallengeLimitedPartner[];
  crossWeekRewards: SeasonChallengeCrossWeekReward[];
}

export interface SeasonChallengeHistoryEntry {
  seasonId: string;
  seasonName: string;
  icon: string;
  finalScore: number;
  finalRank: number;
  totalParticipants: number;
  limitedPartnersUnlocked: string[];
  stagesCompleted: number;
  completedAt: number;
}

export interface SeasonChallengeState {
  currentSeasonId: string | null;
  seasonScore: number;
  taskProgresses: SeasonChallengeTaskProgress[];
  leaderboard: SeasonChallengeLeaderboardEntry[];
  crossWeekRewardClaimed: string[];
  history: SeasonChallengeHistoryEntry[];
  activeTab: SeasonChallengeTab;
}

export const SEASON_TASK_TYPE_NAMES: Record<SeasonTaskType, string> = {
  kill: '击杀',
  collect: '收集',
  explore: '探索',
  battle: '战斗',
  social: '社交',
  boss: '首领',
  level: '等级',
  area: '区域',
  commission: '委托',
  expedition: '远征',
  guild: '公会',
  alchemy: '炼金',
};

export const SEASON_TASK_TYPE_ICONS: Record<SeasonTaskType, string> = {
  kill: '⚔️',
  collect: '💰',
  explore: '🗺️',
  battle: '🛡️',
  social: '🤝',
  boss: '👑',
  level: '📈',
  area: '🏔️',
  commission: '📜',
  expedition: '🏕️',
  guild: '🏰',
  alchemy: '⚗️',
};

export const SEASON_RANK_TITLES: Record<number, string> = {
  1: '至尊王者',
  2: '赛季霸主',
  3: '荣耀战神',
};

export function getSeasonRankTitle(rank: number): string {
  if (rank <= 3) return SEASON_RANK_TITLES[rank] || `前${rank}名`;
  if (rank <= 10) return `前十强`;
  if (rank <= 50) return `荣耀勇士`;
  if (rank <= 100) return `精英挑战者`;
  return `参赛者`;
}

export const SEASON_RANK_COLORS: Record<string, string> = {
  '至尊王者': '#fbbf24',
  '赛季霸主': '#f59e0b',
  '荣耀战神': '#fb923c',
  '前十强': '#a78bfa',
  '荣耀勇士': '#60a5fa',
  '精英挑战者': '#34d399',
  '参赛者': '#9ca3af',
};

export type FactionType = 'light' | 'shadow';

export interface Faction {
  id: FactionType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  preferredRaces: string[];
  preferredClasses: string[];
  bonusStats: { stat: keyof PlayerStats; value: number }[];
  lore: string;
}

export type StrongholdType = 'fortress' | 'tower' | 'mine' | 'shrine' | 'market';

export interface Stronghold {
  id: string;
  name: string;
  type: StrongholdType;
  description: string;
  icon: string;
  areaId: string;
  position: { x: number; y: number };
  controlFaction: FactionType | null;
  difficulty: number;
  maxGarrison: number;
  baseIncome: {
    gold: number;
    exp: number;
    soulOrbs: number;
    reputation: number;
  };
  bonusEffect?: {
    type: 'attack' | 'defense' | 'goldBonus' | 'expBonus' | 'soulOrbBonus';
    value: number;
    isPercent: boolean;
    targetAreas?: string[];
  };
  unlockLevel: number;
  captureCost: number;
}

export interface GarrisonedCompanion {
  companionId: string;
  strongholdId: string;
  deployedAt: number;
  contribution: number;
}

export interface FactionReputation {
  faction: FactionType;
  points: number;
  level: number;
  title: string;
}

export type FactionEventChoiceType = 'support_light' | 'support_shadow' | 'neutral' | 'exploit';

export interface FactionEventChoice {
  id: string;
  text: string;
  type: FactionEventChoiceType;
  effects: EventEffect[];
  reputationChanges: {
    light?: number;
    shadow?: number;
  };
  consequences?: EventConsequence;
  requiredReputation?: { faction: FactionType; minLevel: number };
}

export interface FactionEvent {
  id: string;
  title: string;
  description: string;
  areaId?: string;
  minPlayerLevel: number;
  baseWeight: number;
  choices: FactionEventChoice[];
  icon: string;
}

export interface FactionBattleLog {
  id: number;
  timestamp: number;
  type: 'capture' | 'defend' | 'skirmish' | 'event' | 'income';
  strongholdId?: string;
  strongholdName?: string;
  faction?: FactionType;
  result: 'victory' | 'defeat' | 'neutral';
  description: string;
  rewards?: EventEffect[];
}

export interface FactionIncomeBreakdown {
  strongholdId: string;
  strongholdName: string;
  gold: number;
  exp: number;
  soulOrbs: number;
  reputation: number;
  garrisonBonus: number;
}

export interface FactionSettlement {
  periodStart: number;
  periodEnd: number;
  totalGold: number;
  totalExp: number;
  totalSoulOrbs: number;
  totalReputation: number;
  breakdown: FactionIncomeBreakdown[];
  strongholdsHeld: number;
  factionRank: number;
}

export interface FactionShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  requiredLevel: number;
  rewards: {
    gold?: number;
    exp?: number;
    soulOrbs?: number;
    attack?: number;
    defense?: number;
    maxHp?: number;
    speed?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface FactionState {
  playerFaction: FactionType | null;
  joinedAt: number | null;
  reputations: FactionReputation[];
  strongholds: Stronghold[];
  garrisons: GarrisonedCompanion[];
  battleLogs: FactionBattleLog[];
  currentFactionEvent: FactionEvent | null;
  lastSettlementTime: number;
  settlementHistory: FactionSettlement[];
  totalContribution: number;
  factionRank: number;
  weeklyScore: number;
  activeTab: FactionTab;
}

export type FactionTab = 'overview' | 'strongholds' | 'garrison' | 'events' | 'shop' | 'battlelog';

export const FACTION_TAB_NAMES: Record<FactionTab, string> = {
  overview: '总览',
  strongholds: '据点',
  garrison: '驻防',
  events: '事件',
  shop: '商店',
  battlelog: '战报',
};

export const FACTION_TAB_ICONS: Record<FactionTab, string> = {
  overview: '📊',
  strongholds: '🏰',
  garrison: '⚔️',
  events: '📜',
  shop: '🛒',
  battlelog: '📋',
};

export const STRONGHOLD_TYPE_NAMES: Record<StrongholdType, string> = {
  fortress: '要塞',
  tower: '哨塔',
  mine: '矿场',
  shrine: '神殿',
  market: '市集',
};

export const STRONGHOLD_TYPE_ICONS: Record<StrongholdType, string> = {
  fortress: '🏰',
  tower: '🗼',
  mine: '⛏️',
  shrine: '⛩️',
  market: '🏪',
};

export const FACTION_REPUTATION_LEVELS: { level: number; name: string; minPoints: number; color: string }[] = [
  { level: 0, name: '外人', minPoints: 0, color: '#9ca3af' },
  { level: 1, name: '同情者', minPoints: 100, color: '#6ee7b7' },
  { level: 2, name: '支持者', minPoints: 300, color: '#34d399' },
  { level: 3, name: '战士', minPoints: 800, color: '#22d3ee' },
  { level: 4, name: '精英', minPoints: 2000, color: '#60a5fa' },
  { level: 5, name: '英雄', minPoints: 5000, color: '#fbbf24' },
  { level: 6, name: '传奇', minPoints: 12000, color: '#f59e0b' },
  { level: 7, name: '救世主', minPoints: 30000, color: '#ef4444' },
];

export function getFactionReputationLevel(points: number): number {
  const levels = FACTION_REPUTATION_LEVELS;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) return levels[i].level;
  }
  return 0;
}
