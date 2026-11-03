import { describe, expect, it, vi } from 'vitest';
import { clearPresses, createInput } from '../../../../src/sim/input-state.js';
import { closingCardScreen } from '../../../../src/ui/app/canvas-screens.js';
import { showClosing } from '../../../../src/ui/app/story-flow.js';

function stepFor(screen, input, ticks) {
  for (let i = 0; i < ticks; i += 1) {
    screen.step(input);
    clearPresses(input);
  }
}

const pressPass = (screen, input) => {
  input.pressed.pass = true;
  screen.step(input);
  clearPresses(input);
};

describe('the card the story closes on', () => {
  it('holds longer than a chapter card, then is done', () => {
    const screen = closingCardScreen({ lang: 'en' });

    stepFor(screen, createInput(), 400);
    expect(screen.isDone()).toBe(false);

    stepFor(screen, createInput(), 80);
    expect(screen.isDone()).toBe(true);
  });

  it('lets pass or a tap move on only once its moral is up', () => {
    const screen = closingCardScreen({ lang: 'km' });
    const input = createInput();

    pressPass(screen, input);
    screen.tap({ x: 10, y: 10 });
    expect(screen.isDone()).toBe(false);

    stepFor(screen, input, 100);
    pressPass(screen, input);
    expect(screen.isDone()).toBe(true);
  });

  it('comes up when the story is over, and hands on once it is done', () => {
    const then = vi.fn();
    const app = {
      settings: { lang: 'en' },
      screens: { hide: vi.fn() },
      play: (screen) => {
        app.canvas = screen;
      },
    };

    showClosing(app, then);

    expect(app.screens.hide).toHaveBeenCalled();
    expect(app.canvas.kind).toBe('card');
    expect(app.canvas.playing).toBe(false);

    app.cardDone();
    expect(then).toHaveBeenCalledOnce();
  });
});
