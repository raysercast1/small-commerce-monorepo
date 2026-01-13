
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => ({
  plugins: [angular({
    tsconfig: './tsconfig.spec.json'
  })],
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    // Re-run tests when a file changes.
    watch: mode !== 'ci',
    // Add this server block to properly handle RxFire
    server: {
      deps: {
        inline: [
          'rxfire',
          '@angular/fire',
        ]
      }
    }
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
