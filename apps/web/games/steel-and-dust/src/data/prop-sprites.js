// the palisade that closes a forest road is a PixelLab sprite in assets/sprites/props/, drawn at
// the fighters' density; it hangs from its left end like the brick wall of the desert roads, its
// feet sunk a little into the road so it looks planted. A road's way in is the last road's wall
// broken open, standing at the start with its left edge on the road's edge; a road's closing wall
// stands whole on screen at the end of the road, its paint (`paintedRight`) up to the screen's edge,
// both known before its image loads.
// A broken wall's `doorway` is the opening the hero goes through, [left, top, right, bottom] in the
// sprite's own pixels. A door's is the black hole painted in it (`dark`): the hero steps into the
// hole in front of the dark and fades into it, the door in front of it all round the hole. A fence's
// or a breach's is the gap it was broken open at, low enough for the hero to jump over
const DOORWAYS = {
  palisadeBroken: { opening: [22, 0, 60, 112] },
  canyonBarricadeBroken: { opening: [57, 0, 88, 112] },
  foundryGateBroken: { opening: [60, 24, 82, 98], dark: true },
  templeDoorBroken: { opening: [42, 52, 62, 116], dark: true },
  wardenGateBroken: { opening: [82, 48, 110, 180], dark: true },
  templeGateBroken: { opening: [48, 0, 74, 112] },
};

const SPRITES = {
  palisade: { file: 'palisade.png', width: 82, paintedRight: 82, feetX: 16, feetY: 110 },
  palisadeBroken: {
    file: 'palisadeBroken.png',
    width: 82,
    paintedRight: 82,
    feetX: 16,
    feetY: 110,
  },
  canyonBarricade: {
    file: 'canyonBarricade.png',
    width: 128,
    paintedRight: 128,
    feetX: 56,
    feetY: 108,
  },
  canyonBarricadeBroken: {
    file: 'canyonBarricadeBroken.png',
    width: 128,
    paintedRight: 128,
    feetX: 20,
    feetY: 108,
  },
  foundryGate: { file: 'foundry-gate.png', width: 112, paintedRight: 110, feetX: 88, feetY: 121 },
  foundryGateBroken: {
    file: 'foundry-gate-broken.png',
    width: 112,
    paintedRight: 110,
    feetX: 20,
    feetY: 121,
  },
  templeDoor: { file: 'temple-door.png', width: 112, paintedRight: 102, feetX: 84, feetY: 143 },
  templeDoorBroken: {
    file: 'temple-door-broken.png',
    width: 112,
    paintedRight: 100,
    feetX: 16,
    feetY: 139,
  },
  wardenGate: { file: 'warden-gate.png', width: 196, paintedRight: 196, feetX: 176, feetY: 202 },
  wardenGateBroken: {
    file: 'warden-gate-broken.png',
    width: 196,
    paintedRight: 196,
    feetX: 20,
    feetY: 202,
  },
  templeGate: { file: 'temple-gate.png', width: 82, paintedRight: 82, feetX: 70, feetY: 110 },
  templeGateBroken: {
    file: 'temple-gate-broken.png',
    width: 82,
    paintedRight: 82,
    feetX: 16,
    feetY: 110,
  },
};

export const PROP_SPRITES = Object.fromEntries(
  Object.entries(SPRITES).map(([kind, sprite]) => [kind, { ...sprite, doorway: DOORWAYS[kind] }]),
);
