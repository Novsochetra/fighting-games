import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { drawChapterTitle } from '../../../../src/render/title/chapter-title.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

function textsDrawn(options) {
  const target = createPixelCanvas(VIEW.width, VIEW.height).getContext('2d');
  const texts = [];
  const context = new Proxy(target, {
    get(real, name) {
      const value = real[name];

      if (name === 'fillText') {
        return (text, ...rest) => {
          texts.push(text);
          value(text, ...rest);
        };
      }

      return typeof value === 'function' ? value.bind(real) : value;
    },
    set(real, name, value) {
      real[name] = value;

      return true;
    },
  });

  drawChapterTitle(context, { number: 2, tick: 0, age: 60, ...options });

  return new Set(texts);
}

const TITLE = { en: 'The Big School', km: 'សាលាធំ' };

describe('the words on a chapter card', () => {
  it('reads CHAPTER and its number in English', () => {
    expect(textsDrawn({ title: TITLE, lang: 'en' })).toEqual(
      new Set(['CHAPTER 2', 'The Big School']),
    );
  });

  it('writes the number in Khmer digits, right after the word, in Khmer', () => {
    expect(textsDrawn({ title: TITLE, lang: 'km' })).toEqual(new Set(['ជំពូកទី២', 'សាលាធំ']));
  });

  it('shows no words before the picture has had its beat', () => {
    expect(textsDrawn({ title: TITLE, lang: 'en', age: 5 }).size).toBe(0);
  });
});
