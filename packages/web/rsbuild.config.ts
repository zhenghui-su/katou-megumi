import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
	plugins: [pluginReact()],
	html: {
		template: './index.html',
		favicon: './public/katou-megumi.ico',
	},
	source: {
		entry: {
			index: './src/main.tsx',
		},
	},
	resolve: {
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
