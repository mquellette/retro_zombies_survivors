import { GAME_W, GAME_H } from '../constants.js'
import { CONFIG } from '../config.js'
import { dist, clamp, rndInt, rectCollide } from '../utils.js'
import { getDirFrame } from '../direction.js'
import { joystick } from '../input/joystick.js'
import { gameStore } from '../store/gameStore.js'
import { createPlayer, createBullet, createGem } from './entities.js'
import { spawner } from './spawner.js'

// Internal game arrays — NOT in Vue reactive store (PixiJS reads these directly)
export let player = null
export let bullets = []
export let enemies = []
export let gems = []

export function init() {
  player = createPlayer()
  bullets = []
  enemies = []
  gems = []
  spawner.reset()

  // Sync to store
  gameStore.gameState = 'playing'
  gameStore.timer = CONFIG.round.duration
  gameStore.elapsed = 0
  gameStore.xpToNext = CONFIG.leveling.baseXp
  gameStore.levelUpChoices = []
  _syncStore()
}

export function update(dt) {
  if (gameStore.gameState !== 'playing') return

  const p = player

  // Spawner
  spawner.update(dt, enemies, p)

  // Timer
  gameStore.timer -= dt
  gameStore.elapsed += dt
  if (gameStore.timer <= 0) {
    gameStore.timer = 0
    gameStore.gameState = 'victory'
    _syncStore()
    return
  }

  // Player movement
  const mx = joystick.nx
  const my = joystick.ny
  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my) || 1
    const spd = p.speed * p.speedMul * dt
    p.x += (mx / len) * spd
    p.y += (my / len) * spd
    p.dir = getDirFrame(mx, my, p.dir)
  }
  p.x = clamp(p.x, p.w / 2, GAME_W - p.w / 2)
  p.y = clamp(p.y, p.h / 2, GAME_H - p.h / 2)

  // Auto-attack
  p.atkTimer -= dt
  if (p.atkTimer <= 0) {
    const target = _findNearest(p, enemies, p.atkRange)
    if (target) {
      const dmg = p.atkDamage * p.damageMul
      bullets.push(createBullet(p.x, p.y, target.x, target.y, dmg))
      p.atkTimer = 1 / (p.atkSpeed * p.atkSpeedMul)
    } else {
      p.atkTimer = 0.1
    }
  }

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]
    b.x += b.vx * dt
    b.y += b.vy * dt
    b.life -= dt
    if (b.life <= 0 || b.x < -20 || b.x > GAME_W + 20 || b.y < -20 || b.y > GAME_H + 20) {
      bullets.splice(i, 1)
      continue
    }
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (rectCollide(b, enemies[j])) {
        enemies[j].hp -= b.damage
        bullets.splice(i, 1)
        if (enemies[j].hp <= 0) {
          const e = enemies[j]
          gems.push(createGem(e.x, e.y, e.xp))
          if (Math.random() < CONFIG.loot.chestDropChance) {
            const heal = rndInt(CONFIG.loot.chestHealMin, CONFIG.loot.chestHealMax)
            p.hp = Math.min(p.hp + heal, p.maxHp)
          }
          enemies.splice(j, 1)
          p.kills++
        }
        break
      }
    }
  }

  // Enemies
  for (const e of enemies) {
    const dx = p.x - e.x
    const dy = p.y - e.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    const emx = dx / d
    const emy = dy / d
    e.x += emx * e.speed * dt
    e.y += emy * e.speed * dt
    if (Math.abs(emx) > 0.01 || Math.abs(emy) > 0.01) {
      e.dir = getDirFrame(emx, emy, e.dir)
    }

    e.hitCooldown -= dt
    if (e.hitCooldown <= 0 && rectCollide(e, p)) {
      p.hp -= e.damage
      e.hitCooldown = 1
      if (p.hp <= 0) {
        p.hp = 0
        gameStore.gameState = 'gameover'
        _syncStore()
        return
      }
    }
  }

  // XP Gems
  const magnetRange = CONFIG.player.magnetRange
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i]
    const d = dist(g, p)
    if (d < magnetRange) {
      const dx = p.x - g.x
      const dy = p.y - g.y
      const len = d || 1
      g.x += (dx / len) * g.magnetSpeed * dt
      g.y += (dy / len) * g.magnetSpeed * dt
    }
    if (d < 10) {
      p.xp += g.value
      gems.splice(i, 1)
      if (p.xp >= gameStore.xpToNext) {
        p.xp -= gameStore.xpToNext
        p.level++
        gameStore.xpToNext = CONFIG.leveling.baseXp + (p.level - 1) * CONFIG.leveling.xpPerLevel
        _triggerLevelUp()
      }
    }
  }

  _syncStore()
}

export function applyUpgrade(index) {
  if (index >= 0 && index < gameStore.levelUpChoices.length) {
    gameStore.levelUpChoices[index].apply(player)
  }
  gameStore.gameState = 'playing'
  gameStore.levelUpChoices = []
  _syncStore()
}

function _findNearest(from, list, range) {
  let best = null, bestDist = range
  for (const e of list) {
    const d = dist(from, e)
    if (d < bestDist) { bestDist = d; best = e }
  }
  return best
}

function _triggerLevelUp() {
  gameStore.gameState = 'levelup'
  const shuffled = CONFIG.upgrades.slice().sort(() => Math.random() - 0.5)
  gameStore.levelUpChoices = shuffled.slice(0, 3)
}

function _syncStore() {
  if (!player) return
  gameStore.hp = player.hp
  gameStore.maxHp = player.maxHp
  gameStore.xp = player.xp
  gameStore.level = player.level
  gameStore.kills = player.kills
  gameStore.coins = player.coins || 0
}
