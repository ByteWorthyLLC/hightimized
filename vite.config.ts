import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/hightimized/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallbackDenylist: [/\/gguf\//],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/*.gguf', 'data/build/**', 'tesseract/**', 'sql-wasm.wasm'],
      },
      manifest: {
        name: 'hightimized',
        short_name: 'hightimized',
        description:
          'Audit your hospital bill. Generate a dispute letter. Free, private, browser-only.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/hightimized/',
        scope: '/hightimized/',
        icons: [
          { src: '/hightimized/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/hightimized/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
