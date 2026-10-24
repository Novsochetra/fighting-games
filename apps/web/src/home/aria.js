// ARIA reads an empty value as false, so a flag is written out as "true" or left off.
export function setAriaFlag(element, name, isOn) {
  if (isOn) {
    element.setAttribute(name, 'true');
  } else {
    element.removeAttribute(name);
  }
}
