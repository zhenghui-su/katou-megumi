import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  html: {
    title: '加藤惠网站管理后台',
    favicon: './public/katou-megumi.ico',
  },
  server: {
    port: 3002,
  },
  plugins: [pluginReact()],
});
