// ── Bootstrap ──
(function () {
    // Telegram WebApp: fullscreen + disable swipe close
    if (window.Telegram && Telegram.WebApp) {
        try {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            Telegram.WebApp.isClosingConfirmationEnabled = true;
        } catch(e) {}
        try { Telegram.WebApp.disableVerticalSwipes(); } catch(e) {}
        try { Telegram.WebApp.requestFullscreen(); } catch(e) {}
    }
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    let scale, offsetX, offsetY;

    function resize() {
        const ww = window.innerWidth;
        const wh = window.innerHeight;
        const ratio = GAME_W / GAME_H;
        let cw, ch;

        if (ww / wh < ratio) {
            cw = ww;
            ch = ww / ratio;
        } else {
            ch = wh;
            cw = wh * ratio;
        }

        canvas.width = cw;
        canvas.height = ch;
        scale = cw / GAME_W;
        offsetX = (ww - cw) / 2;
        offsetY = (wh - ch) / 2;
        canvas.style.marginLeft = offsetX + 'px';
        canvas.style.marginTop = offsetY + 'px';

    }

    resize();
    window.addEventListener('resize', resize);
    Input.init(canvas);

    // Disable context menu and all default touch behavior
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('gesturechange', e => e.preventDefault());

    // ── Main Loop ──
    let lastTime = 0;

    function loop(time) {
        requestAnimationFrame(loop);
        const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta
        lastTime = time;

        // Scale canvas to game coordinates
        ctx.save();
        ctx.scale(scale, scale);

        // Handle taps for current screen
        const tap = Input.consumeTap();

        switch (Screens.current) {
            case 'menu':
                Screens.drawMenu(ctx);
                if (tap) Screens.handleMenuTap(tap.x, tap.y);
                break;

            case 'levels':
                Screens.drawLevels(ctx);
                if (tap) Screens.handleLevelsTap(tap.x, tap.y);
                break;

            case 'game':
                // Update
                if (tap) {
                    if (!Game.handleTap(tap.x, tap.y)) {
                        // Tap wasn't consumed by UI overlay — joystick handles it
                    }
                }
                Game.update(dt);
                Game.draw(ctx);
                break;
        }

        ctx.restore();
    }

    requestAnimationFrame(loop);
})();
