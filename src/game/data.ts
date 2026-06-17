import type { MapArea, Companion, GameEvent, RebirthOption } from './types';

export const RACES = ['人类', '精灵', '矮人', '兽人', '魔族', '龙族'];
export const CLASSES = ['战士', '法师', '盗贼', '牧师', '弓箭手', '骑士'];

export const INITIAL_STATS = {
  level: 1,
  exp: 0,
  expToNext: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  attack: 10,
  defense: 5,
  speed: 5,
  luck: 5,
  gold: 0,
  soulOrbs: 0,
};

export const MAP_AREAS: MapArea[] = [
  {
    id: 'forest',
    name: '新手森林',
    description: '充满绿意的森林，适合初学者冒险',
    minLevel: 1,
    baseExp: 10,
    baseGold: 5,
    bgColor: '#2d5a27',
    unlocked: true,
    monsters: [
      { id: 'slime', name: '史莱姆', hp: 30, attack: 5, defense: 2, expReward: 15, goldReward: 8, color: '#7dd87d' },
      { id: 'goblin', name: '哥布林', hp: 50, attack: 8, defense: 3, expReward: 25, goldReward: 12, color: '#5a8f3c' },
      { id: 'wolf', name: '野狼', hp: 45, attack: 12, defense: 2, expReward: 20, goldReward: 10, color: '#6b6b6b' },
    ],
  },
  {
    id: 'cave',
    name: '幽暗洞穴',
    description: '阴暗潮湿的洞穴，潜藏着危险的生物',
    minLevel: 10,
    baseExp: 25,
    baseGold: 15,
    bgColor: '#3d3d3d',
    unlocked: false,
    monsters: [
      { id: 'bat', name: '巨型蝙蝠', hp: 60, attack: 15, defense: 4, expReward: 40, goldReward: 20, color: '#4a4a4a' },
      { id: 'spider', name: '毒蜘蛛', hp: 80, attack: 20, defense: 5, expReward: 55, goldReward: 28, color: '#5c3d5c' },
      { id: 'orc', name: '兽人战士', hp: 120, attack: 25, defense: 10, expReward: 70, goldReward: 35, color: '#8b6914' },
    ],
  },
  {
    id: 'ruins',
    name: '远古遗迹',
    description: '神秘的古代遗迹，蕴含着强大的力量',
    minLevel: 25,
    baseExp: 60,
    baseGold: 40,
    bgColor: '#8b7355',
    unlocked: false,
    monsters: [
      { id: 'skeleton', name: '骷髅战士', hp: 150, attack: 35, defense: 15, expReward: 100, goldReward: 50, color: '#e0e0e0' },
      { id: 'golem', name: '石像鬼', hp: 250, attack: 45, defense: 25, expReward: 150, goldReward: 80, color: '#8b8b8b' },
      { id: 'lich', name: '巫妖', hp: 180, attack: 60, defense: 12, expReward: 180, goldReward: 100, color: '#6b2d6b' },
    ],
  },
  {
    id: 'volcano',
    name: '熔岩火山',
    description: '炽热的火山地带，只有强者才能生存',
    minLevel: 50,
    baseExp: 150,
    baseGold: 100,
    bgColor: '#8b2500',
    unlocked: false,
    monsters: [
      { id: 'fireslime', name: '火焰史莱姆', hp: 300, attack: 70, defense: 20, expReward: 250, goldReward: 120, color: '#ff6b35' },
      { id: 'dragonkin', name: '龙人战士', hp: 500, attack: 90, defense: 35, expReward: 400, goldReward: 200, color: '#cc2936' },
      { id: 'phoenix', name: '火焰凤凰', hp: 400, attack: 120, defense: 25, expReward: 500, goldReward: 300, color: '#ff9500' },
    ],
  },
];

