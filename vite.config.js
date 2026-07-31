import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포
export default defineConfig({
  plugins: [react()],
  base: './',
})
