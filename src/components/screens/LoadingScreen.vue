<template>
  <div class="loading-screen">
    <div class="bg-wrap">
      <img class="bg-spiral" src="/Assets/UI/Screens/spiral.svg" alt="">
    </div>
    <p class="loading-text">ЗАГРУЗКА</p>
    <img class="vhs-player" src="/Assets/UI/Screens/vhs-player.png" alt="">
    <img
      class="vhs-cassette"
      :class="{ 'at-entrance': phase >= 1, 'inserted': phase >= 2 }"
      src="/Assets/UI/Screens/vhs-casette.png"
      alt=""
    >
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const phase = ref(0)
let t1 = null
let t2 = null
let t3 = null

onMounted(() => {
  // Phase 1: cassette slides up to VHS entrance (601 → 421)
  t1 = setTimeout(() => { phase.value = 1 }, 300)
  // Phase 2: cassette shrinks into VHS (insert) — placeholder timing
  t2 = setTimeout(() => { phase.value = 2 }, 1500)
  // Done
  t3 = setTimeout(() => emit('done'), 2500)
})

onUnmounted(() => {
  clearTimeout(t1)
  clearTimeout(t2)
  clearTimeout(t3)
})
</script>

<style scoped>
.loading-screen {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: auto;
  overflow: hidden;
}

.bg-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-spiral {
  position: absolute;
  left: -226px;
  top: -537px;
  width: 799px;
  height: 799px;
  animation: spin 30s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  position: absolute;
  z-index: 1;
  top: calc(50% - 90px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  line-height: 26px;
  color: #fff;
  white-space: nowrap;
}

.vhs-player {
  position: absolute;
  z-index: 2;
  left: 34px;
  top: 426px;
  width: 326px;
  height: 119px;
}

.vhs-cassette {
  position: absolute;
  z-index: 3;
  left: 29.57px;
  top: 601px;
  width: 335.85px;
  height: 79.84px;
  transition: top 1s ease-in-out, left 0.8s ease-in-out, width 0.8s ease-in-out, height 0.8s ease-in-out;
}

/* State 2: cassette at VHS entrance */
.vhs-cassette.at-entrance {
  top: 421px;
}

/* State 3: cassette inserted into slot */
.vhs-cassette.inserted {
  z-index: 1;
  left: 93px;
  top: 436.24px;
  width: 209px;
  height: 49.68px;
}
</style>
