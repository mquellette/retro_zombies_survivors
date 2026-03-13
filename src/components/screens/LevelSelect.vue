<template>
  <div class="levels-screen">
    <button class="back-btn" @click="$emit('back')">&lt; BACK</button>
    <h2 class="header">SELECT LEVEL</h2>

    <div class="level-card" @click="$emit('select', 1)">
      <div class="level-name">1. Cemetery</div>
      <div class="level-desc">Survive 3 minutes among the undead</div>
      <div class="level-diff">Difficulty: ★☆☆</div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['back', 'select'])
</script>

<style scoped>
.levels-screen {
  position: absolute;
  inset: 0;
  background: #1a1a2e;
  pointer-events: auto;
  padding: 20px;
}
.back-btn {
  background: none;
  border: none;
  color: #888;
  font: 12px monospace;
  cursor: pointer;
  padding: 8px 0;
}
.header {
  font: 14px monospace;
  color: #fff;
  text-align: center;
  margin: 20px 0;
}
.level-card {
  background: #16213e;
  border: 1px solid #00ff88;
  padding: 12px;
  margin: 0 auto;
  max-width: 280px;
  cursor: pointer;
  transition: background 0.15s;
}
.level-card:active {
  background: #1c2d50;
}
.level-name {
  font: 13px monospace;
  color: #fff;
  margin-bottom: 8px;
}
.level-desc {
  font: 9px monospace;
  color: #888;
  margin-bottom: 4px;
}
.level-diff {
  font: 9px monospace;
  color: #888;
}
</style>
