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
// Builds offscreen canvases from a spritesheet grid (cols=anim frames, rows=directions).
// Auto-detects bounding box per frame and aligns all frames within a direction
// to a common foot-center anchor to prevent horizontal jumping.
const SpriteCache = {
    _grid: null,     // [dir][frame] = {canvas, anchorX}
    _builtDpr: 0,
    _cols: 4,        // animation frames per direction
    _rows: 8,        // directions
    _drawW: 0,       // game-unit draw width
    _drawH: 0,       // game-unit draw height

    build(sheetImg, targetH) {
        const dpr = window._dpr || 1;
        this._builtDpr = dpr;
        this._grid = [];

        const cellW = sheetImg.width / this._cols;   // e.g. 192
        const cellH = sheetImg.height / this._rows;  // e.g. 172

        // Read pixel data once for anchor detection
        const tmpC = document.createElement('canvas');
        tmpC.width = sheetImg.width;
        tmpC.height = sheetImg.height;
        const tmpCtx = tmpC.getContext('2d');
        tmpCtx.drawImage(sheetImg, 0, 0);

        // Game-unit dimensions preserving cell aspect ratio
        this._drawH = targetH;
        this._drawW = Math.round(targetH * (cellW / cellH));

        const renderH = Math.round(this._drawH * dpr);
        const renderW = Math.round(this._drawW * dpr);

        for (let row = 0; row < this._rows; row++) {
            this._grid[row] = [];

            // Find per-frame foot center (bottom 15% horizontal center-of-mass)
            const footCenters = [];
            for (let col = 0; col < this._cols; col++) {
                const data = tmpCtx.getImageData(col * cellW, row * cellH, cellW, cellH).data;
                const footZone = Math.max(Math.round(cellH * 0.15), 4);
                let sumX = 0, count = 0;
                for (let y = cellH - footZone; y < cellH; y++) {
                    for (let x = 0; x < cellW; x++) {
                        if (data[(y * cellW + x) * 4 + 3] > 10) { sumX += x; count++; }
                    }
                }
                footCenters.push(count > 0 ? sumX / count : cellW / 2);
            }
            const anchor = footCenters.reduce((a, b) => a + b, 0) / footCenters.length;
            const anchorGameX = (anchor / cellW) * this._drawW;

            for (let col = 0; col < this._cols; col++) {
                const c = document.createElement('canvas');
                c.width = renderW;
                c.height = renderH;
                const cx = c.getContext('2d');
                cx.imageSmoothingEnabled = false;
                cx.drawImage(sheetImg,
                    col * cellW, row * cellH, cellW, cellH,
                    0, 0, renderW, renderH);
                this._grid[row].push({ canvas: c, anchorX: anchorGameX });
            }
        }
    },

    getFrame(dir, animFrame) {
        if (!this._grid || !this._grid[dir]) return null;
        return this._grid[dir][animFrame % this._cols];
    }
};

// ── Load all assets ──
Assets.load('hero_walk', 'Assets/Final Assests/Characters/Joey.png');
Assets.load('zombie_walk', 'Assets/Final Assests/Enemies/zombie-basic.png');
Assets.load('skull_icon', 'Assets/UI/HUD/skull_icon Background Removed.png');
Assets.load('coin_icon', 'Assets/UI/HUD/coin_icon Background Removed.png');
