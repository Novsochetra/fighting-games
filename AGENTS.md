# Agents

Every AI agent that changes this repository follows `CLAUDE.md` and the files it imports:
`docs/coding-style.md`, `docs/testing.md` and `docs/versioning.md`. Before each commit:

1. Run `npm install` once, so git runs the pre-commit check (`.githooks/pre-commit`: lint, format,
   types, every test and the build) on each commit. Never skip it with `--no-verify` or `-n`.
2. Stage with `git add`, then review the staged change (`git diff --cached`) against those rules as
   `.claude/agents/guideline-reviewer.md` describes, and fix each finding before you commit.
3. Commit with git and push; never write commits through the GitHub API.

For Claude Code, `.githooks/pre-commit` refuses a commit until the `guideline-reviewer` subagent
passes exactly the tree it commits (`tools/claude-hooks/`), and CI runs the full check on every push.
