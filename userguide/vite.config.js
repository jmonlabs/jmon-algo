import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from parent directories (for local ds import)
      allow: ['..', '../../ds']
    }
  }
});
