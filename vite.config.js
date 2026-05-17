import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

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
