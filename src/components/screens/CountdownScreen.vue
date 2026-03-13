<template>
  <div class="countdown-screen">
    <div class="mission-text" v-if="count > 0">
      <p>ПРОДЕРЖИСЬ</p>
      <p>3 МИНУТЫ</p>
    </div>
    <div class="countdown-num" :key="count">{{ count > 0 ? count : 'ВЫЖИВАЙ' }}</div>
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
  background: #086f51;
  pointer-events: auto;
  overflow: hidden;
}

.mission-text {
  position: absolute;
  top: calc(50% - 139px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  line-height: 34px;
  color: #fff;
  text-align: center;
  white-space: nowrap;
}

.countdown-num {
  position: absolute;
  top: calc(50% - 25px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Press Start 2P', monospace;
  font-size: 48px;
  line-height: 50px;
  color: #fff;
  white-space: nowrap;
  animation: pop 0.3s ease-out;
}

@keyframes pop {
  0% { transform: translateX(-50%) scale(1.5); opacity: 0.5; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}
</style>
