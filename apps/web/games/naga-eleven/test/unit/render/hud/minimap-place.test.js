import { describe, expect, it } from 'vitest';
import { arrangeView, isPortrait } from '../../../../../../packages/screen/src/stage-fit.js';
import { gapBetween, outlineOf } from '../../../../../../packages/touch-pad/src/pad-room.js';
import { VIEW } from '../../../../src/config.js';
import { PITCH_SIDE } from '../../../../src/data/skins/pitch-side.js';
import { minimapRect } from '../../../../src/render/hud/layout.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

// the touch controls' height an upright phone gives them under the stage (src/ui/stage.js)
const CONTROLS_HEIGHT = 250;
const CLEAR = 8;

const PHONES = [
  { name: 'an iPhone held sideways', width: 844, height: 390, safe: [0, 47, 21, 47] },
  { name: 'a small iPhone held sideways', width: 667, height: 375, safe: [0, 0, 0, 0] },
  { name: 'an iPhone upright', width: 390, height: 844, safe: [47, 0, 34, 0] },
];

const safeOf = ([top, right, bottom, left]) => ({ top, right, bottom, left });

function screenOf({ width, height, safe }) {
  const insets = safeOf(safe);
  const { rect } = arrangeView({
    width,
    height,
    safe: insets,
    hinge: null,
    view: VIEW,
    controlsHeight: CONTROLS_HEIGHT,
    frame: null,
  });
  const layer = {
    left: insets.left,
    top: insets.top,
    width: width - insets.left - insets.right,
    height: height - insets.top - insets.bottom,
  };

  return { stage: rect, layer, insets, portrait: isPortrait(width, height) };
}

// the minimap and its frame, in the screen's px
function minimapOnScreen(stage, match) {
  const rect = minimapRect(match);
  const scale = stage.width / VIEW.width;

  return {
    left: stage.x + (rect.x - 2) * scale,
    right: stage.x + (rect.x + rect.width + 2) * scale,
    top: stage.y + (rect.y - 2) * scale,
    bottom: stage.y + (rect.y + rect.height + 2) * scale,
  };
}

const controlsOf = ({ layer, portrait }) =>
  PITCH_SIDE.layouts[portrait ? 'portrait' : 'landscape'].items
    .filter((item) => item.at)
    .map((item) => outlineOf(item, layer, 1));

describe.each(PHONES)('the minimap on $name', (phone) => {
  const screen = screenOf(phone);

  it.each(['7', '11'])('stands clear of every touch key, %s a side', (format) => {
    const minimap = minimapOnScreen(screen.stage, fixtureMatch({ format }));

    for (const control of controlsOf(screen)) {
      expect(gapBetween(control, minimap), control.id).toBeGreaterThan(CLEAR);
    }
  });

  it('stands centred over the foot of the stage, over the home bar', () => {
    const minimap = minimapOnScreen(screen.stage, fixtureMatch({ format: '11' }));
    const middle = screen.stage.x + screen.stage.width / 2;

    expect((minimap.left + minimap.right) / 2).toBeCloseTo(middle, 0);
    expect(minimap.bottom).toBeLessThan(phone.height - screen.insets.bottom - 2);
    expect(minimap.bottom).toBeLessThan(screen.stage.y + screen.stage.height);
  });
});
