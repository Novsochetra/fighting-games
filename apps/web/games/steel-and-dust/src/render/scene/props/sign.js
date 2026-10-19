import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';
import { drawText } from '../../text/draw-text.js';

const SIGN = PROP_COLORS.sign;

export function drawSign(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 1, y - 26, 3, 26);
  painter.use(SIGN.post).rect(x, y - 25, 1, 25);
  painter.use(COLORS.outline).rect(x - 15, y - 30, 30, 12);
  painter.use(SIGN.board).rect(x - 14, y - 29, 28, 10);
  painter.use(SIGN.boardLight).rect(x - 14, y - 29, 28, 1);
  drawText(painter, 'DANGER', { x, y: y - 27, color: SIGN.text, align: 'center', shadow: null });
}
