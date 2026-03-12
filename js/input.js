// ── Virtual Joystick ──
const Joystick = {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    radius: 50,
    deadzone: 8,
    touchId: null,

    // Normalized direction (-1..1)
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
        this.touchId = null;
    },

    draw(ctx) {
        if (!this.active) return;
        // Base circle
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Thumb
        const tx = this.startX + clamp(this.dx, -this.radius, this.radius);
        const ty = this.startY + clamp(this.dy, -this.radius, this.radius);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(tx, ty, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

// ── Touch / Mouse handling ──
const Input = {
    // For UI clicks
    tapX: 0,
    tapY: 0,
    tapped: false,

    init(canvas, scaleX, scaleY, offsetX, offsetY) {
        this._sx = scaleX;
        this._sy = scaleY;
        this._ox = offsetX;
        this._oy = offsetY;

        // Touch
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                const x = (t.clientX - this._ox) / this._sx;
                const y = (t.clientY - this._oy) / this._sy;
                this.tapX = x;
                this.tapY = y;
                this.tapped = true;

                if (!Joystick.active) {
                    Joystick.active = true;
                    Joystick.touchId = t.identifier;
                    Joystick.startX = x;
                    Joystick.startY = y;
                    Joystick.dx = 0;
                    Joystick.dy = 0;
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier === Joystick.touchId) {
                    const x = (t.clientX - this._ox) / this._sx;
                    const y = (t.clientY - this._oy) / this._sy;
                    Joystick.dx = x - Joystick.startX;
                    Joystick.dy = y - Joystick.startY;
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier === Joystick.touchId) {
                    Joystick.reset();
                }
            }
        }, { passive: false });

        // Mouse fallback (for desktop testing)
        let mouseDown = false;
        canvas.addEventListener('mousedown', (e) => {
            const x = (e.clientX - this._ox) / this._sx;
            const y = (e.clientY - this._oy) / this._sy;
            mouseDown = true;
            this.tapX = x;
            this.tapY = y;
            this.tapped = true;
            Joystick.active = true;
            Joystick.startX = x;
            Joystick.startY = y;
            Joystick.dx = 0;
            Joystick.dy = 0;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            const x = (e.clientX - this._ox) / this._sx;
            const y = (e.clientY - this._oy) / this._sy;
            Joystick.dx = x - Joystick.startX;
            Joystick.dy = y - Joystick.startY;
        });
        canvas.addEventListener('mouseup', () => {
            mouseDown = false;
            Joystick.reset();
        });
    },

    consumeTap() {
        if (this.tapped) {
            this.tapped = false;
            return { x: this.tapX, y: this.tapY };
        }
        return null;
    }
};
