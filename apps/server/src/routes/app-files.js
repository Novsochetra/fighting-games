import { stat } from 'node:fs/promises';
import path from 'node:path';
import { AS_IS_SOURCES, BUILD_FOLDER, isServedAsIsInDev } from '../as-is-files.js';
import { sendNotFound } from '../http-responses.js';
import { ARCADE_ROOT, PAGES_ROOT } from '../paths.js';
import { splitRequestTarget } from '../static-path.js';
import { createStaticHandler } from './static-files.js';

// npm run dev: the arcade's pages and modules come from Vite as they are written, with hot reload;
// the games, the packages they share and the arcade's art come as files, as in production. Vite is
// a dev tool, so it is imported only here, never on Railway, where the build has been pruned of it.
export async function createDevFiles() {
  const { createServer } = await import('vite');
  const vite = await createServer({
    configFile: path.join(ARCADE_ROOT, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'mpa',
  });
  const files = createSourceFiles();

  return function serveDev(request, response) {
    const { pathname } = splitRequestTarget(request.url);

    if (isServedAsIsInDev(pathname)) {
      return files(request, response);
    }

    return vite.middlewares(request, response, () => sendNotFound(response));
  };
}

export function createSourceFiles() {
  return createStaticHandler({ webRoot: PAGES_ROOT, mounts: AS_IS_SOURCES });
}

// npm start: everything comes from the build, which must have run (npm run build).
export async function createBuiltFiles({ distRoot }) {
  const page = await stat(path.join(distRoot, 'index.html')).catch(() => null);

  if (!page) {
    throw new Error(`The arcade is not built: run npm run build (no ${distRoot}/index.html).`);
  }

  return createStaticHandler({
    webRoot: distRoot,
    isImmutable: (pathname) => pathname.startsWith(`/${BUILD_FOLDER}/`),
  });
}
