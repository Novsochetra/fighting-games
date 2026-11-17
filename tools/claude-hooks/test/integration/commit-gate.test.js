import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const script = fileURLToPath(new URL('../../commit-gate.js', import.meta.url));
const scratchRepos = [];
// run from a commit's pre-commit check, git has set GIT_INDEX_FILE and the like for the commit's own
// repository, and git in a scratch repository would follow them there
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_')),
);

const REVIEWING_HOOK = '#!/bin/sh\nnode tools/claude-hooks/require-review.js || exit 1\n';

function gate(repo, toolName, toolInput, cwd = repo) {
  const { stdout } = spawnSync('node', [script], {
    input: JSON.stringify({ tool_name: toolName, tool_input: toolInput, cwd }),
    env: { ...env, CLAUDE_PROJECT_DIR: repo },
    encoding: 'utf8',
  });

  return stdout ? JSON.parse(stdout).hookSpecificOutput.permissionDecisionReason : null;
}

const bash = (repo, command) => gate(repo, 'Bash', { command });

function scratchRepo() {
  const repo = mkdtempSync(path.join(tmpdir(), 'commit-gate-'));

  scratchRepos.push(repo);
  execFileSync('git', ['init', '-q'], { cwd: repo, env });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: repo, env });

  mkdirSync(path.join(repo, '.githooks'));
  writeFileSync(path.join(repo, '.githooks/pre-commit'), REVIEWING_HOOK);

  return repo;
}

function oldBranchWorktree(repo) {
  const inRepo = (...args) => execFileSync('git', args, { cwd: repo, env });
  const author = ['-c', 'user.name=t', '-c', 'user.email=t@t'];

  inRepo('add', '.githooks');
  inRepo(...author, 'commit', '-qm', 'reviewing hook');
  inRepo('checkout', '-qb', 'old');
  writeFileSync(path.join(repo, '.githooks/pre-commit'), '#!/bin/sh\nnpm run check\n');
  inRepo(...author, 'commit', '-qam', 'old hook');
  inRepo('checkout', '-q', '-');

  const worktree = `${repo}-wt`;

  inRepo('worktree', 'add', '-q', worktree, 'old');
  scratchRepos.push(worktree);

  return worktree;
}

afterEach(() => {
  scratchRepos.splice(0).forEach((repo) => rmSync(repo, { recursive: true, force: true }));
});

