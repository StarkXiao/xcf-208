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
  type: 'gold' | 'exp' | 'soulOrbs' | 'attack' | 'defense' | 'hp' | 'reputation';
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
}

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
  type: 'gold' | 'exp' | 'hp' | 'mp' | 'attack' | 'defense' | 'soulOrbs' | 'reputation' | 'speed' | 'luck';
  value: number;
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
  type: 'damage' | 'heal' | 'exp' | 'gold' | 'levelup' | 'event' | 'system' | 'reputation' | 'skill' | 'phase' | 'mp' | 'dodge' | 'critical';
  timestamp: number;
}

export type GameScreen = 'rebirth' | 'game';
export type GameTab = 'stats' | 'map' | 'companions' | 'events' | 'expedition' | 'talents';

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
}

export type TalentCategory = 'combat' | 'survival' | 'growth' | 'fortune' | 'class_special' | 'race_special';
export type TalentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TalentEffect {
  type: 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'luck' | 'exp' | 'gold' | 'soulOrbs' | 'critRate' | 'critDamage' | 'dodge';
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
