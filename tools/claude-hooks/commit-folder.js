import { homedir } from 'node:os';
import path from 'node:path';
import { SEGMENT_END, setQuotesAside } from './shell-text.js';

const CD = /^\s*\(?\s*(?:cd|pushd)\s+(\S+)/;
const DASH_C = /\s-C\s+(\S+)/g;
const HOME = /^(?:~|\$HOME|\$\{HOME\})(?=\/|$)/;
const SHELL_VALUE = /[$`]/;

// A folder held in a variable or a command's output is known only when the shell runs, so it is null.
function into(folder, dir, restore) {
  const named = restore(dir).replace(HOME, process.env.HOME ?? homedir());

  return folder === null || SHELL_VALUE.test(named) ? null : path.resolve(folder, named);
}

function gitFolder(part, folder, { subcommand, restore }) {
  const match = subcommand.exec(part);
  const prefix = part.slice(0, match.index + match[0].length);

  return [...prefix.matchAll(DASH_C)].reduce((at, [, dir]) => into(at, dir, restore), folder);
}

// The agent's shell starts each call where the session began, so a git command elsewhere names its
// folder with a cd before it or a git -C, and git runs that folder's hooks.
export function commandFolder(command, cwd, subcommand) {
  const { text, restore } = setQuotesAside(command);
  let folder = cwd;

  for (const part of text.split(SEGMENT_END)) {
    if (subcommand.test(part)) {
      return gitFolder(part, folder, { subcommand, restore });
    }

    const cd = CD.exec(part);

    folder = cd ? into(folder, cd[1], restore) : folder;
  }

  return folder;
}
