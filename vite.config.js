import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  // Served as a GitHub Pages project site at github.io/Stillpoint/, not the
  // domain root — vite-plugin-pwa reads this to prefix manifest/start_url/
  // scope automatically, and Vite rewrites root-absolute asset refs in
  // index.html to match.
  base: '/Stillpoint/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // we call registerSW ourselves in main.jsx, to defer updates mid-session
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\/assets\//],
      },
      manifest: {
        name: 'Stillpoint — Meditation & Self-Hypnosis',
        short_name: 'Stillpoint',
        description: 'Guided meditation and self-hypnosis sessions grounded in real contemplative and clinical technique.',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/Stillpoint/',
        icons: [
          { src: '/Stillpoint/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Stillpoint/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/Stillpoint/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
