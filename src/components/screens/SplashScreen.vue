<template>
  <div class="splash" @click="onTap">
    <img class="splash-bg" src="/Assets/UI/Screens/Background-splashscreen.png" alt="">
    <img
      class="splash-logo"
      :class="{ 'logo-up': phase >= 1 }"
      src="/Assets/UI/Screens/logo.png"
      alt=""
    >
    <p v-if="waitingForTap" class="tap-hint">Нажмите, чтобы начать</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const phase = ref(0)
const waitingForTap = ref(false)

let timer1 = null
let assetsReady = false
let animDone = false

function preloadImages(urls) {
  return Promise.all(urls.map(url => new Promise(resolve => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = url
  })))
}

function showTapPrompt() {
  if (assetsReady && animDone) {
    waitingForTap.value = true
  }
}

onMounted(() => {
  const preload = Promise.all([
    document.fonts.ready,
    preloadImages([
      `${import.meta.env.BASE_URL}Assets/UI/Screens/Background-menu.png`,
      `${import.meta.env.BASE_URL}Assets/UI/Screens/spiral.svg`,
      `${import.meta.env.BASE_URL}Assets/UI/Screens/level_preview-level_1.png`,
      `${import.meta.env.BASE_URL}Assets/UI/Screens/vhs-casette.png`,
      `${import.meta.env.BASE_URL}Assets/UI/Screens/vhs-player.png`,
    ])
  ])

  preload.then(() => {
    assetsReady = true
    showTapPrompt()
  })

  timer1 = setTimeout(() => { phase.value = 1 }, 2000)
  setTimeout(() => {
    animDone = true
    showTapPrompt()
  }, 3500)
})

onUnmounted(() => {
  clearTimeout(timer1)
})

function onTap() {
  if (waitingForTap.value) {
    emit('done')
  } else if (assetsReady) {
    // Skip animation early
    animDone = true
    waitingForTap.value = true
  }
}
</script>

<style scoped>
.splash {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: auto;
  overflow: hidden;
}

.splash-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: 100%;
  object-fit: cover;
}

.splash-logo {
  position: absolute;
  top: 37.1%;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
  transition: top 300ms ease-out;
}

.logo-up {
  top: 11%;
}

.tap-hint {
  position: absolute;
  bottom: 18%;
  left: 0;
  width: 100%;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  z-index: 2;
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
