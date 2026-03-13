import { GAME_W, GAME_H } from '../constants.js'
import { CONFIG } from '../config.js'
import { dist, clamp, rndInt, rectCollide } from '../utils.js'
import { getDirFrame } from '../direction.js'
import { joystick } from '../input/joystick.js'
import { gameStore } from '../store/gameStore.js'
import { createPlayer, createGem, createCola, createDisk, createBoombox } from './entities.js'
import { spawner } from './spawner.js'
import { updateWeapons, updateProjectiles } from './weaponSystem.js'

// Internal game arrays — NOT in Vue reactive store (PixiJS reads these directly)
export let player = null
export let projectiles = []
export let enemies = []
export let gems = []
export let colas = []
export let disks = []
export let boomboxes = []
let _lastDiskDropTime = -60  // allow first drop immediately


export function init() {
  player = createPlayer()
  projectiles = []
  enemies = []
  gems = []
  colas = []
  disks = []
  boomboxes = []
  _lastDiskDropTime = -60
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
      const gem = createGem(e.x, e.y, e.xp)
      _initBounce(gem, p)
      gems.push(gem)
      if (Math.random() < 0.01) {
        const bb = createBoombox(e.x, e.y)
        _initBounce(bb, p)
        boomboxes.push(bb)
      } else if (Math.random() < 0.03) {
        const cola = createCola(e.x, e.y, rndInt(10, 25))
        _initBounce(cola, p)
        colas.push(cola)
      }
      if (Math.random() < 0.03 && (gameStore.elapsed - _lastDiskDropTime) >= 60) {
        const dk = createDisk(e.x, e.y)
        _initBounce(dk, p)
        disks.push(dk)
        _lastDiskDropTime = gameStore.elapsed
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

    if (e.flashTimer > 0) e.flashTimer -= dt
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

  // Update all collectibles (bounce phase + magnet + pickup)
  const magnetRange = CONFIG.player.magnetRange
  _updateCollectibles(dt, p, gems, magnetRange, (g) => {
    p.xp += g.value
    if (p.xp >= gameStore.xpToNext) {
      p.xp -= gameStore.xpToNext
      p.level++
      gameStore.xpToNext = CONFIG.leveling.baseXp + (p.level - 1) * CONFIG.leveling.xpPerLevel
      _triggerLevelUp()
    }
  })
  _updateCollectibles(dt, p, colas, magnetRange, (c) => {
    p.hp = Math.min(p.hp + c.heal, p.maxHp)
  })
  _updateCollectibles(dt, p, disks, magnetRange, () => {
    p.coins++
  })
  _updateCollectibles(dt, p, boomboxes, magnetRange, () => {
    // Kill all enemies on screen
    for (const e of enemies) {
      e.hp = 0
    }
  })

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

// Bounce-then-magnet: collectible flies away from player briefly, then gets magnetized
function _initBounce(item, p) {
  const dx = item.x - p.x
  const dy = item.y - p.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const bounceSpeed = 80 + Math.random() * 40
  item._bounceVx = (dx / len) * bounceSpeed + (Math.random() - 0.5) * 40
  item._bounceVy = (dy / len) * bounceSpeed + (Math.random() - 0.5) * 40
  item._bounceTime = 0.25 + Math.random() * 0.1
}

function _updateCollectibles(dt, p, arr, magnetRange, onPickup) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i]

    // Bounce phase
    if (item._bounceTime > 0) {
      item._bounceTime -= dt
      item.x += item._bounceVx * dt
      item.y += item._bounceVy * dt
      // Decelerate
      item._bounceVx *= 0.92
      item._bounceVy *= 0.92
      continue
    }

    // Magnet phase
    const d = dist(item, p)
    if (d < magnetRange) {
      const dx = p.x - item.x
      const dy = p.y - item.y
      const len = d || 1
      // Accelerate towards player
      item.magnetSpeed = Math.min(item.magnetSpeed + 400 * dt, 500)
      item.x += (dx / len) * item.magnetSpeed * dt
      item.y += (dy / len) * item.magnetSpeed * dt
    }
    if (d < 10) {
      onPickup(item)
      arr.splice(i, 1)
    }
  }
}

function _triggerLevelUp() {
  gameStore.gameState = 'levelup'
  gameStore.selectedUpgrade = -1

  const pool = _buildUpgradePool()
  const stats = pool.filter(c => c.type === 'stat')
  const weapons = pool.filter(c => c.type !== 'stat')

  // Pick 3 choices: each slot has 25% chance of weapon, 75% stat
  const choices = []
  for (let i = 0; i < 3; i++) {
    const useWeapon = Math.random() < 0.25 && weapons.length > 0
    const src = useWeapon ? weapons : stats
    if (src.length === 0) continue
    const idx = Math.floor(Math.random() * src.length)
    choices.push(src[idx])
    src.splice(idx, 1) // don't repeat
  }
  // Fill remaining if needed
  const remaining = [...stats, ...weapons]
  while (choices.length < 3 && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length)
    choices.push(remaining[idx])
    remaining.splice(idx, 1)
  }

  gameStore.levelUpChoices = choices
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
