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

export interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  color: string;
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

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  areaId?: string;
  minReputationLevel?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'gold' | 'exp' | 'hp' | 'mp' | 'attack' | 'defense' | 'soulOrbs' | 'reputation';
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
  type: 'damage' | 'heal' | 'exp' | 'gold' | 'levelup' | 'event' | 'system' | 'reputation';
  timestamp: number;
}

export type GameScreen = 'rebirth' | 'game';
export type GameTab = 'stats' | 'map' | 'companions' | 'events' | 'expedition';

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
