// ── Player ──
function createPlayer() {
    const c = CONFIG.player;
    return {
        x: GAME_W / 2,
        y: GAME_H / 2,
        w: 16,
        h: 16,
        speed: c.speed * TILE,
        hp: c.hp,
        maxHp: c.hp,
        xp: 0,
        level: 1,
        kills: 0,
        atkDamage: c.atkDamage,
        atkSpeed: c.atkSpeed,
        atkTimer: 0,
        atkRange: c.atkRange,
        speedMul: 1,
        damageMul: 1,
        atkSpeedMul: 1,
        facingX: 0,
        facingY: 1,
    };
}

// ── Bullet ──
function createBullet(x, y, tx, ty, damage) {
    const spd = CONFIG.player.bulletSpeed;
    const dx = tx - x;
    const dy = ty - y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
        x, y,
        w: 6, h: 6,
        vx: (dx / len) * spd,
        vy: (dy / len) * spd,
        damage,
        life: 2,
    };
}

// ── Enemy ──
const ENEMY_COLORS = {
    zombie: COL.enemy,
    fast: '#ff88ff',
    big: COL.enemyBig,
};

function createEnemy(x, y, type, elite) {
    const c = CONFIG.enemies[type] || CONFIG.enemies.zombie;
    const s = CONFIG.spawner;
    const isElite = elite || false;
    const hpMul = isElite ? 2 : 1;
    const dmgMul = isElite ? 1.5 : 1;
    const xpMul = isElite ? 2 : 1;
    return {
        x, y,
        w: c.size, h: c.size,
        speed: c.speed * TILE,
        hp: c.hp * hpMul,
        maxHp: c.hp * hpMul,
        damage: c.damage * dmgMul,
        xp: c.xp * xpMul,
        color: ENEMY_COLORS[type] || COL.enemy,
        type,
        elite: isElite,
        hitCooldown: 0,
    };
}

// ── XP Gem ──
function createGem(x, y, value) {
    return {
        x, y,
        w: 8, h: 8,
        value: value || 1,
        magnetSpeed: 150,
    };
}

// ── Spawn logic ──
const Spawner = {
    timer: 0,
    interval: 2,
    perSpawn: 1,
    elapsed: 0,

    update(dt, enemies, player) {
        const s = CONFIG.spawner;
        this.elapsed += dt;
        this.timer -= dt;

        this.perSpawn = 1 + Math.floor(this.elapsed / s.rampEvery);
        this.interval = Math.max(s.minInterval, s.startInterval - this.elapsed * s.intervalDecay);

        if (this.timer <= 0) {
            this.timer = this.interval;
            for (let i = 0; i < this.perSpawn; i++) {
                const pos = this._spawnPos(player);
                let type = 'zombie';
                if (this.elapsed > s.fastSpawnAfter && Math.random() < s.fastSpawnChance) type = 'fast';
                if (this.elapsed > s.bigSpawnAfter && Math.random() < s.bigSpawnChance) type = 'big';
                const elite = Math.random() < s.eliteChance;
                enemies.push(createEnemy(pos.x, pos.y, type, elite));
            }
        }
    },

    _spawnPos(player) {
        const margin = 40;
        const side = rndInt(0, 3);
        let x, y;
        switch (side) {
            case 0: x = rnd(-margin, GAME_W + margin); y = -margin; break;
            case 1: x = rnd(-margin, GAME_W + margin); y = GAME_H + margin; break;
            case 2: x = -margin; y = rnd(-margin, GAME_H + margin); break;
            case 3: x = GAME_W + margin; y = rnd(-margin, GAME_H + margin); break;
        }
        return { x, y };
    },

    reset() {
        this.timer = 0;
        this.interval = CONFIG.spawner.startInterval;
        this.perSpawn = 1;
        this.elapsed = 0;
    }
};
