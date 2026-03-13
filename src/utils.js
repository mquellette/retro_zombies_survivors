export function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

export function rnd(min, max) {
  return Math.random() * (max - min) + min
}

export function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1))
}

export function rectCollide(a, b) {
  return (
    a.x - a.w / 2 < b.x + b.w / 2 &&
    a.x + a.w / 2 > b.x - b.w / 2 &&
    a.y - a.h / 2 < b.y + b.h / 2 &&
    a.y + a.h / 2 > b.y - b.h / 2
  )
}
