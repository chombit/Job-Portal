import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'yup', 'property-expr']
  },
  build: {
    commonjsOptions: {
      include: [/react/, /react-dom/, /node_modules/, /node_modules\/property-expr/],
      transformMixedEsModules: true
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwind,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});