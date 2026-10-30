import path from 'node:path';
import { AS_IS_SOURCES } from '../../../../server/src/as-is-files.js';
import { ARCADE_ROOT, PAGES_ROOT } from '../../../../server/src/paths.js';

// the same files the server sends before a build (createSourceFiles)
export function fileAt(address) {
  const [first, ...rest] = decodeURIComponent(address).replace(/^\//, '').split('/');
  const source = AS_IS_SOURCES.get(first);

  return source ? path.join(source, ...rest) : path.join(PAGES_ROOT, first, ...rest);
}

// a page's /src/ is the arcade's src/, beside pages/, as vite.config.ts aliases it
export function fileLoadedBy(pageAddress, reference) {
  if (reference.startsWith('/src/')) {
    return path.join(ARCADE_ROOT, reference);
  }

  return fileAt(new URL(reference, new URL(pageAddress, 'http://arcade.test/')).pathname);
}
