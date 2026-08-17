import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포 base path
export default defineConfig({
  plugins: [react()],
  base: '/blog/',
})

