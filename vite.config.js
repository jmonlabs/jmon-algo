import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'JmonStudio',
      fileName: (format) => `jmon.${format === 'es' ? 'esm' : 'umd'}.js`
    },
    rollupOptions: {
      external: ['plotly.js', 'abcjs', 'tone'],
      output: {
        format: 'umd',
        name: 'JmonStudio',
        exports: 'named',
        globals: {
          'plotly.js': 'Plotly',
          'abcjs': 'ABCJS',
          'tone': 'Tone'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: false
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    exclude: ['plotly.js']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      buffer: 'buffer'
    }
  },
  server: {
    fs: {
      allow: ['.']
    }
  }
});
