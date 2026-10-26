import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { localRules } from './tools/eslint-rules/index.js';

const sizeAndComplexity = {
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 4],
  'max-nested-callbacks': ['error', 3],
  'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
  'max-classes-per-file': ['error', 1],
};

const readability = {
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
  'id-length': ['error', { min: 2, properties: 'never', exceptions: ['x', 'y', 'i', 'j', '_'] }],
  'no-nested-ternary': 'error',
  'no-param-reassign': ['error', { props: false }],
  'no-shadow': 'error',
  'no-var': 'error',
  'no-else-return': 'error',
  'object-shorthand': 'error',
  'prefer-const': 'error',
  'prefer-template': 'error',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
};

// TypeScript's own versions of the rules it would otherwise misread, as with a type used as a value
const typescript = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': 'error',
};

const comments = {
  'no-warning-comments': [
    'error',
    { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'anywhere' },
  ],
  'local/no-jsdoc-blocks': 'error',
  'local/no-banner-comments': 'error',
};

export default [
  // .claude/ holds Claude Code's own worktrees, copies of this repo it lints on its own
  { ignores: ['node_modules/', 'dist/', 'coverage/', '**/assets/**', '.claude/'] },
  js.configs.recommended,
  prettier,
  {
    plugins: { local: localRules },
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: { ...sizeAndComplexity, ...readability, ...comments },
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] })),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: reactHooks.configs.flat.recommended.plugins,
    rules: { ...reactHooks.configs.flat.recommended.rules, ...typescript },
  },
  {
    files: ['apps/web/**/*.{js,ts,tsx}'],
    ignores: ['apps/web/**/test/**', 'apps/web/vite.config.ts'],
    languageOptions: { globals: globals.browser },
    rules: { 'local/no-raw-hex': 'error' },
  },
  {
    files: ['apps/web/games/*/src/art/**/*.js'],
    rules: { 'local/no-raw-hex': 'off' },
  },
  {
    files: ['**/test/**/*.{js,ts,tsx}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['error', 4],
    },
  },
];
