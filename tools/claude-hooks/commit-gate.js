import { readFileSync } from 'node:fs';
import { problemOf } from './commit-problems.js';
import { gitIn } from './git.js';

function readFile(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

// Claude Code runs this before each Bash command, file edit and GitHub write (.claude/settings.json)
// and refuses the call when it prints a reason. The review itself is checked by .githooks/pre-commit,
// where the commit's tree is final; this keeps git from skipping that hook.
const context = { root: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), gitIn, readFile };
const reason = problemOf(context, JSON.parse(readFileSync(0, 'utf8')));

if (reason) {
  const hookSpecificOutput = {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  };

  process.stdout.write(JSON.stringify({ hookSpecificOutput }));
}
