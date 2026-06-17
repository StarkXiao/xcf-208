import type { ReactNode } from 'react';
import { useGameStore } from '../game/store';
import { REPUTATION_LEVELS, COMPANIONS, MAP_AREAS } from '../game/data';
import { MAP_MODIFIER_ICONS } from '../game/types';
import type { EventEffect, EventConsequence, MapAreaModifier } from '../game/types';

export default function EventModal() {
  const { currentEvent, handleEventChoice, closeEvent, player, currentAreaId, getAreaEventBonus, ownedCompanions } = useGameStore();

  if (!currentEvent) return null;

  const isAreaEvent = !!currentEvent.areaId;
  const repLevel = useGameStore.getState().getAreaReputationLevel(currentAreaId);
  const repData = REPUTATION_LEVELS.find((rl) => rl.level === repLevel) || REPUTATION_LEVELS[0];

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
      case 'speed':
        return `${sign}${effect.value} 👟速度`;
      case 'luck':
        return `${sign}${effect.value} 🍀幸运`;
      case 'soulOrbs':
        return `${sign}${effect.value} 💎魂珠`;
      case 'reputation':
        return `${sign}${effect.value} 🏛️声望`;
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

  const getCompanionName = (companionId: string) => {
    const c = COMPANIONS.find((comp) => comp.id === companionId);
    return c?.name || companionId;
  };

  const isCompanionOwned = (companionId: string) => {
    return ownedCompanions.some((c) => c.id === companionId);
  };

  const getAreaName = (areaId: string) => {
    const area = MAP_AREAS.find((a) => a.id === areaId);
    return area?.name || areaId;
  };

  const getMapModifierIcon = (mod: MapAreaModifier) => {
    return MAP_MODIFIER_ICONS[mod.type] || '📌';
  };

  const renderConsequencePreview = (csq: EventConsequence) => {
    const parts: ReactNode[] = [];

    if (csq.tags && csq.tags.length > 0) {
      parts.push(
        <div key="tags" className="consequence-tags">
          <span className="consequence-label">🏷️ 获得印记</span>
          <div className="consequence-tag-list">
            {csq.tags.map((tag) => (
              <span key={tag} className="consequence-tag-item">{tag}</span>
            ))}
          </div>
        </div>
      );
    }

    if (csq.companionAffinity && csq.companionAffinity.length > 0) {
      parts.push(
        <div key="affinity" className="consequence-affinity">
          <span className="consequence-label">💛 伙伴好感变化</span>
          <div className="consequence-affinity-list">
            {csq.companionAffinity.map((ca) => {
              const owned = isCompanionOwned(ca.companionId);
              return (
                <span
                  key={ca.companionId}
                  className={`consequence-affinity-item ${ca.value > 0 ? 'positive' : 'negative'} ${!owned ? 'not-owned' : ''}`}
                >
                  {getCompanionName(ca.companionId)} {ca.value > 0 ? '+' : ''}{ca.value}
                  {!owned && ' (未拥有)'}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    if (csq.mapModifiers && csq.mapModifiers.length > 0) {
      parts.push(
        <div key="map" className="consequence-map">
          <span className="consequence-label">🗺️ 地图状态变化</span>
          <div className="consequence-map-list">
            {csq.mapModifiers.map((mod, i) => (
              <span
                key={i}
                className={`consequence-map-item ${mod.type === 'hazard' || mod.type === 'cursed' ? 'negative' : 'positive'}`}
              >
                {getMapModifierIcon(mod)} {getAreaName(mod.areaId)} - {mod.name}
                {mod.effect && (
                  <span className="consequence-map-effect">
                    ({mod.effect.stat} {mod.effect.value > 0 ? '+' : ''}{mod.effect.value})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (csq.eventWeights && csq.eventWeights.length > 0) {
      parts.push(
        <div key="weights" className="consequence-weights">
          <span className="consequence-label">🎲 后续事件影响</span>
          <div className="consequence-weight-list">
            {csq.eventWeights.map((ew, i) => (
              <span
                key={i}
                className={`consequence-weight-item ${ew.delta > 0 ? 'positive' : 'negative'}`}
              >
                {ew.delta > 0 ? '⬆️' : '⬇️'} {ew.reason}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return parts.length > 0 ? <div className="consequence-preview">{parts}</div> : null;
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <div className="event-modal-header">
          <h3>✨ {currentEvent.title}</h3>
        </div>

        {isAreaEvent && (
          <div className="event-rep-info" style={{ borderColor: repData.color }}>
            <span>🏛️ 区域声望事件</span>
            <span style={{ color: repData.color }}>{repData.name}</span>
            <span>事件加成: +{(getAreaEventBonus(currentAreaId) * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="event-modal-body">
          <p className="event-description">{currentEvent.description}</p>

          <div className="event-choices">
            {currentEvent.choices.map((choice) => {
              const affordable = canAffordChoice(choice.effects);
              const hasConsequences = choice.consequences && (
                (choice.consequences.tags && choice.consequences.tags.length > 0) ||
                (choice.consequences.companionAffinity && choice.consequences.companionAffinity.length > 0) ||
                (choice.consequences.mapModifiers && choice.consequences.mapModifiers.length > 0) ||
                (choice.consequences.eventWeights && choice.consequences.eventWeights.length > 0)
              );
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
                  {hasConsequences && choice.consequences && (
                    renderConsequencePreview(choice.consequences)
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
