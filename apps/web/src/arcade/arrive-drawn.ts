type NamedAnimation = Animation & { animationName?: string };

// Ends the CSS animations of these names under root at once, so its parts show where they rest.
export function settleEntrances(root: Element, entrances: readonly string[]) {
  const animations: NamedAnimation[] = root.getAnimations?.({ subtree: true }) ?? [];

  for (const animation of animations) {
    if (animation.animationName && entrances.includes(animation.animationName)) {
      animation.finish();
    }
  }
}
