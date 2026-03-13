const BASE = import.meta.env.BASE_URL

const TRACKS = {
  menu:   `${BASE}Music/menu-theme.mp3`,
  defeat: `${BASE}Music/defeat.mp3`,
}

let _current = null   // { key, audio }
let _volume = 0.5

function _create(key) {
  const a = new Audio(TRACKS[key])
  a.volume = _volume
  a.loop = key === 'menu'
  return a
}

export function play(key) {
  if (!TRACKS[key]) return
  // Already playing this track
  if (_current && _current.key === key && !_current.audio.paused) return
  stop()
  const audio = _create(key)
  _current = { key, audio }
  audio.play().catch(() => {})
}

export function stop() {
  if (!_current) return
  _current.audio.pause()
  _current.audio.currentTime = 0
  _current = null
}

export function setVolume(v) {
  _volume = Math.max(0, Math.min(1, v))
  if (_current) _current.audio.volume = _volume
}

export function getVolume() {
  return _volume
}
