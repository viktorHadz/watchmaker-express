import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig((env) => {
  const envars = loadEnv(env.mode, './')
  const serverURL = new URL(envars.VITE_SERVER_URL)
  const serverAPIPath = envars.VITE_SERVER_API_PATH
  const serverStaticAssets = envars.VITE_SERVER_PROXY_STATIC
  return {
    envDir: './',
    define: {
      __API_PATH__: JSON.stringify(serverAPIPath),
    },
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // proxy requests with the API path to the server
        // <http://localhost:5173/api> -> <http://localhost:3001/api>
        [serverAPIPath]: serverURL.origin,
        [serverStaticAssets]: serverURL.origin, // Serve static from the server
      },
    },
  }
})
