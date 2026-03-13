import { Assets } from 'pixi.js'
import { DIR_NAMES } from '../direction.js'

// Hero textures: heroTextures[dirIndex] = Texture
let heroTextures = null

// Zombie textures: zombieTextures[gender][dirIndex] = Texture
let zombieTextures = null

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
  zombieTextures = { male: [], female: [] }
  for (const gender of ['male', 'female']) {
    for (let i = 0; i < DIR_NAMES.length; i++) {
      const alias = `zombie_${gender}_${DIR_NAMES[i]}`
      const tex = Assets.get(alias)
      zombieTextures[gender][i] = tex || null
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
 * Get zombie texture for a direction and gender
 * @param {number} dir - Direction index (0-7)
 * @param {string} gender - 'male' or 'female'
 */
export function getZombieTexture(dir, gender) {
  if (!zombieTextures) buildZombieTextures()
  if (!zombieTextures) return null
  const g = gender || 'male'
  const texArr = zombieTextures[g] || zombieTextures.male
  return texArr[dir] || texArr[0] || null
}

export function getZombieCellSize() {
  if (!zombieTextures || !zombieTextures.male || !zombieTextures.male[0]) return { w: 32, h: 32 }
  return {
    w: zombieTextures.male[0].width,
    h: zombieTextures.male[0].height,
  }
}
