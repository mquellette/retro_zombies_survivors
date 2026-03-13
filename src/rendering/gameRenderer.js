import { Container, Sprite, Graphics, Assets } from 'pixi.js'
import { GAME_W, GAME_H, COL } from '../constants.js'
import { getHeroTexture, getZombieTexture, getZombieCellSize } from './spriteManager.js'
import { createJoystickGraphics, updateJoystick } from './joystickRenderer.js'
import * as engine from '../game/gameEngine.js'

// Layer containers
let bgLayer, gemLayer, enemyLayer, projectileLayer, playerLayer, joystickLayer

// Sprite pools
const enemySprites = new Map()       // entity.id -> { container, sprite, hpBg, hpBar }
const projectileSprites = new Map()  // entity.id -> Graphics
const gemSprites = new Map()         // entity.id -> Sprite
const colaSprites = new Map()        // entity.id -> Sprite
const diskSprites = new Map()        // entity.id -> Sprite
let playerSprite = null
let playerHpBg = null
let playerHpBar = null
let bgRect = null

// Draw sizes
const HERO_DRAW_H = 48
const ZOMBIE_DRAW_H = 40

export function createLayers(stage) {
  bgLayer = new Container()
  gemLayer = new Container()
  enemyLayer = new Container()
  projectileLayer = new Container()
  playerLayer = new Container()
  joystickLayer = new Container()

  stage.addChild(bgLayer, gemLayer, enemyLayer, projectileLayer, playerLayer, joystickLayer)

  // Background
  bgRect = new Graphics()
  bgLayer.addChild(bgRect)

  // Joystick
  joystickLayer.addChild(createJoystickGraphics())

  return { bgLayer, gemLayer, enemyLayer, projectileLayer, playerLayer, joystickLayer }
}

export function sync() {
  const p = engine.player
  if (!p) return

  // Background
  bgRect.clear()
  bgRect.rect(0, 0, GAME_W, GAME_H)
  bgRect.fill({ color: 0x086f51 })

  _syncGems()
  _syncColas()
  _syncDisks()
  _syncEnemies()
  _syncProjectiles()
  _syncPlayer(p)
  updateJoystick()
}

function _syncGems() {
  const activeIds = new Set()
  const brainTex = Assets.get('brain_drop')
  for (const g of engine.gems) {
    activeIds.add(g.id)
    let spr = gemSprites.get(g.id)
    if (!spr) {
      if (brainTex) {
        spr = new Sprite(brainTex)
        spr.anchor.set(0.5, 0.5)
        spr.width = 14
        spr.height = 14
      } else {
        spr = new Graphics()
        spr.rect(-4, -4, 8, 8)
        spr.fill({ color: 0x00ccff })
      }
      gemLayer.addChild(spr)
      gemSprites.set(g.id, spr)
    }
    spr.x = g.x
    spr.y = g.y
  }
  for (const [id, spr] of gemSprites) {
    if (!activeIds.has(id)) {
      gemLayer.removeChild(spr)
      spr.destroy()
      gemSprites.delete(id)
    }
  }
}

function _syncColas() {
  const activeIds = new Set()
  const colaTex = Assets.get('cola_drop')
  for (const c of engine.colas) {
    activeIds.add(c.id)
    let spr = colaSprites.get(c.id)
    if (!spr) {
      if (colaTex) {
        spr = new Sprite(colaTex)
        spr.anchor.set(0.5, 0.5)
        spr.width = 16
        spr.height = 16
      } else {
        spr = new Graphics()
        spr.rect(-4, -4, 8, 8)
        spr.fill({ color: 0xff4444 })
      }
      gemLayer.addChild(spr)
      colaSprites.set(c.id, spr)
    }
    spr.x = c.x
    spr.y = c.y
  }
  for (const [id, spr] of colaSprites) {
    if (!activeIds.has(id)) {
      gemLayer.removeChild(spr)
      spr.destroy()
      colaSprites.delete(id)
    }
  }
}

