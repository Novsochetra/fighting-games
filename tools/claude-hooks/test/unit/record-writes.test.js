import { describe, expect, it } from 'vitest';
import { writesReviewRecords } from '../../record-writes.js';

describe('writesReviewRecords', () => {
  it('finds a command that writes into the records', () => {
    expect(writesReviewRecords('echo pass > .git/claude-review/4b825dc')).toBe(true);
    expect(writesReviewRecords('echo pass >> .git/claude-review/4b825dc')).toBe(true);
    expect(writesReviewRecords('mkdir -p .git/claude-review && touch x')).toBe(true);
    expect(writesReviewRecords('git write-tree | tee .git/claude-review/x')).toBe(true);
    expect(writesReviewRecords('cp /tmp/x .git/claude-review/abc')).toBe(true);
    expect(writesReviewRecords('dd if=/tmp/x of=.git/claude-review/abc')).toBe(true);
  });

  it('leaves alone a read, a message or a search saved elsewhere', () => {
    expect(writesReviewRecords('ls .git/claude-review')).toBe(false);
    expect(writesReviewRecords('ls .git/claude-review | sed -n 1,5p')).toBe(false);
    expect(writesReviewRecords('grep -rn claude-review tools 2>&1')).toBe(false);
    expect(writesReviewRecords('grep -rn claude-review . 2>/dev/null')).toBe(false);
    expect(writesReviewRecords('grep -rn claude-review tools > /tmp/out.txt')).toBe(false);
    expect(writesReviewRecords('git log -S claude-review --oneline > hits.txt')).toBe(false);
    expect(writesReviewRecords('git commit -m "Keep claude-review records in git"')).toBe(false);
    expect(
      writesReviewRecords("cat > probe.js <<'EOF'\nconst folder = 'claude-review';\nEOF"),
    ).toBe(false);
    expect(writesReviewRecords('git diff --cached > /tmp/claude-review.diff')).toBe(false);
    expect(writesReviewRecords('mkdir -p docs/claude-review-notes')).toBe(false);
    expect(writesReviewRecords('rm -rf /tmp/claude-review-scratch')).toBe(false);
    expect(writesReviewRecords('cp .git/claude-review/abc /tmp/abc')).toBe(false);
    expect(writesReviewRecords(undefined)).toBe(false);
  });
});
