// Assets
import '@fontsource-variable/cinzel'
import '@fontsource-variable/eb-garamond'
import './assets/main.css'

// Firebase
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { firebaseConfig } from '@/firebaseConfig'

// Vite
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const firebaseApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(firebaseApp)
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
