import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const fromFiles = loadEnv(mode, process.cwd(), '')
  const base = (process.env.VITE_API_URL ?? fromFiles.VITE_API_URL)?.trim()

  if (command === 'build' && !base) {
    throw new Error(
      'VITE_API_URL is required for `vite build`. Use a Cloudflare Pages build Secret named VITE_API_URL, ' +
        'or add frontend/.env.production (gitignored) with: VITE_API_URL=https://<your-worker>.workers.dev — no trailing slash. Do not pass it on the shell.',
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
