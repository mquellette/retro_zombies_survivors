// ── Game Config (all tunable parameters) ──
const CONFIG = {
    // ── Player ──
    player: {
        hp: 100,
        speed: 2,               // tiles per second
        atkDamage: 10,
        atkSpeed: 1,             // shots per second
        atkRange: 120,           // pixels
        bulletSpeed: 200,        // pixels per second
        magnetRange: 40,         // XP gem pickup range
    },

    // ── Enemies ──
    enemies: {
        zombie: {
            hp: 20,
            speed: 1,            // tiles per second
            damage: 5,
            xp: 1,
            size: 16,
        },
        fast: {
            hp: 12,
            speed: 1.8,
            damage: 3,
            xp: 1,
            size: 14,
        },
        big: {
            hp: 60,
            speed: 0.6,
            damage: 10,
            xp: 3,
            size: 24,
        },
    },

    // ── Spawner ──
    spawner: {
        startInterval: 2,        // seconds between spawns
        minInterval: 0.5,        // minimum interval
        intervalDecay: 0.008,    // how fast interval decreases per second
        rampEvery: 30,           // add +1 enemy per spawn every N seconds
        // Spawn chances (after elapsed time thresholds)
        fastSpawnAfter: 60,      // seconds before fast enemies appear
        fastSpawnChance: 0.2,    // 20%
        bigSpawnAfter: 90,
        bigSpawnChance: 0.1,     // 10%
        eliteChance: 0.05,       // 5% chance any enemy spawns as elite (2x HP, 1.5x damage, 2x XP)
    },

    // ── Loot ──
    loot: {
        chestDropChance: 0.08,   // 8% chance enemy drops a chest
        chestHealMin: 10,
        chestHealMax: 30,
    },

    // ── Leveling ──
    leveling: {
        baseXp: 5,              // XP needed for level 2
        xpPerLevel: 5,          // additional XP per level
    },

    // ── Round ──
    round: {
        duration: 180,           // seconds
    },

    // ── Upgrades ──
    upgrades: [
        { id: 'maxHp',    name: 'Max HP +20',     icon: '♥',  apply(p) { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp); } },
        { id: 'atkSpeed', name: 'ATK Speed +15%',  icon: '⚡', apply(p) { p.atkSpeedMul += 0.15; } },
        { id: 'damage',   name: 'Damage +20%',     icon: '🗡', apply(p) { p.damageMul += 0.2; } },
        { id: 'speed',    name: 'Move Speed +10%',  icon: '👟', apply(p) { p.speedMul += 0.1; } },
        { id: 'heal',     name: 'Heal 30 HP',       icon: '✚', apply(p) { p.hp = Math.min(p.hp + 30, p.maxHp); } },
    ],
};
