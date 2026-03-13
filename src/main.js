import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts.css'
import { initTelegram } from './telegram.js'

// Telegram integration
initTelegram()

// Prevent default touch behaviors
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false })
document.addEventListener('gesturestart', e => e.preventDefault())
document.addEventListener('gesturechange', e => e.preventDefault())

// Mount Vue app
createApp(App).mount('#app')
