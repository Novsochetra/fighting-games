import { act } from '@testing-library/react';

// Reports whether the page kept the click from following its link, then keeps happy-dom from
// following it either.
export function clickAndSeeIfHeld(target, init = {}) {
  let isHeld = null;
  const record = (event) => {
    isHeld = event.defaultPrevented;
    event.preventDefault();
  };
  target.ownerDocument.addEventListener('click', record, { once: true });
  act(() => {
    target.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
    );
  });
  return isHeld;
}
