import { readToken } from './motion-tokens.js';

function readRem(document, name) {
  const rem = parseFloat(readToken(document, name));
  if (!rem) {
    return 0;
  }
  const rootStyle = document.defaultView.getComputedStyle(document.documentElement);
  return rem * parseFloat(rootStyle.fontSize);
}

export const fitsBesideButton = ({ buttonBottom, noteHeight, actionsBottom, gap }) =>
  buttonBottom - noteHeight - gap >= actionsBottom;

// The hero stops growing on a tall phone, which leaves room under its buttons for the note right
// beside the coffee button; where it would cover them it sits right above the button (coffee.css).
// Its height is read untransformed, since it pops in from a smaller scale.
export function placeCoffeeNote({ note, button, actions, document }) {
  note.dataset.spot = 'beside';
  const fits = fitsBesideButton({
    buttonBottom: button.getBoundingClientRect().bottom,
    noteHeight: note.offsetHeight,
    actionsBottom: actions.getBoundingClientRect().bottom,
    gap: readRem(document, '--space-3'),
  });
  if (!fits) {
    delete note.dataset.spot;
  }
}
