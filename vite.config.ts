import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

const repoName = 'semana-da-arte-e-cultura';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [preact()],
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'mixed-decls',
          'color-functions',
          'global-builtin',
        ],
      },
    },
  },
}));
