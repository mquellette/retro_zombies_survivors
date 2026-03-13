<template>
  <div class="result-overlay">
    <h2 :class="['result-title', victory ? 'victory' : 'defeat']">
      {{ victory ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ' }}
    </h2>

    <div class="stats-row">
      <div class="stat-item">
        <img class="stat-icon" :src="skullIcon" alt="">
        <span class="stat-value">{{ store.kills }}</span>
      </div>
      <div class="stat-item">
        <img class="stat-icon" :src="coinIcon" alt="">
        <span class="stat-value">{{ store.coins }}</span>
      </div>
    </div>

    <div class="buttons-col">
      <button class="btn btn-play" @click="$emit('retry')">
        Сыграть ещё
      </button>
      <button class="btn btn-menu" @click="$emit('menu')">
        В меню
      </button>
    </div>
  </div>
</template>

<script setup>
import { gameStore as store } from '../../store/gameStore.js'

defineProps({ victory: Boolean })
defineEmits(['retry', 'menu'])

const BASE = import.meta.env.BASE_URL
const skullIcon = `${BASE}Assets/UI/Icons/Stats/ic-stats-skull.png`
const coinIcon = `${BASE}Assets/UI/Icons/Stats/ic-currency-disk.png`
</script>

<style scoped>
.result-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  font-family: 'Press Start 2P', monospace;
}

.result-title {
  font-size: 32px;
  line-height: 40px;
  margin: 0 0 24px;
  text-align: center;
}

.result-title.victory {
  color: #fff;
}

.result-title.defeat {
  color: #fff;
}

.stats-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stat-icon {
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
}

.stat-value {
  font-size: 16px;
  color: #fff;
}

.buttons-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: calc(100% - 48px);
  max-width: 345px;
  margin-bottom: 24px;
}

.btn {
  width: 100%;
  border: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  line-height: 16px;
  color: #fff;
  cursor: pointer;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-play {
  background: #20268f;
}

.btn-menu {
  background: #8b3a2a;
}

.btn:active {
  filter: brightness(1.2);
}
</style>
