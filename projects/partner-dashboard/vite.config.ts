
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [angular({
    tsconfig: resolve(process.cwd(), 'projects/partner-dashboard/tsconfig.spec.json'),
  })],
  test: {
    globals: true,
    setupFiles: ['projects/partner-dashboard/src/test-setup.ts'],
    environment: 'happy-dom',
    include: ['projects/partner-dashboard/src/**/*.spec.ts'],
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
