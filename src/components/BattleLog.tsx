import { useGameStore } from '../game/store';

export default function BattleLog() {
  const { battleLogs } = useGameStore();

  const getLogColor = (type: string) => {
    switch (type) {
      case 'damage': return 'log-damage';
      case 'heal': return 'log-heal';
      case 'exp': return 'log-exp';
      case 'gold': return 'log-gold';
      case 'levelup': return 'log-levelup';
      case 'event': return 'log-event';
      case 'system': return 'log-system';
      case 'reputation': return 'log-reputation';
      case 'skill': return 'log-skill';
      case 'phase': return 'log-phase';
      case 'mp': return 'log-mp';
      case 'dodge': return 'log-dodge';
      case 'critical': return 'log-critical';
      default: return '';
    }
  };

  return (
    <div className="battle-log">
      <div className="battle-log-header">
        <h4>📜 战斗日志</h4>
      </div>
      <div className="battle-log-content">
        {battleLogs.length === 0 ? (
          <p className="log-empty">暂无战斗记录...</p>
        ) : (
          battleLogs.map((log) => (
            <div key={log.id} className={`log-item ${getLogColor(log.type)}`}>
              <span className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
