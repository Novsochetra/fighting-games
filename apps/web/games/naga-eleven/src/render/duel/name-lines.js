import { wordWidth } from './pixel-word.js';

// a move's name on one line if it fits, else broken at the space that evens the two lines out
export function nameLines(name) {
  const words = name.toUpperCase().split(' ');

  if (words.length === 1) {
    return words;
  }

  let best = [name.toUpperCase()];
  let bestWidth = wordWidth(best[0], 1);

  for (let i = 1; i < words.length; i += 1) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const width = Math.max(...lines.map((line) => wordWidth(line, 1)));

    if (width < bestWidth) {
      best = lines;
      bestWidth = width;
    }
  }

  return best;
}

export function fitLines(name, room, most = 4) {
  const single = [name.toUpperCase()];
  const singleSize = Math.floor(room / wordWidth(single[0], 1));

  if (singleSize >= 3) {
    return { lines: single, size: Math.min(most, singleSize) };
  }

  const lines = nameLines(name);
  const width = Math.max(...lines.map((line) => wordWidth(line, 1)));

  return { lines, size: Math.max(1, Math.min(most, Math.floor(room / width))) };
}
