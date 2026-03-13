import { Assets, Texture, Rectangle } from 'pixi.js'
import { DIR_NAMES } from '../direction.js'

// Hero textures: heroTextures[dirIndex] = Texture
let heroTextures = null

// Zombie textures from spritesheet: zombieTextures[row][col]
let zombieTextures = null
const ZOMBIE_COLS = 4
const ZOMBIE_ROWS = 8

export function buildHeroTextures() {
  if (heroTextures) return
  heroTextures = []
  for (let i = 0; i < DIR_NAMES.length; i++) {
    const alias = `hero_${DIR_NAMES[i]}`
    const tex = Assets.get(alias)
    heroTextures[i] = tex || null
  }
}

export function buildZombieTextures() {
  if (zombieTextures) return
  const source = Assets.get('zombie_walk')
  if (!source) return

  const baseTexture = source.baseTexture || source.source || source
  const srcW = baseTexture.width
  const srcH = baseTexture.height
  const cellW = srcW / ZOMBIE_COLS
  const cellH = srcH / ZOMBIE_ROWS

  zombieTextures = []
  for (let row = 0; row < ZOMBIE_ROWS; row++) {
    zombieTextures[row] = []
    for (let col = 0; col < ZOMBIE_COLS; col++) {
      const pad = 2
      const frame = new Rectangle(
        col * cellW + pad,
        row * cellH + pad,
        cellW - pad * 2,
        cellH - pad * 2
      )
      zombieTextures[row][col] = new Texture({ source: baseTexture, frame })
    }
  }
}

/**
 * Get hero texture for a direction
 * @param {number} dir - Direction index (0-7)
 */
export function getHeroTexture(dir) {
  if (!heroTextures) buildHeroTextures()
  return heroTextures ? heroTextures[dir] || heroTextures[0] : null
}

/**
 * Get zombie texture for a direction (still using spritesheet)
 * @param {number} dir - Direction row (0-7)
 * @param {number} frame - Animation frame (0-3), default 0
 */
export function getZombieTexture(dir, frame = 0) {
  if (!zombieTextures) buildZombieTextures()
  if (!zombieTextures) return null
  const row = zombieTextures[dir]
  if (!row) return null
  return row[frame % ZOMBIE_COLS] || null
}

export function getZombieCellSize() {
  const source = Assets.get('zombie_walk')
  if (!source) return { w: 0, h: 0 }
  const baseTexture = source.baseTexture || source.source || source
  return {
    w: baseTexture.width / ZOMBIE_COLS,
    h: baseTexture.height / ZOMBIE_ROWS,
  }
}
