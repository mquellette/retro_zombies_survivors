export const CONFIG = {
  player: {
    hp: 100,
    speed: 2,
    atkDamage: 10,
    atkSpeed: 1,
    atkRange: 120,
    bulletSpeed: 200,
    magnetRange: 40,
  },

  enemies: {
    zombie: { hp: 20, speed: 1, damage: 5, xp: 1, size: 16 },
    fast:   { hp: 12, speed: 1.8, damage: 3, xp: 1, size: 14 },
    big:    { hp: 60, speed: 0.6, damage: 10, xp: 3, size: 24 },
  },

  spawner: {
    startInterval: 2,
    minInterval: 0.5,
    intervalDecay: 0.008,
    rampEvery: 30,
    fastSpawnAfter: 60,
    fastSpawnChance: 0.2,
    bigSpawnAfter: 90,
    bigSpawnChance: 0.1,
    eliteChance: 0.05,
  },

  loot: {
    chestDropChance: 0.08,
    chestHealMin: 10,
    chestHealMax: 30,
  },

  leveling: {
    baseXp: 5,
    xpPerLevel: 5,
  },

  round: {
    duration: 180,
  },

  upgrades: [
    { id: 'maxHp',    name: 'Max HP +20',      icon: '♥',  apply(p) { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp) } },
    { id: 'atkSpeed', name: 'ATK Speed +15%',   icon: '⚡', apply(p) { p.atkSpeedMul += 0.15 } },
    { id: 'damage',   name: 'Damage +20%',      icon: '🗡', apply(p) { p.damageMul += 0.2 } },
    { id: 'speed',    name: 'Move Speed +10%',   icon: '👟', apply(p) { p.speedMul += 0.1 } },
    { id: 'heal',     name: 'Heal 30 HP',        icon: '✚', apply(p) { p.hp = Math.min(p.hp + 30, p.maxHp) } },
  ],
}
