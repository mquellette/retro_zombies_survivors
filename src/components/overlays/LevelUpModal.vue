<template>
  <div class="levelup-overlay">
    <div class="levelup-header">
      <h2 class="levelup-title">Новый уровень!</h2>
      <p class="levelup-subtitle">Выберите усиление</p>
    </div>

    <div class="cards-container">
      <div
        v-for="(choice, i) in store.levelUpChoices"
        :key="i"
        class="card"
        :class="{ selected: store.selectedUpgrade === i }"
        @click="store.selectedUpgrade = i"
      >
        <div class="card-icon-wrap">
          <img v-if="choice.icon" class="card-icon" :src="choice.icon" alt="">
          <span v-else class="card-icon-placeholder">?</span>
        </div>
        <div class="card-text">
          <span class="card-name">{{ choice.name }}</span>
          <span class="card-desc">{{ choice.desc }}</span>
        </div>
      </div>
    </div>

    <div class="buttons-col">
      <button
        class="btn btn-reroll"
        :disabled="store.rerollsLeft <= 0 || store.selectedUpgrade < 0"
        @click="onReroll"
      >
        <span class="btn-main-text">{{ store.rerollsLeft > 0 ? 'Заменить' : 'За Stars' }}</span>
        <span class="btn-sub-text">Доступно: {{ store.rerollsLeft }}</span>
      </button>
      <button
        class="btn btn-choose"
        :class="{ active: store.selectedUpgrade >= 0 }"
        :disabled="store.selectedUpgrade < 0"
        @click="onChoose"
      >
        Выбрать
      </button>
    </div>
  </div>
</template>

<script setup>
import { gameStore as store } from '../../store/gameStore.js'

const emit = defineEmits(['choose', 'reroll'])

function onChoose() {
  if (store.selectedUpgrade < 0) return
  emit('choose', store.selectedUpgrade)
}

function onReroll() {
  if (store.selectedUpgrade < 0) return
  if (store.rerollsLeft <= 0) return
  emit('reroll', store.selectedUpgrade)
}
</script>

<style scoped>
.levelup-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
  pointer-events: auto;
  font-family: 'Press Start 2P', monospace;
  overflow: hidden;
}

.levelup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.levelup-title {
  font-size: 24px;
  line-height: 34px;
  color: #fff;
  margin: 0;
  text-align: center;
}

.levelup-subtitle {
  font-size: 14px;
  line-height: 16px;
  color: #fff;
  margin: 0;
  text-align: center;
}

.cards-container {
  width: calc(100% - 32px);
  max-width: 361px;
  background: #8b3afc;
  border-radius: 18px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.card.selected {
  border-color: #68f349;
}

.card-icon-wrap {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: #cc5252;
  border: 2px solid #68f349;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  image-rendering: pixelated;
}

.card-icon-placeholder {
  font-size: 20px;
  color: #fff;
}

.card-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 6px;
}

.card-name {
  font-size: 14px;
  line-height: 16px;
  color: #fff;
}

.card-desc {
  font-size: 10px;
  line-height: 12px;
  color: #fff;
}

.buttons-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: calc(100% - 48px);
  max-width: 345px;
  flex-shrink: 0;
}

.btn {
  width: 100%;
  border: none;
  font-family: 'Press Start 2P', monospace;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-reroll {
  background: #20268f;
  height: 64px;
  flex-direction: column;
  gap: 10px;
  padding: 24px 32px;
}

.btn-main-text {
  font-size: 18px;
  line-height: 16px;
}

.btn-sub-text {
  font-size: 14px;
  line-height: 16px;
}

.btn-choose {
  background: #5d5d5d;
  font-size: 18px;
  line-height: 16px;
  padding: 24px 32px;
  transition: background-color 0.15s;
}

.btn-choose.active {
  background: #68f349;
}

.btn:not(:disabled):active {
  filter: brightness(1.2);
}
</style>
