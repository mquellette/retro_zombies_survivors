<template>
  <div class="splash" @click="skip">
    <img class="splash-bg" src="/Assets/UI/Screens/Background-splashscreen.png" alt="">
    <img
      class="splash-logo"
      :class="{ 'logo-up': phase >= 1 }"
      src="/Assets/UI/Screens/logo.png"
      alt=""
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
  timer1 = setTimeout(() => { phase.value = 1 }, 2000)
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
</style>
