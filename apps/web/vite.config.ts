import { cp } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { AS_IS, BUILD_FOLDER } from '../server/src/as-is-files.js';
import { isPublishedPath } from '../server/src/public-files.js';

const WEB_ROOT = import.meta.dirname;
const OUT_DIR = path.resolve(WEB_ROOT, '../../dist');

function copyAsIs(): Plugin {
  return {
    name: 'arcade-copy-as-is',
    apply: 'build',
    async writeBundle() {
      const copies = AS_IS.map((entry) =>
        cp(path.join(WEB_ROOT, entry), path.join(OUT_DIR, entry), {
          recursive: true,
          filter: (source) => isPublishedPath(WEB_ROOT, source),
        }),
      );

      await Promise.all(copies);
    },
  };
}

// The arcade's three pages, each with its own head for search and link previews, around one React
// app. Relative addresses (base './') keep the build working under any path, as the pages always have.
// Vite's own files go to build/, as assets/ is the arcade's art.
export default defineConfig({
  root: WEB_ROOT,
  base: './',
  publicDir: false,
  plugins: [react(), copyAsIs()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    assetsDir: BUILD_FOLDER,
    rollupOptions: {
      input: {
        home: path.join(WEB_ROOT, 'index.html'),
        supporters: path.join(WEB_ROOT, 'supporters', 'index.html'),
        credits: path.join(WEB_ROOT, 'credits', 'index.html'),
      },
    },
  },
});
