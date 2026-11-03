import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// A tuning knob read from `process.env` in src/sim/hunts.js passed every test, which run in Node,
// and threw "process is not defined" in the browser, so the game page never started
const SRC = fileURLToPath(new URL('../../../src', import.meta.url));

const NODE_ONLY = /\bprocess\.|\brequire\(|\b__dirname\b/;

const sourceFiles = () =>
  readdirSync(SRC, { recursive: true })
    .filter((path) => path.endsWith('.js'))
    .map((path) => join(SRC, path));

const linesUsing = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .map((line, index) => ({ line: line.trim(), at: `${file}:${index + 1}` }))
    .filter(({ line }) => !line.startsWith('//') && NODE_ONLY.test(line));

describe('the game’s source', () => {
  it('reads nothing only Node has, since it runs in the browser', () => {
    const found = sourceFiles().flatMap(linesUsing);

    expect(found).toEqual([]);
  });
});
