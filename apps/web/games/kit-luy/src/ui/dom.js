export function setText(element, text) {
  if (element.textContent !== text) {
    element.textContent = text;
  }
}

// an animation plays again only once the browser has seen the element without it
export function replay(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

export function centerOf(element) {
  const box = element.getBoundingClientRect();

  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

export const byIds = (document, ids) =>
  Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
