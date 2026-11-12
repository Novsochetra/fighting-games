export function createPips(element, count) {
  const dots = Array.from({ length: count }, () => element.ownerDocument.createElement('i'));
  let shown = -1;

  element.replaceChildren(...dots);

  return function light(lit) {
    if (lit !== shown) {
      shown = lit;
      dots.forEach((dot, i) => dot.classList.toggle('on', i < lit));
    }
  };
}
