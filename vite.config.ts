import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// base must match the GitHub Pages subpath (ByteWorthyLLC/hightimized).
// Phase 6 may switch to '/' if a custom domain is configured.
export default defineConfig({
  base: '/hightimized/',
  plugins: [react()],
})
