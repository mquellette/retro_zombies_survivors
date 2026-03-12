// ── Asset Loader ──
const Assets = {
    images: {},
    _toLoad: 0,
    _loaded: 0,

    load(id, src) {
        this._toLoad++;
        const img = new Image();
        img.onload = () => {
            this._loaded++;
            this.images[id] = img;
        };
        img.onerror = () => {
            console.warn('Failed to load asset:', src);
            this._loaded++;
        };
        img.src = src;
    },

    ready() {
        return this._toLoad === 0 || this._loaded >= this._toLoad;
    },

    get(id) {
        return this.images[id] || null;
    },
};

// ── Sprite direction mapping ──
// Spritesheet frame order (left to right, clockwise from down):
// 0=down, 1=down-right, 2=right, 3=up-right, 4=up, 5=up-left, 6=left, 7=down-left
const DIR_FRAMES = {
    '0,1':   0,  // down
    '1,1':   1,  // down-right
    '1,0':   2,  // right
    '1,-1':  3,  // up-right
    '0,-1':  4,  // up
    '-1,-1': 5,  // up-left
    '-1,0':  6,  // left
    '-1,1':  7,  // down-left
};

function getDirFrame(fx, fy) {
    if (fx === 0 && fy === 0) return 0; // idle → down
    // Angle-based detection with wider cardinal zones (~60° cardinal, ~30° diagonal)
    const angle = Math.atan2(fy, fx); // radians, 0=right, π/2=down
    // Convert to degrees 0-360
    let deg = angle * (180 / Math.PI);
    if (deg < 0) deg += 360;
    // Sectors (clockwise from right=0°):
    // right: 345-15, down-right: 15-75, down: 75-105,
    // down-left: 105-165, left: 165-195, up-left: 195-255,
    // up: 255-285, up-right: 285-345
    if (deg >= 345 || deg < 15)  return 2; // right
    if (deg >= 15 && deg < 75)   return 1; // down-right
    if (deg >= 75 && deg < 105)  return 0; // down
    if (deg >= 105 && deg < 165) return 7; // down-left
    if (deg >= 165 && deg < 195) return 6; // left
    if (deg >= 195 && deg < 255) return 5; // up-left
    if (deg >= 255 && deg < 285) return 4; // up
    return 3; // up-right (285-345)
}

// ── Pre-rendered sprite cache (walk animation) ──
// Stores frames as _grid[direction][frameIndex] for 4×8 spritesheet
const SpriteCache = {
    _grid: null,     // [dir][frame] = offscreen canvas
    _builtDpr: 0,
    _cols: 4,        // animation frames per direction
    _rows: 8,        // directions

    build(sheetImg, targetSize) {
        const dpr = window._dpr || 1;
        this._builtDpr = dpr;
        this._targetSize = targetSize;
        this._grid = [];
        const frameW = sheetImg.width / this._cols;   // 256
        const frameH = sheetImg.height / this._rows;  // 128
        const renderSize = Math.round(targetSize * dpr);
        for (let row = 0; row < this._rows; row++) {
            this._grid[row] = [];
            for (let col = 0; col < this._cols; col++) {
                const c = document.createElement('canvas');
                c.width = renderSize;
                c.height = renderSize;
                const cx = c.getContext('2d');
                cx.imageSmoothingEnabled = false;
                cx.drawImage(sheetImg,
                    col * frameW, row * frameH, frameW, frameH,
                    0, 0, renderSize, renderSize);
                this._grid[row].push(c);
            }
        }
    },

    getFrame(dir, animFrame) {
        if (!this._grid) return null;
        return this._grid[dir] ? this._grid[dir][animFrame % this._cols] : null;
    }
};

// ── Load all assets ──
Assets.load('hero_walk', 'Assets/Sprites/Player/nb2_walk_sheet_4x8_clean.png');
Assets.load('skull_icon', 'Assets/UI/HUD/skull_icon Background Removed.png');
Assets.load('coin_icon', 'Assets/UI/HUD/coin_icon Background Removed.png');
