import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ARCADE_PACKAGE } from './paths.js';

// The version of a build, which tells an arcade left open on an older one that a deploy replaced it:
// the release package.json names, raised by hand as SemVer, then the build after a + as SemVer puts
// it. The build is the commit Railway deploys (it sets RAILWAY_GIT_COMMIT_SHA for a deploy from
// GitHub), else the one checked out, else the time of the build, so every build has one. A redeploy
// of the same commit keeps its version, as it builds the same arcade.
export function buildVersion({
  env = process.env,
  gitHead = readGitHead,
  now = new Date(),
  release = readRelease,
} = {}) {
  const commit = env.RAILWAY_GIT_COMMIT_SHA || gitHead();
  const build = commit ? commit.slice(0, 7) : now.toISOString().replace(/\D/g, '').slice(0, 14);

  return `${release()}+${build}`;
}

function readRelease() {
  return JSON.parse(readFileSync(ARCADE_PACKAGE, 'utf8')).version;
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
