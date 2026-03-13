<template>
  <div ref="containerEl" class="game-container">
    <div ref="pixiEl" class="pixi-wrap"></div>
    <div class="ui-overlay">
      <!-- Splash -->
      <SplashScreen
        v-if="store.screen === 'splash'"
        @done="store.screen = 'menu'"
      />

      <!-- Menu -->
      <MenuScreen
        v-if="store.screen === 'menu'"
        @play="store.screen = 'levels'"
      />

      <!-- Level Select -->
      <LevelSelect
        v-if="store.screen === 'levels'"
        @back="store.screen = 'menu'"
        @select="onLevelSelect"
      />

      <!-- Loading -->
      <LoadingScreen
        v-if="store.screen === 'loading'"
        @done="store.screen = 'countdown'"
      />

      <!-- Countdown -->
      <CountdownScreen
        v-if="store.screen === 'countdown'"
        @done="startGame"
      />

      <!-- In-game UI -->
      <template v-if="store.screen === 'game'">
        <GameHUD />
        <LevelUpModal
          v-if="store.gameState === 'levelup'"
          @choose="onUpgrade"
        />
        <GameOverScreen
          v-if="store.gameState === 'gameover' || store.gameState === 'victory'"
          :victory="store.gameState === 'victory'"
          @retry="onRetry"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Application } from 'pixi.js'
import { GAME_W, GAME_H, setGameH } from '../constants.js'
import { gameStore as store } from '../store/gameStore.js'
import { loadAssets } from '../assets/assetLoader.js'
import { buildHeroTextures, buildZombieTextures } from '../rendering/spriteManager.js'
import { createLayers, sync, reset } from '../rendering/gameRenderer.js'
import * as engine from '../game/gameEngine.js'
import { joystick } from '../input/joystick.js'
import { applyUpgrade } from '../game/gameEngine.js'

import SplashScreen from './screens/SplashScreen.vue'
import MenuScreen from './screens/MenuScreen.vue'
import LevelSelect from './screens/LevelSelect.vue'
import LoadingScreen from './screens/LoadingScreen.vue'
import CountdownScreen from './screens/CountdownScreen.vue'
import GameHUD from './hud/GameHUD.vue'
import LevelUpModal from './overlays/LevelUpModal.vue'
import GameOverScreen from './overlays/GameOverScreen.vue'

const containerEl = ref(null)
const pixiEl = ref(null)

let app = null

onMounted(async () => {
  app = new Application()

  const dpr = window.devicePixelRatio || 1

  await app.init({
    width: GAME_W,
    height: GAME_H,
    backgroundColor: 0x086f51,
    resolution: dpr,
    autoDensity: true,
    antialias: false,
  })

  // Pixel-art crisp rendering
  app.canvas.style.imageRendering = 'pixelated'

  pixiEl.value.appendChild(app.canvas)

  // Load assets
  await loadAssets()
  buildHeroTextures()
  buildZombieTextures()

  // Create render layers
  createLayers(app.stage)

  // Init joystick on the canvas
  joystick.init(app.canvas)

  // Disable context menu
  app.canvas.addEventListener('contextmenu', e => e.preventDefault())

  // Responsive resize
  _resize()
  window.addEventListener('resize', _resize)
  setTimeout(_resize, 300)
  setTimeout(_resize, 1000)

  // Game loop via ticker
  app.ticker.add((ticker) => {
    if (store.screen !== 'game') return
    const dt = Math.min(ticker.deltaMS / 1000, 0.05)
    engine.update(dt)
    sync()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', _resize)
  if (app) app.destroy(true)
})

function _resize() {
  if (!app || !containerEl.value) return

  const ww = window.innerWidth
  const wh = window.innerHeight
  const screenRatio = wh / ww

  let containerW, containerH
  if (screenRatio < 1) {
    containerH = wh
    containerW = Math.round(containerH * (9 / 16))
    if (containerW > ww) {
      containerW = ww
      containerH = Math.round(containerW * (16 / 9))
    }
  } else {
    containerW = ww
    containerH = wh
  }

  containerEl.value.style.width = containerW + 'px'
  containerEl.value.style.height = containerH + 'px'

  const newH = Math.round(GAME_W * (containerH / containerW))
  setGameH(newH)

  app.renderer.resize(GAME_W, newH)
  app.canvas.style.width = containerW + 'px'
  app.canvas.style.height = containerH + 'px'
}

function onLevelSelect(level) {
  store.selectedLevel = level
  store.screen = 'loading'
}

function startGame() {
  reset()
  engine.init()
  store.screen = 'game'
}

function onRetry() {
  store.screen = 'loading'
}

function onUpgrade(index) {
  applyUpgrade(index)
}
</script>

<style scoped>
.game-container {
  position: relative;
  overflow: hidden;
}
.pixi-wrap {
  width: 100%;
  height: 100%;
}
.pixi-wrap canvas {
  display: block;
  touch-action: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.ui-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
