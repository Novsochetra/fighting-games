import { describe, expect, it } from 'vitest';
import WALLPAPERS from '@/screens/wallpapers/wallpapers.json';
import {
  byMood,
  firstShape,
  megabytes,
  wallpaperCards,
} from '@/screens/wallpapers/wallpaper-list.js';

const BASE = 'https://files.example.test/wallpapers';

const LIST = {
  base: BASE,
  wallpapers: [
    {
      id: 'kulen-night',
      place: 'Kulen',
      time: 'Night',
      mood: 'night',
      files: {
        thumb: 'thumb-a.webp',
        view: 'view-b.webp',
        large: 'large-c.webp',
        phoneView: 'phone-view-d.webp',
        phone: 'phone-e.jpg',
        desktop: 'desktop-f.png',
      },
      phone: [1440, 3120, 1_048_576],
      desktop: [7680, 4320, 17_612_000],
    },
  ],
};

const at = (name) => `${BASE}/kulen-night/${name}`;
const screenWith = (coarse) => ({
  matchMedia: (query) => ({ matches: coarse && query.length > 0 }),
});

describe('wallpaperCards', () => {
  const [card] = wallpaperCards(LIST, 'en-US');

  it('finds every file under the list base and its wallpaper', () => {
    expect(card.thumb.src).toBe(at('thumb-a.webp'));
    expect(card.downloads.desktop.url).toBe(at('desktop-f.png'));
    expect(card.downloads.phone.url).toBe(at('phone-e.jpg'));
  });

  it('lets a phone load the small grid picture and a sharp screen the one twice as wide', () => {
    expect(card.thumb.srcSet).toBe(`${at('thumb-a.webp')} 640w, ${at('view-b.webp')} 1280w`);
    expect(card.preview.desktop.srcSet).toBe(
      `${at('view-b.webp')} 1280w, ${at('large-c.webp')} 2560w`,
    );
    expect(card.preview.phone.src).toBe(at('phone-view-d.webp'));
  });

  it('names each download as it saves, with its kind, its size in pixels and in megabytes', () => {
    expect(card.downloads.phone).toMatchObject({
      name: 'retro-arcade-kulen-night-phone.jpg',
      type: 'image/jpeg',
      sizeLabel: 'JPEG · 1440 × 3120 · 1 MB',
    });
    expect(card.downloads.desktop).toMatchObject({
      name: 'retro-arcade-kulen-night-desktop.png',
      type: 'image/png',
      sizeLabel: 'Original PNG · 7680 × 4320 · 17.6 MB',
    });
  });
});

describe('megabytes', () => {
  it('rounds to a tenth, in the visitor’s own way of writing numbers', () => {
    expect(megabytes(2_712_000, 'en-US')).toBe('2.7 MB');
    expect(megabytes(2_712_000, 'de-DE')).toBe('2,7 MB');
  });
});

describe('byMood', () => {
  const cards = [{ mood: 'day' }, { mood: 'night' }, { mood: 'night' }];

  it('keeps every wallpaper for all, else those of the mood', () => {
    expect(byMood(cards, 'all')).toHaveLength(3);
    expect(byMood(cards, 'night')).toEqual([{ mood: 'night' }, { mood: 'night' }]);
  });
});

describe('firstShape', () => {
  it('shows the phone cut first on a touch screen and the computer one under a mouse', () => {
    expect(firstShape(screenWith(true))).toBe('phone');
    expect(firstShape(screenWith(false))).toBe('desktop');
  });
});

describe('the wallpapers the screen lists', () => {
  it('each has every file, a day or night mood and a download of each shape', () => {
    for (const card of wallpaperCards(WALLPAPERS, 'en-US')) {
      expect(['day', 'night']).toContain(card.mood);
      expect(card.thumb.src).toMatch(/^https:\/\/[\w.]+\.cloudfront\.net\/wallpapers\//);
      expect(card.downloads.phone.height).toBeGreaterThan(card.downloads.phone.width);
      expect(card.downloads.desktop.width).toBeGreaterThan(card.downloads.desktop.height);
    }
  });

  it('gives each wallpaper its own id', () => {
    const ids = WALLPAPERS.wallpapers.map((wallpaper) => wallpaper.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
