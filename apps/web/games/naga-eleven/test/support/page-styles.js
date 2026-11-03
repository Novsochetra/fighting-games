import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '../..');

const withoutComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const squeeze = (text) => text.replace(/\s+/g, ' ').trim();

// the stylesheets the page links, in the order it links them, so a later rule is a later rule
export function pageStyles() {
  const page = readFileSync(join(GAME, 'index.html'), 'utf8');
  const sheets = [...page.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
    (link) => link[1],
  );

  return sheets.map((sheet) => ({ sheet, css: readFileSync(join(GAME, sheet), 'utf8') }));
}

export const styleOf = (sheet) => readFileSync(join(GAME, 'styles', sheet), 'utf8');

function closeBlock(rules, open, body) {
  const at = open.within.join(' ');

  if (!open.head.startsWith('@')) {
    rules.push({ selector: squeeze(open.head), at: squeeze(at), body });
  }
}

// every rule of a stylesheet in order: its selector, the @media or @container it stands in ('' for
// none) and its declarations
export function rulesOf(css) {
  const text = withoutComments(css);
  const rules = [];
  const open = [];
  let from = 0;

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '{') {
      open.push({
        head: text.slice(from, i).trim(),
        at: i + 1,
        within: open.map((outer) => outer.head),
      });
      from = i + 1;
    } else if (text[i] === '}') {
      const block = open.pop();

      closeBlock(rules, block, text.slice(block.at, i));
      from = i + 1;
    }
  }

  return rules;
}

export const pageRules = () =>
  pageStyles().flatMap(({ sheet, css }) => rulesOf(css).map((rule) => ({ ...rule, sheet })));

export const valueOf = (body, property) =>
  body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))?.[1].trim() ?? null;
