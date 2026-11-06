import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 相对 base，既能部署到 username.github.io/repo/，也能部署到根域名
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
  },
});
