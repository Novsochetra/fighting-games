import path from 'node:path';

const commonDir = (gitIn, folder) =>
  path.resolve(folder, gitIn(folder)('rev-parse', '--git-common-dir').trim());

export const isSameRepository = ({ gitIn, root }, folder) =>
  commonDir(gitIn, folder) === commonDir(gitIn, root);

// git runs the pre-commit hook of the worktree it commits in, so a branch from before the review was
// added still runs its old hook, which asks for none.
export function hookSkipsReview({ gitIn, readFile }, folder) {
  const top = gitIn(folder)('rev-parse', '--show-toplevel').trim();

  return !readFile(path.join(top, '.githooks/pre-commit')).includes('require-review.js');
}
