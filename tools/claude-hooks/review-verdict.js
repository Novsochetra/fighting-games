const VERDICT = /^VERDICT: (pass|fail) ([0-9a-f]{40})\s*$/m;
const VERDICTS = new RegExp(VERDICT.source, 'gm');
const WRITE_TREE = /^\s*(?:cd\s+\S+\s*&&\s*)?git write-tree\b/;
const TREE_LINE = /^[0-9a-f]{40}$/;

const blocksOf = (entries, type) =>
  entries.filter((entry) => entry.type === type).flatMap((entry) => entry.message?.content ?? []);

// The reviewer's report is its last text, or the message it hands back with a tool call.
function reportText(block) {
  if (block.type === 'text') {
    return block.text;
  }

  return typeof block.input?.message === 'string' ? block.input.message : '';
}

const resultText = ({ content }) =>
  typeof content === 'string' ? content : (content ?? []).map((part) => part.text ?? '').join('');

// Whoever starts the reviewer writes its prompt, so the tree must be the first line git printed for
// the reviewer's own write-tree, and the reviewer must have read the staged diff.
function treesGitPrinted(said, heard) {
  const asked = said.filter((block) => WRITE_TREE.test(block.input?.command ?? ''));
  const ids = new Set(asked.map((block) => block.id));
  const answers = heard.filter(
    (block) => block.type === 'tool_result' && ids.has(block.tool_use_id),
  );

  const firstLines = answers.map((answer) => resultText(answer).trim().split('\n')[0]);

  return new Set(firstLines.filter((line) => TREE_LINE.test(line)));
}

const readTheDiff = (said) =>
  said.some((block) => (block.input?.command ?? '').includes('git diff --cached'));

export function verdictOf(entries) {
  const said = blocksOf(entries, 'assistant');
  const reports = said.map(reportText).filter((text) => VERDICT.test(text));

  if (reports.length === 0 || !readTheDiff(said)) {
    return null;
  }

  // A report can quote a verdict line before its own, so only its last one counts.
  const [, verdict, tree] = [...reports.at(-1).matchAll(VERDICTS)].at(-1);

  return treesGitPrinted(said, blocksOf(entries, 'user')).has(tree) ? { verdict, tree } : null;
}
