<template>
  <div class="menu-screen">
    <img class="menu-logo" src="/Assets/UI/Screens/logo.png" alt="">
    <div class="menu-buttons">
      <button class="menu-btn story" @click="$emit('play')">Сюжетный режим</button>
      <button class="menu-btn endless disabled">Бесконечный забег</button>
      <button class="menu-btn settings disabled">Настройки</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['play'])
</script>

<style scoped>
.menu-screen {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  overflow: hidden;
}

.menu-logo {
  position: absolute;
  top: 11%;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
}

.menu-buttons {
  position: absolute;
  top: 46.1%;
  left: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

.menu-btn {
  width: 100%;
  height: 64px;
  border: none;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  line-height: 16px;
  text-align: center;
  cursor: pointer;
  padding: 24px 32px;
}

.menu-btn.story { background: #208f35; }
.menu-btn.endless { background: #8f3e20; }
.menu-btn.settings { background: #cea323; color: #000; }

.menu-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.menu-btn:active {
  filter: brightness(1.2);
}
</style>
