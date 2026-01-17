import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true // Allow access from network (important for Raspberry Pi)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
