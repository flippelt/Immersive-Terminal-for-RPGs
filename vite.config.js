import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run build` -> /Immersive-Terminal-for-RPGs/  (GitHub Pages root = public demo)
// `npm run dev`   -> /                              (localhost)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Immersive-Terminal-for-RPGs/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true }
}))
