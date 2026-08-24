import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포 (/blog/ 서브경로 대응)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'https://ragweed-blighted-skylight.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

