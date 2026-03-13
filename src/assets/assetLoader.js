import { Assets } from 'pixi.js'

export async function loadAssets() {
  Assets.add({ alias: 'hero_walk', src: 'Assets/Final Assests/Characters/Joey.png' })
  Assets.add({ alias: 'zombie_walk', src: 'Assets/Final Assests/Enemies/zombie-basic.png' })
  Assets.add({ alias: 'skull_icon', src: 'Assets/UI/HUD/skull_icon Background Removed.png' })
  Assets.add({ alias: 'coin_icon', src: 'Assets/UI/HUD/coin_icon Background Removed.png' })

  await Assets.load(['hero_walk', 'zombie_walk', 'skull_icon', 'coin_icon'])
}
