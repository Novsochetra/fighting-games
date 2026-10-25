import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';

export const CREDITS_PAGE = path.join(WEB_ROOT, 'credits', 'index.html');

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
export async function loadCreditsMarkup() {
  const html = await readFile(CREDITS_PAGE, 'utf8');
  const [, bodyMarkup] = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  expect(bodyMarkup).not.toMatch(/<script|<link/);
  document.body.innerHTML = bodyMarkup;
}

// Reports whether the page kept the click from following its link, then keeps happy-dom from
// following it either.
export function clickAndSeeIfHeld(target, init = {}) {
  let isHeld = null;
  const record = (event) => {
    isHeld = event.defaultPrevented;
    event.preventDefault();
  };
  target.ownerDocument.addEventListener('click', record, { once: true });
  target.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
  );
  return isHeld;
}
