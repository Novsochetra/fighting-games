export function isTouchOn(game) {
  const { touch } = game.settings;
  return (
    touch === 'on' || (touch === 'auto' && (game.device.coarsePointer || game.device.touchUsed))
  );
}

// which input the player used last decides whether menus show a keyboard highlight
export function createUiState(game) {
  const ui = {
    lastInput: game.device.coarsePointer ? 'touch' : 'mouse',
    noteInput(kind) {
      ui.lastInput = kind;
    },
    usesButtons: () => ui.lastInput === 'key' || ui.lastInput === 'pad',
    isTouchOn: () => isTouchOn(game),
  };
  return ui;
}
