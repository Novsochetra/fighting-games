import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const script = path.join(root, 'tools/claude-hooks/review-comments.js');
const component = path.join(root, 'apps/web/src/home/use-details.ts');
const scratchRepos = [];

function runHook(payload, projectDir = root) {
  const run = spawnSync('node', [script], {
    input: JSON.stringify(payload),
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });

  return { status: run.status, output: run.stdout };
}

const contextOf = ({ output }) => JSON.parse(output).hookSpecificOutput.additionalContext;

function commitIn(repo, file, text) {
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      cwd: repo,
      encoding: 'utf8',
    });

  writeFileSync(path.join(repo, file), text);
  git('add', file);

  return git('commit', '-m', 'change');
}

afterEach(() => {
  scratchRepos.splice(0).forEach((repo) => rmSync(repo, { recursive: true, force: true }));
});

describe('the comment review hook, after an edit', () => {
  it('hands Claude the comments the edit added', () => {
    const edit = { file_path: component, old_string: '', new_string: '// x' };
    const run = runHook({ tool_name: 'Edit', tool_input: edit });
    const { hookSpecificOutput } = JSON.parse(run.output);

    expect(run.status).toBe(0);
    expect(hookSpecificOutput.hookEventName).toBe('PostToolUse');
    expect(hookSpecificOutput.additionalContext).toContain(
      'apps/web/src/home/use-details.ts:\n  // x',
    );
  });

  it('says nothing about an edit that added no comment, or a file it does not review', () => {
    const plain = { file_path: component, old_string: 'a', new_string: 'b' };
    const notes = { file_path: path.join(root, 'CLAUDE.md'), old_string: '', new_string: '// x' };

    expect(runHook({ tool_name: 'Edit', tool_input: plain })).toEqual({ status: 0, output: '' });
    expect(runHook({ tool_name: 'Edit', tool_input: notes }).output).toBe('');
  });
});

describe('the comment review hook, after a commit', () => {
  it('hands Claude the comments the commit added, however the files were edited', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'comment-review-'));

    scratchRepos.push(repo);
    execFileSync('git', ['init', '-q'], { cwd: repo });
    commitIn(repo, 'a.js', '// kept\nconst a = 1;\n');
    const printed = commitIn(repo, 'a.js', '// kept\n// sets a\nconst a = 2;\n');
    const run = runHook({ tool_name: 'Bash', tool_response: { stdout: printed } }, repo);

    expect(contextOf(run)).toMatch(
      /^Commit [0-9a-f]{7,} added these comments:\na\.js:\n {2}\/\/ sets a\n/,
    );
  });

  it('says nothing after a command that made no commit', () => {
    const run = runHook({ tool_name: 'Bash', tool_response: { stdout: 'ok' } });

    expect(run).toEqual({ status: 0, output: '' });
  });
});
