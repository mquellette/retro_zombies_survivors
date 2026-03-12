// ── Screen Manager ──
const Screens = {
    current: 'menu', // menu | levels | game

    // ── Menu Screen ──
    drawMenu(ctx) {
        ctx.fillStyle = COL.bg;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Title
        ctx.fillStyle = COL.text;
        ctx.textAlign = 'center';
        ctx.font = '18px monospace';
        ctx.fillText('SURVIVOR', GAME_W / 2, 200);
        ctx.font = '10px monospace';
        ctx.fillStyle = COL.textDim;
        ctx.fillText('zombie nightmare', GAME_W / 2, 222);

        // Play button
        const btnW = 180;
        const btnH = 50;
        const bx = (GAME_W - btnW) / 2;
        const by = 320;
        ctx.fillStyle = COL.btn;
        ctx.fillRect(bx, by, btnW, btnH);
        ctx.strokeStyle = '#6666cc';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, btnW, btnH);
        ctx.fillStyle = COL.text;
        ctx.font = '16px monospace';
        ctx.fillText('PLAY', GAME_W / 2, by + btnH / 2 + 6);
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
    },

    handleMenuTap(x, y) {
        const btnW = 180;
        const btnH = 50;
        const bx = (GAME_W - btnW) / 2;
        const by = 320;
        if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
            this.current = 'levels';
            return true;
        }
        return false;
    },

    // ── Level Select Screen ──
    drawLevels(ctx) {
        ctx.fillStyle = COL.bg;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Header
        ctx.fillStyle = COL.text;
        ctx.textAlign = 'center';
        ctx.font = '14px monospace';
        ctx.fillText('SELECT LEVEL', GAME_W / 2, 60);

        // Back button
        ctx.textAlign = 'left';
        ctx.font = '12px monospace';
        ctx.fillStyle = COL.textDim;
        ctx.fillText('< BACK', 12, 30);

        // Level card
        const cardW = 280;
        const cardH = 80;
        const cx = (GAME_W - cardW) / 2;
        const cy = 100;

        ctx.fillStyle = COL.panel;
        ctx.fillRect(cx, cy, cardW, cardH);
        ctx.strokeStyle = '#00ff88';
        ctx.strokeRect(cx, cy, cardW, cardH);

        ctx.fillStyle = COL.text;
        ctx.textAlign = 'left';
        ctx.font = '13px monospace';
        ctx.fillText('1. Cemetery', cx + 12, cy + 28);
        ctx.fillStyle = COL.textDim;
        ctx.font = '9px monospace';
        ctx.fillText('Survive 3 minutes among the undead', cx + 12, cy + 48);
        ctx.fillText('Difficulty: ★☆☆', cx + 12, cy + 64);

        ctx.textAlign = 'left';
    },

    handleLevelsTap(x, y) {
        // Back button
        if (x < 80 && y < 45) {
            this.current = 'menu';
            return true;
        }
        // Level 1 card
        const cardW = 280;
        const cardH = 80;
        const cx = (GAME_W - cardW) / 2;
        const cy = 100;
        if (x >= cx && x <= cx + cardW && y >= cy && y <= cy + cardH) {
            this.current = 'game';
            Game.init();
            return true;
        }
        return false;
    }
};
