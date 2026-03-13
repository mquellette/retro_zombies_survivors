<template>
  <div class="game-hud">
    <!-- XP Bar -->
    <div class="xp-bar-wrap">
      <div class="xp-bar-bg">
        <div class="xp-bar-fill" :style="{ width: xpPercent + '%' }"></div>
        <span class="xp-label">LVL {{ store.level }}</span>
      </div>
    </div>

    <!-- Second row: slots | timer | counters -->
    <div class="info-row">
      <!-- Ability slots -->
      <div class="ability-slots">
        <div class="slot" v-for="i in 4" :key="i"></div>
      </div>

      <!-- Timer -->
      <div class="timer">{{ formattedTime }}</div>

      <!-- Counters -->
      <div class="counters">
        <div class="counter">
          <span class="counter-val">{{ store.kills }}</span>
          <span class="counter-icon">☠</span>
        </div>
        <div class="counter">
          <span class="counter-val">{{ store.coins }}</span>
          <span class="counter-icon">●</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameStore as store } from '../../store/gameStore.js'
import { CONFIG } from '../../config.js'

const xpPercent = computed(() =>
  Math.min((store.xp / store.xpToNext) * 100, 100)
)

const formattedTime = computed(() => {
  const elapsed = store.elapsed
  const mins = Math.floor(elapsed / 60)
  const secs = Math.floor(elapsed % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})
</script>

<style scoped>
.game-hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  pointer-events: none;
}
.xp-bar-wrap {
  margin-bottom: 6px;
}
.xp-bar-bg {
  position: relative;
  height: 16px;
  background: #2a0a2a;
  border: 1px solid #6a1a6a;
}
.xp-bar-fill {
  height: 100%;
  background: #ff44ff;
  transition: width 0.1s linear;
}
.xp-label {
  position: absolute;
  right: 4px;
  top: 1px;
  font: 10px monospace;
  color: #fff;
}
.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.ability-slots {
  display: flex;
  gap: 4px;
}
.slot {
  width: 22px;
  height: 22px;
  background: #5a6a5a;
}
.timer {
  font: 16px monospace;
  color: #fff;
}
.counters {
  text-align: right;
}
.counter {
  font: 10px monospace;
  color: #fff;
  line-height: 1.5;
}
.counter-icon {
  margin-left: 3px;
}
</style>
