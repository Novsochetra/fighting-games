const MEASURES = ['x', 'y', 'width', 'height'];

// the menus size their words on the screen's smaller side (vmin, styles/tokens.css), so they fit on
// a half whose smaller side is at least this share of the screen's: either half of a Surface Duo or
// the top half of a Flip, but not a half of a Fold, whose fold has no gap to keep clear anyway
const FITS_HALF = 0.7;

// a hinge keeps the menus on the stage's half, so none of their buttons falls into it; the painting
// behind them still fills both halves (styles/menus.css)
export function menuBox({ hinge, width, height }) {
  const half = hinge?.game;
  const fits = half && Math.min(half.width, half.height) >= Math.min(width, height) * FITS_HALF;

  return fits ? half : null;
}

export function fitMenus(menus, box) {
  for (const measure of MEASURES) {
    if (box) {
      menus.style.setProperty(`--menu-${measure}`, `${box[measure]}px`);
    } else {
      menus.style.removeProperty(`--menu-${measure}`);
    }
  }
}
