// ── Game State ──
const Game = {
    player: null,
    bullets: [],
    enemies: [],
    gems: [],
    timer: 180,
    paused: false,
    state: 'playing',    // playing | levelup | gameover | victory

    // Level-up
    levelUpChoices: [],
    xpToNext: 5,

    // Camera (for future scrolling maps)
    camX: 0,
    camY: 0,

    init() {
        this.player = createPlayer();
        this.bullets = [];
        this.enemies = [];
        this.gems = [];
        this._zombieCache = null;
        this.timer = CONFIG.round.duration;
        this.paused = false;
        this.state = 'playing';
        this.xpToNext = CONFIG.leveling.baseXp;
        Spawner.reset();
    },

    update(dt) {
        if (this.state !== 'playing') return;

        const p = this.player;

        // ── Spawner ──
        Spawner.update(dt, this.enemies, p);

        // ── Timer ──
        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = 0;
            this.state = 'victory';
            return;
        }

        // ── Player movement ──
        const mx = Joystick.nx;
        const my = Joystick.ny;
        if (mx !== 0 || my !== 0) {
            // Normalize diagonal
            const len = Math.sqrt(mx * mx + my * my) || 1;
            const spd = p.speed * p.speedMul * dt;
            p.x += (mx / len) * spd;
            p.y += (my / len) * spd;
            p.facingX = mx;
            p.facingY = my;
            // Walk animation
            p.walkTimer = (p.walkTimer || 0) + dt;
            if (p.walkTimer >= 0.15) {  // ~6.7 FPS walk cycle
                p.walkTimer -= 0.15;
                p.walkFrame = ((p.walkFrame || 0) + 1) % 4;
            }
        } else {
            p.walkFrame = 0;
            p.walkTimer = 0;
        }
        // Clamp to bounds
        p.x = clamp(p.x, p.w / 2, GAME_W - p.w / 2);
        p.y = clamp(p.y, p.h / 2, GAME_H - p.h / 2);

        // ── Auto-attack ──
        p.atkTimer -= dt;
        if (p.atkTimer <= 0) {
            const target = this._findNearest(p, this.enemies, p.atkRange);
            if (target) {
                const dmg = p.atkDamage * p.damageMul;
                this.bullets.push(createBullet(p.x, p.y, target.x, target.y, dmg));
                p.atkTimer = 1 / (p.atkSpeed * p.atkSpeedMul);
            } else {
                p.atkTimer = 0.1; // Retry quickly
            }
        }

        // ── Bullets ──
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;
            if (b.life <= 0 || b.x < -20 || b.x > GAME_W + 20 || b.y < -20 || b.y > GAME_H + 20) {
                this.bullets.splice(i, 1);
                continue;
            }
            // Hit enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (rectCollide(b, this.enemies[j])) {
                    this.enemies[j].hp -= b.damage;
                    this.bullets.splice(i, 1);
                    if (this.enemies[j].hp <= 0) {
                        const e = this.enemies[j];
                        this.gems.push(createGem(e.x, e.y, e.xp));
                        // Chest drop chance
                        if (Math.random() < CONFIG.loot.chestDropChance) {
                            const heal = rndInt(CONFIG.loot.chestHealMin, CONFIG.loot.chestHealMax);
                            p.hp = Math.min(p.hp + heal, p.maxHp);
                        }
                        this.enemies.splice(j, 1);
                        p.kills++;
                    }
                    break;
                }
            }
        }

        // ── Enemies ──
        for (const e of this.enemies) {
            // Move toward player
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const mx = dx / d;
            const my = dy / d;
            e.x += mx * e.speed * dt;
            e.y += my * e.speed * dt;
            // Track facing direction and walk animation
            if (Math.abs(mx) > 0.01 || Math.abs(my) > 0.01) {
                e.facingX = mx;
                e.facingY = my;
            }
            e.walkTimer = (e.walkTimer || 0) + dt;
            if (e.walkTimer >= 0.15) {
                e.walkTimer -= 0.15;
                e.walkFrame = ((e.walkFrame || 0) + 1) % 4;
            }

            // Damage player on contact
            e.hitCooldown -= dt;
            if (e.hitCooldown <= 0 && rectCollide(e, p)) {
                p.hp -= e.damage;
                e.hitCooldown = 1;
                if (p.hp <= 0) {
                    p.hp = 0;
                    this.state = 'gameover';
                    return;
                }
            }
        }

        // ── XP Gems ──
        const magnetRange = CONFIG.player.magnetRange;
        for (let i = this.gems.length - 1; i >= 0; i--) {
            const g = this.gems[i];
            const d = dist(g, p);
            // Magnet effect
            if (d < magnetRange) {
                const dx = p.x - g.x;
                const dy = p.y - g.y;
                const len = d || 1;
                g.x += (dx / len) * g.magnetSpeed * dt;
                g.y += (dy / len) * g.magnetSpeed * dt;
            }
            // Pickup
            if (d < 10) {
                p.xp += g.value;
                this.gems.splice(i, 1);
                // Level up check
                if (p.xp >= this.xpToNext) {
                    p.xp -= this.xpToNext;
                    p.level++;
                    this.xpToNext = CONFIG.leveling.baseXp + (p.level - 1) * CONFIG.leveling.xpPerLevel;
                    this._triggerLevelUp();
                }
            }
        }
    },

    _findNearest(from, list, range) {
        let best = null;
        let bestDist = range;
        for (const e of list) {
            const d = dist(from, e);
            if (d < bestDist) {
                bestDist = d;
                best = e;
            }
        }
        return best;
    },

    _triggerLevelUp() {
        this.state = 'levelup';
        const shuffled = CONFIG.upgrades.slice().sort(() => Math.random() - 0.5);
        this.levelUpChoices = shuffled.slice(0, 3);
    },

    applyUpgrade(index) {
        if (index >= 0 && index < this.levelUpChoices.length) {
            this.levelUpChoices[index].apply(this.player);
        }
        this.state = 'playing';
        this.levelUpChoices = [];
    },

    // ── Draw ──
    draw(ctx) {
        // Background
        ctx.fillStyle = '#1f6b4a';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Gems
        for (const g of this.gems) {
            ctx.fillStyle = COL.xpGem;
            ctx.fillRect(g.x - g.w / 2, g.y - g.h / 2, g.w, g.h);
        }

        // Enemies
        const zombieImg = Assets.get('zombie_walk');
        if (zombieImg && !this._zombieCache) {
            this._zombieCache = Object.create(SpriteCache);
            this._zombieCache._grid = null;
            this._zombieCache.build(zombieImg, 40);
        }
        for (const e of this.enemies) {
            const zc = this._zombieCache;
            if (zc && zc._grid) {
                const dir = getDirFrame(e.facingX || 0, e.facingY || 1);
                const frame = zc.getFrame(dir, e.walkFrame || 0);
                if (frame) {
                    const dw = zc._drawW;
                    const dh = zc._drawH;
                    const ex = Math.round(e.x - frame.anchorX);
                    const ey = Math.round(e.y - dh / 2);
                    ctx.drawImage(frame.canvas, ex, ey, dw, dh);
                }
            } else {
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
            }
            // HP bar
            if (e.hp < e.maxHp) {
                const bw = e.w;
                const bh = 3;
                const bx = e.x - bw / 2;
                const by = e.y - e.h / 2 - 5;
                ctx.fillStyle = COL.hpBg;
                ctx.fillRect(bx, by, bw, bh);
                ctx.fillStyle = COL.hpBar;
                ctx.fillRect(bx, by, bw * (e.hp / e.maxHp), bh);
            }
        }

        // Bullets
        ctx.fillStyle = COL.bullet;
        for (const b of this.bullets) {
            ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        }

        // Player
        const p = this.player;
        const heroImg = Assets.get('hero_walk');
        if (heroImg) {
            // Build sprite cache at native device resolution (rebuild if dpr changes)
            const dpr = window._dpr || 1;
            if (!SpriteCache._grid || SpriteCache._builtDpr !== dpr) {
                SpriteCache.build(heroImg, 48);
            }
            const dir = getDirFrame(p.facingX, p.facingY);
            const animFrame = p.walkFrame || 0;
            const cached = SpriteCache.getFrame(dir, animFrame);
            if (cached) {
                const dw = SpriteCache._drawW;
                const dh = SpriteCache._drawH;
                // Position so player center aligns with foot anchor
                const dx = Math.round(p.x - cached.anchorX);
                const dy = Math.round(p.y - dh / 2);
                ctx.drawImage(cached.canvas, dx, dy, dw, dh);
            }
        } else {
            ctx.fillStyle = COL.player;
            ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
        }

        // HP bar under hero
        if (p.hp < p.maxHp) {
            const hpBarW = 28;
            const hpBarH = 3;
            const hpX = Math.round(p.x - hpBarW / 2);
            const hpY = Math.round(p.y + 18);
            ctx.fillStyle = '#440000';
            ctx.fillRect(hpX, hpY, hpBarW, hpBarH);
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(hpX, hpY, hpBarW * (p.hp / p.maxHp), hpBarH);
        }

        // Joystick
        Joystick.draw(ctx);

        // HUD
        this._drawHUD(ctx);

        // Overlays
        if (this.state === 'levelup') this._drawLevelUp(ctx);
        if (this.state === 'gameover') this._drawGameOver(ctx, false);
        if (this.state === 'victory') this._drawGameOver(ctx, true);
    },

    _drawHUD(ctx) {
        const p = this.player;
        const pad = 6;

        // ── XP Bar (full width, magenta) ──
        const barY = 4;
        const barH = 16;
        const barX = pad;
        const barW = GAME_W - pad * 2;
        // Background
        ctx.fillStyle = '#2a0a2a';
        ctx.fillRect(barX, barY, barW, barH);
        // Fill
        ctx.fillStyle = '#ff44ff';
        const xpFill = Math.min(p.xp / this.xpToNext, 1);
        ctx.fillRect(barX, barY, barW * xpFill, barH);
        // Border
        ctx.strokeStyle = '#6a1a6a';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
        // "LVL X" label right-aligned inside bar
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`LVL ${p.level}`, barX + barW - 4, barY + barH - 4);

        // ── Second row: ability slots | timer | kill/coin counters ──
        const rowY = barY + barH + 6;

        // Ability slots (4 gray squares, left side)
        const slotSize = 22;
        const slotGap = 4;
        ctx.fillStyle = '#5a6a5a';
        for (let i = 0; i < 4; i++) {
            const sx = pad + i * (slotSize + slotGap);
            ctx.fillRect(sx, rowY, slotSize, slotSize);
        }

        // Timer (centered)
        const elapsed = CONFIG.round.duration - this.timer;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, GAME_W / 2, rowY + 17);

        // Kill & coin counters (right side, with icons)
        const iconSize = 14;
        const counterX = GAME_W - pad;

        // Skull (kills) - top row
        const skullImg = Assets.get('skull_icon');
        ctx.textAlign = 'right';
        ctx.font = '10px monospace';
        ctx.fillStyle = '#ffffff';
        if (skullImg) {
            ctx.drawImage(skullImg, counterX - iconSize, rowY, iconSize, iconSize);
            ctx.fillText(`${p.kills}`, counterX - iconSize - 3, rowY + 11);
        } else {
            ctx.fillText(`☠${p.kills}`, counterX, rowY + 11);
        }

        // Coin - bottom row
        const coinImg = Assets.get('coin_icon');
        const coinY = rowY + iconSize + 3;
        if (coinImg) {
            ctx.drawImage(coinImg, counterX - iconSize, coinY, iconSize, iconSize);
            ctx.fillText(`${p.coins || 0}`, counterX - iconSize - 3, coinY + 11);
        } else {
            ctx.fillText(`●${p.coins || 0}`, counterX, coinY + 11);
        }

        ctx.textAlign = 'left';
    },

    _drawLevelUp(ctx) {
        // Dim overlay
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.fillStyle = COL.text;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL UP!', GAME_W / 2, 180);

        // Choice buttons
        const btnW = 200;
        const btnH = 50;
        const startY = 230;
        const gap = 15;

        for (let i = 0; i < this.levelUpChoices.length; i++) {
            const c = this.levelUpChoices[i];
            const bx = (GAME_W - btnW) / 2;
            const by = startY + i * (btnH + gap);

            ctx.fillStyle = COL.panelLt;
            ctx.fillRect(bx, by, btnW, btnH);
            ctx.strokeStyle = COL.xpBar;
            ctx.strokeRect(bx, by, btnW, btnH);

            ctx.fillStyle = COL.text;
            ctx.font = '11px monospace';
            ctx.fillText(c.name, GAME_W / 2, by + btnH / 2 + 4);
        }
        ctx.textAlign = 'left';
    },

    _drawGameOver(ctx, victory) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        const p = this.player;
        ctx.textAlign = 'center';
        ctx.fillStyle = victory ? '#00ff88' : '#ff4444';
        ctx.font = '20px monospace';
        ctx.fillText(victory ? 'VICTORY!' : 'GAME OVER', GAME_W / 2, 200);

        ctx.fillStyle = COL.text;
        ctx.font = '10px monospace';
        const elapsed = CONFIG.round.duration - this.timer;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        ctx.fillText(`Time: ${mins}:${secs.toString().padStart(2, '0')}`, GAME_W / 2, 250);
        ctx.fillText(`Kills: ${p.kills}`, GAME_W / 2, 270);
        ctx.fillText(`Level: ${p.level}`, GAME_W / 2, 290);

        // Retry button
        const btnW = 160;
        const btnH = 44;
        const bx = (GAME_W - btnW) / 2;
        const by = 330;
        ctx.fillStyle = COL.btn;
        ctx.fillRect(bx, by, btnW, btnH);
        ctx.fillStyle = COL.text;
        ctx.font = '14px monospace';
        ctx.fillText('RETRY', GAME_W / 2, by + btnH / 2 + 5);
        ctx.textAlign = 'left';
    },

    handleTap(x, y) {
        if (this.state === 'levelup') {
            const btnW = 200;
            const btnH = 50;
            const startY = 230;
            const gap = 15;
            const bx = (GAME_W - btnW) / 2;
            for (let i = 0; i < this.levelUpChoices.length; i++) {
                const by = startY + i * (btnH + gap);
                if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
                    this.applyUpgrade(i);
                    return true;
                }
            }
            return true; // consume tap
        }
        if (this.state === 'gameover' || this.state === 'victory') {
            const btnW = 160;
            const btnH = 44;
            const bx = (GAME_W - btnW) / 2;
            const by = 330;
            if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
                this.init();
                return true;
            }
            return true;
        }
        return false;
    }
};
