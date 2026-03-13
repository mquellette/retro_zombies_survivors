<template>
  <div class="gameover-overlay">
    <h2 :class="['result-title', victory ? 'victory' : 'defeat']">
      {{ victory ? 'VICTORY!' : 'GAME OVER' }}
    </h2>
    <div class="stats">
      <p>Time: {{ formattedTime }}</p>
      <p>Kills: {{ store.kills }}</p>
      <p>Level: {{ store.level }}</p>
    </div>
    <button class="retry-btn" @click="$emit('retry')">RETRY</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameStore as store } from '../../store/gameStore.js'
import { CONFIG } from '../../config.js'

defineProps({ victory: Boolean })
defineEmits(['retry'])

const formattedTime = computed(() => {
  const elapsed = store.elapsed
  const mins = Math.floor(elapsed / 60)
  const secs = Math.floor(elapsed % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
})
</script>

<style scoped>
.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}
.result-title {
  font: 700 20px monospace;
  margin-bottom: 30px;
}
.result-title.victory { color: #00ff88; }
.result-title.defeat  { color: #ff4444; }
.stats {
  font: 10px monospace;
  color: #fff;
  text-align: center;
  line-height: 2;
  margin-bottom: 30px;
}
.retry-btn {
  width: 160px;
  height: 44px;
  background: #4444aa;
  border: none;
  color: #fff;
  font: 700 14px monospace;
  cursor: pointer;
}
.retry-btn:active {
  background: #6666cc;
}
</style>