export const COMPANIONS: Companion[] = [
  {
    id: 'novice_warrior',
    name: '新手战士',
    race: '人类',
    class: '战士',
    rarity: 'common',
    level: 1,
    attack: 8,
    defense: 5,
    cost: 100,
    description: '一位刚刚踏上冒险之旅的年轻战士',
  },
  {
    id: 'forest_archer',
    name: '森林弓手',
    race: '精灵',
    class: '弓箭手',
    rarity: 'rare',
    level: 1,
    attack: 15,
    defense: 3,
    cost: 500,
    description: '来自精灵森林的神射手，百发百中',
  },
  {
    id: 'dwarf_blacksmith',
    name: '矮人铁匠',
    race: '矮人',
    class: '战士',
    rarity: 'rare',
    level: 1,
    attack: 12,
    defense: 10,
    cost: 600,
    description: '精通锻造的矮人，防御力出众',
  },
  {
    id: 'dark_mage',
    name: '暗黑法师',
    race: '魔族',
    class: '法师',
    rarity: 'epic',
    level: 1,
    attack: 25,
    defense: 5,
    cost: 2000,
    description: '掌握禁忌魔法的暗黑法师，攻击力惊人',
  },
  {
    id: 'holy_priest',
    name: '神圣祭司',
    race: '人类',
    class: '牧师',
    rarity: 'epic',
    level: 1,
    attack: 10,
    defense: 15,
    cost: 2500,
    description: '受到神祝福的祭司，能提供强大的防护',
  },
  {
    id: 'dragon_knight',
    name: '龙骑士',
    race: '龙族',
    class: '骑士',
    rarity: 'legendary',
    level: 1,
    attack: 40,
    defense: 30,
    cost: 10000,
    description: '与龙族签订契约的传说骑士，实力深不可测',
  },
];

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'treasure_chest',
    title: '神秘宝箱',
    description: '你在路边发现了一个闪闪发光的宝箱...',
    choices: [
      { id: 'open', text: '打开宝箱', effects: [{ type: 'gold', value: 50 }] },
      { id: 'leave', text: '谨慎离开', effects: [{ type: 'exp', value: 20 }] },
    ],
  },
  {
    id: 'merchant',
    title: '流浪商人',
    description: '一位神秘的商人出现在你面前，提出了一笔交易...',
    choices: [
      { id: 'buy', text: '用金币交换经验', effects: [{ type: 'gold', value: -30 }, { type: 'exp', value: 80 }] },
      { id: 'sell', text: '用经验交换金币', effects: [{ type: 'exp', value: -50 }, { type: 'gold', value: 100 }] },
      { id: 'refuse', text: '婉拒离开', effects: [] },
    ],
  },
  {
    id: 'herb_garden',
    title: '草药花园',
    description: '你发现了一片神奇的草药花园...',
    choices: [
      { id: 'hp_herb', text: '采集生命草药', effects: [{ type: 'hp', value: 30 }] },
      { id: 'mp_herb', text: '采集魔力草药', effects: [{ type: 'mp', value: 25 }] },
      { id: 'luck_herb', text: '采集幸运草药', effects: [{ type: 'gold', value: 30 }] },
    ],
  },
  {
    id: 'old_sage',
    title: '神秘老者',
    description: '一位白胡子老者看起来想要传授你一些东西...',
    choices: [
      { id: 'attack_train', text: '学习攻击技巧', effects: [{ type: 'attack', value: 2 }] },
      { id: 'defense_train', text: '学习防御技巧', effects: [{ type: 'defense', value: 2 }] },
      { id: 'soul', text: '赠送魂珠', effects: [{ type: 'soulOrbs', value: 1 }] },
    ],
  },
  {
    id: 'dungeon_entrance',
    title: '地牢入口',
    description: '你发现了一个神秘的地牢入口，里面似乎有宝藏...',
    choices: [
      { id: 'enter', text: '进入探索', effects: [{ type: 'gold', value: 200 }, { type: 'hp', value: -50 }] },
      { id: 'train', text: '在地牢门口修炼', effects: [{ type: 'exp', value: 100 }] },
      { id: 'leave', text: '太危险了，离开', effects: [] },
    ],
  },
];

export const REBIRTH_OPTIONS: RebirthOption[] = [
  {
    id: 'attack_boost',
    name: '战神祝福',
    description: '每次转生提升 5% 攻击力',
    bonus: 0.05,
    cost: 1,
    icon: '⚔️',
  },
  {
    id: 'defense_boost',
    name: '守护之盾',
    description: '每次转生提升 5% 防御力',
    bonus: 0.05,
    cost: 1,
    icon: '🛡️',
  },
  {
    id: 'hp_boost',
    name: '生命之泉',
    description: '每次转生提升 8% 生命值',
    bonus: 0.08,
    cost: 1,
    icon: '❤️',
  },
  {
    id: 'gold_boost',
    name: '财富之手',
    description: '每次转生提升 10% 金币获取',
    bonus: 0.10,
    cost: 1,
    icon: '💰',
  },
  {
    id: 'exp_boost',
    name: '智慧之眼',
    description: '每次转生提升 10% 经验获取',
    bonus: 0.10,
    cost: 1,
    icon: '✨',
  },
  {
    id: 'speed_boost',
    name: '疾风之靴',
    description: '每次转生提升 5% 攻击速度',
    bonus: 0.05,
    cost: 2,
    icon: '👟',
  },
];

export const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};
