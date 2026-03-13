<template>
  <div class="menu-screen">
    <div class="title-block">
      <h1 class="title">SURVIVOR</h1>
      <p class="subtitle">zombie nightmare</p>
    </div>
    <button class="play-btn" @click="$emit('play')">PLAY</button>
  </div>
</template>

<script setup>
defineEmits(['play'])
</script>

<style scoped>
.menu-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  pointer-events: auto;
}
.title-block {
  margin-bottom: 80px;
  text-align: center;
}
.title {
  font: 700 28px monospace;
  color: #fff;
  letter-spacing: 4px;
}
.subtitle {
  font: 12px monospace;
  color: #888;
  margin-top: 6px;
}
.play-btn {
  width: 180px;
  height: 50px;
  background: #4444aa;
  border: 2px solid #6666cc;
  color: #fff;
  font: 700 16px monospace;
  cursor: pointer;
  transition: background 0.15s;
}
.play-btn:active {
  background: #6666cc;
}
</style>
