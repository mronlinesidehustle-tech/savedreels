import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/lucide-react')) return 'lucide';
          if (id.includes('node_modules/idb')) return 'idb';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
