import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run build` -> /Immersive-Terminal-for-RPGs/  (GitHub Pages root = public demo)
// `npm run dev`   -> /                              (localhost)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Immersive-Terminal-for-RPGs/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
  // rpgterm-engine ships untranspiled ESM source (bare .json imports); vitest
  // skips node_modules by default, so inline it to transform like our own code.
  test: { server: { deps: { inline: [/rpgterm-engine/] } } }
}))
