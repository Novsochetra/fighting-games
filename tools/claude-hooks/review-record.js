import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const REVIEWER = 'guideline-reviewer';

export const RECORDS_FOLDER = 'claude-review';

export const stagedTree = (git) => git('write-tree').trim();

export const stagedFiles = (git) =>
  git('diff', '--cached', '--name-only').split('\n').filter(Boolean);

// A tree is the same code in every worktree, so its record lives in the repository's common folder.
function recordPath(root, git, tree) {
  const common = path.resolve(root, git('rev-parse', '--git-common-dir').trim());

  return path.join(common, RECORDS_FOLDER, tree);
}

export const isReviewRecord = (file = '') => file.includes(`/${RECORDS_FOLDER}/`);

export function hasPassed(root, git, tree) {
  const file = recordPath(root, git, tree);

  return Boolean(tree) && existsSync(file) && readFileSync(file, 'utf8').startsWith('pass');
}

export function writeRecord(root, git, { verdict, tree }) {
  const file = recordPath(root, git, tree);

  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${verdict}\n`);
}

export function reviewRequest(tree, files) {
  return [
    `This commit needs a guideline review of exactly what it commits (tree ${tree}):`,
    ...files.map((file) => `  ${file}`),
    `Stage the change, then run the ${REVIEWER} subagent (Agent tool, subagent_type ` +
      `"${REVIEWER}"). Fix each finding, stage the fixes and run it again. When it passes the ` +
      'staged tree, commit that tree; staging anything more needs a new review.',
  ].join('\n');
}
