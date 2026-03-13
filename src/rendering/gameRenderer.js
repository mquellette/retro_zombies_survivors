import { Container, Sprite, Graphics } from 'pixi.js'
import { GAME_W, GAME_H, COL } from '../constants.js'
import { getHeroTexture, getZombieTexture, getZombieCellSize } from './spriteManager.js'
import { createJoystickGraphics, updateJoystick } from './joystickRenderer.js'
import * as engine from '../game/gameEngine.js'

// Layer containers
let bgLayer, gemLayer, enemyLayer, bulletLayer, playerLayer, joystickLayer

// Sprite pools
const enemySprites = new Map()   // entity.id -> { container, sprite, hpBg, hpBar }
const bulletSprites = new Map()  // entity.id -> sprite
const gemSprites = new Map()     // entity.id -> sprite
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
  bulletLayer = new Container()
  playerLayer = new Container()
  joystickLayer = new Container()

  stage.addChild(bgLayer, gemLayer, enemyLayer, bulletLayer, playerLayer, joystickLayer)

  // Background
  bgRect = new Graphics()
  bgLayer.addChild(bgRect)

  // Joystick
  joystickLayer.addChild(createJoystickGraphics())

  return { bgLayer, gemLayer, enemyLayer, bulletLayer, playerLayer, joystickLayer }
}

export function sync() {
  const p = engine.player
  if (!p) return

  // Background
  bgRect.clear()
  bgRect.rect(0, 0, GAME_W, GAME_H)
  bgRect.fill({ color: 0x086f51 })

  _syncGems()
  _syncEnemies()
  _syncBullets()
  _syncPlayer(p)
  updateJoystick()
}

function _syncGems() {
  const activeIds = new Set()
  for (const g of engine.gems) {
    activeIds.add(g.id)
    let spr = gemSprites.get(g.id)
    if (!spr) {
      spr = new Graphics()
      spr.rect(-4, -4, 8, 8)
      spr.fill({ color: 0x00ccff })
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

function _syncEnemies() {
  const activeIds = new Set()
  for (const e of engine.enemies) {
    activeIds.add(e.id)
    let data = enemySprites.get(e.id)
    if (!data) {
      data = _createEnemySpriteData()
      enemySprites.set(e.id, data)
    }

    const tex = getZombieTexture(e.dir || 0, 0)
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

function _syncBullets() {
  const activeIds = new Set()
  for (const b of engine.bullets) {
    activeIds.add(b.id)
    let spr = bulletSprites.get(b.id)
    if (!spr) {
      spr = new Graphics()
      spr.rect(-3, -3, 6, 6)
      spr.fill({ color: 0xffff00 })
      bulletLayer.addChild(spr)
      bulletSprites.set(b.id, spr)
    }
    spr.x = b.x
    spr.y = b.y
  }
  for (const [id, spr] of bulletSprites) {
    if (!activeIds.has(id)) {
      bulletLayer.removeChild(spr)
      spr.destroy()
      bulletSprites.delete(id)
    }
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
    // Scale proportionally to HERO_DRAW_H
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

  // HP bar (Figma: 36×6, black bg, #F32121 fill, rounded)
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
  gemLayer?.removeChildren()

  for (const [, data] of enemySprites) { data.container.destroy({ children: true }) }
  enemySprites.clear()
  enemyLayer?.removeChildren()

  for (const [, spr] of bulletSprites) { spr.destroy() }
  bulletSprites.clear()
  bulletLayer?.removeChildren()

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
