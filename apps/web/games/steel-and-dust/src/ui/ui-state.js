export function isTouchOn(game) {
  const { touch } = game.settings;
  return (
    touch === 'on' || (touch === 'auto' && (game.device.coarsePointer || game.device.touchUsed))
  );
}

// a phone or tablet played with a gamepad keeps its touch controls off the screen until touched
function hiddenByPad(game, lastInput) {
  return game.settings.padHidesTouch && lastInput === 'pad';
}

// which input the player used last decides whether menus show a keyboard highlight, and whether
// the touch controls step aside for a gamepad (`onTouchShownChange` hears when they do)
export function createUiState(game) {
  const ui = {
    lastInput: game.device.coarsePointer ? 'touch' : 'mouse',
    noteInput(kind) {
      const shown = ui.showsTouchControls();
      ui.lastInput = kind;
      if (ui.showsTouchControls() !== shown) {
        ui.onTouchShownChange?.();
      }
    },
    usesButtons: () => ui.lastInput === 'key' || ui.lastInput === 'pad',
    isTouchOn: () => isTouchOn(game),
    showsTouchControls: () => isTouchOn(game) && !hiddenByPad(game, ui.lastInput),
  };
  return ui;
}
