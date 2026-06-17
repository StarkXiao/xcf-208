import { useGameStore } from '../game/store';
import { COMPANIONS, RARITY_COLORS, RARITY_NAMES, REPUTATION_LEVELS, BONDS, STAR_UP_CONFIGS, FORMATION_SLOT_CONFIG } from '../game/data';

export default function CompanionsPanel() {
  const {
    ownedCompanions,
    buyCompanion,
    player,
    getDiscountedCompanionCost,
    canRecruitCompanion,
    mapAreas,
    formation,
    setFormationSlot,
    getCompanionEffectiveAttack,
    getCompanionEffectiveDefense,
    getBondBonus,
  } = useGameStore();

  const isOwned = (companionId: string) => {
    return ownedCompanions.some((c) => c.id === companionId);
  };

  const formationAttack = ownedCompanions
    .filter((c) => formation.slots.some((s) => s.companionId === c.id))
    .reduce((sum, c) => sum + getCompanionEffectiveAttack(c), 0);
  const formationDefense = ownedCompanions
    .filter((c) => formation.slots.some((s) => s.companionId === c.id))
    .reduce((sum, c) => sum + getCompanionEffectiveDefense(c), 0);
  const bondBonus = getBondBonus();

  const activeBonds = BONDS.filter((b) => formation.activeBondIds.includes(b.id));

  const handleFormationSlotClick = (slotIndex: number) => {
    const slot = formation.slots.find((s) => s.index === slotIndex);
    if (!slot || !slot.unlocked) return;
    if (slot.companionId !== null) {
      setFormationSlot(slotIndex, null);
    }
  };

  const handleCompanionDragToSlot = (slotIndex: number, companionId: string) => {
    setFormationSlot(slotIndex, companionId);
  };

  return (
    <div className="companions-panel">
      <div className="companions-header">
        <h3>🤝 伙伴成长</h3>
        <p className="companions-gold">💰 {player.stats.gold.toLocaleString()}</p>
      </div>

      <div className="formation-section">
        <h4>⚔️ 战斗编队</h4>
        <p className="formation-hint">
          编队中的伙伴将在战斗中为你出战，已解锁 {formation.slots.filter((s) => s.unlocked).length}/{formation.slots.length} 位
        </p>
        <div className="formation-slots-grid">
          {FORMATION_SLOT_CONFIG.map((cfg) => {
            const slot = formation.slots.find((s) => s.index === cfg.index);
            const isUnlocked = slot?.unlocked ?? false;
            const companion = slot?.companionId
              ? ownedCompanions.find((c) => c.id === slot.companionId)
              : null;

            return (
              <div
                key={cfg.index}
                className={`formation-slot ${!isUnlocked ? 'locked' : ''} ${companion ? 'filled' : 'empty'}`}
                onClick={() => isUnlocked && handleFormationSlotClick(cfg.index)}
              >
                {!isUnlocked ? (
                  <>
                    <span className="slot-lock-icon">🔒</span>
                    <span className="slot-unlock-level">Lv.{cfg.unlockLevel}</span>
                  </>
                ) : companion ? (
                  <>
                    <div
                      className="slot-avatar"
                      style={{ backgroundColor: RARITY_COLORS[companion.rarity] + '40', borderColor: RARITY_COLORS[companion.rarity] }}
                    >
                      {companion.name[0]}
                    </div>
                    <span className="slot-name">{companion.name}</span>
                    <span className="slot-stars">
                      {Array.from({ length: companion.stars }).map((_, i) => (
                        <span key={i} className="star-filled">★</span>
                      ))}
                    </span>
                    <div className="slot-drop-hint">点击移除</div>
                  </>
                ) : (
                  <>
                    <span className="slot-empty-icon">+</span>
                    <span className="slot-empty-text">空位</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="formation-stats-summary">
          <span>⚔️ 编队攻击: {formationAttack + bondBonus.attack}{bondBonus.attack > 0 ? ` (+${bondBonus.attack}羁绊)` : ''}</span>
          <span>🛡️ 编队防御: {formationDefense + bondBonus.defense}{bondBonus.defense > 0 ? ` (+${bondBonus.defense}羁绊)` : ''}</span>
        </div>

        {activeBonds.length > 0 && (
          <div className="active-bonds-section">
            <h5>🔗 激活羁绊</h5>
            <div className="active-bonds-list">
              {activeBonds.map((bond) => {
                const members = ownedCompanions.filter((c) => bond.memberIds.includes(c.id));
                const minStars = Math.min(...members.map((m) => m.stars));
                return (
                  <div key={bond.id} className="active-bond-card">
                    <span className="bond-icon">{bond.icon}</span>
                    <div className="bond-info">
                      <span className="bond-name">{bond.name} ({minStars}星)</span>
                      <span className="bond-desc">{bond.description}</span>
                      <div className="bond-bonus-list">
                        {bond.bonusPerStar.map((b, i) => (
                          <span key={i} className="bond-bonus-tag">
                            {b.type === 'attack' ? '⚔️' : b.type === 'defense' ? '🛡️' : b.type === 'hp' ? '❤️' : b.type === 'speed' ? '👟' : '🍀'}
                            +{b.value * minStars}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {ownedCompanions.length > 0 && (
        <div className="owned-companions-section">
          <h4>我的伙伴</h4>
          <p className="companions-hint">点击伙伴可加入编队空位 | 战斗可获得升星经验</p>
          <div className="owned-companions-list">
            {ownedCompanions.map((companion) => {
              const config = STAR_UP_CONFIGS.find((c) => c.rarity === companion.rarity) || STAR_UP_CONFIGS[0];
              const isInFormation = formation.slots.some((s) => s.companionId === companion.id);
              const effectiveAtk = getCompanionEffectiveAttack(companion);
              const effectiveDef = getCompanionEffectiveDefense(companion);
              const bond = companion.bondId ? BONDS.find((b) => b.id === companion.bondId) : null;
              const isMaxStar = companion.stars >= config.maxStars;
              const starProgress = isMaxStar ? 1 : companion.starExp / companion.starExpToNext;

              const emptySlot = formation.slots.find((s) => s.unlocked && s.companionId === null);

              return (
                <div
                  key={companion.id}
                  className={`companion-card owned ${isInFormation ? 'in-formation' : ''}`}
                  style={{ borderColor: RARITY_COLORS[companion.rarity] }}
                  onClick={() => {
                    if (!isInFormation && emptySlot) {
                      handleCompanionDragToSlot(emptySlot.index, companion.id);
                    }
                  }}
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
                      {isInFormation && <span className="in-formation-badge">⚔️ 出战</span>}
                    </h5>
                    <p className="companion-rarity">
                      {RARITY_NAMES[companion.rarity]} · {companion.race} {companion.class}
                    </p>
                    <div className="companion-stars">
                      {Array.from({ length: config.maxStars }).map((_, i) => (
                        <span key={i} className={`comp-star ${i < companion.stars ? 'filled' : ''}`}>★</span>
                      ))}
                      <span className="star-level">{companion.stars}/{config.maxStars}</span>
                    </div>
                    {!isMaxStar && (
                      <div className="star-exp-bar">
                        <div className="star-exp-fill" style={{ width: `${starProgress * 100}%` }} />
                        <span className="star-exp-text">{companion.starExp}/{companion.starExpToNext}</span>
                      </div>
                    )}
                    {isMaxStar && <span className="star-max-label">MAX</span>}
                    <div className="companion-stats">
                      <span>Lv.{companion.level}</span>
                      <span>⚔️ {effectiveAtk}</span>
                      <span>🛡️ {effectiveDef}</span>
                    </div>
                    {bond && (
                      <div className="companion-bond-info">
                        <span className="bond-tag">{bond.icon} {bond.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bonds-overview-section">
        <h4>🔗 羁绊图鉴</h4>
        <div className="bonds-overview-list">
          {BONDS.map((bond) => {
            const allOwned = bond.memberIds.every((id) => isOwned(id));
            const inFormation = allOwned && formation.activeBondIds.includes(bond.id);
            return (
              <div key={bond.id} className={`bond-overview-card ${inFormation ? 'active' : ''} ${!allOwned ? 'incomplete' : ''}`}>
                <span className="bond-ov-icon">{bond.icon}</span>
                <div className="bond-ov-info">
                  <span className="bond-ov-name">{bond.name}</span>
                  <span className="bond-ov-desc">{bond.description}</span>
                  <div className="bond-ov-members">
                    {bond.memberIds.map((mid) => {
                      const c = COMPANIONS.find((cc) => cc.id === mid);
                      const ownedC = isOwned(mid);
                      return c ? (
                        <span key={mid} className={`bond-member-tag ${ownedC ? 'owned' : 'missing'}`}>
                          {c.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="bond-ov-bonus">
                    {bond.bonusPerStar.map((b, i) => (
                      <span key={i} className="bond-bonus-preview">
                        {b.type === 'attack' ? '⚔️' : b.type === 'defense' ? '🛡️' : b.type === 'hp' ? '❤️' : b.type === 'speed' ? '👟' : '🍀'}
                        +{b.value}/星
                      </span>
                    ))}
                  </div>
                  {inFormation && <span className="bond-active-label">✅ 已激活</span>}
                  {!allOwned && <span className="bond-incomplete-label">🔒 需集齐伙伴</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="recruit-section">
        <h4>可招募伙伴</h4>
        <div className="recruit-list">
          {COMPANIONS.map((companion) => {
            const owned = isOwned(companion.id);
            const canRecruit = canRecruitCompanion(companion);
            const discountedCost = getDiscountedCompanionCost(companion);
            const affordable = player.stats.gold >= discountedCost;
            const hasDiscount = discountedCost < companion.cost;
            const repLocked = !canRecruit;
            const areaName = companion.areaId
              ? mapAreas.find((a) => a.id === companion.areaId)?.name
              : null;
            const requiredRepName = companion.minReputationLevel
              ? REPUTATION_LEVELS.find((rl) => rl.level === companion.minReputationLevel)?.name
              : null;
            const bond = companion.bondId ? BONDS.find((b) => b.id === companion.bondId) : null;

            return (
              <div
                key={companion.id}
                className={`companion-card recruit ${owned ? 'owned' : ''} ${!affordable && !owned ? 'unaffordable' : ''} ${repLocked ? 'rep-locked' : ''}`}
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
                  {areaName && (
                    <p className="companion-area">📍 {areaName}</p>
                  )}
                  {repLocked && requiredRepName && areaName && (
                    <p className="companion-rep-requirement">
                      🔒 需要声望: {areaName} - {requiredRepName}
                    </p>
                  )}
                  {!repLocked && companion.minReputationLevel && companion.minReputationLevel > 0 && areaName && (
                    <p className="companion-rep-unlocked">
                      ✅ {areaName}声望已达标
                    </p>
                  )}
                  <div className="companion-stats">
                    <span>⚔️ {companion.attack}</span>
                    <span>🛡️ {companion.defense}</span>
                  </div>
                  {bond && (
                    <p className="companion-bond-hint">{bond.icon} {bond.name}</p>
                  )}
                  {hasDiscount && !owned && (
                    <p className="companion-discount">
                      💰 折扣价: {discountedCost.toLocaleString()} <s>{companion.cost.toLocaleString()}</s>
                    </p>
                  )}
                </div>
                <div className="companion-action">
                  {owned ? (
                    <button className="owned-btn" disabled>
                      ✅ 已拥有
                    </button>
                  ) : (
                    <button
                      className={`buy-btn ${!affordable || repLocked ? 'disabled' : ''}`}
                      onClick={() => buyCompanion(companion.id)}
                      disabled={!affordable || repLocked}
                    >
                      💰 {hasDiscount ? discountedCost.toLocaleString() : companion.cost.toLocaleString()}
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
