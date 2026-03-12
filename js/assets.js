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
    // Normalize to -1, 0, 1
    const sx = fx === 0 ? 0 : (fx > 0 ? 1 : -1);
    const sy = fy === 0 ? 0 : (fy > 0 ? 1 : -1);
    const key = sx + ',' + sy;
    return DIR_FRAMES[key] !== undefined ? DIR_FRAMES[key] : 0;
}

// ── Load all assets ──
Assets.load('hero', 'Assets/Sprites/Player/hero_spritesheet_final.png');
