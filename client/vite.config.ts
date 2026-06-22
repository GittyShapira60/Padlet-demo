import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Local npm: server on 3000. Docker maps API to host 3001 — set VITE_DEV_API_TARGET in .env
  const apiProxyTarget =
    env.VITE_DEV_API_TARGET?.trim() || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    server: {
      host: true,
      port: 5173,
      // Docker on Windows: bind mounts don't emit file events — poll so HMR picks up edits.
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        host: 'localhost',
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
