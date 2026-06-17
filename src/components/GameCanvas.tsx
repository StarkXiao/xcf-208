import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
  color: string;
  isPlayer: boolean;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const playerYRef = useRef(200);
  const monsterYRef = useRef(200);
  const lastAttackTimeRef = useRef(0);
  const eventTriggerTimerRef = useRef(0);

  const {
    currentAreaId,
    mapAreas,
    currentMonster,
    setCurrentMonster,
    addExp,
    addGold,
    takeDamage,
    healHp,
    addBattleLog,
    getTotalAttack,
    getTotalDefense,
    isAutoBattle,
    triggerRandomEvent,
    player,
    getAreaDropBonus,
    addAreaReputation,
    addCompanionStarExp,
  } = useGameStore();

  const currentArea = mapAreas.find((a) => a.id === currentAreaId);

  const spawnMonster = () => {
    if (!currentArea || currentArea.monsters.length === 0) return;
    
    const monsters = currentArea.monsters;
    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    
    const levelBonus = 1 + (player.stats.level - 1) * 0.1;
    
    setCurrentMonster({
      id: monster.id,
      name: monster.name,
      hp: Math.floor(monster.hp * levelBonus),
      maxHp: Math.floor(monster.hp * levelBonus),
      attack: Math.floor(monster.attack * levelBonus),
      defense: Math.floor(monster.defense * levelBonus),
      expReward: Math.floor(monster.expReward * levelBonus),
      goldReward: Math.floor(monster.goldReward * levelBonus),
      color: monster.color,
    });
  };

  const addParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const addDamageNumber = (x: number, y: number, value: number, isPlayer: boolean) => {
    damageNumbersRef.current.push({
      x,
      y,
      value,
      life: 60,
      maxLife: 60,
      color: isPlayer ? '#ef4444' : '#fbbf24',
      isPlayer,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (!currentMonster && isAutoBattle) {
      spawnMonster();
    }

    const gameLoop = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (currentArea) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, currentArea.bgColor);
        gradient.addColorStop(1, darkenColor(currentArea.bgColor, 30));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        drawBackground(ctx, width, height, currentArea.bgColor);
      }

      const playerX = width * 0.2;
      const monsterX = width * 0.75;
      const groundY = height * 0.75;

      if (playerYRef.current < groundY - 50) {
        playerYRef.current += 2;
      }
      if (monsterYRef.current < groundY - 50) {
        monsterYRef.current += 2;
      }

      const playerBobY = Math.sin(timestamp * 0.003) * 3;
      drawPlayer(ctx, playerX, playerYRef.current + playerBobY);

      const formationCompanions = useGameStore.getState().getFormationCompanions();
      formationCompanions.forEach((companion, index) => {
        const compX = playerX - 40 - index * 30;
        const compY = groundY - 40 + Math.sin(timestamp * 0.003 + index) * 3;
        drawCompanion(ctx, compX, compY, companion.rarity, companion.stars);
      });

      if (currentMonster) {
        const monsterBobY = Math.sin(timestamp * 0.004) * 5;
        drawMonster(ctx, monsterX, monsterYRef.current + monsterBobY, currentMonster);

        const hpBarWidth = 80;
        const hpBarHeight = 8;
        const hpPercent = currentMonster.hp / currentMonster.maxHp;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(monsterX - hpBarWidth / 2, monsterYRef.current - 70, hpBarWidth, hpBarHeight);
        
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(monsterX - hpBarWidth / 2, monsterYRef.current - 70, hpBarWidth * hpPercent, hpBarHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(monsterX - hpBarWidth / 2, monsterYRef.current - 70, hpBarWidth, hpBarHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentMonster.name, monsterX, monsterYRef.current - 80);
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 1;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      damageNumbersRef.current = damageNumbersRef.current.filter((d) => {
        d.y -= 1.5;
        d.life -= 1;

        if (d.life <= 0) return false;

        ctx.globalAlpha = d.life / d.maxLife;
        ctx.fillStyle = d.color;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`-${d.value}`, d.x, d.y);
        ctx.fillText(`-${d.value}`, d.x, d.y);
        ctx.globalAlpha = 1;

        return true;
      });

      if (isAutoBattle && currentMonster && player.stats.hp > 0) {
        const attackInterval = 800 - Math.min(player.stats.speed * 20, 500);
        
        if (timestamp - lastAttackTimeRef.current > attackInterval) {
          lastAttackTimeRef.current = timestamp;

          const playerDamage = Math.max(1, getTotalAttack() - currentMonster.defense / 2);
          const actualDamage = Math.floor(playerDamage * (0.9 + Math.random() * 0.2));
          
          addParticles(monsterX, monsterYRef.current - 20, '#fbbf24', 8);
          addDamageNumber(monsterX + (Math.random() - 0.5) * 30, monsterYRef.current - 30, actualDamage, false);

          const newHp = currentMonster.hp - actualDamage;
          
          if (newHp <= 0) {
            addParticles(monsterX, monsterYRef.current - 20, currentMonster.color, 20);
            const dropBonus = getAreaDropBonus(currentAreaId);
            const expReward = Math.floor(currentMonster.expReward * (1 + dropBonus));
            const goldReward = Math.floor(currentMonster.goldReward * (1 + dropBonus));
            addExp(expReward);
            addGold(goldReward);
            const repGain = Math.max(1, Math.floor(currentMonster.expReward / 10));
            addAreaReputation(currentAreaId, repGain);
            addBattleLog(`击杀了 ${currentMonster.name}！获得 ${expReward} 经验, ${goldReward} 金币, ${repGain} 声望`, 'exp');

            const fc = useGameStore.getState().getFormationCompanions();
            fc.forEach((c) => {
              const starExp = Math.max(1, Math.floor(expReward * 0.08));
              addCompanionStarExp(c.id, starExp);
            });

            eventTriggerTimerRef.current += 1;
            if (eventTriggerTimerRef.current >= 5 && Math.random() < 0.3) {
              eventTriggerTimerRef.current = 0;
              setTimeout(() => triggerRandomEvent(), 500);
            }
            
            setTimeout(() => {
              spawnMonster();
              monsterYRef.current = 0;
            }, 500);
          } else {
            setCurrentMonster({ ...currentMonster, hp: newHp });
          }

          setTimeout(() => {
            const storeState = useGameStore.getState();
            if (!storeState.currentMonster) return;
            
            const monsterDamage = Math.max(1, storeState.currentMonster.attack - getTotalDefense() / 2);
            const actualMonsterDamage = Math.floor(monsterDamage * (0.9 + Math.random() * 0.2));
            
            addParticles(playerX, playerYRef.current - 20, '#ef4444', 6);
            addDamageNumber(playerX + (Math.random() - 0.5) * 20, playerYRef.current - 30, actualMonsterDamage, true);
            
            takeDamage(actualMonsterDamage);
            
            if (storeState.player.stats.hp - actualMonsterDamage <= 0) {
              addBattleLog('💀 你被击败了！正在恢复...', 'damage');
              setTimeout(() => {
                healHp(useGameStore.getState().player.stats.maxHp);
                spawnMonster();
              }, 1500);
            }
          }, 300);
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentArea, currentMonster, isAutoBattle]);

  useEffect(() => {
    if (isAutoBattle && !currentMonster) {
      spawnMonster();
    }
  }, [isAutoBattle, currentAreaId]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, bgColor: string) {
  const groundY = height * 0.75;
  
  ctx.fillStyle = darkenColor(bgColor, 20);
  ctx.fillRect(0, groundY, width, height - groundY);

  for (let i = 0; i < 5; i++) {
    const x = (width / 6) * (i + 1);
    const treeHeight = 60 + Math.random() * 40;
    
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(x - 5, groundY - treeHeight + 30, 10, treeHeight - 30);
    
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.moveTo(x, groundY - treeHeight);
    ctx.lineTo(x - 25, groundY - treeHeight + 50);
    ctx.lineTo(x + 25, groundY - treeHeight + 50);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 3; i++) {
    const cloudX = (width / 4) * i + 50;
    const cloudY = 50 + i * 30;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
    ctx.arc(cloudX + 20, cloudY - 5, 25, 0, Math.PI * 2);
    ctx.arc(cloudX + 40, cloudY, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(-15, -20, 30, 40);

  ctx.fillStyle = '#fdbf6f';
  ctx.beginPath();
  ctx.arc(0, -35, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4c1d95';
  ctx.beginPath();
  ctx.arc(0, -40, 16, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-5, -37, 2, 0, Math.PI * 2);
  ctx.arc(5, -37, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(15, -25, 5, 40);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(12, -5, 11, 5);

  ctx.fillStyle = '#3b267a';
  ctx.fillRect(-12, 20, 8, 15);
  ctx.fillRect(4, 20, 8, 15);

  ctx.restore();
}

function drawCompanion(ctx: CanvasRenderingContext2D, x: number, y: number, rarity: string, stars: number) {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = colors[rarity] || '#9ca3af';
  ctx.fillRect(-10, -15, 20, 25);

  ctx.fillStyle = '#fdbf6f';
  ctx.beginPath();
  ctx.arc(0, -25, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors[rarity] || '#9ca3af';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(0, -15, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (stars > 1) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    const starText = '★'.repeat(Math.min(stars, 5));
    ctx.fillText(starText, 0, 15);
  }

  ctx.restore();
}

function drawMonster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  monster: { color: string; name: string; hp: number; maxHp: number }
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = monster.color;
  ctx.beginPath();
  ctx.arc(0, -20, 35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-12, -25, 10, 0, Math.PI * 2);
  ctx.arc(12, -25, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-10, -25, 5, 0, Math.PI * 2);
  ctx.arc(14, -25, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, -5, 15, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-10, -5);
  ctx.lineTo(-5, 5);
  ctx.lineTo(0, -5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(5, 5);
  ctx.lineTo(10, -5);
  ctx.fill();

  ctx.restore();
}
