const isOnScreen = (rect, viewportHeight) =>
  rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < viewportHeight;

// A game opens out of the first of its pictures the visitor can see: the carousel card, else its tile
// in the library, else the card even off screen.
export function pickLaunchSource(candidates, viewportHeight) {
  const present = candidates.filter(Boolean);
  const visible = present.find((element) =>
    isOnScreen(element.getBoundingClientRect(), viewportHeight),
  );
  return visible ?? present[0] ?? null;
}
