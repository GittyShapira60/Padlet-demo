import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Local npm: server on 3000. Docker maps API to host 3001 — set VITE_DEV_API_TARGET in .env
  const apiProxyTarget =
    env.VITE_DEV_API_TARGET?.trim() || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
