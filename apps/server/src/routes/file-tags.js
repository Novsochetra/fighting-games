import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const tags = new Map();

// A file's tag is a hash of its content, so a deploy that leaves a file as it was leaves its tag as
// it was, and a browser (or the arcade's worker) checking it again gets a 304 in place of the file.
// Each file is hashed once for each version of it on disk.
export async function tagOf(filePath, stats) {
  const version = `${stats.size}:${stats.mtimeMs}`;
  const known = tags.get(filePath);

  if (known?.version === version) {
    return known.tag;
  }

  const digest = createHash('sha256')
    .update(await readFile(filePath))
    .digest('base64url');
  const tag = `"${digest.slice(0, 27)}"`;

  tags.set(filePath, { version, tag });

  return tag;
}

export const matchesTag = (ifNoneMatch, tag) =>
  typeof ifNoneMatch === 'string' &&
  ifNoneMatch.split(',').some((candidate) => candidate.trim().replace(/^W\//, '') === tag);
