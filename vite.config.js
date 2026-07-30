import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포: https://nsc0321.github.io/ociServer/
export default defineConfig({
  plugins: [react()],
  base: '/ociServer/',
})
