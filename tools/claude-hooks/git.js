import { execFileSync } from 'node:child_process';

export function gitIn(root) {
  return (...args) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    } catch {
      return '';
    }
  };
}
