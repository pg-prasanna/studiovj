import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Dev proxy target — reads from VITE_API_URL env var, strips /api suffix for the proxy target
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080/api'
  const proxyTarget = apiUrl.replace(/\/api$/, '')

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT || '3001', 10),
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'form-vendor': ['react-hook-form', 'react-dropzone'],
          },
        },
      },
    },
  }
})
