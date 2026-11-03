import { describe, expect, it } from 'vitest';
import { clearPresses, createInput } from '../../../../src/sim/input-state.js';
import { chapterCardScreen } from '../../../../src/ui/app/canvas-screens.js';

const card = () => chapterCardScreen({ number: 1, title: { en: 'One', km: 'មួយ' }, lang: 'en' });

function stepFor(screen, input, ticks) {
  for (let i = 0; i < ticks; i += 1) {
    screen.step(input);
    clearPresses(input);
  }
}

describe('a chapter card', () => {
  it('holds a few seconds, then is done', () => {
    const screen = card();

    stepFor(screen, createInput(), 200);
    expect(screen.isDone()).toBe(false);

    stepFor(screen, createInput(), 60);
    expect(screen.isDone()).toBe(true);
  });

  it('lets pass move on only once its words are up', () => {
    const screen = card();
    const input = createInput();

    input.pressed.pass = true;
    screen.step(input);
    clearPresses(input);
    expect(screen.isDone()).toBe(false);

    stepFor(screen, input, 50);
    input.pressed.pass = true;
    screen.step(input);

    expect(screen.isDone()).toBe(true);
  });
});
