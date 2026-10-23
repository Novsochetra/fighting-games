import { describe, expect, it } from 'vitest';
import {
  relativeImports,
  rewriteImports,
  rewriteScripts,
} from '../../src/static-site/module-imports.js';

const SOURCE = [
  "import { a } from './a.js';",
  'import {',
  '  b,',
  '  c,',
  "} from '../shared/b.js';",
  'export { d } from "./d.js";',
  "import './side.js';",
  "import { describe } from 'vitest';",
  "const art = 'assets/hero.png';",
].join('\n');

describe('relativeImports', () => {
  it('finds every relative module the source imports or re-exports, and nothing else', () => {
    expect(relativeImports(SOURCE)).toEqual(['./a.js', '../shared/b.js', './d.js', './side.js']);
  });
});

describe('rewriteImports', () => {
  it('adds each version as a query and leaves a specifier without one alone', () => {
    const versions = { './a.js': 'aaaa', '../shared/b.js': 'bbbb', './side.js': null };
    const rewritten = rewriteImports(SOURCE, (specifier) => versions[specifier] ?? null);
    expect(rewritten).toContain("from './a.js?v=aaaa';");
    expect(rewritten).toContain("} from '../shared/b.js?v=bbbb';");
    expect(rewritten).toContain('export { d } from "./d.js";');
    expect(rewritten).toContain("import './side.js';");
    expect(rewritten).toContain("from 'vitest';");
  });
});

describe('rewriteScripts', () => {
  it("versions the page's module scripts and nothing else", () => {
    const html = [
      '<script type="module" src="src/main.js"></script>',
      '<script src="https://cdn.example.com/lib.js"></script>',
      '<link rel="stylesheet" href="styles/page.css" />',
    ].join('\n');
    const versions = { 'src/main.js': '1234' };
    const rewritten = rewriteScripts(html, (source) => versions[source] ?? null);
    expect(rewritten).toContain('<script type="module" src="src/main.js?v=1234"></script>');
    expect(rewritten).toContain('src="https://cdn.example.com/lib.js"');
    expect(rewritten).toContain('href="styles/page.css"');
  });
});
