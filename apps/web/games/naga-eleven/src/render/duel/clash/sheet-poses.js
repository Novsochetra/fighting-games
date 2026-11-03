// The frame of the footballer's sheets each pose of the clash is drawn with, for a player facing
// right: the animation, the way he faces in it (a row of the sheet), the frame, and how far the
// frame is moved off the figure's place, in sheet pixels, so a boot meets the ball. The runs and
// the stance are 3/4 to the camera, so his face and the number on his chest show; a strike, a
// slide and a stretch are side on, where the sheets draw the leg out full length.
const SHOTS = {
  stand: { animation: 'idle', way: 'south-east', frame: 0 },
  // the fall's last frame rises into a crouch, arms out: a defender jockeying
  guard: { animation: 'fall', way: 'south-east', frame: 3, dx: 2 },
  ready: { animation: 'fall', way: 'south-east', frame: 3 },
  run: { animation: 'run', way: 'south-east', frame: null, dx: 3 },
  run2: { animation: 'run', way: 'south-east', frame: null, dx: 3 },
  windup: { animation: 'kick', way: 'east', frame: 0, dx: 6 },
  kick: { animation: 'kick', way: 'east', frame: 1, dx: 6 },
  leap: { animation: 'kick', way: 'east', frame: 0 },
  slide: { animation: 'slide', way: 'east', frame: 2, dx: -4 },
  // his celebration's second frame is a crouch with his fists in: braced for the shot
  block: { animation: 'celebrate', way: 'south', frame: 1 },
  lunge: { animation: 'kick', way: 'east', frame: 2, dx: -2 },
  fallen: { animation: 'fall', way: 'south-east', frame: 2, dx: -10 },
  // the slide's first frame is him sat on the grass, a leg out: a defender left behind
  sat: { animation: 'slide', way: 'east', frame: 0 },
  catch: { animation: 'celebrate', way: 'south', frame: 6 },
  punch: { animation: 'celebrate', way: 'south', frame: 4 },
  dive: { animation: 'dive', way: 'east', frame: 4, dx: -6 },
  front: { animation: 'idle', way: 'south', frame: 0 },
  frontDive: { animation: 'dive', way: 'east', frame: 3, dx: -6 },
};

export const SHEET_POSES = Object.keys(SHOTS);

// a run takes a step of its sheet every few ticks of the show's clock
export const TICKS_PER_STEP = 5;

const MIRRORED = { east: 'west', 'south-east': 'south-west', 'north-east': 'north-west' };

const wayOf = (way, facing) => (facing < 0 ? (MIRRORED[way] ?? way) : way);

// `sheet` on the figure names a shot of its own for a pose the shadow draws alike, and `frame`,
// where the clash's choreography gives one, comes before the shot's own; with neither, the frame
// steps on with the clock
export function sheetShotOf({ pose, sheet, frame, facing = 1 }, clock = 0) {
  const shot = SHOTS[sheet] ?? SHOTS[pose] ?? SHOTS.stand;
  const step = Math.floor(Math.max(0, clock) / TICKS_PER_STEP);

  return {
    animation: shot.animation,
    direction: wayOf(shot.way, facing),
    frame: frame ?? shot.frame,
    step,
    dx: (shot.dx ?? 0) * (facing < 0 ? -1 : 1),
  };
}

// the frame of an animation of `count` frames the shot shows: its own, or the clock's step
export const frameIn = (shot, count) =>
  shot.frame === null ? shot.step % count : Math.min(Math.max(0, shot.frame), count - 1);
