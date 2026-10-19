export const keycap = (label) => `<kbd class="k">${label}</kbd>`;

const TOUCH_NAMES = { J: 'ATTACK', K: 'HEAVY', L: 'ULT' };

// move inputs are written with keyboard keys; touch players see the button names instead
export function inputLabel(input, touch) {
  return input
    .split(' ')
    .map((word) => {
      if (TOUCH_NAMES[word]) {
        return keycap(touch ? TOUCH_NAMES[word] : word);
      }
      return word === '↑' || word === '↓' ? keycap(word) : word;
    })
    .join(' ');
}

export function touchWords(text, touch) {
  if (!touch) {
    return text;
  }
  return text.replace(/\bJ\b/g, 'ATTACK').replace(/\bK\b/g, 'HEAVY');
}

export function table(title, rows) {
  const body = rows.map(([name, value]) => `<tr><td>${name}</td><td>${value}</td></tr>`).join('');
  return `<div class="group">${title}</div><table class="keys">${body}</table>`;
}
