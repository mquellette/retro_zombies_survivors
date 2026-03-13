<template>
  <div class="levelup-overlay">
    <div class="levelup-panel">
      <h2 class="levelup-title">LEVEL UP!</h2>
      <button
        v-for="(choice, i) in store.levelUpChoices"
        :key="i"
        class="upgrade-btn"
        @click="$emit('choose', i)"
      >
        <span class="upgrade-icon">{{ choice.icon }}</span>
        {{ choice.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { gameStore as store } from '../../store/gameStore.js'

defineEmits(['choose'])
</script>

<style scoped>
.levelup-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}
.levelup-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.levelup-title {
  font: 700 16px monospace;
  color: #fff;
  margin-bottom: 10px;
}
.upgrade-btn {
  width: 200px;
  height: 50px;
  background: #0f3460;
  border: 1px solid #00ccff;
  color: #fff;
  font: 11px monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}
.upgrade-btn:active {
  background: #1a4a7a;
}
.upgrade-icon {
  font-size: 16px;
}
</style>
