import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Remove babel plugins to avoid conflicts
    }),
    visualizer({ open: false }),
    compression({
      verbose: true,
      disable: process.platform === 'win32', // Disable on Windows due to path length
      threshold: 5120,
      algorithm: 'brotli',
      ext: '.br',
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    esbuildOptions: {
      target: 'esnext',
      splitting: true,
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    reportCompressedSize: true,
    sourcemap: false, // Disable sourcemaps in production for faster builds
    terserOptions: {
      compress: {
        drop_console: true, // Remove all console.* in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2, // Multiple compression passes for better results
      },
      mangle: {
        toplevel: true, // Mangle top-level variables
      },
      output: {
        comments: false,
      },
    },
    cssMinify: 'csso',
    rollupOptions: {
      output: [
        {
          format: 'es',
          dir: 'dist',
          entryFileNames: '[name].[hash:8].js',
          chunkFileNames: 'chunks/[name].[hash:8].js',
          assetFileNames: 'assets/[name].[hash:8][extname]',
          manualChunks: (id) => {
            // Vendor chunks for better caching
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('lucide')) return 'vendor-ui';
              return 'vendor-misc';
            }
            // Page components as separate chunks
            if (id.includes('/pages/')) return `page-${id.split('/pages/')[1].split('.')[0]}`;
          },
        },
      ],
    },
    chunkSizeWarningLimit: 500,
    commonjsOptions: {
      esmExternals: true,
    },
  },
});
