import path from 'node:path';
import { hookSkipsReview, isSameRepository } from './branch-hooks.js';
import {
  commitsWithoutHook,
  GIT_COMMIT,
  GIT_SELF_COMMIT,
  isGitCommit,
  skipsHooks,
  writesOnGitHub,
} from './commit-command.js';
import { commandFolder } from './commit-folder.js';
import { writesReviewRecords } from './record-writes.js';
import { isReviewRecord } from './review-record.js';

// git runs these from the working tree, so an unstaged edit to them changes what checks the commit.
// :(top) reads them from the top of the worktree, wherever in it the command runs.
const COMMIT_HOOKS = [
  ':(top).githooks',
  ':(top)tools/claude-hooks',
  ':(top,exclude)tools/claude-hooks/test',
];

// These write commits on GitHub without git, out of reach of the pre-commit hook.
const GITHUB_WRITES = new Set([
  'mcp__github__push_files',
  'mcp__github__create_or_update_file',
  'mcp__github__delete_file',
]);

const RECORDS_ARE_THE_HOOKS =
  'Only the hook that runs when the guideline-reviewer finishes writes review records.';

function hooksProblem(context, folder) {
  const gitThere = context.gitIn(folder);

  if (gitThere('config', '--get', 'core.hooksPath').trim() !== '.githooks') {
    return 'Point git back at the project hooks first: git config core.hooksPath .githooks';
  }

  if (hookSkipsReview(context, folder)) {
    return (
      'The .githooks/pre-commit of this branch asks for no guideline review: bring the commit gate ' +
      'onto it first (merge the change that adds tools/claude-hooks/require-review.js).'
    );
  }

  const editedHooks = gitThere('diff', '--name-only', '--', ...COMMIT_HOOKS).trim();

  return editedHooks
    ? `Stage or undo your edits to the commit hooks first; git runs them from disk:\n${editedHooks}`
    : null;
}

function commitProblem(context, command, folder) {
  if (!isSameRepository(context, folder)) {
    return null;
  }

  return skipsHooks(command)
    ? 'Commits here always run the pre-commit hook: commit without --no-verify, -n or a ' +
        'core.hooksPath of your own, and fix what it finds.'
    : hooksProblem(context, folder);
}

// Each worktree keeps its own sequence, so its options are read where the command runs.
function inNoCommitSequence({ gitIn }, folder) {
  const gitThere = gitIn(folder);
  const options = path.resolve(
    folder,
    gitThere('rev-parse', '--git-path', 'sequencer/opts').trim(),
  );

  return gitThere('config', '-f', options, '--get', 'options.no-commit').trim() === 'true';
}

function selfCommitProblem(context, command, folder) {
  const noCommitSequence = inNoCommitSequence(context, folder);

  if (!isSameRepository(context, folder) || !commitsWithoutHook(command, { noCommitSequence })) {
    return null;
  }

  return (
    'Leave the result staged instead (git revert or git cherry-pick with --no-commit, or ' +
    'git apply --index in place of git am), review it and commit it with git commit, so the ' +
    'pre-commit hook checks it.'
  );
}

// The shell starts each call in the project, so a folder known only to the shell, such as one held in
// a variable, is likeliest the project itself, and checking it there errs toward refusing.
const folderOf = (context, command, { cwd, subcommand }) =>
  commandFolder(command, cwd, subcommand) ?? context.root;

function bashProblem(context, command, cwd) {
  if (writesReviewRecords(command)) {
    return RECORDS_ARE_THE_HOOKS;
  }

  if (commitsWithoutHook(command)) {
    const folder = folderOf(context, command, { cwd, subcommand: GIT_SELF_COMMIT });
    const problem = selfCommitProblem(context, command, folder);

    if (problem) {
      return problem;
    }
  }

  if (!isGitCommit(command)) {
    return null;
  }

  return commitProblem(
    context,
    command,
    folderOf(context, command, { cwd, subcommand: GIT_COMMIT }),
  );
}

export function problemOf(context, { tool_name: toolName, tool_input: toolInput = {}, cwd }) {
  if (GITHUB_WRITES.has(toolName) || writesOnGitHub(toolInput.command)) {
    return 'Commit with git and push it, so the pre-commit hook runs.';
  }

  if (isReviewRecord(toolInput.file_path)) {
    return RECORDS_ARE_THE_HOOKS;
  }

  return toolName === 'Bash'
    ? bashProblem(context, toolInput.command ?? '', cwd ?? context.root)
    : null;
}
