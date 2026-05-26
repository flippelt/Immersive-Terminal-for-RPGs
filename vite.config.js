import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run build`           -> /terminal-immersive-rpg/        (main)
// `npm run build:demo`      -> /terminal-immersive-rpg/demo/   (curated)
// `npm run dev`             -> /                                (localhost)
export default defineConfig(({ command, mode }) => ({
  base:
    command === 'build'
      ? mode === 'demo'
        ? '/terminal-immersive-rpg/demo/'
        : '/terminal-immersive-rpg/'
      : '/',
  plugins: [react()],
  server: { port: 5173, open: true }
}))
