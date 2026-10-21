import { describe, expect, it, vi } from 'vitest';
import { loadFonts, PIXEL_FONTS } from '../../../src/ui/loading/fonts.js';

describe('waiting for the pixel font', () => {
  it('asks for Silkscreen in both weights the page uses', async () => {
    const fonts = { load: vi.fn(() => Promise.resolve([])) };
    await loadFonts(fonts);
    expect(fonts.load.mock.calls.map(([spec]) => spec)).toEqual(PIXEL_FONTS);
    expect(PIXEL_FONTS.join()).toMatch(/700 .*Silkscreen/);
  });

  it('goes on without it where the browser cannot load fonts or the load fails', async () => {
    await expect(loadFonts(undefined)).resolves.toBeUndefined();
    const failing = { load: () => Promise.reject(new Error('offline')) };
    await expect(loadFonts(failing)).resolves.toBeUndefined();
  });
});
