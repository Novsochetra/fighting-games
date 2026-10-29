// The board is public and a name is free text, so a name with a slur in it is turned away. Words are
// matched whole, so a name that only holds one inside another (Cassandra, Dickson) stays; the worst
// are also caught spelled out with gaps, and Khmer, written without spaces, inside the name.
const BLOCKED_WORDS = new Set([
  'ass',
  'asshole',
  'bitch',
  'cock',
  'cunt',
  'dick',
  'fag',
  'faggot',
  'hitler',
  'kys',
  'nazi',
  'penis',
  'porn',
  'pussy',
  'rape',
  'rapist',
  'sex',
  'shit',
  'slut',
  'vagina',
  'whore',
]);
const BLOCKED_STARTS = ['fuck', 'nigg', 'fagg', 'cunt'];
const BLOCKED_SPELLED_OUT = ['fuck', 'nigg'];
const BLOCKED_KHMER = ['ចុយ'];

const wordsOf = (name) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

function hasBlockedWord(words) {
  return words.some(
    (word) => BLOCKED_WORDS.has(word) || BLOCKED_STARTS.some((start) => word.startsWith(start)),
  );
}

export function isBlockedName(name) {
  const words = wordsOf(name);
  const joined = words.join('');

  return (
    hasBlockedWord(words) ||
    BLOCKED_SPELLED_OUT.some((word) => joined.includes(word)) ||
    BLOCKED_KHMER.some((word) => name.includes(word))
  );
}
