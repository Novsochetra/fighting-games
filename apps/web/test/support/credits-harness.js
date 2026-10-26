import path from 'node:path';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { screenOf, startArcadeAt } from './arcade-harness.js';

export const CREDITS_PAGE = path.join(WEB_ROOT, 'credits', 'index.html');

// The credits as a visitor opens their page: the arcade, with its home under them.
export function openCredits() {
  startArcadeAt('credits');

  return screenOf('credits');
}
