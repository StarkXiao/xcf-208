import { useGameStore } from '../game/store';
import type { EventEffect } from '../game/types';

export default function EventModal() {
  const { currentEvent, handleEventChoice, closeEvent, player } = useGameStore();

  if (!currentEvent) return null;

  const getEffectText = (effect: EventEffect) => {
    const sign = effect.value >= 0 ? '+' : '';
    switch (effect.type) {
      case 'gold':
        return `${sign}${effect.value} 💰金币`;
      case 'exp':
        return `${sign}${effect.value} ⭐经验`;
      case 'hp':
        return `${sign}${effect.value} ❤️生命`;
      case 'mp':
        return `${sign}${effect.value} 💙魔力`;
      case 'attack':
        return `${sign}${effect.value} ⚔️攻击`;
      case 'defense':
        return `${sign}${effect.value} 🛡️防御`;
      case 'soulOrbs':
        return `${sign}${effect.value} 💎魂珠`;
      default:
        return '';
    }
  };

  const canAffordChoice = (effects: EventEffect[]) => {
    for (const effect of effects) {
      if (effect.value < 0) {
        switch (effect.type) {
          case 'gold':
            if (player.stats.gold < Math.abs(effect.value)) return false;
            break;
          case 'exp':
            if (player.stats.exp < Math.abs(effect.value)) return false;
            break;
          case 'hp':
            if (player.stats.hp <= Math.abs(effect.value)) return false;
            break;
          default:
            break;
        }
      }
    }
    return true;
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <div className="event-modal-header">
          <h3>✨ {currentEvent.title}</h3>
        </div>
        
        <div className="event-modal-body">
          <p className="event-description">{currentEvent.description}</p>
          
          <div className="event-choices">
            {currentEvent.choices.map((choice) => {
              const affordable = canAffordChoice(choice.effects);
              return (
                <button
                  key={choice.id}
                  className={`event-choice-btn ${!affordable ? 'disabled' : ''}`}
                  onClick={() => affordable && handleEventChoice(choice.id)}
                  disabled={!affordable}
                >
                  <span className="choice-text">{choice.text}</span>
                  {choice.effects.length > 0 && (
                    <div className="choice-effects">
                      {choice.effects.map((effect, idx) => (
                        <span 
                          key={idx} 
                          className={`effect-tag ${effect.value >= 0 ? 'positive' : 'negative'}`}
                        >
                          {getEffectText(effect)}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button className="event-close-btn" onClick={closeEvent}>
          ✕ 关闭
        </button>
      </div>
    </div>
  );
}
