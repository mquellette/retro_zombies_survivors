// ── Player ──
function createPlayer() {
    return {
        x: GAME_W / 2,
        y: GAME_H / 2,
        w: 16,
        h: 16,
        speed: 2 * TILE,       // 2 tiles/sec → pixels/sec
        hp: 100,
        maxHp: 100,
        xp: 0,
        level: 1,
        kills: 0,
        // Attack
        atkDamage: 10,
        atkSpeed: 1,            // shots per second
        atkTimer: 0,
        atkRange: 120,
        // Upgrades
        speedMul: 1,
        damageMul: 1,
        atkSpeedMul: 1,
        // Direction for rendering
        facingX: 0,
        facingY: 1,
    };
}

// ── Bullet ──
function createBullet(x, y, tx, ty, damage) {
    const dx = tx - x;
    const dy = ty - y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
        x, y,
        w: 6, h: 6,
        vx: (dx / len) * 200,
        vy: (dy / len) * 200,
        damage,
        life: 2, // seconds
    };
}

// ── Enemy ──
function createEnemy(x, y, type) {
    const defs = {
        zombie: { w: 16, h: 16, speed: 1 * TILE, hp: 20, damage: 5, xp: 1, color: COL.enemy },
        fast:   { w: 14, h: 14, speed: 1.8 * TILE, hp: 12, damage: 3, xp: 1, color: '#ff88ff' },
        big:    { w: 24, h: 24, speed: 0.6 * TILE, hp: 60, damage: 10, xp: 3, color: COL.enemyBig },
    };
    const d = defs[type] || defs.zombie;
    return {
        x, y,
        w: d.w, h: d.h,
        speed: d.speed,
        hp: d.hp,
        maxHp: d.hp,
        damage: d.damage,
        xp: d.xp,
        color: d.color,
        type,
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
    interval: 2,        // seconds between spawns
    perSpawn: 1,
    elapsed: 0,

    update(dt, enemies, player) {
        this.elapsed += dt;
        this.timer -= dt;

        // Ramp difficulty every 30 seconds
        this.perSpawn = 1 + Math.floor(this.elapsed / 30);
        this.interval = Math.max(0.5, 2 - this.elapsed * 0.008);

        if (this.timer <= 0) {
            this.timer = this.interval;
            for (let i = 0; i < this.perSpawn; i++) {
                const pos = this._spawnPos(player);
                // Mix enemy types after some time
                let type = 'zombie';
                if (this.elapsed > 60 && Math.random() < 0.2) type = 'fast';
                if (this.elapsed > 90 && Math.random() < 0.1) type = 'big';
                enemies.push(createEnemy(pos.x, pos.y, type));
            }
        }
    },

    _spawnPos(player) {
        // Spawn outside visible area but not too far
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
        this.interval = 2;
        this.perSpawn = 1;
        this.elapsed = 0;
    }
};
