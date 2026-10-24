export function hasPointerMoved(previous, { clientX, clientY }) {
  return !previous || previous.x !== clientX || previous.y !== clientY;
}

// Browsers send pointer events when the page scrolls under a still mouse, so only a real move or a
// press hands the selection back to the mouse after the keys or a gamepad moved it.
export function trackInputModality({ document, signal }) {
  const root = document.documentElement;
  let lastPointer = null;
  const use = (mode) => {
    if (root.dataset.input !== mode) {
      root.dataset.input = mode;
    }
  };
  const options = { signal, capture: true, passive: true };
  document.addEventListener('pointerdown', () => use('pointer'), options);
  document.addEventListener(
    'pointermove',
    (event) => {
      if (hasPointerMoved(lastPointer, event)) {
        use('pointer');
      }
      lastPointer = { x: event.clientX, y: event.clientY };
    },
    options,
  );
  return { useKeys: () => use('keys'), isKeys: () => root.dataset.input === 'keys' };
}
