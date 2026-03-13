import { Assets } from 'pixi.js'
import { DIR_NAMES } from '../direction.js'

// Map direction name -> filename for hero
const HERO_FILES = {
  'down':       'down-1.png',
  'down-left':  'down-left-1.png',
  'left':       'left.png',
  'up-left':    'up-left-1.png',
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

  // Zombie direction sprites
  for (const dir of DIR_NAMES) {
    const alias = `zombie_${dir}`
    const file = HERO_FILES[dir] // same naming convention
    Assets.add({ alias, src: `Assets/Final Assests/Enemies/zombie-male-adult/${file}` })
    toLoad.push(alias)
  }

  // UI
  Assets.add({ alias: 'skull_icon', src: 'Assets/UI/HUD/skull_icon Background Removed.png' })
  Assets.add({ alias: 'coin_icon', src: 'Assets/UI/HUD/coin_icon Background Removed.png' })
  toLoad.push('skull_icon', 'coin_icon')

  // Weapon icons
  const weaponIcons = [
    { alias: 'ic_bat', src: 'Assets/UI/Icons/Weapons/ic-weapon-bat.png' },
    { alias: 'ic_gun', src: 'Assets/UI/Icons/Weapons/ic-weapon-gun.png' },
    { alias: 'ic_guitar', src: 'Assets/UI/Icons/Weapons/ic-weapon-guitar.png' },
    { alias: 'ic_shotgun', src: 'Assets/UI/Icons/Weapons/ic-weapon-shotgun.png' },
  ]
  for (const icon of weaponIcons) {
    Assets.add(icon)
    toLoad.push(icon.alias)
  }

  // Stat upgrade icons
  const statIcons = [
    { alias: 'ic_damage', src: 'Assets/UI/Icons/Level-up/ic-levelup_damage.png' },
    { alias: 'ic_max_health', src: 'Assets/UI/Icons/Level-up/ic-levelup_max_health.png' },
    { alias: 'ic_armor', src: 'Assets/UI/Icons/Level-up/ic-levelup_stats-armor.png' },
    { alias: 'ic_atk_speed', src: 'Assets/UI/Icons/Level-up/ic-levelup_stats-attack_speed.png' },
    { alias: 'ic_move_speed', src: 'Assets/UI/Icons/Level-up/ic-levelup_stats-move_speed.png' },
  ]
  for (const icon of statIcons) {
    Assets.add(icon)
    toLoad.push(icon.alias)
  }

  await Assets.load(toLoad)
}
