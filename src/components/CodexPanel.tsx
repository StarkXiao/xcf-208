import { useState, useMemo } from 'react';
import { useGameStore } from '../game/store';
import {
  MAP_AREAS,
  RANDOM_EVENTS,
  COMPANIONS,
  RARITY_COLORS,
  RARITY_NAMES,
} from '../game/data';
import { MONSTER_TIER_CONFIGS } from '../game/types';
import type { MonsterTier } from '../game/types';

type CodexTab = 'monster' | 'event' | 'companion' | 'rebirth';

const TIER_COLORS: Record<MonsterTier, string> = {
  normal: '#9ca3af',
  elite: '#f59e0b',
  boss: '#ef4444',
};

export default function CodexPanel() {
  const {
    monsterCodex,
    eventCodex,
    companionCodex,
    rebirthRecords,
    getMonsterCodexEntry,
    getMonsterCodexProgress,
    getEventCodexEntry,
    getEventCodexProgress,
    getCodexEntry: getCompanionCodexEntry,
    getCodexProgress: getCompanionCodexProgress,
    getRebirthRecords,
    ownedCompanions,
    player,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<CodexTab>('monster');

  const monsterProgress = useMemo(() => getMonsterCodexProgress(), [getMonsterCodexProgress, monsterCodex]);
  const eventProgress = useMemo(() => getEventCodexProgress(), [getEventCodexProgress, eventCodex]);
  const companionProgress = useMemo(() => getCompanionCodexProgress(), [getCompanionCodexProgress, companionCodex]);

  const allMonsters = useMemo(() => {
    const monsters: Array<{ monster: typeof MAP_AREAS[0]['monsters'][0]; areaName: string; tier: MonsterTier }> = [];
    MAP_AREAS.forEach((area) => {
      area.monsters.forEach((monster) => {
        const tier = monster.tier || 'normal';
        if (!monsters.find((m) => m.monster.id === monster.id)) {
          monsters.push({ monster, areaName: area.name, tier });
        }
      });
    });
    return monsters;
  }, []);

  const tabs = [
    { id: 'monster' as const, label: '🐉 怪物', count: monsterProgress },
    { id: 'event' as const, label: '📖 事件', count: eventProgress },
    { id: 'companion' as const, label: '🤝 伙伴', count: companionProgress },
    { id: 'rebirth' as const, label: '🔄 转生', count: { total: rebirthRecords.length, unlocked: rebirthRecords.length, percentage: 100 } },
  ];

  const getMonsterEmoji = (monsterName: string): string => {
    const emojiMap: Record<string, string> = {
      '史莱姆': '🟢',
      '哥布林': '👺',
      '野狼': '🐺',
      '森林树人': '🌳',
      '蝙蝠': '🦇',
      '骷髅兵': '💀',
      '石像鬼': '🗿',
      '洞穴巨蛛': '🕷️',
      '强盗': '🗡️',
      '沙漠蝎': '🦂',
      '木乃伊': '🧟',
      '沙虫': '🐛',
      '冰狼': '🐺',
      '雪人': '⛄',
      '冰霜元素': '❄️',
      '冰晶巨人': '🧊',
    };
    return emojiMap[monsterName] || '👾';
  };

  const getEventEmoji = (eventTitle: string): string => {
    const emojiMap: Record<string, string> = {
      '神秘商人': '🧙',
      '宝箱': '📦',
      '迷路的旅人': '🧳',
      '古老的祭坛': '⛩️',
      '草药丛': '🌿',
      '矿脉': '⛏️',
      '陷阱': '⚠️',
      '休息点': '🏕️',
      '神秘泉水': '💧',
      '流浪的铁匠': '🔨',
    };
    return emojiMap[eventTitle] || '✨';
  };

  const renderMonsterTab = () => (
    <div className="codex-tab-content">
      <div className="codex-progress-section">
        <div className="codex-progress-bar">
          <div className="codex-progress-fill" style={{ width: `${monsterProgress.percentage}%` }} />
        </div>
        <span className="codex-progress-text">
          怪物收集: {monsterProgress.unlocked} / {monsterProgress.total} ({monsterProgress.percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="codex-grid">
        {allMonsters.map(({ monster, areaName, tier }) => {
          const entry = getMonsterCodexEntry(monster.id);
          return (
            <div key={monster.id} className={`codex-card ${!entry.unlocked ? 'locked' : ''}`}>
              <div className="codex-card-header">
                <span className="codex-card-icon" style={{ color: entry.unlocked ? monster.color : '#6b7280' }}>
                  {entry.unlocked ? getMonsterEmoji(monster.name) : '❓'}
                </span>
                <span className="codex-card-tier" style={{ color: TIER_COLORS[tier] }}>
                  {MONSTER_TIER_CONFIGS[tier]?.name || tier}
                </span>
              </div>
              <div className="codex-card-body">
                <h4 className="codex-card-name">
                  {entry.unlocked ? monster.name : '???'}
                </h4>
                {entry.unlocked ? (
                  <>
                    <p className="codex-card-area">出没区域: {areaName}</p>
                    <p className="codex-card-kills">击杀次数: {entry.killCount}</p>
                    {entry.maxTierDefeated && (
                      <p className="codex-card-tier-defeated">
                        最高难度: {MONSTER_TIER_CONFIGS[entry.maxTierDefeated]?.name || entry.maxTierDefeated}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="codex-card-locked">🔒 尚未发现</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEventTab = () => (
    <div className="codex-tab-content">
      <div className="codex-progress-section">
        <div className="codex-progress-bar">
          <div className="codex-progress-fill" style={{ width: `${eventProgress.percentage}%` }} />
        </div>
        <span className="codex-progress-text">
          事件收集: {eventProgress.unlocked} / {eventProgress.total} ({eventProgress.percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="codex-grid">
        {RANDOM_EVENTS.map((event) => {
          const entry = getEventCodexEntry(event.id);
          return (
            <div key={event.id} className={`codex-card ${!entry.unlocked ? 'locked' : ''}`}>
              <div className="codex-card-header">
                <span className="codex-card-icon">{entry.unlocked ? getEventEmoji(event.title) : '❓'}</span>
              </div>
              <div className="codex-card-body">
                <h4 className="codex-card-name">
                  {entry.unlocked ? event.title : '???'}
                </h4>
                {entry.unlocked ? (
                  <>
                    <p className="codex-card-desc">{event.description}</p>
                    <p className="codex-card-trigger">触发次数: {entry.triggerCount}</p>
                    <p className="codex-card-choices">
                      选择分支: {Object.keys(entry.choicesMade).length} / {event.choices.length}
                    </p>
                  </>
                ) : (
                  <p className="codex-card-locked">🔒 尚未触发</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCompanionTab = () => (
    <div className="codex-tab-content">
      <div className="codex-progress-section">
        <div className="codex-progress-bar">
          <div className="codex-progress-fill" style={{ width: `${companionProgress.percentage}%` }} />
        </div>
        <span className="codex-progress-text">
          伙伴收集: {companionProgress.unlocked} / {companionProgress.total} ({companionProgress.percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="codex-grid">
        {COMPANIONS.map((companion) => {
          const entry = getCompanionCodexEntry(companion.id);
          const owned = ownedCompanions.find((c) => c.id === companion.id);
          return (
            <div
              key={companion.id}
              className={`codex-card ${!entry.unlocked ? 'locked' : ''} ${owned ? 'owned' : ''}`}
              style={{ borderColor: entry.unlocked ? RARITY_COLORS[companion.rarity] : undefined }}
            >
              <div className="codex-card-header">
                <span className="codex-card-avatar" style={{ backgroundColor: entry.unlocked ? RARITY_COLORS[companion.rarity] + '30' : '#374151' }}>
                  {entry.unlocked ? companion.name[0] : '?'}
                </span>
              </div>
              <div className="codex-card-body">
                <h4 className="codex-card-name" style={{ color: entry.unlocked ? RARITY_COLORS[companion.rarity] : undefined }}>
                  {entry.unlocked ? companion.name : '???'}
                </h4>
                {entry.unlocked ? (
                  <>
                    <p className="codex-card-rarity">{RARITY_NAMES[companion.rarity]} · {companion.race} {companion.class}</p>
                    <p className="codex-card-desc">{companion.description}</p>
                    {owned && <span className="codex-owned-badge">✅ 已拥有</span>}
                  </>
                ) : (
                  <p className="codex-card-locked">🔒 尚未招募</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRebirthTab = () => {
    const records = getRebirthRecords();
    return (
      <div className="codex-tab-content">
        <div className="rebirth-records-header">
          <h3>🔄 转生记录</h3>
          <p>共 {records.length} 次转生</p>
        </div>
        {records.length === 0 ? (
          <div className="codex-empty-state">
            <p>暂无转生记录</p>
            <p className="codex-empty-hint">达到 30 级后可以进行转生</p>
          </div>
        ) : (
          <div className="rebirth-records-list">
            {[...records].reverse().map((record) => (
              <div key={record.id} className="rebirth-record-card">
                <div className="rebirth-record-header">
                  <span className="rebirth-record-number">第 {record.rebirthCount} 次转生</span>
                  <span className="rebirth-record-date">
                    {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="rebirth-record-stats">
                  <div className="rebirth-record-stat">
                    <span className="stat-label">等级</span>
                    <span className="stat-value">Lv.{record.level}</span>
                  </div>
                  <div className="rebirth-record-stat">
                    <span className="stat-label">魂珠获得</span>
                    <span className="stat-value">💎 {record.soulOrbsGained}</span>
                  </div>
                  <div className="rebirth-record-stat">
                    <span className="stat-label">永久加成</span>
                    <span className="stat-value">+{record.totalRebirthBonus}</span>
                  </div>
                </div>
                {record.bonusesPurchased.length > 0 && (
                  <div className="rebirth-record-bonuses">
                    <span className="bonuses-label">选择的加成:</span>
                    <div className="bonuses-list">
                      {record.bonusesPurchased.map((bonusId) => (
                        <span key={bonusId} className="bonus-tag">{bonusId}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="codex-panel panel">
      <h2 className="panel-title">📖 图鉴收集</h2>
      <div className="codex-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`codex-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="codex-tab-count">
              {tab.count.unlocked}/{tab.count.total}
            </span>
          </button>
        ))}
      </div>
      <div className="codex-content">
        {activeTab === 'monster' && renderMonsterTab()}
        {activeTab === 'event' && renderEventTab()}
        {activeTab === 'companion' && renderCompanionTab()}
        {activeTab === 'rebirth' && renderRebirthTab()}
      </div>
      <div className="rebirth-info">
        <p>当前转生次数: {player.rebirthCount}</p>
        <p>累计永久加成: +{player.totalRebirthBonus}</p>
      </div>
    </div>
  );
}
