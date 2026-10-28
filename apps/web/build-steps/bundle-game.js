import { readdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';

// Where a game's bundles go in its folder of the build, beside its page.
const GAME_BUILD_FOLDER = 'build';

const MODULE_SCRIPT = /<script type="module" src="([^"]+)"><\/script>/g;

// A game's page names its own module scripts, in the order it runs them.
export const entriesOf = (page) => [...page.matchAll(MODULE_SCRIPT)].map((match) => match[1]);

// The page with each of its module scripts the bundle built from it.
export const pointAtBundles = (page, bundles) =>
  page.replace(MODULE_SCRIPT, (script, source) => script.replace(source, bundles.get(source)));

const nameOf = (entry) => entry.replace(/\.js$/, '').replaceAll('/', '-');
const fromRoot = (root, file) => path.relative(root, file).split(path.sep).join('/');

// The game's code as it is written (esnext, so no syntax is rewritten), only minified and joined,
// with names that change with their content, so a page never pairs with another build's bundle.
async function buildBundles({ sourceRoot, outDir, entries }) {
  const { output } = await build({
    configFile: false,
    root: sourceRoot,
    publicDir: false,
    logLevel: 'warn',
    build: {
      outDir,
      emptyOutDir: true,
      target: 'esnext',
      modulePreload: false,
      reportCompressedSize: false,
      // a game is one app, so most of it in one bundle is meant (Steel & Dust's is about 750 kB)
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: Object.fromEntries(
          entries.map((entry) => [nameOf(entry), path.join(sourceRoot, entry)]),
        ),
        output: { entryFileNames: '[name]-[hash].js', chunkFileNames: '[name]-[hash].js' },
      },
    },
  });
  const chunks = output.filter((file) => file.type === 'chunk');
  const bundles = chunks
    .filter((chunk) => chunk.isEntry)
    .map((chunk) => [
      fromRoot(sourceRoot, chunk.facadeModuleId),
      `${GAME_BUILD_FOLDER}/${chunk.fileName}`,
    ]);
  const bundled = chunks
    .flatMap((chunk) => chunk.moduleIds)
    .filter((id) => id.startsWith(`${sourceRoot}${path.sep}`));

  return { bundles: new Map(bundles), bundled: bundled.map((id) => fromRoot(sourceRoot, id)) };
}

async function removeEmptyFolders(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory());

  await Promise.all(folders.map((entry) => removeEmptyFolders(path.join(folder, entry.name))));

  if ((await readdir(folder)).length === 0) {
    await rmdir(folder);
  }
}

// A game's thousand modules came down one request at a time, thirty imports deep, each through the
// arcade's worker: slow on a phone, and one that failed held the game's start. The build joins
// the modules each of its page's scripts loads into a few bundles in the game's own folder, points
// the page at them and leaves the modules out; npm run dev still serves them as they are written.
export async function bundleGame({ sourceRoot, gameRoot }) {
  const pagePath = path.join(gameRoot, 'index.html');
  const page = await readFile(pagePath, 'utf8');
  const entries = entriesOf(page);

  if (entries.length === 0) {
    return;
  }

  const outDir = path.join(gameRoot, GAME_BUILD_FOLDER);
  const { bundles, bundled } = await buildBundles({ sourceRoot, outDir, entries });

  await writeFile(pagePath, pointAtBundles(page, bundles));
  await Promise.all(bundled.map((file) => rm(path.join(gameRoot, file), { force: true })));
  await removeEmptyFolders(gameRoot);
}
