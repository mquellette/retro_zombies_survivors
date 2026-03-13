export function initTelegram() {
  const tg = window.Telegram?.WebApp
  if (!tg) return
  tg.ready()
  tg.disableVerticalSwipes()
  tg.isClosingConfirmationEnabled = true
  tg.expand()
  try { tg.requestFullscreen() } catch (e) { /* not supported outside telegram */ }
}
