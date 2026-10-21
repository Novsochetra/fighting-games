const NO_VARS = { '--tb-x': null, '--tb-y': null, '--tb-size': null };

export function buttonVars(entry) {
  if (!entry) {
    return NO_VARS;
  }
  return { '--tb-x': String(entry.x), '--tb-y': String(entry.y), '--tb-size': String(entry.size) };
}

function setVars(style, vars) {
  for (const [name, value] of Object.entries(vars)) {
    if (value === null) {
      style.removeProperty(name);
    } else {
      style.setProperty(name, value);
    }
  }
}

// `layer` is the touch layer or the editor's copy of it; with no entries its buttons and stick go
// back to the original layout in touch-buttons.css and touch.css. The stick's place is set where it
// rests (TouchStick, or the editor's view)
export function applyButtonLayout(layer, entries) {
  layer.querySelector('.btns').classList.toggle('custom', !!entries);
  for (const button of layer.querySelectorAll('.tb[data-action]')) {
    setVars(button.style, buttonVars(entries?.[button.dataset.action]));
  }
  const stickSize = entries ? String(entries.stick.size) : null;
  setVars(layer.querySelector('.stick-base').style, { '--stick-size': stickSize });
}

// `span` is the custom stick's zone in px of the touch layer, or none for the original left side
export function applyStickZone(zone, span) {
  zone.style.left = span ? `${span.left}px` : '';
  zone.style.width = span ? `${span.width}px` : '';
}
