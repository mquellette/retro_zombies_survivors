import { Graphics } from 'pixi.js'
import { joystick } from '../input/joystick.js'
import { clamp } from '../utils.js'

let gfx = null

export function createJoystickGraphics() {
  gfx = new Graphics()
  return gfx
}

export function updateJoystick() {
  if (!gfx) return
  gfx.clear()

  if (!joystick.active) {
    gfx.visible = false
    return
  }
  gfx.visible = true

  // Outer circle (base)
  gfx.circle(joystick.startX, joystick.startY, joystick.radius)
  gfx.fill({ color: 0xaaccaa, alpha: 0.2 })

  // Inner thumb
  const tx = joystick.startX + clamp(joystick.dx, -joystick.radius, joystick.radius)
  const ty = joystick.startY + clamp(joystick.dy, -joystick.radius, joystick.radius)
  gfx.circle(tx, ty, 13)
  gfx.fill({ color: 0xffffff, alpha: 0.5 })
}
