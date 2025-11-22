import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    css: {
      postcss: {
        plugins: [tailwind, autoprefixer]
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});