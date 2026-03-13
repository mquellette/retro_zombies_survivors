<template>
  <div class="countdown-screen">
    <div class="countdown-num" :key="count">{{ count > 0 ? count : 'GO!' }}</div>
    <p class="mission-text" v-if="count > 0">Выживи 90 секунд</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const count = ref(3)
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    count.value--
    if (count.value < 0) {
      clearInterval(interval)
      emit('done')
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.countdown-screen {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.countdown-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 64px;
  color: #fff;
  animation: pop 0.3s ease-out;
}

@keyframes pop {
  0% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.mission-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ccc;
  margin-top: 32px;
}
</style>
