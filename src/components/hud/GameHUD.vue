<template>
  <div class="game-hud" :style="{ paddingTop: safeTop + 'px' }">
    <!-- XP Bar -->
    <div class="xp-row">
      <div class="xp-bar-bg">
        <div class="xp-bar-fill" :style="{ width: xpPercent + '%' }"></div>
      </div>
      <span class="xp-label">LVL {{ store.level }}</span>
    </div>

    <!-- Second row: slots | timer | counters -->
    <div class="info-row">
      <!-- Weapon slots -->
      <div class="weapon-slots">
        <div class="slot" v-for="i in 4" :key="i">
          <template v-if="store.weapons[i - 1]">
            <img v-if="store.weapons[i - 1].icon" class="slot-icon" :src="store.weapons[i - 1].icon" alt="">
            <span v-else class="slot-placeholder">?</span>
            <div class="level-pips">
              <span v-for="pip in 5" :key="pip" class="pip" :class="{ filled: pip <= store.weapons[i - 1].level }" />
            </div>
          </template>
        </div>
      </div>

      <!-- Timer -->
      <div class="timer">{{ formattedTime }}</div>

      <!-- Counters -->
      <div class="counters">
        <div class="counter">
          <span class="counter-val">{{ store.kills }}</span>
          <img class="counter-icon" src="/Assets/UI/Icons/Stats/ic-stats-skull.png" alt="">
        </div>
        <div class="counter">
          <span class="counter-val">{{ store.coins }}</span>
          <img class="counter-icon" src="/Assets/UI/Icons/Stats/ic-currency-disk.png" alt="">
        </div>
      </div>
    </div>

    <!-- Pause button -->
    <button class="pause-btn" @click="$emit('pause')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="3" width="4" height="14" rx="1" fill="#fff"/>
        <rect x="12" y="3" width="4" height="14" rx="1" fill="#fff"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { gameStore as store } from '../../store/gameStore.js'

defineEmits(['pause'])

const safeTop = ref(14)

function updateSafeTop() {
  const tg = window.Telegram?.WebApp
  if (!tg) return
  // safeAreaInset = device safe area (notch, status bar)
  // contentSafeAreaInset = below Telegram's header (Close button, toolbar)
  const sa = tg.safeAreaInset || {}
  const csa = tg.contentSafeAreaInset || {}
  const top = (sa.top || 0) + (csa.top || 0)
  safeTop.value = top > 0 ? top + 14 : 14
}

onMounted(() => {
  updateSafeTop()
  const tg = window.Telegram?.WebApp
  if (tg) {
    tg.onEvent?.('safeAreaChanged', updateSafeTop)
    tg.onEvent?.('contentSafeAreaChanged', updateSafeTop)
    // Retry after short delay in case insets aren't ready yet
    setTimeout(updateSafeTop, 500)
  }
})

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
  padding: 14px 16px 0;
  pointer-events: none;
  font-family: 'Press Start 2P', monospace;
}

/* XP Bar row */
.xp-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.xp-bar-bg {
  flex: 1;
  height: 16px;
  background: #3b0139;
  border-radius: 100px;
  overflow: hidden;
  padding: 2px;
}

.xp-bar-fill {
  height: 100%;
  background: #ff34f8;
  border-radius: 100px;
  transition: width 0.1s linear;
}

.xp-label {
  font-size: 12px;
  line-height: 14px;
  color: #fff;
  white-space: nowrap;
}

/* Info row */
.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

/* Weapon slots */
.weapon-slots {
  display: flex;
  gap: 6px;
}

.slot {
  width: 24px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 2px;
}

.slot-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  image-rendering: pixelated;
}

.slot-placeholder {
  font-size: 10px;
  color: #fff;
  line-height: 20px;
}

.level-pips {
  display: flex;
  gap: 1px;
}

.pip {
  width: 3px;
  height: 2px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 1px;
}

.pip.filled {
  background: #fff;
}

/* Timer */
.timer {
  font-size: 16px;
  line-height: 16px;
  color: #fff;
}

/* Counters */
.counters {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.counter {
  display: flex;
  align-items: center;
  gap: 2px;
}

.counter-val {
  font-size: 12px;
  line-height: 14px;
  color: #fff;
  text-align: right;
}

.counter-icon {
  width: 16px;
  height: 16px;
  object-fit: cover;
  image-rendering: pixelated;
}

/* Pause button */
.pause-btn {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ff9900;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
}

.pause-btn:active {
  filter: brightness(0.8);
}
</style>
