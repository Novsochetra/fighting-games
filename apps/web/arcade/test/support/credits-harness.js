import path from 'node:path';
import { PAGES_ROOT } from '../../../../server/src/paths.js';
import { screenOf, startArcadeAt } from './arcade-harness.js';

export const CREDITS_PAGE = path.join(PAGES_ROOT, 'credits', 'index.html');

// The credits as a visitor opens their page: the arcade, with its home under them.
export function openCredits(ports = {}) {
  startArcadeAt('credits', ports);

  return screenOf('credits');
}
