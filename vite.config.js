import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // If deploying to GitHub Pages at https://4warko.github.io/mathquiz/,
  // uncomment the line below so asset paths resolve correctly.
  // base: '/mathquiz/',
})
