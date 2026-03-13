import { reactive } from 'vue'

export const gameStore = reactive({
  screen: 'splash', // splash | menu | levels | loading | countdown | game
  selectedLevel: 1,

  // Game state (only relevant when screen === 'game')
  gameState: 'playing', // playing | levelup | gameover | victory

  // Player stats (synced from game engine each frame)
  hp: 100,
  maxHp: 100,
  xp: 0,
  level: 1,
  kills: 0,
  coins: 0,

  // Timer
  timer: 180,
  elapsed: 0,

  // Level up
  xpToNext: 5,
  levelUpChoices: [],
  selectedUpgrade: -1,
  rerollsLeft: 1,

  // Weapons (synced from engine: [{ id, level, icon, name }])
  weapons: [],
})
