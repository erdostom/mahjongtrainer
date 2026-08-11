import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/mahjongtrainer/',
  server: {
    allowedHosts: ['artoo.tilapia-acrux.ts.net'],
  },
  preview: {
    allowedHosts: ['artoo.tilapia-acrux.ts.net'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
})
