// How a move reads on the pitch in the normal view (README "On the pitch"), in world pixels and in
// its look's colours (LOOK_ART). The `trail` follows the ball, or the player for a move he carries;
// the `aura` wraps the player from the moment a full charge would fire it until it has; the
// `impact` bursts where it is struck, blocked or saved. Each play has its own three, and a move may
// change any of them
export const EFFECT_SHAPES = {
  trail: [
    'streak',
    'coils',
    'twin-coils',
    'heads',
    'wings',
    'blade',
    'arc',
    'flame',
    'horns',
    'ribbon',
    'kite',
    'river',
    'wave',
    'bolt',
    'afterimage',
    'confetti',
    'wind',
  ],
  aura: ['motes', 'wind', 'stone', 'flame', 'halo'],
  impact: ['burst', 'splash', 'feathers', 'ring', 'wall', 'sparks', 'dust'],
};

// a trail of null leaves none: a block or a save happens where the player stands
export const PLAY_EFFECTS = {
  shot: { trail: 'streak', aura: 'motes', impact: 'burst', follows: 'ball' },
  pass: { trail: 'ribbon', aura: 'wind', impact: 'sparks', follows: 'ball' },
  cross: { trail: 'kite', aura: 'wind', impact: 'sparks', follows: 'ball' },
  dribble: { trail: 'afterimage', aura: 'wind', impact: 'dust', follows: 'player' },
  tackle: { trail: 'wind', aura: 'motes', impact: 'ring', follows: 'player' },
  block: { trail: null, aura: 'stone', impact: 'wall', follows: 'player' },
  save: { trail: null, aura: 'halo', impact: 'burst', follows: 'player' },
};

export const MOVE_EFFECTS = {
  'naga-shot': { trail: 'coils', impact: 'splash' },
  'hanuman-leap': { trail: 'wind' },
  'garuda-volley': { trail: 'wings', impact: 'feathers' },
  'twin-naga': { trail: 'twin-coils', impact: 'splash' },
  'seven-headed-naga': { trail: 'heads', aura: 'halo', impact: 'splash' },
  'preah-khan-strike': { trail: 'blade', aura: 'halo' },
  'angkor-wall': { aura: 'stone', impact: 'wall' },
  'silent-moon': { trail: 'arc', aura: 'halo' },
  'hwarang-charge': { trail: 'flame', aura: 'flame' },
  'mountain-guard': { aura: 'stone', impact: 'dust' },
  'samba-mirage': { trail: 'confetti' },
  'carnival-rocket': { trail: 'flame', aura: 'flame' },
  'iron-gate': { aura: 'stone' },
  'belly-block': { aura: 'stone', impact: 'wall' },
  'elephant-guard': { impact: 'dust' },
  'kouprey-kick': { trail: 'horns', impact: 'dust' },
  'whip-cross': { trail: 'ribbon' },
  'thunder-shot': { trail: 'bolt' },
  'mekong-current': { trail: 'river', impact: 'splash' },
  'tonle-sap-tide': { trail: 'wave', aura: 'halo', impact: 'splash' },
  'wave-strike': { trail: 'wave', impact: 'splash' },
  'tidal-wave': { trail: 'wave', aura: 'halo', impact: 'splash' },
  'kite-header': { trail: 'kite', impact: 'sparks' },
  'chrey-lightning': { trail: 'bolt', impact: 'sparks' },
  'moon-relay': { trail: 'arc', aura: 'halo' },
  'carnival-bicycle': { trail: 'confetti', aura: 'flame' },
  'flying-naga': { trail: 'coils', aura: 'wind', impact: 'splash' },
  'storm-garuda': { trail: 'wings', aura: 'wind', impact: 'feathers' },
  'eclipse-moon': { trail: 'arc', aura: 'halo', impact: 'sparks' },
  'samba-rocket': { trail: 'flame', aura: 'flame' },
};

// how long each part lasts on the pitch, in ticks; a trail lasts while its ball is in flight
export const EFFECT_TICKS = { aura: 30, impact: 24, ring: 20, wall: 36, comboPop: 30 };

// a move's three on the pitch: its play's, with what the move changes; a move of a play with none
// (a star's save) reads as a save
export const effectOfMove = (move) => ({
  ...(PLAY_EFFECTS[move?.play] ?? PLAY_EFFECTS.save),
  ...MOVE_EFFECTS[move?.id],
});
