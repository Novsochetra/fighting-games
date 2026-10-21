const NO_VARS = { '--tb-x': null, '--tb-y': null, '--tb-size': null };

export function buttonVars(entry) {
  if (!entry) {
    return NO_VARS;
  }
  return { '--tb-x': String(entry.x), '--tb-y': String(entry.y), '--tb-size': String(entry.size) };
}

// `layer` is the touch layer or the editor's copy of it; with no entries its buttons go back to the
// original layout in touch-buttons.css
export function applyButtonLayout(layer, entries) {
  layer.querySelector('.btns').classList.toggle('custom', !!entries);
  for (const button of layer.querySelectorAll('.tb[data-action]')) {
    const vars = buttonVars(entries?.[button.dataset.action]);
    for (const [name, value] of Object.entries(vars)) {
      if (value === null) {
        button.style.removeProperty(name);
      } else {
        button.style.setProperty(name, value);
      }
    }
  }
}
