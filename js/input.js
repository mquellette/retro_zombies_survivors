// ── Virtual Joystick ──
const Joystick = {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    radius: 50,
    deadzone: 8,
    pointerId: null,

    get nx() {
        const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (len < this.deadzone) return 0;
        return clamp(this.dx / this.radius, -1, 1);
    },
    get ny() {
        const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (len < this.deadzone) return 0;
        return clamp(this.dy / this.radius, -1, 1);
    },

    reset() {
        this.active = false;
        this.dx = 0;
        this.dy = 0;
        this.pointerId = null;
    },

    // Fixed joystick position (always visible bottom-left)
    baseX: 60,
    baseY: 0, // set in init based on GAME_H

    initPosition() {
        this.baseY = GAME_H - 80;
    },

    draw(ctx) {
        // Always draw joystick base at fixed position
        const bx = this.baseX;
        const by = this.baseY;

        // Outer circle (base)
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#aaccaa';
        ctx.beginPath();
        ctx.arc(bx, by, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner thumb
        let tx = bx;
        let ty = by;
        if (this.active) {
            tx = bx + clamp(this.dx, -this.radius, this.radius);
            ty = by + clamp(this.dy, -this.radius, this.radius);
        }
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tx, ty, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }
};

// ── Input (Pointer Events) ──
const Input = {
    tapX: 0,
    tapY: 0,
    tapped: false,

    init(canvas) {
        this._canvas = canvas;

        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const { x, y } = this._toGame(e.clientX, e.clientY);
            this.tapX = x;
            this.tapY = y;
            this.tapped = true;

            if (!Joystick.active) {
                Joystick.active = true;
                Joystick.pointerId = e.pointerId;
                // Use fixed base position, calculate offset from there
                Joystick.startX = Joystick.baseX;
                Joystick.startY = Joystick.baseY;
                Joystick.dx = x - Joystick.baseX;
                Joystick.dy = y - Joystick.baseY;
            }
        });

        canvas.addEventListener('pointermove', (e) => {
            e.preventDefault();
            if (e.pointerId === Joystick.pointerId) {
                const { x, y } = this._toGame(e.clientX, e.clientY);
                Joystick.dx = x - Joystick.startX;
                Joystick.dy = y - Joystick.startY;
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            e.preventDefault();
            if (e.pointerId === Joystick.pointerId) {
                Joystick.reset();
            }
        });

        canvas.addEventListener('pointercancel', (e) => {
            if (e.pointerId === Joystick.pointerId) {
                Joystick.reset();
            }
        });
    },

    _toGame(clientX, clientY) {
        const rect = this._canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / rect.width * GAME_W,
            y: (clientY - rect.top) / rect.height * GAME_H,
        };
    },

    consumeTap() {
        if (this.tapped) {
            this.tapped = false;
            return { x: this.tapX, y: this.tapY };
        }
        return null;
    }
};
