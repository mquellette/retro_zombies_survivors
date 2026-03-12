// ── Constants ──
const GAME_W = 360;
let GAME_H = 640; // Will be adjusted to screen aspect ratio
const TILE = 16;

// ── Colors (placeholder palette) ──
const COL = {
    bg:       '#1a1a2e',
    player:   '#00ff88',
    enemy:    '#ff4444',
    enemyBig: '#ff6600',
    bullet:   '#ffff00',
    xpGem:    '#00ccff',
    hpBar:    '#ff3333',
    hpBg:     '#440000',
    xpBar:    '#00ccff',
    xpBg:     '#002244',
    text:     '#ffffff',
    textDim:  '#888888',
    btn:      '#4444aa',
    btnHover: '#6666cc',
    panel:    '#16213e',
    panelLt:  '#0f3460',
};

// ── Utility functions ──
function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

function rnd(min, max) {
    return Math.random() * (max - min) + min;
}

function rndInt(min, max) {
    return Math.floor(rnd(min, max + 1));
}

function rectCollide(a, b) {
    return a.x - a.w / 2 < b.x + b.w / 2 &&
           a.x + a.w / 2 > b.x - b.w / 2 &&
           a.y - a.h / 2 < b.y + b.h / 2 &&
           a.y + a.h / 2 > b.y - b.h / 2;
}
