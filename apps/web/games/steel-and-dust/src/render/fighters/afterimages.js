import { GHOST_PALETTE } from '../../art/tinted-palettes.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { drawBody } from './body.js';
import { drawHeroFrame } from './hero-sprites.js';

export function drawHeroAfterimages(painter, sheet, fighter) {
  const row = WEAPONS[fighter.weapon.id].spriteRow;
  const trail =
    fighter.weapon.id === 'sword' ? sheet.theme.blade : WEAPONS[fighter.weapon.id].trailColor;
  for (const image of fighter.afterimages) {
    painter.alpha(((image.color ? 0.5 : 0.28) * image.life) / 12);
    drawHeroFrame(painter, sheet, {
      frame: image.sprite || ['dash', 2],
      x: image.x,
      y: image.y,
      facing: image.facing,
      tint: image.color || trail,
      row: image.row !== undefined ? image.row : row,
    });
  }
  painter.alpha(1);
}

export function drawSkeletonAfterimages(painter, fighter) {
  for (const image of fighter.afterimages) {
    painter.alpha(image.life / 22);
    const echo = { ...fighter, facing: image.facing, joints: image.joints, scarf: null };
    drawBody(painter, {
      fighter: echo,
      joints: image.joints,
      pose: image.pose,
      palette: GHOST_PALETTE,
      ghost: true,
      headStyle: fighter.palette.headStyle,
    });
  }
  painter.alpha(1);
}
