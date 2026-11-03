// A broadcast camera high in the near stand, on a rail along the touchline: it slides along x and
// tilts to look nearer or further, but never moves in depth, so a row of the view is always the same
// depth of the venue and a ground drawn once can be laid down again each frame. It stands `back`
// behind the near touchline and `height` above the grass.
const LENS = { back: 2340, height: 1560 };

// how many canvas pixels a world unit is drawn as on the near touchline, sized to the 58 px
// footballer sprites, which never scale; the far touchline is drawn smaller by the perspective
export const PIXELS_PER_UNIT = 1.45;

// the row of the view the camera looks at, a little under its middle as the HUD covers the top;
// the rest of the view is laid out from it
export const FOCUS_ROW = 448;

export const lensFor = (pitch) => ({
  eye: pitch.width + LENS.back,
  height: LENS.height,
  focal: LENS.back * PIXELS_PER_UNIT,
});

export const scaleAt = (lens, y) => lens.focal / (lens.eye - y);

// rows counted down from the horizon, the same for every camera on the rail
export const rowAt = (lens, y, lift = 0) => (lens.height - lift) * scaleAt(lens, y);

export const groundAtRow = (lens, row) => lens.eye - (lens.focal * lens.height) / row;

export const groundAtScale = (lens, scale) => lens.eye - lens.focal / scale;
