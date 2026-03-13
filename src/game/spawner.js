import { GAME_W, GAME_H } from '../constants.js'
import { CONFIG } from '../config.js'
import { rnd, rndInt } from '../utils.js'
import { createEnemy } from './entities.js'

export const spawner = {
  timer: 0,
  interval: 2,
  perSpawn: 1,
  elapsed: 0,

  update(dt, enemies, player) {
    const s = CONFIG.spawner
    this.elapsed += dt
    this.timer -= dt

    this.perSpawn = 1 + Math.floor(this.elapsed / s.rampEvery)
    this.interval = Math.max(s.minInterval, s.startInterval - this.elapsed * s.intervalDecay)

    if (this.timer <= 0) {
      this.timer = this.interval
      for (let i = 0; i < this.perSpawn; i++) {
        const pos = this._spawnPos(player)
        let type = 'zombie'
        if (this.elapsed > s.fastSpawnAfter && Math.random() < s.fastSpawnChance) type = 'fast'
        if (this.elapsed > s.bigSpawnAfter && Math.random() < s.bigSpawnChance) type = 'big'
        const elite = Math.random() < s.eliteChance
        enemies.push(createEnemy(pos.x, pos.y, type, elite))
      }
    }
  },

  _spawnPos(player) {
    const margin = 40
    const side = rndInt(0, 3)
    let x, y
    switch (side) {
      case 0: x = rnd(-margin, GAME_W + margin); y = -margin; break
      case 1: x = rnd(-margin, GAME_W + margin); y = GAME_H + margin; break
      case 2: x = -margin; y = rnd(-margin, GAME_H + margin); break
      case 3: x = GAME_W + margin; y = rnd(-margin, GAME_H + margin); break
    }
    return { x, y }
  },

  reset() {
    this.timer = 0
    this.interval = CONFIG.spawner.startInterval
    this.perSpawn = 1
    this.elapsed = 0
  },
}
