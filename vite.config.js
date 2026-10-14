import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000/api';
  let proxyTarget = 'http://localhost:5000';
  try {
    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
      proxyTarget = new URL(apiUrl).origin;
    }
  } catch (e) {
    // ignore
  }

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    }
  };
})
