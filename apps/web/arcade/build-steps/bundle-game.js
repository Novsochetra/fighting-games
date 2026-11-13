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

// The game's code as it is written, only minified and joined, with names that change with their
// content, so a page never pairs with another build's bundle. It keeps to ES2021, as the game's own
// code does, so the minifier never writes syntax that phones on Chrome 85 or Safari 14 can't read.
const GAME_TARGET = 'es2021';

async function buildBundles({ sourceRoot, outDir, entries }) {
  const { output } = await build({
    configFile: false,
    root: sourceRoot,
    publicDir: false,
    logLevel: 'warn',
    build: {
      outDir,
      emptyOutDir: true,
      target: GAME_TARGET,
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

// A game's own page, and the pages it is worked on with in its dev/ folder (Naga Eleven's camera
// lab), each with its own bundles beside it, so the game's bundles and download stay as they are.
async function pagesOf(gameRoot) {
  const tools = await readdir(path.join(gameRoot, 'dev'), { withFileTypes: true }).catch(() => []);
  const devPages = tools
    .filter((tool) => tool.isDirectory())
    .map((tool) => path.join('dev', tool.name, 'index.html'));
  const found = await Promise.all(
    devPages.map((page) => readFile(path.join(gameRoot, page)).then(Boolean, () => false)),
  );

  return ['index.html', ...devPages.filter((_, i) => found[i])];
}

// A page's scripts are named from its own folder; the build knows them from the game's.
async function bundlePage({ sourceRoot, gameRoot, page }) {
  const pagePath = path.join(gameRoot, page);
  const folder = path.dirname(page);
  const html = await readFile(pagePath, 'utf8');
  const scripts = entriesOf(html);
  const fromGame = (script) => path.posix.join(folder.split(path.sep).join('/'), script);

  if (scripts.length === 0) {
    return [];
  }

  const outDir = path.join(gameRoot, folder, GAME_BUILD_FOLDER);
  const entries = scripts.map(fromGame);
  const { bundles, bundled } = await buildBundles({ sourceRoot, outDir, entries });
  const pageBundles = new Map(scripts.map((script) => [script, bundles.get(fromGame(script))]));

  await writeFile(pagePath, pointAtBundles(html, pageBundles));

  return bundled;
}

// A game's thousand modules came down one request at a time, thirty imports deep, each through the
// arcade's worker: slow on a phone, and one that failed held the game's start. The build joins
// the modules each of its page's scripts loads into a few bundles in the game's own folder, points
// the page at them and leaves the modules out; npm run dev still serves them as they are written.
export async function bundleGame({ sourceRoot, gameRoot }) {
  const bundled = [];

  for (const page of await pagesOf(gameRoot)) {
    bundled.push(...(await bundlePage({ sourceRoot, gameRoot, page })));
  }

  await Promise.all(bundled.map((file) => rm(path.join(gameRoot, file), { force: true })));
  await removeEmptyFolders(gameRoot);
}
