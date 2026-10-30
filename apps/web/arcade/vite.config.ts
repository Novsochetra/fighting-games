import { cp, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { AS_IS, BUILD_FOLDER, sourceOfAsIs } from '../../server/src/as-is-files.js';
import { buildVersion } from '../../server/src/build-version.js';
import { catalogArtEntries } from '../../server/src/offline/catalog-art.js';
import { offlineListOf } from '../../server/src/offline/game-files.js';
import { ARCADE_SRC, DIST_ROOT, GAMES_ROOT, PAGES_ROOT, WEB_ROOT } from '../../server/src/paths.js';
import { isPublishedPath } from '../../server/src/public-files.js';
import { bundleGame } from './build-steps/bundle-game.js';

// The games played here, each with a page of its own (a game on its own site keeps only its art).
async function playedGames(gamesRoot: string) {
  const ids = await readdir(gamesRoot);
  const pages = await Promise.all(
    ids.map((id) => stat(path.join(gamesRoot, id, 'index.html')).catch(() => null)),
  );

  return ids.filter((_, i) => pages[i]);
}

// Each game played here comes as a few bundles, then gets the list its whole download goes by, so
// the list names the bundles, not the modules they were built from.
async function buildGames(gamesRoot: string) {
  for (const id of await playedGames(gamesRoot)) {
    const gameRoot = path.join(gamesRoot, id);

    await bundleGame({ sourceRoot: path.join(GAMES_ROOT, id), gameRoot });
    await writeFile(
      path.join(gameRoot, 'offline.json'),
      JSON.stringify(await offlineListOf(gameRoot)),
    );
  }
}

function copyAsIs(): Plugin {
  return {
    name: 'arcade-copy-as-is',
    apply: 'build',
    async writeBundle() {
      const copies = AS_IS.map((entry) => {
        const source = sourceOfAsIs(entry);

        return cp(source, path.join(DIST_ROOT, entry), {
          recursive: true,
          filter: (file) => isPublishedPath(source, file),
        });
      });

      await Promise.all(copies);
      await buildGames(path.join(DIST_ROOT, 'games'));
    },
  };
}

// Vite watches only its root, pages/, and each module it has loaded, so a file added to src/ would
// go unseen and an import waiting for it would stay broken until its importer is saved again.
function watchSource(): Plugin {
  return {
    name: 'arcade-watch-source',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(ARCADE_SRC);
    },
  };
}

// Each page names the build it comes from, and version.json the one the server holds now, so an
// arcade left open on an older build learns of a deploy (src/services/updates/update-check.js).
function stampVersion(): Plugin {
  let version = '';

  return {
    name: 'arcade-version',
    apply: 'build',
    buildStart() {
      version = buildVersion();
    },
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { name: 'arcade-version', content: version }, injectTo: 'head' },
    ],
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version }),
      });
    },
  };
}

// The arcade's worker (src/service-worker/sw.js), built with the list of what it keeps: the pages,
// the built modules and styles, the arcade's art, the early appearance script and each game's card
// art. It is registered by the app itself, and the arcade keeps its own web manifest.
const offline = VitePWA({
  strategies: 'injectManifest',
  srcDir: path.join(ARCADE_SRC, 'service-worker'),
  filename: 'sw.js',
  injectRegister: false,
  manifest: false,
  injectManifest: {
    rollupFormat: 'iife',
    globPatterns: [
      'index.html',
      '*/index.html',
      `${BUILD_FOLDER}/**/*`,
      'assets/**/*',
      'appearance-early.js',
    ],
    globIgnores: ['games/**'],
    additionalManifestEntries: await catalogArtEntries({
      webRoot: WEB_ROOT,
      gamesRoot: GAMES_ROOT,
    }),
  },
});

// The arcade's four pages, each with its own head for search and link previews, around one React
// app. Relative addresses (base './') keep the build working under any path, as the pages always have.
// Vite's own files go to build/, as assets/ is the arcade's art.
export default defineConfig({
  root: PAGES_ROOT,
  base: './',
  publicDir: false,
  resolve: {
    // A page's /src/main.tsx is the app beside pages/, which is Vite's root. Only that one address:
    // a wider /src/ would also catch the absolute path of a checkout that lives under /src/.
    alias: [
      { find: /^@\//, replacement: `${ARCADE_SRC}/` },
      { find: /^\/src\/main\.tsx$/, replacement: path.join(ARCADE_SRC, 'main.tsx') },
    ],
  },
  plugins: [react(), stampVersion(), copyAsIs(), watchSource(), offline],
  build: {
    outDir: DIST_ROOT,
    emptyOutDir: true,
    assetsDir: BUILD_FOLDER,
    rollupOptions: {
      input: {
        home: path.join(PAGES_ROOT, 'index.html'),
        leaderboard: path.join(PAGES_ROOT, 'leaderboard', 'index.html'),
        supporters: path.join(PAGES_ROOT, 'supporters', 'index.html'),
        credits: path.join(PAGES_ROOT, 'credits', 'index.html'),
      },
    },
  },
});
