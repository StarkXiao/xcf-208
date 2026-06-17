import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../game/store';
import type { BattleLog } from '../game/types';

type LogTypeFilter = BattleLog['type'] | 'all';

interface FilterOption {
  key: LogTypeFilter;
  label: string;
  icon: string;
  color: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: '全部', icon: '📋', color: '#9ca3af' },
  { key: 'event', label: '事件', icon: '✨', color: '#60a5fa' },
  { key: 'drop', label: '掉落', icon: '🎁', color: '#fbbf24' },
  { key: 'levelup', label: '升级', icon: '🎉', color: '#a78bfa' },
  { key: 'critical', label: '暴击', icon: '💥', color: '#ff6b35' },
  { key: 'death', label: '死亡', icon: '💀', color: '#ef4444' },
];

const LOG_TYPE_COLORS: Record<BattleLog['type'], string> = {
  damage: 'log-damage',
  heal: 'log-heal',
  exp: 'log-exp',
  gold: 'log-gold',
  levelup: 'log-levelup',
  event: 'log-event',
  system: 'log-system',
  reputation: 'log-reputation',
  skill: 'log-skill',
  phase: 'log-phase',
  mp: 'log-mp',
  dodge: 'log-dodge',
  critical: 'log-critical',
  drop: 'log-drop',
  death: 'log-death',
};

