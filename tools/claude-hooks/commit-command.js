import { blankQuotes, SEGMENT_END, setQuotesAside, withoutText } from './shell-text.js';

const GIT = String.raw`\bgit(?:\s+(?:-[cC]\s+\S+|--?[\w-]+(?:=\S+)?))*\s+`;
export const GIT_COMMIT = new RegExp(`${GIT}commit(?=\\s|$)`);
export const GIT_SELF_COMMIT = new RegExp(`${GIT}(revert|cherry-pick|am)(?=\\s|$)`);
const SETS_HOOKS_PATH =
  /(?:-c\s*|\bconfig\s+(?:--(?!get|list)\S+\s+)*)core\.hookspath(?:=|\s+)(?!\.githooks\b)(?=\S)/i;
const UNSETS_HOOKS_PATH = /\bconfig\s+(?:--\S+\s+)*--unset(?:-all)?\s+core\.hookspath\b/i;
const SETTING_IN_QUOTES = /(-c\s*|core\.hookspath(?:=|\s+))(\0\d+\0)/gi;
const SHORT_TAKES_NEXT = new Set(['m', 'F', 'C', 'c', 't']);
const SHORT_TAKES_ATTACHED = new Set(['u', 'S']);
const COMMITS_NOTHING = new Set(['--no-commit', '--abort', '--quit', '-h', '--help']);
const GOES_ON = new Set(['--continue', '--skip']);
const GH_API = /\bgh\s+api\b/;
// gh api sends a POST once it has any field, so a field writes as surely as an explicit method.
const GH_WRITES =
  /(?:-X|--method)[\s=]*(?:PUT|POST|PATCH|DELETE)\b|\s(?:-[fF]|--field|--raw-field|--input)\b/i;
// A ref only points at a commit that already exists, so /git/refs writes no new code.
const GH_CODE_ENDPOINT = /\/(?:contents\/|git\/(?:blobs|trees|commits)\b)|createCommitOnBranch/;

const segmentsOf = (text, subcommand) =>
  text.split(SEGMENT_END).filter((part) => subcommand.test(part));

export const isGitCommit = (command) => segmentsOf(withoutText(command), GIT_COMMIT).length > 0;

// git reads a short option's letters until one that takes a value: -qnm x is -q -n -m, -mnote and
// -uno are a message and an untracked-files mode.
function shortFlags(token) {
  for (let i = 1; i < token.length; i++) {
    if (SHORT_TAKES_NEXT.has(token[i]) || SHORT_TAKES_ATTACHED.has(token[i])) {
      return token.slice(1, i + 1);
    }
  }

  return token.slice(1);
}

const hasShortN = (word) => /^-[^-]/.test(word) && shortFlags(word).includes('n');

function optionsAfter(subcommand, segment) {
  const match = subcommand.exec(segment);
  const words = segment.slice(match.index + match[0].length).split(/\s+/);
  const end = words.indexOf('--');

  return words.slice(0, end === -1 ? undefined : end);
}

// git takes any unambiguous start of a long option, so --no-veri is --no-verify.
const isNoVerify = (word) => word.length >= 9 && '--no-verify'.startsWith(word);

const skipsHooksIn = (segment) =>
  optionsAfter(GIT_COMMIT, segment).some((word) => isNoVerify(word) || hasShortN(word));

// A message is no setting, but -c "core.hooksPath=…" and a quoted value for it are.
function setsHooksPath(command) {
  const { text, restore } = setQuotesAside(command);
  const settings = text.replace(SETTING_IN_QUOTES, (_, lead, mark) => lead + restore(mark));

  return blankQuotes(settings)
    .split(SEGMENT_END)
    .some((part) => SETS_HOOKS_PATH.test(part) || UNSETS_HOOKS_PATH.test(part));
}

export const skipsHooks = (command) =>
  setsHooksPath(command) || segmentsOf(withoutText(command), GIT_COMMIT).some(skipsHooksIn);

// For revert and cherry-pick -n is --no-commit; for am it is --no-verify, and the patch still commits.
// A sequence started with --no-commit keeps that option, so going on with it commits nothing either.
const commitsNothing = (word, { isAm, noCommitSequence }) =>
  COMMITS_NOTHING.has(word) ||
  word.startsWith('--show-current-patch') ||
  (!isAm && hasShortN(word)) ||
  (GOES_ON.has(word) && noCommitSequence);

// revert, cherry-pick and am commit without running pre-commit, unless they leave the result staged.
export function commitsWithoutHook(command, { noCommitSequence = false } = {}) {
  const commitsItself = (segment) => {
    const how = { isAm: GIT_SELF_COMMIT.exec(segment)[1] === 'am', noCommitSequence };

    return !optionsAfter(GIT_SELF_COMMIT, segment).some((word) => commitsNothing(word, how));
  };

  return segmentsOf(withoutText(command), GIT_SELF_COMMIT).some(commitsItself);
}

// gh api writes files and commits on GitHub without git, out of reach of the pre-commit hook. Its
// endpoint is often quoted, so each part is read with its quotes back.
export function writesOnGitHub(command = '') {
  const { text, restore } = setQuotesAside(command);

  return text.split(SEGMENT_END).some((part) => {
    const call = restore(part);

    return GH_API.test(call) && GH_WRITES.test(call) && GH_CODE_ENDPOINT.test(call);
  });
}
