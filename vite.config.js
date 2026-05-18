import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://*.openstreetmap.org",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://teachablemachine.withgoogle.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://router.project-osrm.org",
  "worker-src blob:",
  "frame-ancestors 'none'",
].join('; ')

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server:  { headers: { 'Content-Security-Policy': DEV_CSP } },
  preview: { headers: { 'Content-Security-Policy': DEV_CSP } },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('onnxruntime-web')) return 'onnx'
          if (id.includes('@tensorflow') || id.includes('teachablemachine')) return 'tensorflow'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'leaflet'
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor'
          if (id.includes('node_modules/react/')) return 'vendor'
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js', './src/setupTests.js'],
    exclude: ['**/node_modules/**', '**/.claude/worktrees/**', '**/e2e/**'],
  },
})
