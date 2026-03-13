import { Assets } from 'pixi.js'
import { DIR_NAMES } from '../direction.js'

const BASE = import.meta.env.BASE_URL

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
    Assets.add({ alias, src: `${BASE}Assets/Final Assests/Characters/${file}` })
    toLoad.push(alias)
  }

  // Zombie direction sprites (male + female)
  for (const gender of ['male', 'female']) {
    for (const dir of DIR_NAMES) {
      const alias = `zombie_${gender}_${dir}`
      const file = HERO_FILES[dir]
      Assets.add({ alias, src: `${BASE}Assets/Final Assests/Enemies/zombie-${gender}-adult/${file}` })
      toLoad.push(alias)
    }
  }

  // UI — HUD icons
  Assets.add({ alias: 'skull_icon', src: `${BASE}Assets/UI/Icons/Stats/ic-stats-skull.png` })
  Assets.add({ alias: 'coin_icon', src: `${BASE}Assets/UI/Icons/Stats/ic-currency-disk.png` })
  Assets.add({ alias: 'xp_icon', src: `${BASE}Assets/UI/Icons/Collectibles/ic-collectibles-experience.png` })
  toLoad.push('skull_icon', 'coin_icon', 'xp_icon')

  // Weapon icons
  const weaponIcons = [
    { alias: 'ic_bat', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-bat.png` },
    { alias: 'ic_gun', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-gun.png` },
    { alias: 'ic_guitar', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-guitar.png` },
    { alias: 'ic_shotgun', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-shotgun.png` },
    { alias: 'ic_boomerang', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-boomerang.png` },
    { alias: 'ic_chainsaw', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-chainsaw.png` },
    { alias: 'ic_skateboard', src: `${BASE}Assets/UI/Icons/Weapons/ic-weapon-skateboard.png` },
  ]
  for (const icon of weaponIcons) {
    Assets.add(icon)
    toLoad.push(icon.alias)
  }

  // Stat upgrade icons
  const statIcons = [
    { alias: 'ic_damage', src: `${BASE}Assets/UI/Icons/Level-up/ic-levelup_damage.png` },
    { alias: 'ic_max_health', src: `${BASE}Assets/UI/Icons/Level-up/ic-levelup_max_health.png` },
    { alias: 'ic_armor', src: `${BASE}Assets/UI/Icons/Level-up/ic-levelup_stats-armor.png` },
    { alias: 'ic_atk_speed', src: `${BASE}Assets/UI/Icons/Level-up/ic-levelup_stats-attack_speed.png` },
    { alias: 'ic_move_speed', src: `${BASE}Assets/UI/Icons/Level-up/ic-levelup_stats-move_speed.png` },
  ]
  for (const icon of statIcons) {
    Assets.add(icon)
    toLoad.push(icon.alias)
  }

  // Collectible sprites (in-game drops)
  Assets.add({ alias: 'brain_drop', src: `${BASE}Assets/UI/Icons/Collectibles/ic-collectibles-experience.png` })
  Assets.add({ alias: 'cola_drop', src: `${BASE}Assets/UI/Icons/Collectibles/ic-cola.png` })
  Assets.add({ alias: 'boombox_drop', src: `${BASE}Assets/UI/Icons/Collectibles/ic-collectibles-boombox.png` })
  toLoad.push('brain_drop', 'cola_drop', 'boombox_drop')

  await Assets.load(toLoad)
}
