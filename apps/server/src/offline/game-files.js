import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { isHiddenName } from '../public-files.js';

// What a game is shared by, which it never loads itself: the shots the arcade's card and a link
// preview show, the trailer the arcade plays (megabytes a saved game has no use for), and its notes.
const NOT_PLAYED = [/^assets\/screenshots\//, /^assets\/social\//, /^assets\/trailer\//, /\.md$/];

async function exists(file) {
  return stat(file).then(
    () => true,
    () => false,
  );
}

// A sprite drawn whole beside a packed copy of it (packed/<same name>, cut down to its painted
// pieces) is only the packer's source: the game draws the packed one.
const hasPackedTwin = (gameRoot, file) =>
  exists(path.join(gameRoot, path.dirname(file), 'packed', path.basename(file)));

async function filesUnder(gameRoot) {
  const entries = await readdir(gameRoot, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(gameRoot, path.join(entry.parentPath, entry.name)))
    .filter((file) => file.split(path.sep).every((name) => !isHiddenName(name)))
    .map((file) => file.split(path.sep).join('/'));
}

// Every file the game may load as it is played, so the whole game plays offline once it is in.
export async function playedFilesOf(gameRoot) {
  const files = (await filesUnder(gameRoot)).filter(
    (file) => !NOT_PLAYED.some((pattern) => pattern.test(file)),
  );
  const twins = await Promise.all(files.map((file) => hasPackedTwin(gameRoot, file)));

  return files.filter((_, i) => !twins[i]).sort();
}

// The list the arcade's worker downloads a game by, with a revision that changes with any file in
// it, so a deploy that changes the game brings it down again whole, never a file at a time.
export async function offlineListOf(gameRoot) {
  const files = await playedFilesOf(gameRoot);
  const digest = createHash('sha256');

  for (const file of files) {
    digest.update(file);
    digest.update(
      createHash('sha256')
        .update(await readFile(path.join(gameRoot, file)))
        .digest(),
    );
  }

  return { revision: digest.digest('hex').slice(0, 16), files };
}
