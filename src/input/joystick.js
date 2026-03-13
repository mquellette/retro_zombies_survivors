import { clamp } from '../utils.js'
import { GAME_W, GAME_H } from '../constants.js'

export const joystick = {
  active: false,
  startX: 0,
  startY: 0,
  dx: 0,
  dy: 0,
  radius: 40,
  deadzone: 8,
  pointerId: null,
  _canvas: null,

  get nx() {
    const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
    if (len < this.deadzone) return 0
    return clamp(this.dx / this.radius, -1, 1)
  },

  get ny() {
    const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
    if (len < this.deadzone) return 0
    return clamp(this.dy / this.radius, -1, 1)
  },

  reset() {
    this.active = false
    this.dx = 0
    this.dy = 0
    this.pointerId = null
  },

  _toGame(clientX, clientY) {
    const rect = this._canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * GAME_W,
      y: ((clientY - rect.top) / rect.height) * GAME_H,
    }
  },

  init(canvas) {
    this._canvas = canvas

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      const { x, y } = this._toGame(e.clientX, e.clientY)

      if (!this.active) {
        this.active = true
        this.pointerId = e.pointerId
        this.startX = x
        this.startY = y
        this.dx = 0
        this.dy = 0
      }
    })

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault()
      if (e.pointerId === this.pointerId) {
        const { x, y } = this._toGame(e.clientX, e.clientY)
        this.dx = x - this.startX
        this.dy = y - this.startY
      }
    })

    canvas.addEventListener('pointerup', (e) => {
      e.preventDefault()
      if (e.pointerId === this.pointerId) this.reset()
    })

    canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerId === this.pointerId) this.reset()
    })
  },
}
