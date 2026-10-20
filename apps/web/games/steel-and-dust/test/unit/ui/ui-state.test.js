import { describe, expect, it, vi } from 'vitest';
import { createUiState } from '../../../src/ui/ui-state.js';
import { createTestGame } from '../../support/test-game.js';

function phoneUi(settings = {}) {
  const game = createTestGame({ settings });
  game.device.coarsePointer = true;
  const ui = createUiState(game);
  ui.onTouchShownChange = vi.fn();
  return { game, ui };
}

describe('the touch controls with a gamepad', () => {
  it('step aside while a gamepad is played and come back on a touch', () => {
    const { ui } = phoneUi();
    expect(ui.showsTouchControls()).toBe(true);
    ui.noteInput('pad');
    expect(ui.showsTouchControls()).toBe(false);
    expect(ui.isTouchOn()).toBe(true);
    ui.noteInput('pad');
    expect(ui.onTouchShownChange).toHaveBeenCalledTimes(1);
    ui.noteInput('touch');
    expect(ui.showsTouchControls()).toBe(true);
    expect(ui.onTouchShownChange).toHaveBeenCalledTimes(2);
  });

  it('stay on screen with a gamepad when that setting is off', () => {
    const { ui } = phoneUi({ padHidesTouch: false });
    ui.noteInput('pad');
    expect(ui.showsTouchControls()).toBe(true);
    expect(ui.onTouchShownChange).not.toHaveBeenCalled();
  });

  it('never show on a desktop with touch controls on auto, whatever is played', () => {
    const ui = createUiState(createTestGame());
    ui.noteInput('key');
    expect(ui.showsTouchControls()).toBe(false);
    ui.noteInput('pad');
    expect(ui.showsTouchControls()).toBe(false);
  });
});
