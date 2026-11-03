import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const PAGE = join(import.meta.dirname, '../../index.html');

export const readPage = () => readFile(PAGE, 'utf8');

// the game's real page body, so the screens are tested on the markup the game ships
export async function loadPageBody(document) {
  const page = await readPage();

  document.body.innerHTML = page.match(/<body>([\s\S]*)<\/body>/)[1];
}
