import { describe, expect, it } from 'vitest';
import {
  commitsWithoutHook,
  isGitCommit,
  skipsHooks,
  writesOnGitHub,
} from '../../commit-command.js';

describe('isGitCommit', () => {
  it('finds a commit, with or without options before it', () => {
    expect(isGitCommit('git commit -m "Fix the dash"')).toBe(true);
    expect(isGitCommit('git -c user.name=t commit -qm x')).toBe(true);
    expect(isGitCommit('git -C /home/user/app commit -am x')).toBe(true);
    expect(isGitCommit('git add a.js && git commit -m x &')).toBe(true);
  });

  it('leaves alone a command that only mentions a commit', () => {
    expect(isGitCommit('git log --grep commit')).toBe(false);
    expect(isGitCommit('gh pr create --body "Run git add, then git commit"')).toBe(false);
    expect(isGitCommit("cat > notes.sh <<'EOF'\ngit commit -mclean\nEOF")).toBe(false);
  });
});

describe('skipsHooks', () => {
  it('finds each way a commit skips the pre-commit hook', () => {
    expect(skipsHooks('git commit --no-verify -m x')).toBe(true);
    expect(skipsHooks('git commit --no-verif -m x')).toBe(true);
    expect(skipsHooks('git commit -qnm x')).toBe(true);
    expect(skipsHooks('git commit -m "Fix the dash" \\\n  --no-verify')).toBe(true);
    expect(skipsHooks('git -c core.hooksPath=/dev/null commit -m x')).toBe(true);
    expect(skipsHooks('git -c "core.hooksPath=/dev/null" commit -m x')).toBe(true);
    expect(skipsHooks('git -c core.hookspath=/dev/null commit -m x')).toBe(true);
    expect(skipsHooks('git config core.hooksPath /dev/null && git commit -m x')).toBe(true);
  });

  it('reads no option out of a message or an option value', () => {
    expect(skipsHooks('git commit -m "Drop -n and --no-verify"')).toBe(false);
    expect(skipsHooks("git commit -q -F - <<'EOF'\nSkip -n here\nEOF")).toBe(false);
    expect(skipsHooks('git commit -mnote')).toBe(false);
    expect(skipsHooks('git commit -uno -m "Fix the dash"')).toBe(false);
    expect(skipsHooks('git commit --amend --no-edit')).toBe(false);
    expect(skipsHooks('git commit -q -m "$(cat <<\'EOF\'\nUse -n\nEOF\n)" 2>&1')).toBe(false);
    expect(skipsHooks('git commit -m x -- -notes.md')).toBe(false);
  });

  it('lets a message name the hooks setting, and git be pointed at the project hooks', () => {
    expect(skipsHooks('git commit -m "Point git at .githooks with core.hooksPath"')).toBe(false);
    expect(skipsHooks("git commit -F - <<'EOF'\nRefuse -c core.hooksPath=/dev/null\nEOF")).toBe(
      false,
    );
    expect(skipsHooks('git config core.hooksPath .githooks && git commit -m x')).toBe(false);
    expect(skipsHooks('git config core.hooksPath ".githooks" && git commit -m x')).toBe(false);
    expect(skipsHooks('git commit -m "Refuse -c core.hooksPath=/dev/null"')).toBe(false);
    expect(skipsHooks('git commit -m "Run git config core.hooksPath .husky to test"')).toBe(false);
    expect(skipsHooks('git commit -m "Point git config core.hooksPath at the hooks"')).toBe(false);
  });

  it('reads no option out of a message with an escaped apostrophe', () => {
    expect(skipsHooks("git commit -m 'Don'\\''t skip -n'")).toBe(false);
  });

  it('reads no setting out of a read of it', () => {
    expect(skipsHooks('git config --get core.hooksPath && git commit -m x')).toBe(false);
    expect(skipsHooks('git config core.hooksPath && git commit -m x')).toBe(false);
  });

  it('finds a hooks path unset', () => {
    expect(skipsHooks('git config --unset core.hooksPath && git commit -m x')).toBe(true);
  });

  it('finds a hooks path set in quotes', () => {
    expect(skipsHooks('git config core.hooksPath "/dev/null" && git commit -m x')).toBe(true);
    expect(skipsHooks("git -c 'core.hooksPath=/dev/null' commit -m x")).toBe(true);
  });
});