function _syncDisks() {
  const activeIds = new Set()
  const diskTex = Assets.get('coin_icon')
  for (const dk of engine.disks) {
    activeIds.add(dk.id)
    let spr = diskSprites.get(dk.id)
    if (!spr) {
      if (diskTex) {
        spr = new Sprite(diskTex)
        spr.anchor.set(0.5, 0.5)
        spr.width = 14
        spr.height = 14
      } else {
        spr = new Graphics()
        spr.circle(0, 0, 5)
        spr.fill({ color: 0xffcc00 })
      }
      gemLayer.addChild(spr)
      diskSprites.set(dk.id, spr)
    }
    spr.x = dk.x
    spr.y = dk.y
  }
  for (const [id, spr] of diskSprites) {
    if (!activeIds.has(id)) {
      gemLayer.removeChild(spr)
      spr.destroy()
      diskSprites.delete(id)
    }
  }
}

function _syncEnemies() {
  const activeIds = new Set()
  for (const e of engine.enemies) {
    activeIds.add(e.id)
    let data = enemySprites.get(e.id)
    if (!data) {
      data = _createEnemySpriteData()
      enemySprites.set(e.id, data)
    }

    const tex = getZombieTexture(e.dir || 0, e.gender)
    if (tex) {
      data.sprite.texture = tex
      data.sprite.visible = true
      const cellSize = getZombieCellSize()
      const drawH = ZOMBIE_DRAW_H
      const drawW = Math.round(drawH * (cellSize.w / cellSize.h))
      data.sprite.width = drawW
      data.sprite.height = drawH
    } else {
      data.sprite.visible = false
    }

    data.container.x = e.x
    data.container.y = e.y

    // HP bar
    if (e.hp < e.maxHp) {
      data.hpBg.visible = true
      data.hpBar.visible = true
      const bw = e.w
      data.hpBg.clear()
      data.hpBg.rect(-bw / 2, -e.h / 2 - 5, bw, 3)
      data.hpBg.fill({ color: 0x440000 })
      data.hpBar.clear()
      data.hpBar.rect(-bw / 2, -e.h / 2 - 5, bw * (e.hp / e.maxHp), 3)
      data.hpBar.fill({ color: 0xff3333 })
    } else {
      data.hpBg.visible = false
      data.hpBar.visible = false
    }
  }
  for (const [id, data] of enemySprites) {
    if (!activeIds.has(id)) {
      enemyLayer.removeChild(data.container)
      data.container.destroy({ children: true })
      enemySprites.delete(id)
    }
  }
}

function _createEnemySpriteData() {
  const container = new Container()
  const sprite = new Sprite()
  sprite.anchor.set(0.5, 0.5)
  const hpBg = new Graphics()
  const hpBar = new Graphics()
  hpBg.visible = false
  hpBar.visible = false
  container.addChild(sprite, hpBg, hpBar)
  enemyLayer.addChild(container)
  return { container, sprite, hpBg, hpBar }
}

function _syncProjectiles() {
  const activeIds = new Set()
  for (const p of engine.projectiles) {
    activeIds.add(p.id)
    let spr = projectileSprites.get(p.id)
    if (!spr) {
      spr = _createProjectileGraphic(p)
      projectileLayer.addChild(spr)
      projectileSprites.set(p.id, spr)
    }
    _updateProjectileGraphic(spr, p)
  }
  for (const [id, spr] of projectileSprites) {
    if (!activeIds.has(id)) {
      projectileLayer.removeChild(spr)
      spr.destroy()
      projectileSprites.delete(id)
    }
  }
}

function _createProjectileGraphic(p) {
  const g = new Graphics()

  switch (p.type) {
    case 'bullet':
      g.rect(-3, -3, 6, 6)
      g.fill({ color: 0xffff00 })
      break

    case 'melee_arc':
      // Drawn dynamically
      break

    case 'aoe_ring':
      // Drawn dynamically
      break

    case 'boomerang':
      g.rect(-5, -3, 10, 6)
      g.fill({ color: 0xff8800 })
      break

    case 'orbit':
      g.circle(0, 0, 5)
      g.fill({ color: 0xff4444 })
      break

    case 'trail':
      g.rect(-p.w / 2, -p.h / 2, p.w, p.h)
      g.fill({ color: 0x88ff44, alpha: 0.4 })
      break
  }

  return g
}

