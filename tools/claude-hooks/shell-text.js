const CONTINUED_LINE = /\\\n/g;
const HEREDOC = /(<<-?\s*(['"]?)(\w+)\2[^\n]*)\n[\s\S]*?\n\s*\3(?=\n|$)/g;
const QUOTED = /\\.|'[^']*'|"(?:\\.|[^"\\])*"/g;
const SET_ASIDE = /\0(\d+)\0/g;

export const SEGMENT_END = /&&|\|\||[;|&\n]/;

export const joinContinuedLines = (command = '') => command.replace(CONTINUED_LINE, ' ');

export const withoutHeredocs = (command = '') => command.replace(HEREDOC, '$1');

// Each quoted string becomes one marked word, so the command splits into its parts without a ; or &
// in a message splitting it, and a path or a value can still be read back from its mark. A \' outside
// quotes is an escaped apostrophe, as in 'Don'\''t', and starts no quoted string.
export function setQuotesAside(command) {
  const quoted = [];
  const text = withoutHeredocs(joinContinuedLines(command)).replace(QUOTED, (string) => {
    if (string.startsWith('\\')) {
      return string;
    }

    quoted.push(string.slice(1, -1));

    return `\0${quoted.length - 1}\0`;
  });

  return { text, restore: (part) => part.replace(SET_ASIDE, (_, index) => quoted[index]) };
}

export const blankQuotes = (text) => text.replace(SET_ASIDE, '_');

// Messages and heredoc bodies are text: a "-n" or "git commit" in them is no command.
export const withoutText = (command) => blankQuotes(setQuotesAside(command).text);
