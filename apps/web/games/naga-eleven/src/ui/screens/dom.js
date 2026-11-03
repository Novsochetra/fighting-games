export function make(document, tag, { className, text, lang } = {}) {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  if (text !== undefined) {
    node.textContent = text;
  }

  if (lang) {
    node.lang = lang;
  }

  return node;
}

export const slotOf = (section, name) => section.querySelector(`[data-slot="${name}"]`);

export function setSlot(section, name, text) {
  const node = slotOf(section, name);

  if (node) {
    node.textContent = text;
  }

  return node;
}

export function fillSlot(section, name, nodes) {
  slotOf(section, name)?.replaceChildren(...nodes);
}

export function showSlot(section, name, shown) {
  const node = slotOf(section, name);

  if (node) {
    node.hidden = !shown;
  }
}

export const actionButton = (section, action) => section.querySelector(`[data-action="${action}"]`);
