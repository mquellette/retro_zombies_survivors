import { GAME_W, GAME_H } from '../constants.js'
import { CONFIG } from '../config.js'
import { dist, clamp, rndInt, rectCollide } from '../utils.js'
import { getDirFrame } from '../direction.js'
import { joystick } from '../input/joystick.js'
import { gameStore } from '../store/gameStore.js'
import { createPlayer, createGem } from './entities.js'
import { spawner } from './spawner.js'
import { updateWeapons, updateProjectiles } from './weaponSystem.js'

// Internal game arrays — NOT in Vue reactive store (PixiJS reads these directly)
export let player = null
export let projectiles = []
export let enemies = []
export let gems = []


export function init() {
  player = createPlayer()
  projectiles = []
  enemies = []
  gems = []
  spawner.reset()

  gameStore.gameState = 'playing'
  gameStore.timer = CONFIG.round.duration
  gameStore.elapsed = 0
  gameStore.xpToNext = CONFIG.leveling.baseXp
  gameStore.levelUpChoices = []
  gameStore.selectedUpgrade = -1
  gameStore.rerollsLeft = 1
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

  // Store movement for weapons that need it (skateboard)
  p._lastMx = mx
  p._lastMy = my

  // Weapon system
  updateWeapons(dt, p, enemies, projectiles)
  updateProjectiles(dt, p, enemies, projectiles)

  // Clean up dead enemies (from weapon hits)
  for (let j = enemies.length - 1; j >= 0; j--) {
    const e = enemies[j]
    if (e.hp <= 0) {
      gems.push(createGem(e.x, e.y, e.xp))
      if (Math.random() < CONFIG.loot.chestDropChance) {
        const heal = rndInt(CONFIG.loot.chestHealMin, CONFIG.loot.chestHealMax)
        p.hp = Math.min(p.hp + heal, p.maxHp)
      }
      enemies.splice(j, 1)
      p.kills++
    }
  }

  // Enemy movement & contact damage
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
      const dmg = Math.max(1, e.damage - p.armor)
      p.hp -= dmg
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
      const gdx = p.x - g.x
      const gdy = p.y - g.y
      const len = d || 1
      g.x += (gdx / len) * g.magnetSpeed * dt
      g.y += (gdy / len) * g.magnetSpeed * dt
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
  const choice = gameStore.levelUpChoices[index]
  if (!choice) return

  if (choice.type === 'stat') {
    choice.apply(player)
  } else if (choice.type === 'weaponUpgrade') {
    const w = player.weapons.find(w => w.id === choice.weaponId)
    if (w) w.level++
  } else if (choice.type === 'newWeapon') {
    player.weapons.push({ id: choice.weaponId, level: 1, timer: 0 })
  }

  gameStore.gameState = 'playing'
  gameStore.levelUpChoices = []
  gameStore.selectedUpgrade = -1
  _syncStore()
}

export function rerollChoice(index) {
  if (gameStore.rerollsLeft <= 0) return
  if (index < 0 || index >= gameStore.levelUpChoices.length) return

  gameStore.rerollsLeft--
  const pool = _buildUpgradePool()
  const currentIds = gameStore.levelUpChoices.map(c => c.id || c.weaponId)
  const available = pool.filter(c => !currentIds.includes(c.id || c.weaponId))
  if (available.length > 0) {
    const replacement = available[Math.floor(Math.random() * available.length)]
    gameStore.levelUpChoices[index] = replacement
  }
}

function _triggerLevelUp() {
  gameStore.gameState = 'levelup'
  gameStore.selectedUpgrade = -1
  const pool = _buildUpgradePool()
  const shuffled = pool.sort(() => Math.random() - 0.5)
  gameStore.levelUpChoices = shuffled.slice(0, 3)
}

function _buildUpgradePool() {
  const pool = []
  const equippedIds = player.weapons.map(w => w.id)
  const slotsFull = player.weapons.length >= 4

  // Stat upgrades (always available)
  for (const key of Object.keys(CONFIG.statUpgrades)) {
    const s = CONFIG.statUpgrades[key]
    pool.push({
      type: 'stat',
      id: s.id,
      name: s.name,
      icon: s.icon,
      desc: s.desc,
      apply: s.apply,
    })
  }

  // Weapon upgrades for equipped weapons below max level
  for (const w of player.weapons) {
    const def = CONFIG.weapons[w.id]
    if (!def) continue
    if (w.level < def.maxLevel) {
      pool.push({
        type: 'weaponUpgrade',
        weaponId: w.id,
        id: `${w.id}_up`,
        name: `${def.name} LVL${w.level + 1}`,
        icon: def.icon,
        desc: def.desc,
        currentLevel: w.level,
      })
    }
  }

  // New weapons (only if slots available)
  if (!slotsFull) {
    for (const key of Object.keys(CONFIG.weapons)) {
      if (!equippedIds.includes(key)) {
        const def = CONFIG.weapons[key]
        pool.push({
          type: 'newWeapon',
          weaponId: key,
          id: `${key}_new`,
          name: `${def.name} LVL1`,
          icon: def.icon,
          desc: def.desc,
        })
      }
    }
  }

  return pool
}

function _syncStore() {
  if (!player) return
  gameStore.hp = player.hp
  gameStore.maxHp = player.maxHp
  gameStore.xp = player.xp
  gameStore.level = player.level
  gameStore.kills = player.kills
  gameStore.coins = player.coins || 0
  gameStore.weapons = player.weapons.map(w => {
    const def = CONFIG.weapons[w.id]
    return {
      id: w.id,
      level: w.level,
      icon: def ? def.icon : null,
      name: def ? def.name : w.id,
    }
  })
}
