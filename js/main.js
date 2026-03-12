// ── Bootstrap ──
(function () {
    // Telegram WebApp: fullscreen + disable swipe close
    const tg = window.Telegram && Telegram.WebApp;
    if (tg) {
        tg.ready();
        tg.disableVerticalSwipes();
        tg.isClosingConfirmationEnabled = true;
        tg.expand();
        try { tg.requestFullscreen(); } catch(e) {}
    }
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    function resize() {
        const ww = window.innerWidth;
        const wh = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        // Adapt game height to screen aspect ratio, keeping width = 360
        GAME_H = Math.round(GAME_W * (wh / ww));

        // Canvas at native device resolution for crisp rendering
        canvas.width = Math.round(GAME_W * dpr);
        canvas.height = Math.round(GAME_H * dpr);
        canvas.style.width = ww + 'px';
        canvas.style.height = wh + 'px';

        // Store dpr globally for the render loop
        window._dpr = dpr;
    }

    resize();
    window.addEventListener('resize', resize);
    // Telegram expand/fullscreen may change viewport async — re-check
    setTimeout(resize, 300);
    setTimeout(resize, 1000);
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

        ctx.save();
        const dpr = window._dpr || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;

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
