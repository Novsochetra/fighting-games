import { homedir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GIT_COMMIT } from '../../commit-command.js';
import { commandFolder } from '../../commit-folder.js';

const folderOf = (command, cwd) => commandFolder(command, cwd, GIT_COMMIT);

const home = process.env.HOME ?? homedir();

describe('commandFolder', () => {
  it('is where the command starts, for a plain commit', () => {
    expect(folderOf('git commit -m x', '/repo')).toBe('/repo');
  });

  it('follows a cd, a pushd or a cd in a subshell before the commit, and a git -C', () => {
    expect(folderOf('cd ../wt && git commit -m x', '/repo/main')).toBe('/repo/wt');
    expect(folderOf('pushd /repo/wt && git commit -m x', '/home')).toBe('/repo/wt');
    expect(folderOf('(cd /repo/wt && git commit -m x)', '/home')).toBe('/repo/wt');
    expect(folderOf('git -C /repo/wt commit -m x', '/repo/main')).toBe('/repo/wt');
    expect(folderOf('cd /repo && git -C wt -C sub commit -m x', '/home')).toBe('/repo/wt/sub');
  });

  it('reads the home folder as the shell does', () => {
    expect(folderOf('cd ~/wt && git commit -m x', '/repo')).toBe(path.join(home, 'wt'));
    expect(folderOf('git -C ~/wt commit -m x', '/repo')).toBe(path.join(home, 'wt'));
    expect(folderOf('cd $HOME/wt && git commit -m x', '/repo')).toBe(path.join(home, 'wt'));
    expect(folderOf('cd ${HOME}/wt && git commit -m x', '/repo')).toBe(path.join(home, 'wt'));
  });

  it('knows no folder held in a variable or a command output', () => {
    expect(
      folderOf('cd "$(git rev-parse --show-toplevel)" && git commit -m x', '/repo'),
    ).toBeNull();
    expect(folderOf('git -C "$PWD" commit -m x', '/repo')).toBeNull();
    expect(folderOf('cd $OLDPWD && git -C wt commit -m x', '/repo')).toBeNull();
  });

  it('reads a quoted folder back', () => {
    expect(folderOf('cd "/repo/my wt" && git commit -m "a; b"', '/home')).toBe('/repo/my wt');
  });

  it('takes no cd after the commit, nor one in a message', () => {
    expect(folderOf('git commit -m x && cd /elsewhere', '/repo')).toBe('/repo');
    expect(folderOf('git commit -m "then cd /elsewhere && commit"', '/repo')).toBe('/repo');
  });
});
