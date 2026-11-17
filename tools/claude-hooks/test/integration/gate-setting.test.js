import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const settings = fileURLToPath(new URL('../../../../.claude/settings.json', import.meta.url));
const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const gateCommand = JSON.parse(readFileSync(settings, 'utf8')).hooks.PreToolUse[0].hooks[0].command;
const scratchFolders = [];

function runSetting(projectDir, command, call = { tool_name: 'Bash', tool_input: { command } }) {
  const run = spawnSync('sh', ['-c', gateCommand], {
    input: JSON.stringify({ ...call, cwd: projectDir }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });

  return { status: run.status, said: run.stderr };
}

afterEach(() => {
  scratchFolders.splice(0).forEach((folder) => rmSync(folder, { recursive: true, force: true }));
});

describe('the gate as .claude/settings.json runs it', () => {
  it('refuses a commit on a branch that has no gate, rather than letting it through', () => {
    const branchWithoutGate = mkdtempSync(path.join(tmpdir(), 'no-gate-'));

    scratchFolders.push(branchWithoutGate);

    const refused = runSetting(branchWithoutGate, 'git commit -am x');

    expect(refused.status).toBe(2);
    expect(refused.said).toMatch(/no commit gate/);
    expect(runSetting(branchWithoutGate, 'git -C .. commit -m "x"').status).toBe(2);
    expect(runSetting(branchWithoutGate, 'cd app && git am fix.patch').status).toBe(2);
    expect(runSetting(branchWithoutGate, 'git add -A\ngit commit -m x').status).toBe(2);
    expect(runSetting(branchWithoutGate, 'git status\tgit commit -m x').status).toBe(2);
  });

  it('leaves alone any other command or edit on a branch that has no gate', () => {
    const branchWithoutGate = mkdtempSync(path.join(tmpdir(), 'no-gate-'));
    const edit = {
      tool_name: 'Edit',
      tool_input: { file_path: 'README.md', new_string: 'Clone it with git, then start a game' },
    };

    scratchFolders.push(branchWithoutGate);

    expect(runSetting(branchWithoutGate, 'git status').status).toBe(0);
    expect(runSetting(branchWithoutGate, 'git log --oneline -- apps/web/games').status).toBe(0);
    expect(runSetting(branchWithoutGate, 'git switch claude/commit-gate').status).toBe(0);
    expect(runSetting(branchWithoutGate, 'git checkout -b claude/fix-game-dash').status).toBe(0);
    expect(runSetting(branchWithoutGate, 'legit commit').status).toBe(0);
    expect(runSetting(branchWithoutGate, 'echo done\nlegit commit').status).toBe(0);
    expect(runSetting(branchWithoutGate, '', edit).status).toBe(0);
  });

  it('runs the gate where the branch has it', () => {
    expect(runSetting(projectRoot, 'git status')).toEqual({ status: 0, said: '' });
  });
});
