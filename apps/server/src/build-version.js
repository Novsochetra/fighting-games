import { execFileSync } from 'node:child_process';

// The version of a build, which tells an arcade left open on an older one that a deploy replaced it:
// the commit Railway deploys (it sets RAILWAY_GIT_COMMIT_SHA for a deploy from GitHub), else the one
// checked out, else the time of the build, so every build has one. A redeploy of the same commit
// keeps its version, as it builds the same arcade.
export function buildVersion({ env = process.env, gitHead = readGitHead, now = new Date() } = {}) {
  const commit = env.RAILWAY_GIT_COMMIT_SHA || gitHead();

  return commit ? commit.slice(0, 7) : now.toISOString().replace(/\D/g, '').slice(0, 14);
}

// Railway's builder may leave .git out, and a machine may have no git at all.
function readGitHead() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}
