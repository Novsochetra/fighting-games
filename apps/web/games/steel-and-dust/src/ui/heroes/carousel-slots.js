// how far a card stands from the middle of the looping carousel, negative to the left
export function wrapOffset(index, center, count) {
  const offset = (((index - center) % count) + count) % count;
  return offset > count / 2 ? offset - count : offset;
}

// every card slides as far as the carousel turns, except one that comes round the loop: it starts
// out of sight on the side it comes in from, so no card is seen sliding across the row; the card
// opposite the middle stays out of sight on the side it went out by
export function nextSlots(previous, center, count) {
  return Array.from({ length: count }, (_, index) => {
    const offset = wrapOffset(index, center, count);
    if (!previous) {
      return { slot: offset, from: null };
    }
    const turn = previous[center];
    const before = previous[index];
    const slot = offset === count / 2 && before < 0 ? -offset : offset;
    return { slot, from: before - slot === turn ? null : slot + turn };
  });
}
