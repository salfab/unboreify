import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `bundle.js`,
        manualChunks: (id) => {
          // Separate MUI icons into their own chunk to reduce file handle pressure
          if (id.includes('@mui/icons-material')) {
            return 'mui-icons';
          }
          // Separate other large dependencies
          if (id.includes('lodash')) {
            return 'lodash';
          }
          if (id.includes('@mui/material')) {
            return 'mui-material';
          }
          if (id.includes('react') && !id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      // Reduce concurrent file operations
      maxParallelFileOps: 2
    },
    chunkSizeWarningLimit: 1000,
    // Reduce memory pressure
    minify: false,
    // Disable source maps to reduce file operations
    sourcemap: false
  },
  optimizeDeps: {
    include: ['@mui/icons-material', 'lodash', 'lodash/debounce'],
    force: true
  },
  // Increase file system timeout
  server: {
    fs: {
      // Allow serving files from outside the root
      allow: ['..']
    }
  }
})
