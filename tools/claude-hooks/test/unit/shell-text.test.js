import { describe, expect, it } from 'vitest';
import { joinContinuedLines, SEGMENT_END, withoutHeredocs, withoutText } from '../../shell-text.js';

describe('withoutHeredocs', () => {
  it('drops a heredoc body and keeps the line that starts it', () => {
    expect(withoutHeredocs("git commit -F - <<'EOF'\nUse -n\nEOF")).toBe("git commit -F - <<'EOF'");
  });
});

describe('joinContinuedLines', () => {
  it('joins a line ending in a backslash to the next, as the shell does', () => {
    expect(joinContinuedLines('git commit -m x \\\n  --no-verify')).toBe(
      'git commit -m x    --no-verify',
    );
  });
});

describe('withoutText', () => {
  it('turns each quoted message into one word, across continued lines', () => {
    expect(withoutText('git commit -m "x" \\\n  -n')).toBe('git commit -m _    -n');
    expect(withoutText('git commit -m "Drop -n" -q')).toBe('git commit -m _ -q');
    expect(withoutText("echo 'a b' && ls")).toBe('echo _ && ls');
  });
});

describe('SEGMENT_END', () => {
  it('splits a command line into its commands', () => {
    expect('a && b || c; d | e & f\ng'.split(SEGMENT_END).map((part) => part.trim())).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
  });
});
