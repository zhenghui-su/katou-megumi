import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
    alias: {
      '@': './src',
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  dev: {
    hmr: true,
  },
});