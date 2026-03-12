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
// Spritesheet frame order (counter-clockwise from down):
// 0=down, 1=down-left, 2=left, 3=up-left, 4=up, 5=up-right, 6=right, 7=down-right
const DIR_FRAMES = {
    '0,1':   0,  // down
    '-1,1':  1,  // down-left
    '-1,0':  2,  // left
    '-1,-1': 3,  // up-left
    '0,-1':  4,  // up
    '1,-1':  5,  // up-right
    '1,0':   6,  // right
    '1,1':   7,  // down-right
};

// Sector center angles for each direction row (in degrees, 0=right clockwise)
// Row order (counter-clockwise): 0=down, 1=down-left, 2=left, 3=up-left, 4=up, 5=up-right, 6=right, 7=down-right
const _dirCenters = [90, 135, 180, 225, 270, 315, 0, 45];

function _angleDist(a, b) {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

function getDirFrame(fx, fy, prevDir) {
    if (fx === 0 && fy === 0) return prevDir != null ? prevDir : 0;
    const angle = Math.atan2(fy, fx);
    let deg = angle * (180 / Math.PI);
    if (deg < 0) deg += 360;

    // Find nearest sector
    let bestDir = 0, bestDist = 999;
    for (let i = 0; i < 8; i++) {
        const d = _angleDist(deg, _dirCenters[i]);
        if (d < bestDist) { bestDist = d; bestDir = i; }
    }

    // Hysteresis: keep previous direction unless new one is >10° closer
    if (prevDir != null && prevDir !== bestDir) {
        const prevDist = _angleDist(deg, _dirCenters[prevDir]);
        if (prevDist - bestDist < 10) return prevDir;
    }
    return bestDir;
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
                // Inset to avoid bleeding pixels from adjacent cells
                const pad = 2;
                const sx = col * cellW + pad;
                const sy = row * cellH + pad;
                const sw = cellW - pad * 2;
                const sh = cellH - pad * 2;
                cx.drawImage(sheetImg,
                    sx, sy, sw, sh,
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
