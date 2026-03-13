<template>
  <div class="levelup-overlay">
    <div class="levelup-content">
      <h2 class="levelup-title">Новый уровень!</h2>
      <p class="levelup-subtitle">Выберите усиление</p>

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

      <div class="buttons-row">
        <button
          class="btn btn-reroll"
          :disabled="store.rerollsLeft <= 0 || store.selectedUpgrade < 0"
          @click="onReroll"
        >
          {{ store.rerollsLeft > 0 ? 'Заменить' : 'За Stars' }}
        </button>
        <button
          class="btn btn-choose"
          :disabled="store.selectedUpgrade < 0"
          @click="onChoose"
        >
          Выбрать
        </button>
      </div>
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
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  font-family: 'Press Start 2P', monospace;
}

.levelup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 90%;
  max-width: 340px;
}

.levelup-title {
  font-size: 20px;
  color: #fff;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.levelup-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-align: center;
}

.cards-container {
  width: 100%;
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
}

.card-icon {
  width: 36px;
  height: 36px;
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
  gap: 4px;
}

.card-name {
  font-size: 11px;
  color: #fff;
  line-height: 1.3;
}

.card-desc {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}

.buttons-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #fff;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-reroll {
  background: #20268f;
}

.btn-choose {
  background: #5d5d5d;
}

.btn:not(:disabled):active {
  filter: brightness(1.2);
}
</style>
