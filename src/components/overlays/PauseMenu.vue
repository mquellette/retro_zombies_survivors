<template>
  <div class="pause-overlay">
    <h2 class="pause-title">ПАУЗА</h2>
    <div class="buttons-col">
      <button class="btn btn-resume" @click="$emit('resume')">
        Продолжить
      </button>
      <button class="btn btn-restart" @click="$emit('restart')">
        Начать заново
      </button>
      <button class="btn btn-settings" @click="$emit('settings')">
        Настройки
      </button>
      <button class="btn btn-menu" @click="$emit('menu')">
        Выйти в меню
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['resume', 'restart', 'settings', 'menu'])
</script>

<style scoped>
.pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  pointer-events: auto;
  font-family: 'Press Start 2P', monospace;
}

.pause-title {
  font-size: 28px;
  color: #fff;
  margin: 0;
}

.buttons-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: calc(100% - 48px);
  max-width: 345px;
}

.btn {
  width: 100%;
  border: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  line-height: 16px;
  color: #fff;
  cursor: pointer;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-resume {
  background: #68f349;
}

.btn-restart {
  background: #20268f;
}

.btn-settings {
  background: #5d5d5d;
}

.btn-menu {
  background: #8b3a2a;
}

.btn:active {
  filter: brightness(1.2);
}
</style>
