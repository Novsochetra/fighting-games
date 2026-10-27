import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Bug: offline, every word in the game fell back to a plain typewriter font. Silkscreen came from
// Google Fonts, another site, which the game's offline download does not keep; it now ships in the
// game's own folder, which the download takes whole.
const GAME = new URL('../../../', import.meta.url);
const STYLES = new URL('styles/', GAME);
const page = readFileSync(new URL('index.html', GAME), 'utf8');
const stylesheets = readdirSync(STYLES).map((name) => ({
  name,
  css: readFileSync(new URL(name, STYLES), 'utf8'),
}));

const fontFaces = () => stylesheets.flatMap(({ css }) => css.match(/@font-face \{[^}]*\}/g) ?? []);

describe('the pixel font offline', () => {
  it('loads no font, nor a font stylesheet, from another site', () => {
    expect(page).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);

    for (const { css } of stylesheets) {
      expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
  });

  it('ships the regular and the bold face of Silkscreen in its own folder', () => {
    const faces = fontFaces();
    const weights = faces.map((face) => face.match(/font-weight: (\d+)/)[1]);

    expect(faces.every((face) => face.includes("font-family: 'Silkscreen'"))).toBe(true);
    expect(new Set(weights)).toEqual(new Set(['400', '700']));

    for (const face of faces) {
      const file = new URL(face.match(/url\('([^']+)'\)/)[1], STYLES);

      expect(file.href.startsWith(new URL('assets/fonts/', GAME).href)).toBe(true);
      expect(readFileSync(file).subarray(0, 4).toString()).toBe('wOF2');
    }
  });

  it('keeps the font license beside the font', () => {
    expect(existsSync(new URL('assets/fonts/OFL.txt', GAME))).toBe(true);
  });
});
