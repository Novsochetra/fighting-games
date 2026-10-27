import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const GAME = new URL('../../../', import.meta.url);
const STYLES = new URL('styles/', GAME);
const stylesheets = readdirSync(STYLES).map((file) => readFileSync(new URL(file, STYLES), 'utf8'));

// the game's own text was set in Barlow wherever a style did not name a font, so How to play, the
// notes and the stats read in a smooth sans next to the pixel titles and buttons
describe('the pixel font', () => {
  it('sets every word in the game in the pixel font', () => {
    for (const css of stylesheets) {
      expect(css).not.toContain('var(--font-body)');
    }
    expect(readFileSync(new URL('page.css', STYLES), 'utf8')).toMatch(
      /body \{\s*font-family: var\(--font-display\);/,
    );
  });

  it('loads only the pixel font, from its own folder', () => {
    const page = readFileSync(new URL('index.html', GAME), 'utf8');
    const faces = readFileSync(new URL('fonts.css', STYLES), 'utf8');
    expect(page).toContain('href="styles/fonts.css"');
    expect(page).not.toContain('Barlow');
    expect(faces.match(/font-family: '[^']+'/g)).toEqual(
      Array(4).fill("font-family: 'Silkscreen'"),
    );
  });
});
