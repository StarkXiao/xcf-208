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

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'gold' | 'exp' | 'hp' | 'mp' | 'attack' | 'defense' | 'soulOrbs';
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
  type: 'damage' | 'heal' | 'exp' | 'gold' | 'levelup' | 'event' | 'system';
  timestamp: number;
}

export type GameScreen = 'rebirth' | 'game';
export type GameTab = 'stats' | 'map' | 'companions' | 'events';
