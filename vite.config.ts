import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use a relative base so assets load correctly when the site is served from
  // sub-paths (e.g., GitHub Pages PR previews under /pr/<id>/).
  base: './',
  plugins: [react()],
})
