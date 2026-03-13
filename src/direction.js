// Sector center angles for each spritesheet row (degrees, 0°=right, CW in screen coords)
// Row order (CCW): 0=down, 1=down-left, 2=left, 3=up-left, 4=up, 5=up-right, 6=down-right, 7=right
const _dirCenters = [90, 135, 180, 225, 270, 315, 45, 0]

function _angleDist(a, b) {
  let d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

export function getDirFrame(fx, fy, prevDir) {
  if (fx === 0 && fy === 0) return prevDir != null ? prevDir : 0
  const angle = Math.atan2(fy, fx)
  let deg = angle * (180 / Math.PI)
  if (deg < 0) deg += 360

  let bestDir = 0, bestDist = 999
  for (let i = 0; i < 8; i++) {
    const d = _angleDist(deg, _dirCenters[i])
    if (d < bestDist) { bestDist = d; bestDir = i }
  }

  if (prevDir != null && prevDir !== bestDir) {
    const prevDist = _angleDist(deg, _dirCenters[prevDir])
    if (prevDist - bestDist < 10) return prevDir
  }
  return bestDir
}
