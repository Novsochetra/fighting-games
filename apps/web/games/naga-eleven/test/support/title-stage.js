import { arrangeView } from '../../../../packages/screen/src/stage-fit.js';
import { VIEW } from '../../src/config.js';
import { TITLE_ART_LAYOUT } from '../../src/ui/screens/title-spots.js';

export const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

// an iPhone's insets held upright and sideways: the notch, and the home bar at the foot
export const IPHONE_UPRIGHT = { top: 47, right: 0, bottom: 34, left: 0 };
export const IPHONE_SIDEWAYS = { top: 0, right: 47, bottom: 21, left: 47 };

// where the game's stage fit stands the canvas (src/ui/stage.js): with touch controls an upright
// stage stands at the top, over the room they take
export function stageFor({ width, height, touch = false, safe = NO_INSETS }) {
  const { rect } = arrangeView({
    width,
    height,
    safe,
    hinge: null,
    view: VIEW,
    controlsHeight: touch ? 250 : null,
    frame: null,
  });

  return rect;
}

const at = (stage, share) => stage.y + share * stage.height;

// the parts of the title art the words must keep clear of, in screen px
export function artMarks(stage) {
  return {
    headsTop: at(stage, TITLE_ART_LAYOUT.headsTop),
    boy: {
      left: stage.x + 0.46 * stage.width,
      right: stage.x + TITLE_ART_LAYOUT.pastBall * stage.width,
      top: at(stage, TITLE_ART_LAYOUT.boyTop),
      bottom: at(stage, TITLE_ART_LAYOUT.feet),
    },
  };
}

const crosses = (box, area) =>
  box.x < area.right &&
  box.x + box.width > area.left &&
  box.y < area.bottom &&
  box.y + box.height > area.top;

// the logo stays over the heads (or off the stage), and the prompt off the boy
export function clashesOf(spots, stage) {
  const marks = artMarks(stage);
  const headLow = spots.head.y + spots.head.height;
  const overStage = spots.head.y < stage.y + stage.height && headLow > stage.y;

  return {
    logoOnNaga: overStage && headLow > marks.headsTop,
    promptOnBoy: crosses(spots.prompt, marks.boy),
  };
}
