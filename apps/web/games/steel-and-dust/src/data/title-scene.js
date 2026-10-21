// the title's painting of Angkor Wat at dusk and the life laid over it, one set for each painting
// the page shows, every place in the painting's own pixels and drawn in this order. The shared air
// effects only draw inside one 384x216 view, so one meant for lower down the tall painting carries
// `shiftY`, the painting row its own top row lies on
const LANDSCAPE = {
  painting: 'assets/ui/select/bg-landscape.png',
  width: 384,
  height: 216,
  effects: [
    {
      kind: 'ripple',
      top: 122,
      bottom: 180,
      reach: 2,
      areas: [{ left: 96, right: 334, top: 123, bottom: 176 }],
    },
    {
      kind: 'sway',
      reach: 1.6,
      crowns: [
        { left: 0, right: 60, top: 0, bottom: 34 },
        { left: 62, right: 102, top: 15, bottom: 52 },
        { left: 104, right: 127, top: 40, bottom: 61 },
        { left: 293, right: 322, top: 25, bottom: 53 },
        { left: 332, right: 383, top: 1, bottom: 44 },
      ],
    },
    { kind: 'sunRays', x: 278, y: 54, radius: 14, alpha: 0.15 },
    { kind: 'sunGlow', x: 278, y: 54, radius: 14 },
    { kind: 'glints', count: 16, top: 126, bottom: 176, left: 80, span: 260 },
    { kind: 'birds', period: 1500, y: 24 },
    { kind: 'motes', count: 8, top: 30, bottom: 110 },
    { kind: 'fireflies', count: 12, top: 134, bottom: 210 },
    { kind: 'leaves', count: 3, wind: 0.1 },
  ],
};

// the tall painting is only 216 wide, so about half of what the shared effects spread over a
// 384 wide view lands on it
const PORTRAIT = {
  painting: 'assets/ui/select/bg-portrait.png',
  width: 216,
  height: 468,
  effects: [
    {
      kind: 'ripple',
      top: 217,
      bottom: 312,
      reach: 2,
      areas: [{ left: 36, right: 186, top: 218, bottom: 306 }],
    },
    {
      kind: 'sway',
      reach: 1.6,
      crowns: [
        { left: 0, right: 21, top: 13, bottom: 38 },
        { left: 2, right: 39, top: 38, bottom: 70 },
        { left: 178, right: 209, top: 62, bottom: 96 },
        { left: 199, right: 216, top: 96, bottom: 113 },
      ],
    },
    { kind: 'sunRays', x: 161, y: 84, radius: 16, alpha: 0.15 },
    { kind: 'sunGlow', x: 161, y: 84, radius: 16 },
    { kind: 'glints', count: 10, top: 22, bottom: 104, left: 30, span: 160, shiftY: 200 },
    { kind: 'birds', period: 1500, y: 30 },
    { kind: 'motes', count: 10, top: 40, bottom: 160 },
    { kind: 'fireflies', count: 14, top: 60, bottom: 200, shiftY: 260 },
    { kind: 'leaves', count: 5, wind: 0.1, shiftY: 120 },
  ],
};

export const TITLE_SCENES = { landscape: LANDSCAPE, portrait: PORTRAIT };
