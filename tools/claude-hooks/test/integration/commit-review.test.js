import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const hooks = fileURLToPath(new URL('../../', import.meta.url));
const scratchRepos = [];
// run from a commit's pre-commit check, git has set GIT_INDEX_FILE and the like for the commit's own
// repository, and git in a scratch repository would follow them there; run by Claude, CLAUDECODE
// would make every commit here one by Claude
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_') && name !== 'CLAUDECODE'),
);
const asClaude = { ...env, CLAUDECODE: '1' };
const author = ['-c', 'user.name=t', '-c', 'user.email=t@t'];

const git = (repo, ...args) => execFileSync('git', args, { cwd: repo, env, encoding: 'utf8' });

function commit(repo, args, commitEnv = asClaude) {
  const run = spawnSync('git', [...author, 'commit', '-q', ...args], {
    cwd: repo,
    env: commitEnv,
    encoding: 'utf8',
  });

  return { committed: run.status === 0, said: run.stderr };
}

function edit(repo, file, text) {
  writeFileSync(path.join(repo, file), text);
}

function installReviewHook(repo) {
  const preCommit = path.join(repo, '.hooks/pre-commit');

  mkdirSync(path.dirname(preCommit));
  writeFileSync(preCommit, `#!/bin/sh\nnode "${path.join(hooks, 'require-review.js')}"\n`);
  chmodSync(preCommit, 0o755);
  git(repo, 'config', 'core.hooksPath', '.hooks');
}

function scratchRepo() {
  const repo = mkdtempSync(path.join(tmpdir(), 'commit-review-'));

  scratchRepos.push(repo);
  git(repo, 'init', '-q');

  edit(repo, 'a.js', 'export const a = 1;\n');
  git(repo, 'add', 'a.js');
  git(repo, ...author, 'commit', '-qm', 'start');

  installReviewHook(repo);

  return repo;
}

const said = (...content) => JSON.stringify({ type: 'assistant', message: { content } });

const ran = (id, command, output) => [
  said({ type: 'tool_use', id, name: 'Bash', input: { command } }),
  JSON.stringify({
    type: 'user',
    message: { content: [{ type: 'tool_result', tool_use_id: id, content: output }] },
  }),
];

function reviewerFinishes(repo, verdict, agentType = 'guideline-reviewer') {
  const tree = git(repo, 'write-tree').trim();
  const lines = [
    ...ran('t1', 'git write-tree', `${tree}\n`),
    ...ran('t2', 'git diff --cached', ''),
    said({ type: 'text', text: `VERDICT: ${verdict} ${tree}` }),
  ];

  const transcript = path.join(repo, '.hooks/reviewer.jsonl');

  writeFileSync(transcript, lines.join('\n'));

  const payload = { agent_type: agentType, agent_transcript_path: transcript, cwd: repo };

  spawnSync('node', [path.join(hooks, 'record-review.js')], {
    input: JSON.stringify(payload),
    env: { ...env, CLAUDE_PROJECT_DIR: repo },
  });
}

afterEach(() => {
  scratchRepos.splice(0).forEach((repo) => rmSync(repo, { recursive: true, force: true }));
});

describe('a commit by Claude', () => {
  it('waits for the reviewer to pass exactly what it commits', () => {
    const repo = scratchRepo();

    edit(repo, 'a.js', 'export const a = 2;\n');
    git(repo, 'add', 'a.js');

    const refused = commit(repo, ['-m', 'two']);

    expect(refused.committed).toBe(false);
    expect(refused.said).toMatch(/guideline-reviewer[\s\S]*a\.js|a\.js[\s\S]*guideline-reviewer/);

    reviewerFinishes(repo, 'pass');
    expect(commit(repo, ['-m', 'two']).committed).toBe(true);
  });

  it('stays refused after a fail', () => {
    const repo = scratchRepo();

    edit(repo, 'a.js', 'export const a = 2;\n');
    git(repo, 'add', 'a.js');
    reviewerFinishes(repo, 'fail');

    expect(commit(repo, ['-m', 'two']).committed).toBe(false);
  });

  it('is refused when -a or a path adds what the reviewer never saw', () => {
    const repo = scratchRepo();

    edit(repo, 'a.js', 'export const a = 2;\n');
    git(repo, 'add', 'a.js');
    reviewerFinishes(repo, 'pass');
    edit(repo, 'a.js', 'export const a = 3;\n');

    expect(commit(repo, ['-am', 'three']).committed).toBe(false);
    expect(commit(repo, ['-m', 'three', 'a.js']).committed).toBe(false);
    expect(commit(repo, ['-m', 'two']).committed).toBe(true);
  });

  it('needs a review for any file, a deletion or a setting as much as code', () => {
    const repo = scratchRepo();

    git(repo, 'rm', '-q', 'a.js');
    expect(commit(repo, ['-m', 'gone']).committed).toBe(false);

    git(repo, 'reset', '-q', '--hard');
    edit(repo, 'settings.json', '{}\n');
    git(repo, 'add', 'settings.json');
    expect(commit(repo, ['-m', 'settings']).committed).toBe(false);
  });

  it('takes no verdict from another kind of subagent', () => {
    const repo = scratchRepo();

    edit(repo, 'a.js', 'export const a = 2;\n');
    git(repo, 'add', 'a.js');
    reviewerFinishes(repo, 'pass', 'Explore');

    expect(commit(repo, ['-m', 'two']).committed).toBe(false);
  });
});

describe('a merge by Claude', () => {
  it('needs no review, even when a conflict makes git commit finish it', () => {
    const repo = scratchRepo();

    git(repo, 'checkout', '-qb', 'side');
    edit(repo, 'a.js', 'export const a = 2;\n');
    git(repo, ...author, 'commit', '-qam', 'side');
    git(repo, 'checkout', '-q', '-');
    edit(repo, 'a.js', 'export const a = 3;\n');
    git(repo, ...author, 'commit', '-qam', 'main');

    spawnSync('git', [...author, 'merge', '-q', 'side'], { cwd: repo, env });
    edit(repo, 'a.js', 'export const a = 4;\n');
    git(repo, 'add', 'a.js');

    expect(commit(repo, ['--no-edit']).committed).toBe(true);
  });
});

describe('a commit by a person', () => {
  it('needs no review', () => {
    const repo = scratchRepo();

    edit(repo, 'a.js', 'export const a = 2;\n');

    expect(commit(repo, ['-am', 'two'], env).committed).toBe(true);
  });
});