export default function BattleLog() {
  const { battleLogs } = useGameStore();
  const [activeFilter, setActiveFilter] = useState<LogTypeFilter>('all');
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const logContentRef = useRef<HTMLDivElement>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reversedLogs = useMemo(() => [...battleLogs].reverse(), [battleLogs]);

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'all') return reversedLogs;
    return reversedLogs.filter((log) => log.type === activeFilter);
  }, [reversedLogs, activeFilter]);

  const displayLogs = useMemo(() => {
    if (!isReplaying) return filteredLogs;
    return filteredLogs.slice(0, replayIndex + 1);
  }, [filteredLogs, isReplaying, replayIndex]);

  const quickJumpTargets = useMemo(() => {
    const targets: Record<string, number> = {};
    FILTER_OPTIONS.forEach((opt) => {
      if (opt.key === 'all') return;
      const idx = reversedLogs.findIndex((log) => log.type === opt.key);
      if (idx !== -1) {
        targets[opt.key] = reversedLogs[idx].id;
      }
    });
    return targets;
  }, [reversedLogs]);

  useEffect(() => {
    if (isReplaying && replayIndex < filteredLogs.length - 1) {
      replayTimerRef.current = setTimeout(() => {
        setReplayIndex((prev) => prev + 1);
      }, 300);
    } else if (isReplaying && replayIndex >= filteredLogs.length - 1) {
      setIsReplaying(false);
    }

    return () => {
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
      }
    };
  }, [isReplaying, replayIndex, filteredLogs.length]);

  useEffect(() => {
    if (isReplaying && logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [replayIndex, isReplaying]);

  const handleFilterChange = (filter: LogTypeFilter) => {
    setActiveFilter(filter);
    setIsReplaying(false);
    setReplayIndex(0);
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
    }
  };

  const handleQuickJump = (type: string) => {
    const targetId = quickJumpTargets[type];
    if (targetId === undefined) return;

    setActiveFilter('all');
    setIsReplaying(false);
    setHighlightedId(targetId);

    setTimeout(() => {
      const element = document.getElementById(`log-item-${targetId}`);
      if (element && logContentRef.current) {
        const containerTop = logContentRef.current.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        logContentRef.current.scrollTop += elementTop - containerTop - 50;
      }
    }, 50);

    setTimeout(() => {
      setHighlightedId(null);
    }, 2000);
  };

  const handleStartReplay = () => {
    if (filteredLogs.length === 0) return;
    setIsReplaying(true);
    setReplayIndex(0);
  };

  const handlePauseReplay = () => {
    setIsReplaying(false);
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
    }
  };

  const handleResetReplay = () => {
    setIsReplaying(false);
    setReplayIndex(0);
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
    }
    if (logContentRef.current) {
      logContentRef.current.scrollTop = 0;
    }
  };

  const handleJumpToLatest = () => {
    setIsReplaying(false);
    setReplayIndex(filteredLogs.length - 1);
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  };

  const getLogTypeCount = (type: LogTypeFilter): number => {
    if (type === 'all') return reversedLogs.length;
    return reversedLogs.filter((log) => log.type === type).length;
  };

  return (
    <div className="battle-log">
      <div className="battle-log-header">
        <h4>📜 战斗日志</h4>
        <div className="battle-log-controls">
          {isReplaying ? (
            <button
              className="log-replay-btn pause"
              onClick={handlePauseReplay}
              title="暂停回放"
            >
              ⏸️
            </button>
          ) : (
            <button
              className="log-replay-btn play"
              onClick={handleStartReplay}
              title="回放日志"
              disabled={filteredLogs.length === 0}
            >
              ▶️
            </button>
          )}
          <button
            className="log-replay-btn reset"
            onClick={handleResetReplay}
            title="重置"
          >
            ⏮️
          </button>
          <button
            className="log-replay-btn latest"
            onClick={handleJumpToLatest}
            title="跳转最新"
          >
            ⏭️
          </button>
        </div>
      </div>

      <div className="log-filter-bar">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`log-filter-btn ${activeFilter === opt.key ? 'active' : ''}`}
            style={{
              borderColor: activeFilter === opt.key ? opt.color : undefined,
              color: activeFilter === opt.key ? opt.color : undefined,
            }}
            onClick={() => handleFilterChange(opt.key)}
            title={`${opt.label} (${getLogTypeCount(opt.key)})`}
          >
            <span className="filter-icon">{opt.icon}</span>
            <span className="filter-count">{getLogTypeCount(opt.key)}</span>
          </button>
        ))}
      </div>

      <div className="log-quick-jump-bar">
        <span className="quick-jump-label">快速定位:</span>
        {FILTER_OPTIONS.filter((o) => o.key !== 'all').map((opt) => (
          <button
            key={opt.key}
            className={`log-quick-jump-btn ${!quickJumpTargets[opt.key] ? 'disabled' : ''}`}
            style={{ color: opt.color }}
            onClick={() => handleQuickJump(opt.key)}
            disabled={!quickJumpTargets[opt.key]}
            title={quickJumpTargets[opt.key] ? `定位最新的${opt.label}` : `暂无${opt.label}记录`}
          >
            {opt.icon}
          </button>
        ))}
      </div>

      {isReplaying && (
        <div className="log-replay-progress">
          <div className="replay-progress-bar">
            <div
              className="replay-progress-fill"
              style={{
                width: `${filteredLogs.length > 0 ? ((replayIndex + 1) / filteredLogs.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="replay-progress-text">
            {replayIndex + 1} / {filteredLogs.length}
          </span>
        </div>
      )}

      <div className="battle-log-content" ref={logContentRef}>
        {displayLogs.length === 0 ? (
          <p className="log-empty">暂无战斗记录...</p>
        ) : (
          displayLogs.map((log, index) => (
            <div
              key={log.id}
              id={`log-item-${log.id}`}
              className={`log-item ${LOG_TYPE_COLORS[log.type] || ''} ${
                highlightedId === log.id ? 'log-highlight' : ''
              } ${isReplaying && index === replayIndex ? 'log-appear' : ''}`}
            >
              <span className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-type-badge">{LOG_TYPE_BADGE[log.type] || ''}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const LOG_TYPE_BADGE: Record<BattleLog['type'], string> = {
  damage: '⚔️',
  heal: '❤️',
  exp: '⭐',
  gold: '💰',
  levelup: '🎉',
  event: '✨',
  system: '📢',
  reputation: '🏛️',
  skill: '🔮',
  phase: '📊',
  mp: '💙',
  dodge: '💨',
  critical: '💥',
  drop: '🎁',
  death: '💀',
};
