import { describe, expect, it } from 'vitest';
import { problemOf } from '../../commit-problems.js';

const REVIEWING_HOOK = '#!/bin/sh\nnode tools/claude-hooks/require-review.js || exit 1\n';

function fakeContext(repo = {}) {
  const { hooksPath = '.githooks', preCommit = REVIEWING_HOOK, editedHooks = '' } = repo;
  const answer = (folder, args) => {
    const answers = {
      'rev-parse --git-common-dir': folder.startsWith('/repo') ? '/repo/.git' : '/other/.git',
      'rev-parse --show-toplevel': folder.startsWith('/repo') ? '/repo' : '/other',
      'config --get core.hooksPath': hooksPath,
      'rev-parse --git-path sequencer/opts': '/repo/.git/sequencer/opts',
      'config -f /repo/.git/sequencer/opts --get options.no-commit': repo.noCommit ? 'true' : '',
    };

    return args.startsWith('diff') ? editedHooks : (answers[args] ?? '');
  };

  const gitIn =
    (folder) =>
    (...args) =>
      answer(folder, args.join(' '));

  return { root: '/repo', gitIn, readFile: () => preCommit };
}

const bash = (command, { repo, cwd = '/repo' } = {}) =>
  problemOf(fakeContext(repo), { tool_name: 'Bash', tool_input: { command }, cwd });

describe('problemOf, for a commit', () => {
  it('lets a commit through to the pre-commit hook', () => {
    expect(bash('git commit -m "Fix the dash"')).toBeNull();
    expect(bash('git config --get core.hooksPath && git commit -m x')).toBeNull();
  });

  it('refuses a commit that skips the pre-commit hook, wherever it is written to run', () => {
    expect(bash('git commit --no-verify -m x')).toMatch(/pre-commit hook/);
    expect(bash('cd "$(git rev-parse --show-toplevel)" && git commit -n -m x')).toMatch(/-n/);
    expect(bash('git -C "$PWD" commit -n -m x')).toMatch(/-n/);
  });

  it('refuses a commit while the hooks that check it are off or changed', () => {
    expect(bash('git commit -m x', { repo: { hooksPath: '.husky/_' } })).toMatch(/\.githooks$/);
    expect(bash('git commit -m x', { repo: { preCommit: 'npm run check\n' } })).toMatch(
      /no guideline review/,
    );
    expect(bash('git commit -m x', { repo: { editedHooks: '.githooks/pre-commit\n' } })).toMatch(
      /Stage or undo/,
    );
  });

  it('leaves alone a commit in another repository', () => {
    expect(bash('git commit -n -m x', { cwd: '/other' })).toBeNull();
    expect(bash('cd /other && git commit -m x', { repo: { hooksPath: '' } })).toBeNull();
  });
});

describe('problemOf, for a revert, cherry-pick or am', () => {
  it('refuses one that commits by itself', () => {
    expect(bash('git cherry-pick side')).toMatch(/--no-commit/);
    expect(bash('git cherry-pick --continue')).toMatch(/--no-commit/);
  });

  it('lets a sequence started with --no-commit go on, and leaves another repository alone', () => {
    expect(bash('git cherry-pick --continue', { repo: { noCommit: true } })).toBeNull();
    expect(bash('cd /other && git cherry-pick side')).toBeNull();
  });
});

describe('problemOf, for the review records and GitHub', () => {
  it('refuses a write into the records by a command or an edit', () => {
    const edit = { tool_name: 'Write', tool_input: { file_path: '/repo/.git/claude-review/abc' } };

    expect(bash('echo pass > .git/claude-review/abc')).toMatch(/Only the hook/);
    expect(problemOf(fakeContext(), edit)).toMatch(/Only the hook/);
  });

  it('refuses a commit written on GitHub, and leaves any other call alone', () => {
    const push = { tool_name: 'mcp__github__push_files', tool_input: {} };
    const edit = { tool_name: 'Edit', tool_input: { file_path: '/repo/a.js' } };

    expect(problemOf(fakeContext(), push)).toMatch(/Commit with git/);
    expect(bash('gh api -X PUT repos/o/r/contents/a.js -f content=eA==')).toMatch(
      /Commit with git/,
    );
    expect(problemOf(fakeContext(), edit)).toBeNull();
    expect(bash('git status')).toBeNull();
  });
});
