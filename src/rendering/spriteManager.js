import { Assets, Texture, Rectangle } from 'pixi.js'

// Spritesheet grid: 4 columns (animation frames) × 8 rows (directions)
const COLS = 4
const ROWS = 8

// Cache: textures[alias][row][col]
const textures = {}

export function buildTextures(alias) {
  const source = Assets.get(alias)
  if (!source || textures[alias]) return

  const baseTexture = source.baseTexture || source.source || source
  const srcW = baseTexture.width
  const srcH = baseTexture.height
  const cellW = srcW / COLS
  const cellH = srcH / ROWS

  textures[alias] = []
  for (let row = 0; row < ROWS; row++) {
    textures[alias][row] = []
    for (let col = 0; col < COLS; col++) {
      // Inset by 2px to avoid bleeding
      const pad = 2
      const frame = new Rectangle(
        col * cellW + pad,
        row * cellH + pad,
        cellW - pad * 2,
        cellH - pad * 2
      )
      textures[alias][row][col] = new Texture({ source: baseTexture, frame })
    }
  }
}

/**
 * Get a texture for a specific direction and animation frame
 * @param {string} alias - Asset alias ('hero_walk', 'zombie_walk')
 * @param {number} dir - Direction row (0-7)
 * @param {number} frame - Animation frame (0-3), default 0 (static)
 */
export function getTexture(alias, dir, frame = 0) {
  if (!textures[alias]) buildTextures(alias)
  if (!textures[alias]) return null
  const row = textures[alias][dir]
  if (!row) return null
  return row[frame % COLS] || null
}

export function getCellSize(alias) {
  const source = Assets.get(alias)
  if (!source) return { w: 0, h: 0 }
  const baseTexture = source.baseTexture || source.source || source
  return {
    w: baseTexture.width / COLS,
    h: baseTexture.height / ROWS,
  }
}
