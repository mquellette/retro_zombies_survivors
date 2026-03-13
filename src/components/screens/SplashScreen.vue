<template>
  <div class="splash" @click="skip">
    <img class="splash-bg" src="/Assets/UI/Screens/Background-splashscreen.png" alt="">
    <img
      class="splash-logo"
      :class="{ 'logo-up': phase >= 1 }"
      src="/Assets/UI/Screens/logo.png"
      alt="Retro Zombie Survivors"
    >
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const phase = ref(0)
let timer1 = null
let timer2 = null

onMounted(() => {
  // After 2s, animate logo up
  timer1 = setTimeout(() => { phase.value = 1 }, 2000)
  // After logo animation (1s transition) + short pause, done
  timer2 = setTimeout(() => { emit('done') }, 3500)
})

onUnmounted(() => {
  clearTimeout(timer1)
  clearTimeout(timer2)
})

function skip() {
  clearTimeout(timer1)
  clearTimeout(timer2)
  emit('done')
}
</script>

<style scoped>
.splash {
  position: absolute;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  overflow: hidden;
}

.splash-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.splash-logo {
  position: relative;
  width: 100%;
  max-width: 393px;
  z-index: 1;
  transition: transform 1s ease-in-out;
  transform: translateY(0);
}

.logo-up {
  transform: translateY(-40%);
}
</style>
