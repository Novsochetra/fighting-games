// where the tip of the Ember Shade's baked spear sits on each attack strip's strike frame, facing
// right: world px from the feet, and the way it points (degrees clockwise from level); measured on the
// spear row of assets/sprites/heroes/ember/arsenal/, so re-baking that row means measuring again
export const EMBER_SPEAR_TIPS = {
  slash1: { x: 18, y: -10, aim: 0 },
  slash2: { x: 17.5, y: -23, aim: 0 },
  spin_slash: { x: 24.5, y: -18, aim: 0 },
  thrust: { x: 31.5, y: -17, aim: 0 },
  rising_dragon: { x: 16, y: -33, aim: -55 },
  cleave: { x: 24, y: -7.5, aim: 0 },
  air_slash: { x: 31.5, y: -10.5, aim: 0 },
  air_rising_cut: { x: 17.5, y: -21, aim: -45 },
  meteor_slash: { x: 23.5, y: -1, aim: 35 },
  plunge: { x: 20.5, y: 1.5, aim: 70 },
};
