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
      proxy: {
    '/api': {
      target: 'http://localhost:5000',
        changeOrigin: true,
          secure: false,
      },
  },
},
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    },
},
});