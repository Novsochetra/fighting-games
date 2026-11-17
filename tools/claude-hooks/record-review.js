import { readFileSync } from 'node:fs';
import { gitIn } from './git.js';
import { REVIEWER, writeRecord } from './review-record.js';
import { verdictOf } from './review-verdict.js';

// Claude Code runs this when a subagent finishes (SubagentStop in .claude/settings.json). It is the
// only writer of review records, so no agent can mark its own change as reviewed.
const {
  agent_type: agentType = '',
  agent_transcript_path: transcript,
  cwd,
} = JSON.parse(readFileSync(0, 'utf8'));

function transcriptEntries() {
  try {
    return readFileSync(transcript, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

const verdict = agentType.includes(REVIEWER) ? verdictOf(transcriptEntries()) : null;

if (verdict) {
  const root = process.env.CLAUDE_PROJECT_DIR ?? cwd;

  writeRecord(root, gitIn(root), verdict);
}
