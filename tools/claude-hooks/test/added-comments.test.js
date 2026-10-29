import { describe, expect, it } from 'vitest';
import {
  addedComments,
  changesOf,
  committedRevision,
  isReviewed,
  reviewRequest,
} from '../added-comments.js';

describe('isReviewed', () => {
  it('reviews the project’s scripts, components and styles', () => {
    for (const file of ['apps/a.js', 'apps/b.ts', 'apps/c.tsx', 'tools/d.mjs', 'apps/e.css']) {
      expect(isReviewed(file)).toBe(true);
    }
  });

  it('leaves out other files, packages, builds and files outside the project', () => {
    for (const file of ['CLAUDE.md', 'node_modules/x/a.js', 'dist/a.js', '../a.js', 'a.json']) {
      expect(isReviewed(file)).toBe(false);
    }
  });
});

describe('addedComments', () => {
  it('finds line, trailing, block and JSX comments', () => {
    const after = '// a\nconst x = 1; // b\n/* c */\n<p>{/* d */}</p>';

    expect(addedComments([['', after]])).toEqual(['// a', '// b', '/* c */', '/* d */']);
  });

  it('skips the comments the edit only kept', () => {
    const before = '// kept\nconst x = 1;';

    expect(addedComments([[before, '// kept\n// new\nconst x = 2;']])).toEqual(['// new']);
  });

  it('skips tool directives, which explain nothing', () => {
    const after = [
      '// @vitest-environment happy-dom',
      '// eslint-disable-next-line no-console',
      '/* stylelint-disable */',
      '// @ts-expect-error the DOM types lag the spec',
    ].join('\n');

    expect(addedComments([['', after]])).toEqual([]);
  });

  it('takes no address or glob in a string for a comment', () => {
    const after = "const url = 'https://cdn.example/a.mp4';\nconst glob = 'apps/**/*.js';";

    expect(addedComments([['', after]])).toEqual([]);
  });
});

describe('changesOf', () => {
  it('reads an Edit, a MultiEdit and a Write', () => {
    const edits = [{ old_string: 'a', new_string: 'b' }];

    expect(changesOf({ old_string: 'a', new_string: 'b' }, '')).toEqual([['a', 'b']]);
    expect(changesOf({ edits }, '')).toEqual([['a', 'b']]);
    expect(changesOf({ content: 'new' }, 'old')).toEqual([['old', 'new']]);
  });
});

describe('committedRevision', () => {
  it('reads the commit git just made from what it printed', () => {
    expect(committedRevision('[claude/x 6c2ac8d] Take the button off\n 3 files changed')).toBe(
      '6c2ac8d',
    );
    expect(committedRevision('[main (root-commit) 1a2b3c4] First')).toBe('1a2b3c4');
  });

  it('finds none in a command that made no commit', () => {
    expect(committedRevision('nothing to commit, working tree clean')).toBeNull();
    expect(committedRevision(undefined)).toBeNull();
  });
});

describe('reviewRequest', () => {
  it('names each file and its comments, and asks for the what-comments to go', () => {
    const request = reviewRequest('This edit', [
      ['apps/a.js', ['// sets the card']],
      ['apps/b.css', ['/* the sheet */']],
    ]);

    expect(request).toMatch(
      /^This edit added these comments:\napps\/a\.js:\n {2}\/\/ sets the card/,
    );
    expect(request).toContain('apps/b.css:\n  /* the sheet */');
    expect(request).toMatch(/Delete now each one above that says what the code does/);
  });
});