describe('commitsWithoutHook', () => {
  it('finds a revert, cherry-pick or am that commits by itself', () => {
    expect(commitsWithoutHook('git revert --no-edit HEAD')).toBe(true);
    expect(commitsWithoutHook('git cherry-pick side')).toBe(true);
    expect(commitsWithoutHook('git cherry-pick --continue')).toBe(true);
    expect(commitsWithoutHook('git cherry-pick --skip')).toBe(true);
    expect(commitsWithoutHook('git am --skip')).toBe(true);
    expect(commitsWithoutHook('git am --resolved')).toBe(true);
    expect(commitsWithoutHook('git am -n fix.patch')).toBe(true);
    expect(commitsWithoutHook('git am ../patches/0001-two.patch')).toBe(true);
  });

  it('leaves alone one that leaves the result staged, or stops', () => {
    expect(commitsWithoutHook('git revert --no-commit HEAD')).toBe(false);
    expect(commitsWithoutHook('git cherry-pick -n side')).toBe(false);
    expect(commitsWithoutHook('git cherry-pick --abort')).toBe(false);
    expect(commitsWithoutHook('git am --abort')).toBe(false);
    expect(commitsWithoutHook('git log --grep revert')).toBe(false);
  });

  it('leaves alone help and a look at the current patch', () => {
    expect(commitsWithoutHook('git revert -h')).toBe(false);
    expect(commitsWithoutHook('git cherry-pick --help')).toBe(false);
    expect(commitsWithoutHook('git am --show-current-patch=diff')).toBe(false);
  });

  it('lets --continue and --skip go on only in a sequence started with --no-commit', () => {
    const continuing = 'git cherry-pick --continue';

    expect(commitsWithoutHook(continuing, { noCommitSequence: true })).toBe(false);
    expect(commitsWithoutHook('git revert --skip', { noCommitSequence: true })).toBe(false);
    expect(commitsWithoutHook(continuing, { noCommitSequence: false })).toBe(true);
  });
});

describe('writesOnGitHub', () => {
  it('finds a gh api call that writes files or commits', () => {
    expect(writesOnGitHub('gh api -X PUT repos/o/r/contents/a.js -f message=x')).toBe(true);
    expect(writesOnGitHub('gh api --method POST repos/o/r/git/commits -f message=x')).toBe(true);
    expect(writesOnGitHub('gh api -X PUT "repos/o/r/contents/a.js" -f message=x')).toBe(true);
    expect(writesOnGitHub("gh api -X 'DELETE' 'repos/o/r/contents/a.js'")).toBe(true);
    expect(writesOnGitHub('gh api repos/o/r/git/commits -f message=x -f tree=T')).toBe(true);
    expect(writesOnGitHub('gh api repos/o/r/git/trees --input tree.json')).toBe(true);
    expect(writesOnGitHub("gh api graphql -f query='mutation { createCommitOnBranch(x) }'")).toBe(
      true,
    );
  });

  it('leaves alone a read, and a write that is no commit', () => {
    expect(writesOnGitHub('gh api repos/o/r/contents/a.js')).toBe(false);
    expect(writesOnGitHub('gh api -X POST repos/o/r/issues -f title=x')).toBe(false);
    expect(writesOnGitHub('gh api -X DELETE repos/o/r/git/refs/heads/old-branch')).toBe(false);
    expect(writesOnGitHub('gh api -X POST repos/o/r/git/refs -f ref=refs/tags/v1 -f sha=a')).toBe(
      false,
    );
    expect(writesOnGitHub('gh api repos/o/r/git/commits/abc')).toBe(false);
    expect(writesOnGitHub(undefined)).toBe(false);
  });
});
