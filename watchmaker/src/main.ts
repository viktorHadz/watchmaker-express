import '@fontsource-variable/cinzel'
import '@fontsource-variable/eb-garamond'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3SocialSharingPlugin from 'vue3-social-sharing'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'

declare global {
  interface Window {
    __watchmakerSeoSnapshotTimer?: number
  }
}

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(createPinia())
app.use(router)
// Simple social sharing config
app.use(Vue3SocialSharingPlugin)

function finishClientBoot() {
  document.documentElement.classList.remove('watchmaker-app-pending')
  document.documentElement.classList.add('watchmaker-app-ready')

  if (typeof window.__watchmakerSeoSnapshotTimer === 'number') {
    window.clearTimeout(window.__watchmakerSeoSnapshotTimer)
    delete window.__watchmakerSeoSnapshotTimer
  }
}

router
  .isReady()
  .catch((error) => {
    console.error('Initial router navigation failed:', error)
  })
  .finally(() => {
    try {
      app.mount('#app')
    } finally {
      finishClientBoot()
    }
  })
