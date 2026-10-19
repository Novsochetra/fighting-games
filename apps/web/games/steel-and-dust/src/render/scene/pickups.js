import { COLORS } from '../../art/colors.js';
import { ITEM_COLORS } from '../../art/item-colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { drawItemIcon } from './item-icons.js';

function beamColor(item) {
  return item === 'ration' ? COLORS.mint : WEAPONS[item].trailColor;
}

// a beam of light marks where a drop landed
function drawPickup(painter, pickup) {
  if (pickup.landed) {
    painter.alpha(0.25 + 0.15 * Math.sin(pickup.time * 0.15));
    painter.use(beamColor(pickup.item)).rect(pickup.x - 1, pickup.y - 40, 3, 36);
    painter.alpha(1);
  }
  if (pickup.landed && (pickup.time >> 3) % 4 === 0) {
    painter.use(ITEM_COLORS.pickupGlow).diamond(pickup.x, pickup.y, 9);
  }
  const bob = pickup.landed ? Math.round(Math.sin(pickup.time * 0.1) * 1.5) : 0;
  drawItemIcon(painter, pickup.item, pickup.x, pickup.y + bob);
}

export function drawPickups(painter, pickups) {
  for (const pickup of pickups) {
    drawPickup(painter, pickup);
  }
}
