import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

// Bug: on a phone whose Chrome is older than 92 the game stood on its loading screen for good
// (`.at()` is not a function), older than 93 its sounds threw (Object.hasOwn), and older than 97 the
// rainbow orb would stop the fight (findLast). Its bundles keep to ES2021, which Chrome 85 and
// Safari 14 read, so the code keeps to the built-ins those browsers have as well.
const SOURCE = path.join(import.meta.dirname, '../../../src');
const files = readdirSync(SOURCE, { recursive: true }).filter((file) => file.endsWith('.js'));

const NEWER_METHODS = {
  at: 'Chrome 92 and Safari 15.4',
  findLast: 'Chrome 97 and Safari 15.4',
  findLastIndex: 'Chrome 97 and Safari 15.4',
  toSorted: 'Chrome 110 and Safari 16',
  toReversed: 'Chrome 110 and Safari 16',
  toSpliced: 'Chrome 110 and Safari 16',
};
const NEWER_STATICS = {
  'Object.hasOwn': 'Chrome 93 and Safari 15.4',
  'Object.groupBy': 'Chrome 117 and Safari 17.4',
  'Map.groupBy': 'Chrome 117 and Safari 17.4',
  'Promise.withResolvers': 'Chrome 119 and Safari 17.4',
  'Array.fromAsync': 'Chrome 121 and Safari 16.4',
};

const methodCalls = Object.entries(NEWER_METHODS).map(([name, since]) => ({
  selector: `CallExpression[callee.property.name='${name}']`,
  message: `.${name}() came in ${since}`,
}));
const statics = Object.entries(NEWER_STATICS).map(([name, since]) => {
  const [owner, property] = name.split('.');

  return {
    selector: `MemberExpression[object.name='${owner}'][property.name='${property}']`,
    message: `${name} came in ${since}`,
  };
});
const globalCalls = [
  {
    selector: "CallExpression[callee.name='structuredClone']",
    message: 'structuredClone came in Chrome 98 and Safari 15.4',
  },
];

const linter = new Linter();
const CONFIG = [
  {
    languageOptions: { ecmaVersion: 2021, sourceType: 'module' },
    rules: { 'no-restricted-syntax': ['error', ...methodCalls, ...statics, ...globalCalls] },
  },
];

const problems = files.flatMap((file) =>
  linter
    .verify(readFileSync(path.join(SOURCE, file), 'utf8'), CONFIG, { filename: file })
    .map((problem) => ({ ...problem, where: `src/${file}:${problem.line}` })),
);
const listed = (found) => found.map((problem) => `${problem.where} ${problem.message}`);

describe('the game on an older phone', () => {
  it('is written in ES2021, as its bundles are', () => {
    expect(files.length).toBeGreaterThan(500);
    expect(listed(problems.filter((problem) => problem.fatal))).toEqual([]);
  });

  it('calls no built-in newer than Chrome 85 and Safari 14', () => {
    expect(listed(problems.filter((problem) => !problem.fatal))).toEqual([]);
  });
});
