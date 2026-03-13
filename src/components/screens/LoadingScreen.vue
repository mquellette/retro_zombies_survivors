<template>
  <div class="loading-screen">
    <p class="loading-text">ЗАГРУЗКА</p>
    <div class="vhs-area">
      <img class="vhs-player" src="/Assets/UI/Screens/vhs-player.png" alt="">
      <img
        class="vhs-cassette"
        :class="{ 'cassette-in': animating }"
        src="/Assets/UI/Screens/vhs-casette.png"
        alt=""
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const animating = ref(false)
let timer = null

onMounted(() => {
  // Start cassette animation after brief delay
  requestAnimationFrame(() => { animating.value = true })
  // Done after animation completes
  timer = setTimeout(() => emit('done'), 2500)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<style scoped>
.loading-screen {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  line-height: 26px;
  color: #fff;
  margin-bottom: 60px;
}

.vhs-area {
  position: relative;
  width: 326px;
  height: 200px;
}

.vhs-player {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 326px;
  height: 119px;
}

.vhs-cassette {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(120px) scale(1);
  width: 200px;
  bottom: 80px;
  transition: transform 2s ease-in-out, width 2s ease-in-out, bottom 2s ease-in-out;
}

.cassette-in {
  transform: translateX(-50%) translateY(0) scale(0.5);
  bottom: 60px;
  width: 140px;
}
</style>
