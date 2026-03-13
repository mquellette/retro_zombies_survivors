import { CONFIG } from '../config.js'
import { GAME_W, GAME_H } from '../constants.js'
import { createBullet, createProjectile } from './entities.js'
import { dist, rectCollide } from '../utils.js'

// ── Helpers ──

function findNearest(from, enemies, range) {
  let best = null, bestDist = range
  for (const e of enemies) {
    const d = dist(from, e)
    if (d < bestDist) { bestDist = d; best = e }
  }
  return best
}

function angleTo(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

// ── Weapon Handlers ──
// Each returns array of new projectiles to spawn (or empty)

function fireBat(player, enemies, stats) {
  const target = findNearest(player, enemies, stats.range)
  if (!target) return []
  const angle = angleTo(player, target)
  return [createProjectile('melee_arc', player.x, player.y, {
    damage: stats.damage * player.damageMul,
    angle,
    range: stats.range,
    arcWidth: Math.PI / 2, // 90° sweep
    life: 0.15,
    w: stats.range * 2,
    h: stats.range * 2,
    hitIds: [],
  })]
}

function firePistol(player, enemies, stats) {
  const target = findNearest(player, enemies, stats.range)
  if (!target) return []
  return [createBullet(
    player.x, player.y, target.x, target.y,
    stats.damage * player.damageMul,
    stats.bulletSpeed,
    stats.pierce,
  )]
}

function fireGuitar(player, enemies, stats) {
  return [createProjectile('aoe_ring', player.x, player.y, {
    damage: stats.damage * player.damageMul,
    radius: stats.radius,
    maxRadius: stats.radius,
    currentRadius: 0,
    life: 0.3,
    maxLife: 0.3,
    w: stats.radius * 2,
    h: stats.radius * 2,
    hitIds: [],
  })]
}

function fireShotgun(player, enemies, stats) {
  const target = findNearest(player, enemies, stats.range)
  if (!target) return []
  const baseAngle = angleTo(player, target)
  const result = []
  const halfSpread = stats.spread / 2
  for (let i = 0; i < stats.pellets; i++) {
    const a = baseAngle - halfSpread + (stats.pellets > 1 ? (stats.spread * i / (stats.pellets - 1)) : 0)
    const tx = player.x + Math.cos(a) * stats.range
    const ty = player.y + Math.sin(a) * stats.range
    const b = createBullet(
      player.x, player.y, tx, ty,
      stats.damage * player.damageMul,
      stats.bulletSpeed,
      0,
    )
    b.knockback = stats.knockback
    b.life = 0.5
    result.push(b)
  }
  return result
}

function fireBoomerang(player, enemies, stats) {
  const target = findNearest(player, enemies, stats.range)
  if (!target) return []
  const angle = angleTo(player, target)
  return [createProjectile('boomerang', player.x, player.y, {
    damage: stats.damage * player.damageMul,
    speed: stats.speed,
    angle,
    range: stats.range,
    distTraveled: 0,
    returning: false,
    originX: player.x,
    originY: player.y,
    w: 10, h: 10,
    life: 10, // long life, removed when returns
    hitIds: [],
    rotation: 0,
  })]
}

function fireSkateboard(player, enemies, stats) {
  // Only drop trail if player is moving
  const mx = player._lastMx || 0
  const my = player._lastMy || 0
  if (mx === 0 && my === 0) return []
  return [createProjectile('trail', player.x, player.y, {
    damage: stats.damage * player.damageMul,
    life: stats.duration,
    w: stats.size, h: stats.size,
    hitIds: [],
    hitCooldown: new Map(),
  })]
}

const weaponFireHandlers = {
  bat: fireBat,
  pistol: firePistol,
  guitar: fireGuitar,
  shotgun: fireShotgun,
  boomerang: fireBoomerang,
  skateboard: fireSkateboard,
  // chainsaw doesn't "fire" — it manages persistent orbiters
}

// ── Main Update Functions ──

export function updateWeapons(dt, player, enemies, projectiles) {
  for (const w of player.weapons) {
    const def = CONFIG.weapons[w.id]
    if (!def) continue

    if (w.id === 'chainsaw') {
      _updateChainsaw(dt, player, enemies, projectiles, w, def)
      continue
    }

    const stats = def.levels[w.level - 1]
    w.timer -= dt
    if (w.timer <= 0) {
      const handler = weaponFireHandlers[w.id]
      if (handler) {
        const newProj = handler(player, enemies, stats)
        for (const p of newProj) {
          p.weaponId = w.id
          projectiles.push(p)
        }
      }
      w.timer = stats.cooldown / player.atkSpeedMul
    }
  }
}

function _updateChainsaw(dt, player, enemies, projectiles, w, def) {
  const stats = def.levels[w.level - 1]
  // Count existing orbit projectiles for this weapon
  let orbitCount = 0
  for (const p of projectiles) {
    if (p.type === 'orbit' && p.weaponId === 'chainsaw') orbitCount++
  }
  // Spawn missing orbiters
  while (orbitCount < stats.count) {
    const angleOffset = (Math.PI * 2 / stats.count) * orbitCount
    projectiles.push(createProjectile('orbit', player.x, player.y, {
      damage: stats.damage * player.damageMul,
      orbitRadius: stats.orbitRadius,
      angularSpeed: stats.angularSpeed,
      orbitAngle: angleOffset,
      w: 10, h: 10,
      life: 999,
      weaponId: 'chainsaw',
      hitCooldown: new Map(),
    }))
    orbitCount++
  }
}

export function updateProjectiles(dt, player, enemies, projectiles) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]

    switch (p.type) {
      case 'bullet':
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt
        break

      case 'melee_arc':
        p.life -= dt
        break

      case 'aoe_ring':
        p.life -= dt
        p.currentRadius = p.maxRadius * (1 - p.life / p.maxLife)
        break

      case 'boomerang':
        _updateBoomerang(p, player, dt)
        break

      case 'orbit':
        p.orbitAngle += p.angularSpeed * dt
        p.x = player.x + Math.cos(p.orbitAngle) * p.orbitRadius
        p.y = player.y + Math.sin(p.orbitAngle) * p.orbitRadius
        break

      case 'trail':
        p.life -= dt
        break
    }

    // Remove expired or out of bounds
    if (p.life <= 0) {
      projectiles.splice(i, 1)
      continue
    }
    if ((p.type === 'bullet' || p.type === 'boomerang') &&
        (p.x < -50 || p.x > GAME_W + 50 || p.y < -50 || p.y > GAME_H + 50)) {
      projectiles.splice(i, 1)
      continue
    }

    // Collision with enemies
    _checkHits(p, enemies, player, projectiles, i)
  }
}

