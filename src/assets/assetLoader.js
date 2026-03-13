import { Assets } from 'pixi.js'
import { DIR_NAMES } from '../direction.js'

// Map direction name -> filename for hero
const HERO_FILES = {
  'down':       'down-1.png',
  'down-left':  'down-left-1.png',
  'left':       'left.png',
  'up-left':    'up-right-1-1.png',
  'up':         'up-1.png',
  'up-right':   'up-right-1.png',
  'right':      'right.png',
  'down-right': 'down-right-1.png',
}

export async function loadAssets() {
  const toLoad = []

  // Hero direction sprites
  for (const dir of DIR_NAMES) {
    const alias = `hero_${dir}`
    const file = HERO_FILES[dir]
    Assets.add({ alias, src: `Assets/Final Assests/Characters/${file}` })
    toLoad.push(alias)
  }

  // Zombie spritesheet (keep for now until individual sprites are provided)
  Assets.add({ alias: 'zombie_walk', src: 'Assets/Final Assests/Enemies/zombie-basic.png' })
  toLoad.push('zombie_walk')

  // UI
  Assets.add({ alias: 'skull_icon', src: 'Assets/UI/HUD/skull_icon Background Removed.png' })
  Assets.add({ alias: 'coin_icon', src: 'Assets/UI/HUD/coin_icon Background Removed.png' })
  toLoad.push('skull_icon', 'coin_icon')

  await Assets.load(toLoad)
}
