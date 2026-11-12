const MOST = 10;

export function createPops(layer) {
  return function pop({ text, kind, at }) {
    const element = layer.ownerDocument.createElement('span');

    element.className = `pop pop-${kind}`;
    element.textContent = text;
    element.style.left = `${at.x}px`;
    element.style.top = `${at.y}px`;
    element.addEventListener('animationend', () => element.remove());
    layer.append(element);

    while (layer.children.length > MOST) {
      layer.firstElementChild.remove();
    }
  };
}
