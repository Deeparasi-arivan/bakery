import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://bakery-vjhc.onrender.com',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'https://bakery-vjhc.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
