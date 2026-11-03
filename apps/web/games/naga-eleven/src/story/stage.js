export const SIDES = ['left', 'right'];

export const createStage = () => ({ left: null, right: null, speaking: null });

const otherSide = (side) => (side === 'left' ? 'right' : 'left');

// who stands on each side of a scene: a speaker steps in when they first talk and stays there
// listening while the other side answers; narration clears the stage
export function placeOnStage(stage, view, tick) {
  if (!view.portrait) {
    Object.assign(stage, createStage());

    return;
  }

  const { side, speaker, portrait } = view;
  const standing = stage[side];

  if (stage[otherSide(side)]?.speaker === speaker) {
    stage[otherSide(side)] = null;
  }

  stage[side] =
    standing?.speaker === speaker ? { ...standing, portrait } : { speaker, portrait, since: tick };
  stage.speaking = side;
}
