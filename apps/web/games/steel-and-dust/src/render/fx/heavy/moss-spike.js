// a small bramble spike in the Thornwood's own look (assets/sprites/fx/thorns.png): a navy edge, a
// dark green body lit on one side, narrowing to a pale point, leaning as it rises
function spikeRow(painter, { x, y, width, art }) {
  if (width === 3) {
    painter.use(art.outline).rect(x - 1, y, 1, 1);
    painter.use(art.thorn).rect(x, y, 1, 1);
    painter.use(art.thornLight).rect(x + 1, y, 1, 1);
    return;
  }
  if (width === 2) {
    painter.use(art.outline).rect(x - 1, y, 1, 1);
  }
  painter.use(art.thornLight).rect(x, y, 1, 1);
}

// three pixels wide at the root, two through the middle, one to the point
function widthAt(share) {
  if (share < 0.34) {
    return 3;
  }
  return share < 0.67 ? 2 : 1;
}

export function drawSpike(painter, { x, y, height, lean, art, tip = art.thornTip }) {
  for (let row = 0; row < height; row++) {
    const share = row / height;
    const width = widthAt(share);
    spikeRow(painter, { x: x + Math.round((lean * row) / height), y: y - row - 1, width, art });
  }
  painter.use(tip).rect(x + lean, y - height - 1, 1, 1);
}
