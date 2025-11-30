// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'vite.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'TripWay',
        short_name: 'TripWay',
        description: 'Planeje sua viagem com facilidade.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // --- ADICIONE ISSO AQUI ---
  server: {
    host: '127.0.0.1', // Força o servidor a rodar neste IP
    port: 5173,
  },
  // --------------------------
  base: "/",
})