function _updateBoomerang(p, player, dt) {
  if (!p.returning) {
    p.x += Math.cos(p.angle) * p.speed * dt
    p.y += Math.sin(p.angle) * p.speed * dt
    p.distTraveled += p.speed * dt
    p.rotation += 10 * dt
    if (p.distTraveled >= p.range) {
      p.returning = true
      p.hitIds = [] // can hit again on return
    }
  } else {
    const dx = player.x - p.x
    const dy = player.y - p.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    p.x += (dx / d) * p.speed * dt
    p.y += (dy / d) * p.speed * dt
    p.rotation += 10 * dt
    if (d < 20) {
      p.life = 0 // collected back
    }
  }
}

function _checkHits(p, enemies, player, projectiles, idx) {
  for (let j = enemies.length - 1; j >= 0; j--) {
    const e = enemies[j]
    let hit = false

    switch (p.type) {
      case 'bullet':
        hit = rectCollide(p, e)
        break

      case 'melee_arc': {
        const d = dist(p, e)
        if (d <= p.range && !p.hitIds.includes(e.id)) {
          const aToE = Math.atan2(e.y - p.y, e.x - p.x)
          let diff = aToE - p.angle
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          if (Math.abs(diff) <= p.arcWidth / 2) hit = true
        }
        break
      }

      case 'aoe_ring': {
        const d = dist(p, e)
        if (d <= p.currentRadius && !p.hitIds.includes(e.id)) hit = true
        break
      }

      case 'boomerang': {
        const d = dist(p, e)
        if (d < 20 && !p.hitIds.includes(e.id)) hit = true
        break
      }

      case 'orbit': {
        const d = dist(p, e)
        if (d < 18) {
          const cd = p.hitCooldown.get(e.id) || 0
          if (cd <= 0) {
            hit = true
            p.hitCooldown.set(e.id, 0.5) // hit once per 0.5s per enemy
          }
        }
        // Decrement cooldowns
        for (const [eid, t] of p.hitCooldown) {
          p.hitCooldown.set(eid, t - 0.016) // approximate dt
        }
        break
      }

      case 'trail': {
        if (rectCollide(p, e)) {
          const cd = p.hitCooldown.get(e.id) || 0
          if (cd <= 0) {
            hit = true
            p.hitCooldown.set(e.id, 0.3)
          }
        }
        for (const [eid, t] of p.hitCooldown) {
          p.hitCooldown.set(eid, t - 0.016)
        }
        break
      }
    }

    if (hit) {
      e.hp -= p.damage
      e.flashTimer = 0.12
      if (p.hitIds) p.hitIds.push(e.id)

      // Knockback
      if (p.knockback) {
        const dx = e.x - player.x
        const dy = e.y - player.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        e.x += (dx / d) * p.knockback
        e.y += (dy / d) * p.knockback
      }

      // Bullet: remove unless it can pierce
      if (p.type === 'bullet') {
        if (p.pierce > 0) {
          p.pierce--
        } else {
          projectiles.splice(idx, 1)
        }
      }

      // Check enemy death (handled by gameEngine, not here)
      // We just reduce HP; gameEngine cleanup handles the rest
      break // one hit per frame per projectile (except aoe/orbit/trail)
    }
  }
}
