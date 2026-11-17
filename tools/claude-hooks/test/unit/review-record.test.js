import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  hasPassed,
  isReviewRecord,
  reviewRequest,
  stagedFiles,
  stagedTree,
  writeRecord,
} from '../../review-record.js';

const TREE = 'ef4af8c50d64e8f2d1b052d303cebba38e07d792';
const roots = [];

function fakeRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'review-record-'));
  const answers = {
    'rev-parse --git-common-dir': '.git\n',
    'write-tree': `${TREE}\n`,
    'diff --cached --name-only': 'a.js\ndocs/notes.md\n',
  };

  roots.push(root);

  return { root, git: (...args) => answers[args.join(' ')] ?? '' };
}

afterEach(() => {
  roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }));
});

describe('the review record', () => {
  it('reads the staged tree and every staged file', () => {
    const { git } = fakeRepo();

    expect(stagedTree(git)).toBe(TREE);
    expect(stagedFiles(git)).toEqual(['a.js', 'docs/notes.md']);
  });

  it('passes a tree only once a pass is written for it', () => {
    const { root, git } = fakeRepo();

    expect(hasPassed(root, git, TREE)).toBe(false);

    writeRecord(root, git, { verdict: 'fail', tree: TREE });
    expect(hasPassed(root, git, TREE)).toBe(false);

    writeRecord(root, git, { verdict: 'pass', tree: TREE });
    expect(hasPassed(root, git, TREE)).toBe(true);
    expect(hasPassed(root, git, '')).toBe(false);
  });

  it('keeps the record in the common git folder, shared by every worktree', () => {
    const { root, git } = fakeRepo();

    writeRecord(root, git, { verdict: 'pass', tree: TREE });

    const file = path.join(root, '.git/claude-review', TREE);

    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, 'utf8')).toBe('pass\n');
  });

  it('knows a file inside the records', () => {
    expect(isReviewRecord(`/repo/.git/claude-review/${TREE}`)).toBe(true);
    expect(isReviewRecord('/repo/tools/claude-hooks/review-record.js')).toBe(false);
    expect(isReviewRecord(undefined)).toBe(false);
  });

  it('asks for the reviewer by name, with the tree and the files', () => {
    const request = reviewRequest(TREE, ['a.js']);

    expect(request).toContain(TREE);
    expect(request).toContain('  a.js');
    expect(request).toContain('subagent_type "guideline-reviewer"');
  });
});
