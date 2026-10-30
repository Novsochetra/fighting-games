import path from 'node:path';
import { AS_IS_SOURCES } from '../../../../server/src/as-is-files.js';
import { ARCADE_ROOT, PAGES_ROOT } from '../../../../server/src/paths.js';
import { resolveStaticTarget } from '../../../../server/src/static-path.js';

export const fileAt = (address) =>
  resolveStaticTarget(PAGES_ROOT, `/${address.replace(/^\//, '')}`, AS_IS_SOURCES).filePath;

// a page's /src/ is the arcade's src/, beside pages/, as vite.config.ts aliases it
export function fileLoadedBy(pageAddress, reference) {
  if (reference.startsWith('/src/')) {
    return path.join(ARCADE_ROOT, reference);
  }

  return fileAt(new URL(reference, new URL(pageAddress, 'http://arcade.test/')).pathname);
}
