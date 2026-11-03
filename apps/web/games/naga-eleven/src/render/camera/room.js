import { UI_SCALE, WORLD_VIEW } from '../../config.js';
import { HUD_BOTTOM } from '../hud/layout.js';

// The score and the player card cover the top of the view down to this row of the world's pixels,
// and a footballer stands a sprite's height above his feet (58 pixels and his marker), so the
// camera frames the play by where the feet are: low enough that a head clears the HUD.
export const HUD_COVER = HUD_BOTTOM * UI_SCALE;
export const HEAD_ROOM = 76;

// the rows of the view a point on the ground is kept between: `top` pixels under the HUD and
// `bottom` pixels over the foot of the view. The minimap at the foot is not kept clear: lifting
// these rooms over it tilted the view after every ball toward the near touchline, and jolted it
// (test/regression/bugs/camera-jolts.test.js), and the near touchline stays at the foot anyway
// (bounds.js); the minimap fades while the ball passes under it (src/render/hud/minimap-fade.js)
export const rowsBetween = ({ top, bottom }) => ({
  top: HUD_COVER + top,
  bottom: WORLD_VIEW.height - bottom,
});
