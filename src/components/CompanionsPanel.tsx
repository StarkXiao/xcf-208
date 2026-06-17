import { useGameStore } from '../game/store';
import { COMPANIONS, RARITY_COLORS, RARITY_NAMES } from '../game/data';

export default function CompanionsPanel() {
  const { ownedCompanions, buyCompanion, player } = useGameStore();

  const isOwned = (companionId: string) => {
    return ownedCompanions.some((c) => c.id === companionId);
  };

  const canAfford = (cost: number) => {
    return player.stats.gold >= cost;
  };

  const handleBuy = (companionId: string) => {
    buyCompanion(companionId);
  };

  const totalAttack = ownedCompanions.reduce((sum, c) => sum + c.attack * c.level, 0);
  const totalDefense = ownedCompanions.reduce((sum, c) => sum + c.defense * c.level, 0);

  return (
    <div className="companions-panel">
      <div className="companions-header">
        <h3>🤝 伙伴招募</h3>
        <p className="companions-gold">💰 {player.stats.gold.toLocaleString()}</p>
      </div>

      {ownedCompanions.length > 0 && (
        <div className="owned-companions-section">
          <h4>我的伙伴</h4>
          <div className="companion-stats-summary">
            <span>总攻击: +{totalAttack}</span>
            <span>总防御: +{totalDefense}</span>
          </div>
          <div className="owned-companions-list">
            {ownedCompanions.map((companion) => (
              <div 
                key={companion.id} 
                className="companion-card owned"
                style={{ borderColor: RARITY_COLORS[companion.rarity] }}
              >
                <div 
                  className="companion-avatar"
                  style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                >
                  <span>{companion.name[0]}</span>
                </div>
                <div className="companion-info">
                  <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                    {companion.name}
                  </h5>
                  <p className="companion-rarity">
                    {RARITY_NAMES[companion.rarity]} · {companion.race} {companion.class}
                  </p>
                  <div className="companion-stats">
                    <span>Lv.{companion.level}</span>
                    <span>⚔️ {companion.attack * companion.level}</span>
                    <span>🛡️ {companion.defense * companion.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="recruit-section">
        <h4>可招募伙伴</h4>
        <div className="recruit-list">
          {COMPANIONS.map((companion) => {
            const owned = isOwned(companion.id);
            const affordable = canAfford(companion.cost);
            
            return (
              <div 
                key={companion.id} 
                className={`companion-card recruit ${owned ? 'owned' : ''} ${!affordable && !owned ? 'unaffordable' : ''}`}
                style={{ borderColor: RARITY_COLORS[companion.rarity] }}
              >
                <div 
                  className="companion-avatar"
                  style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '30' }}
                >
                  <span>{companion.name[0]}</span>
                </div>
                <div className="companion-info">
                  <h5 style={{ color: RARITY_COLORS[companion.rarity] }}>
                    {companion.name}
                  </h5>
                  <p className="companion-rarity">
                    {RARITY_NAMES[companion.rarity]} · {companion.race} {companion.class}
                  </p>
                  <p className="companion-desc">{companion.description}</p>
                  <div className="companion-stats">
                    <span>⚔️ {companion.attack}</span>
                    <span>🛡️ {companion.defense}</span>
                  </div>
                </div>
                <div className="companion-action">
                  {owned ? (
                    <button className="owned-btn" disabled>
                      ✅ 已拥有
                    </button>
                  ) : (
                    <button
                      className={`buy-btn ${affordable ? '' : 'disabled'}`}
                      onClick={() => handleBuy(companion.id)}
                      disabled={!affordable}
                    >
                      💰 {companion.cost.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
