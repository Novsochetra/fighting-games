import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  addedComments,
  changesOf,
  committedRevision,
  isReviewed,
  reviewRequest,
} from './added-comments.js';

// Claude Code runs this after each edit and each Bash command (.claude/settings.json) and shows
// Claude what it prints. A commit is reviewed too, as Bash can edit a file without the Edit tool.
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  } catch {
    return '';
  }
}

function reviewEdit(toolInput) {
  const file = path.relative(root, path.resolve(root, toolInput.file_path ?? ''));

  if (!isReviewed(file)) {
    return [];
  }

  const fileBefore = typeof toolInput.content === 'string' ? git('show', `HEAD:${file}`) : '';

  return [[file, addedComments(changesOf(toolInput, fileBefore))]];
}

function reviewCommit(revision) {
  const files = git('show', '--name-only', '--format=', revision).split('\n').filter(isReviewed);

  return files.map((file) => {
    const change = [git('show', `${revision}~1:${file}`), git('show', `${revision}:${file}`)];

    return [file, addedComments([change])];
  });
}

function reviewTool(toolName, toolInput, revision) {
  if (revision) {
    return reviewCommit(revision);
  }

  return toolName === 'Bash' ? [] : reviewEdit(toolInput);
}

function review({ tool_name: toolName, tool_input: toolInput = {}, tool_response: response }) {
  const revision = toolName === 'Bash' ? committedRevision(response?.stdout) : null;
  const subject = revision ? `Commit ${revision}` : 'This edit';
  const found = reviewTool(toolName, toolInput, revision);
  const commentsByFile = found.filter(([, comments]) => comments.length > 0);

  return commentsByFile.length > 0 ? reviewRequest(subject, commentsByFile) : null;
}

const request = review(JSON.parse(readFileSync(0, 'utf8')));

if (request) {
  const hookSpecificOutput = { hookEventName: 'PostToolUse', additionalContext: request };

  process.stdout.write(JSON.stringify({ hookSpecificOutput }));
}