describe('the commit gate', () => {
  it('lets a commit through to the pre-commit hook', () => {
    const repo = scratchRepo();

    expect(bash(repo, 'git commit -m "Fix the dash"')).toBeNull();
    expect(bash(repo, 'git add -A && git commit -am x')).toBeNull();
  });

  it('refuses a commit that skips the pre-commit hook', () => {
    const repo = scratchRepo();

    expect(bash(repo, 'git commit --no-verify -m x')).toMatch(/pre-commit hook/);
    expect(bash(repo, 'git -c core.hooksPath=/dev/null commit -m x')).toMatch(/pre-commit hook/);
  });

  it('refuses a commit while the hooks that check it have unstaged edits', () => {
    const repo = scratchRepo();
    const preCommit = path.join(repo, '.githooks/pre-commit');

    execFileSync('git', ['add', '.githooks'], { cwd: repo, env });
    writeFileSync(preCommit, `${REVIEWING_HOOK}exit 0\n`);

    expect(bash(repo, 'git commit -m x')).toMatch(/\.githooks\/pre-commit/);

    execFileSync('git', ['add', '.githooks'], { cwd: repo, env });
    expect(bash(repo, 'git commit -m x')).toBeNull();
  });

  it('refuses a commit on a branch whose pre-commit hook asks for no review', () => {
    const repo = scratchRepo();

    writeFileSync(path.join(repo, '.githooks/pre-commit'), '#!/bin/sh\nnpm run check\n');

    expect(bash(repo, 'git commit -m x')).toMatch(/no guideline review/);
  });

  it('refuses a commit reached by -C or cd in a worktree whose hook asks for no review', () => {
    const repo = scratchRepo();
    const worktree = oldBranchWorktree(repo);

    expect(bash(repo, `git -C ${worktree} commit -m x`)).toMatch(/no guideline review/);
    expect(bash(repo, `cd ${worktree} && git commit -m x`)).toMatch(/no guideline review/);
    expect(bash(repo, 'git commit -m x')).toBeNull();
  });

  it('leaves alone a commit in another repository, whatever this one holds', () => {
    const repo = scratchRepo();
    const other = scratchRepo();

    writeFileSync(path.join(other, '.githooks/pre-commit'), '#!/bin/sh\nexit 0\n');
    execFileSync('git', ['config', 'core.hooksPath', '.husky/_'], { cwd: repo, env });

    expect(gate(repo, 'Bash', { command: 'git commit -m x' }, other)).toBeNull();
    expect(bash(repo, `cd ${other} && git commit -n -m x`)).toBeNull();
  });

  it('refuses any command or edit that writes a review record, but not a read', () => {
    const repo = scratchRepo();
    const record = path.join(repo, '.git/claude-review/4b825dc');

    expect(gate(repo, 'Write', { file_path: record, content: 'pass' })).toMatch(/Only the hook/);
    expect(bash(repo, `echo pass > ${record}`)).toMatch(/Only the hook/);
    expect(bash(repo, `ls ${path.dirname(record)}`)).toBeNull();
  });

  it('refuses a revert, cherry-pick or am that would commit past the pre-commit hook', () => {
    const repo = scratchRepo();

    expect(bash(repo, 'git revert --no-edit HEAD')).toMatch(/--no-commit/);
    expect(bash(repo, 'git am fix.patch')).toMatch(/git apply --index/);
    expect(bash(repo, 'git revert --no-commit HEAD')).toBeNull();
  });

  it('finds unstaged hook edits from a subfolder of the worktree', () => {
    const repo = scratchRepo();
    const subfolder = path.join(repo, 'apps/web');

    execFileSync('git', ['add', '.githooks'], { cwd: repo, env });
    writeFileSync(path.join(repo, '.githooks/pre-commit'), `${REVIEWING_HOOK}exit 0\n`);
    mkdirSync(subfolder, { recursive: true });

    expect(gate(repo, 'Bash', { command: 'git commit -m x' }, subfolder)).toMatch(/Stage or undo/);
    expect(bash(repo, 'cd apps/web && git commit -m x')).toMatch(/Stage or undo/);
  });

  it('lets a commit through while only a test of the hooks has unstaged edits', () => {
    const repo = scratchRepo();
    const hookTest = path.join(repo, 'tools/claude-hooks/test/a.test.js');

    mkdirSync(path.dirname(hookTest), { recursive: true });
    writeFileSync(hookTest, 'one\n');
    execFileSync('git', ['add', 'tools'], { cwd: repo, env });
    writeFileSync(hookTest, 'two\n');

    expect(bash(repo, 'git commit -m x')).toBeNull();
  });

  it('lets --continue go on in a cherry-pick started with --no-commit', () => {
    const repo = scratchRepo();

    expect(bash(repo, 'git cherry-pick --continue')).toMatch(/--no-commit/);

    const options = path.join(repo, '.git/sequencer/opts');

    mkdirSync(path.dirname(options));
    writeFileSync(options, '[options]\n\tno-commit = true\n');

    expect(bash(repo, 'git cherry-pick --continue')).toBeNull();
  });

  it('reads the sequence of the worktree the command runs in', () => {
    const repo = scratchRepo();
    const worktree = oldBranchWorktree(repo);
    const options = execFileSync('git', ['rev-parse', '--git-path', 'sequencer/opts'], {
      cwd: worktree,
      env,
      encoding: 'utf8',
    }).trim();

    mkdirSync(path.resolve(worktree, path.dirname(options)), { recursive: true });
    writeFileSync(path.resolve(worktree, options), '[options]\n\tno-commit = true\n');

    expect(gate(repo, 'Bash', { command: 'git cherry-pick --continue' }, worktree)).toBeNull();
    expect(bash(repo, `cd ${worktree} && git cherry-pick --continue`)).toBeNull();
    expect(bash(repo, 'git cherry-pick --continue')).toMatch(/--no-commit/);
  });

  it('leaves alone a revert or cherry-pick in another repository', () => {
    const repo = scratchRepo();
    const other = scratchRepo();

    expect(bash(repo, `cd ${other} && git cherry-pick abc`)).toBeNull();
  });

  it('refuses a commit while git is pointed away from the project hooks', () => {
    const repo = scratchRepo();

    execFileSync('git', ['config', 'core.hooksPath', '.husky/_'], { cwd: repo, env });

    expect(bash(repo, 'git commit -m x')).toMatch(/core\.hooksPath \.githooks/);
  });

  it('refuses a commit written on GitHub, past git and its hooks', () => {
    const repo = scratchRepo();

    expect(gate(repo, 'mcp__github__push_files', {})).toMatch(/Commit with git/);
  });

  it('leaves every other command alone', () => {
    const repo = scratchRepo();

    expect(bash(repo, 'git status')).toBeNull();
    expect(gate(repo, 'Edit', { file_path: path.join(repo, 'a.js') })).toBeNull();
  });
});
