// the palisade that closes a forest road is a PixelLab sprite in assets/sprites/props/, drawn at
// the fighters' density; it hangs from its left end like the brick wall of the desert roads, its
// feet sunk a little into the road so it looks planted. A road's way in is the last road's wall
// broken open, standing at the start with its left edge on the road's edge; a road's closing wall
// stands whole on screen at the end of the road, by its `width`, known before its image loads.
// A broken wall's `doorway` is where the hero walks through it, in the sprite's own pixels. A door
// has a `dark` space painted in it, [left, right] along the road: the hero walks in front of the
// wall into that dark and is lost in it, and comes out of it the same way. A fence or a breach
// has an `opening` the road shows through, [left, top, right, bottom]: there the hero walks behind
// the wall, seen only through the opening, and out of sight behind its far side
const DOORWAYS = {
  palisadeBroken: { opening: [22, 0, 60, 112] },
  canyonBarricadeBroken: { opening: [57, 0, 88, 112] },
  foundryGateBroken: { dark: [62, 86] },
  templeDoorBroken: { dark: [42, 55] },
  wardenGateBroken: { dark: [80, 110] },
  templeGateBroken: { opening: [48, 0, 74, 112] },
};

const SPRITES = {
  palisade: { file: 'palisade.png', width: 82, feetX: 16, feetY: 110 },
  palisadeBroken: { file: 'palisadeBroken.png', width: 82, feetX: 16, feetY: 110 },
  canyonBarricade: { file: 'canyonBarricade.png', width: 128, feetX: 56, feetY: 108 },
  canyonBarricadeBroken: { file: 'canyonBarricadeBroken.png', width: 128, feetX: 20, feetY: 108 },
  foundryGate: { file: 'foundry-gate.png', width: 112, feetX: 88, feetY: 121 },
  foundryGateBroken: { file: 'foundry-gate-broken.png', width: 112, feetX: 20, feetY: 121 },
  templeDoor: { file: 'temple-door.png', width: 112, feetX: 84, feetY: 143 },
  templeDoorBroken: { file: 'temple-door-broken.png', width: 112, feetX: 16, feetY: 139 },
  wardenGate: { file: 'warden-gate.png', width: 196, feetX: 176, feetY: 202 },
  wardenGateBroken: { file: 'warden-gate-broken.png', width: 196, feetX: 20, feetY: 202 },
  templeGate: { file: 'temple-gate.png', width: 82, feetX: 70, feetY: 110 },
  templeGateBroken: { file: 'temple-gate-broken.png', width: 82, feetX: 16, feetY: 110 },
};

export const PROP_SPRITES = Object.fromEntries(
  Object.entries(SPRITES).map(([kind, sprite]) => [kind, { ...sprite, doorway: DOORWAYS[kind] }]),
);
