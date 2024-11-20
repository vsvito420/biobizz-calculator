import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/biobizz-calculator/',
})
