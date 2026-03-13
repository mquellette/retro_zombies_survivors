import { GAME_W, GAME_H, TILE } from '../constants.js'
import { CONFIG } from '../config.js'
import { COL } from '../constants.js'
import { rnd, rndInt } from '../utils.js'

let _nextId = 1

export function createPlayer() {
  const c = CONFIG.player
  return {
    id: _nextId++,
    x: GAME_W / 2,
    y: GAME_H / 2,
    w: 16,
    h: 16,
    speed: c.speed * TILE,
    hp: c.hp,
    maxHp: c.hp,
    armor: 0,
    xp: 0,
    level: 1,
    kills: 0,
    coins: 0,
    speedMul: 1,
    damageMul: 1,
    atkSpeedMul: 1,
    dir: 0,
    weapons: [{ id: 'bat', level: 1, timer: 0 }],
  }
}

// Generic projectile factory
export function createProjectile(type, x, y, props) {
  return {
    id: _nextId++,
    type,
    x, y,
    w: props.w || 6,
    h: props.h || 6,
    life: props.life ?? 2,
    damage: props.damage || 0,
    ...props,
  }
}

// Backward-compatible bullet helper
export function createBullet(x, y, tx, ty, damage, speed, pierce) {
  const spd = speed || 200
  const dx = tx - x
  const dy = ty - y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return createProjectile('bullet', x, y, {
    vx: (dx / len) * spd,
    vy: (dy / len) * spd,
    damage,
    life: 2,
    w: 6, h: 6,
    pierce: pierce || 0,
    hitIds: [],
  })
}

const ENEMY_COLORS = {
  zombie: COL.enemy,
  fast: '#ff88ff',
  big: COL.enemyBig,
}

export function createEnemy(x, y, type, elite) {
  const c = CONFIG.enemies[type] || CONFIG.enemies.zombie
  const isElite = elite || false
  const hpMul = isElite ? 2 : 1
  const dmgMul = isElite ? 1.5 : 1
  const xpMul = isElite ? 2 : 1
  return {
    id: _nextId++,
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
    dir: 0,
    gender: Math.random() < 0.5 ? 'male' : 'female',
  }
}

export function createGem(x, y, value) {
  return {
    id: _nextId++,
    x, y,
    w: 12, h: 12,
    value: value || 1,
    magnetSpeed: 150,
  }
}

export function createDisk(x, y) {
  return {
    id: _nextId++,
    x, y,
    w: 12, h: 12,
    magnetSpeed: 120,
  }
}

export function createCola(x, y, heal) {
  return {
    id: _nextId++,
    x, y,
    w: 12, h: 12,
    heal: heal || 15,
    magnetSpeed: 120,
  }
}
