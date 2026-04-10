import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'build' && !process.env.VITE_API_URL?.trim()) {
    throw new Error(
      'VITE_API_URL must be set in the build environment (e.g. Cloudflare Pages → Secrets for the build step). ' +
        'Use your Worker origin only, no trailing slash.',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
  }
})
