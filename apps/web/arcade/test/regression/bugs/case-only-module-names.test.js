import { readdirSync } from 'node:fs';
import { extname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Bug: components/avatar held avatar.js beside Avatar.tsx. A Mac's disk does not tell the two apart,
// so `@/components/avatar/Avatar` loaded avatar.js there: the build lost Avatar and every screen with
// an avatar broke on a Mac, while Linux CI and Railway were fine
const SRC = fileURLToPath(new URL('../../../src/', import.meta.url));
const MODULE = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json']);

function clashesIn(folder) {
  const entries = readdirSync(folder, { withFileTypes: true });
  const byName = new Map();

  for (const entry of entries.filter((each) => each.isFile() && MODULE.has(extname(each.name)))) {
    const { name } = parse(entry.name);
    const key = name.toLowerCase();
    byName.set(key, new Set([...(byName.get(key) ?? []), name]));
  }

  const clashes = [...byName.values()].filter((names) => names.size > 1).map((names) => [...names]);
  const below = entries.filter((each) => each.isDirectory());

  return [...clashes, ...below.flatMap((each) => clashesIn(join(folder, each.name)))];
}

describe("the arcade's modules", () => {
  it('never share a folder with one whose name differs only in case', () => {
    expect(clashesIn(SRC)).toEqual([]);
  });
});