function _updateProjectileGraphic(spr, p) {
  switch (p.type) {
    case 'bullet':
      spr.x = p.x
      spr.y = p.y
      break

    case 'melee_arc':
      spr.clear()
      spr.x = p.x
      spr.y = p.y
      // Draw arc
      spr.moveTo(0, 0)
      spr.arc(0, 0, p.range, p.angle - p.arcWidth / 2, p.angle + p.arcWidth / 2)
      spr.lineTo(0, 0)
      spr.fill({ color: 0xffffff, alpha: 0.3 })
      break

    case 'aoe_ring':
      spr.clear()
      spr.x = p.x
      spr.y = p.y
      if (p.currentRadius > 0) {
        spr.circle(0, 0, p.currentRadius)
        spr.stroke({ color: 0x00ffff, width: 3, alpha: 0.6 })
        spr.circle(0, 0, p.currentRadius)
        spr.fill({ color: 0x00ffff, alpha: 0.1 })
      }
      break

    case 'boomerang':
      spr.x = p.x
      spr.y = p.y
      spr.rotation = p.rotation || 0
      break

    case 'orbit':
      spr.x = p.x
      spr.y = p.y
      break

    case 'trail':
      spr.x = p.x
      spr.y = p.y
      spr.alpha = Math.min(1, p.life)
      break
  }
}

function _syncPlayer(p) {
  if (!playerSprite) {
    playerSprite = new Sprite()
    playerSprite.anchor.set(0.5, 0.5)
    playerHpBg = new Graphics()
    playerHpBar = new Graphics()
    playerLayer.addChild(playerSprite, playerHpBg, playerHpBar)
  }

  const tex = getHeroTexture(p.dir || 0)
  if (tex) {
    playerSprite.texture = tex
    playerSprite.visible = true
    const origW = tex.width
    const origH = tex.height
    if (origH > 0) {
      const drawH = HERO_DRAW_H
      const drawW = Math.round(drawH * (origW / origH))
      playerSprite.width = drawW
      playerSprite.height = drawH
    }
  }

  playerSprite.x = p.x
  playerSprite.y = p.y

  // HP bar
  if (p.hp < p.maxHp) {
    playerHpBg.visible = true
    playerHpBar.visible = true
    const hpBarW = 36
    const hpBarH = 6
    const hpY = p.y + 20
    playerHpBg.clear()
    playerHpBg.roundRect(p.x - hpBarW / 2, hpY, hpBarW, hpBarH, 100)
    playerHpBg.fill({ color: 0x000000 })
    playerHpBar.clear()
    const fillW = hpBarW * (p.hp / p.maxHp)
    if (fillW > 0) {
      playerHpBar.roundRect(p.x - hpBarW / 2, hpY, fillW, hpBarH, 100)
      playerHpBar.fill({ color: 0xf32121 })
    }
  } else {
    playerHpBg.visible = false
    playerHpBar.visible = false
  }
}

export function reset() {
  for (const [, spr] of gemSprites) { spr.destroy() }
  gemSprites.clear()
  for (const [, spr] of colaSprites) { spr.destroy() }
  colaSprites.clear()
  for (const [, spr] of diskSprites) { spr.destroy() }
  diskSprites.clear()
  gemLayer?.removeChildren()

  for (const [, data] of enemySprites) { data.container.destroy({ children: true }) }
  enemySprites.clear()
  enemyLayer?.removeChildren()

  for (const [, spr] of projectileSprites) { spr.destroy() }
  projectileSprites.clear()
  projectileLayer?.removeChildren()

  if (playerSprite) {
    playerSprite.destroy()
    playerHpBg.destroy()
    playerHpBar.destroy()
    playerSprite = null
    playerHpBg = null
    playerHpBar = null
    playerLayer?.removeChildren()
  }
}
