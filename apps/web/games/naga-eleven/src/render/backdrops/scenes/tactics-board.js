import { fillRect, hline, plot, vline } from '../raster.js';
import { line, ring } from '../shapes.js';

// the coach's whiteboard: a pitch in blue marker, our Os, their Xs and the arrows of the plan
// `colors` [frame, white, blue, red, dark]

function paintCross(raster, { x, y }, color) {
  line(raster, { from: { x: x - 1, y: y - 1 }, to: { x: x + 1, y: y + 1 } }, color);
  line(raster, { from: { x: x + 1, y: y - 1 }, to: { x: x - 1, y: y + 1 } }, color);
}

function paintArrow(raster, { from, to }, color) {
  line(raster, { from, to }, color);
  plot(raster, to.x - 1, to.y - 1, color);
  plot(raster, to.x - 1, to.y + 1, color);
}

const OURS = [0.15, 0.5, 0.3, 0.25, 0.3, 0.75, 0.42, 0.5];
const THEIRS = [0.62, 0.3, 0.62, 0.7, 0.75, 0.5, 0.86, 0.4];

const spotsOf = (pitch, flat) =>
  flat.flatMap((value, i) =>
    i % 2 === 0
      ? [
          {
            x: Math.round(pitch.x + pitch.width * value),
            y: Math.round(pitch.y + pitch.height * flat[i + 1]),
          },
        ]
      : [],
  );

function paintPitch(raster, { pitch, color }) {
  const middle = { x: pitch.x + pitch.width / 2, y: pitch.y + pitch.height / 2 };

  [pitch.y, pitch.y + pitch.height].forEach((rowY) => {
    hline(raster, { x: pitch.x, y: rowY, length: pitch.width }, color);
  });
  [pitch.x, pitch.x + pitch.width, middle.x].forEach((columnX) => {
    vline(raster, { x: columnX, y: pitch.y, length: pitch.height }, color);
  });
  ring(raster, { ...middle, radius: 6 }, color);
}

export function paintTacticsBoard(raster, { x, y, width, height, colors }) {
  const pitch = { x: x + 6, y: y + 6, width: width - 12, height: height - 14 };
  const at = (across, down) => ({ x: pitch.x + across, y: pitch.y + down });

  fillRect(raster, { x: x - 2, y: y - 2, width: width + 4, height: height + 4 }, colors[4]);
  fillRect(raster, { x, y, width, height }, colors[1]);
  hline(raster, { x, y: y + height - 1, length: width }, colors[0]);
  fillRect(raster, { x: x - 2, y: y + height + 2, width: width + 4, height: 2 }, colors[0]);
  paintPitch(raster, { pitch, color: colors[2] });
  spotsOf(pitch, OURS).forEach((spot) => ring(raster, { ...spot, radius: 1.5 }, colors[2]));
  spotsOf(pitch, THEIRS).forEach((spot) => paintCross(raster, spot, colors[3]));
  paintArrow(raster, { from: at(26, 24), to: at(50, 14) }, colors[3]);
  paintArrow(raster, { from: at(14, 12), to: at(36, 34) }, colors[3]);
}
