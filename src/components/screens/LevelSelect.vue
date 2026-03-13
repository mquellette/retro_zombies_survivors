<template>
  <div class="levels-screen">
    <!-- Spiral background -->
    <div class="bg-spiral"></div>

    <!-- Toolbar -->
    <div class="toolbar">
      <button class="btn-back" @click="$emit('back')">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#2979FF"/>
          <path d="M19 10L13 16L19 22" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="toolbar-title">Выберите уровень</span>
    </div>

    <!-- VHS Preview -->
    <div class="vhs-preview">
      <img class="vhs-preview-img" src="/Assets/UI/Screens/level_preview-level_1.png" alt="">
      <div class="vhs-info">
        <p class="vhs-name">Начало кошмара</p>
        <p class="vhs-detail">90 секунд</p>
        <p class="vhs-detail">Легко</p>
      </div>
    </div>

    <!-- Level Grid -->
    <div class="level-grid">
      <div class="level-row">
        <button
          v-for="n in 4" :key="n"
          class="level-cell"
          :class="{ selected: n === selected, locked: n > 1 }"
          @click="selectLevel(n)"
        >
          <span class="level-num">{{ n }}</span>
          <span v-if="n > 1" class="lock-icon">&#x1F512;</span>
        </button>
      </div>
      <div class="level-row">
        <button
          v-for="n in 4" :key="n + 4"
          class="level-cell locked"
        >
          <span class="level-num">{{ n + 4 }}</span>
          <span class="lock-icon">&#x1F512;</span>
        </button>
      </div>
    </div>

    <!-- Start button -->
    <button class="start-btn" @click="$emit('select', selected)">НАЧАТЬ ИГРУ</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['back', 'select'])
const selected = ref(1)

function selectLevel(n) {
  if (n <= 1) selected.value = n
}
</script>

<style scoped>
.levels-screen {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bg-spiral {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 60% 20%, #c0392b 0%, transparent 50%),
    radial-gradient(ellipse at 30% 70%, #c0392b 0%, transparent 50%);
  opacity: 0.5;
}

/* Toolbar */
.toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 100px 24px 0;
  height: 148px;
  flex-shrink: 0;
}

.btn-back {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.toolbar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  line-height: 16px;
  color: #fff;
  white-space: nowrap;
}

/* VHS Preview */
.vhs-preview {
  position: relative;
  z-index: 1;
  width: 345px;
  height: 204px;
  margin: 24px auto 0;
  flex-shrink: 0;
}

.vhs-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vhs-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 8px 12px;
  text-align: center;
  width: 137px;
}

.vhs-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  line-height: 16px;
  color: #000;
  margin-bottom: 8px;
}

.vhs-detail {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  line-height: 12px;
  color: #000;
}

/* Level Grid */
.level-grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 345px;
  margin: 24px auto 0;
}

.level-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.level-cell {
  width: 80.25px;
  height: 64px;
  background: #5d5d5d;
  border: 4px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  padding: 0;
}

.level-cell.selected {
  background: #fff;
  border-color: #208f35;
}

.level-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  line-height: 16px;
  color: #fff;
}

.level-cell.selected .level-num {
  color: #000;
}

.level-cell.locked {
  pointer-events: none;
}

.lock-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
}

/* Start Button */
.start-btn {
  position: relative;
  z-index: 1;
  width: 345px;
  height: 64px;
  margin: auto auto 24px;
  background: #208f35;
  border: none;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  line-height: 16px;
  cursor: pointer;
  padding: 24px 32px;
}

.start-btn:active {
  filter: brightness(1.2);
}
</style>
