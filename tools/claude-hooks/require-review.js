import { gitIn } from './git.js';
import { hasPassed, reviewRequest, stagedFiles, stagedTree } from './review-record.js';

// .githooks/pre-commit runs this before the check. git has built the tree it commits by then, with
// -a, paths or another worktree, so the tree read here is exactly what the commit holds.
const root = process.cwd();
const git = gitIn(root);

// A merge combines commits already reviewed, even when a conflict makes git commit finish it.
const merging = git('rev-parse', '-q', '--verify', 'MERGE_HEAD').trim() !== '';
const files = process.env.CLAUDECODE && !merging ? stagedFiles(git) : [];

if (files.length > 0) {
  const tree = stagedTree(git);

  if (!hasPassed(root, git, tree)) {
    console.error(reviewRequest(tree, files));
    process.exitCode = 1;
  }
}
