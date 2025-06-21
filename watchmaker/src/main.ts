// main.js - Clean version without @vueuse/head
import '@fontsource-variable/cinzel'
import '@fontsource-variable/eb-garamond'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3SocialSharingPlugin from 'vue3-social-sharing'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Simple social sharing config
app.use(Vue3SocialSharingPlugin)

app.mount('#app')
