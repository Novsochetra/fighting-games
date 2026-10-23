// a relative module specifier in an import or re-export: `from './x.js'`, `import './x.js'`
const SPECIFIER = /(\bfrom\s*|\bimport\s*)(['"])(\.\.?\/[^'"]+?\.js)\2/g;

export function relativeImports(source) {
  return [...source.matchAll(SPECIFIER)].map((match) => match[3]);
}

// versionOf(specifier) gives the version to add, or null to leave the specifier as it is
export function rewriteImports(source, versionOf) {
  return source.replace(SPECIFIER, (whole, lead, quote, specifier) => {
    const version = versionOf(specifier);
    return version ? `${lead}${quote}${specifier}?v=${version}${quote}` : whole;
  });
}

const MODULE_SCRIPT = /(<script\b[^>]*\bsrc=")([^"?]+\.js)("[^>]*>)/g;

// the page's own <script src="..."> tags, the roots of its module graph
export function rewriteScripts(html, versionOf) {
  return html.replace(MODULE_SCRIPT, (whole, before, source, after) => {
    const version = versionOf(source);
    return version ? `${before}${source}?v=${version}${after}` : whole;
  });
}
