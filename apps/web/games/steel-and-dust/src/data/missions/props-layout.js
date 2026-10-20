import { hashInt } from '../../lib/math.js';
import { groundAt, isLevelUnder } from './terrain.js';

const PROP_SPACING = 150;
// half the width of the widest prop, so a prop never hangs over the edge of a hill or a step
const PROP_FOOTPRINT = 28;

function endWall(spec, { length, terrain }) {
  const x = length - 12;
  return { kind: spec.endWall ?? 'wall', x, y: groundAt(terrain, x) };
}

// a prop every so often along the road where it is level, then the wall that closes the road;
// the forests list no props and let their painted layers dress the road
export function layoutProps(spec, road) {
  const props = [];
  const kinds = spec.props;
  for (let spot = 110; kinds.length && spot < road.length - 140; spot += PROP_SPACING) {
    const hash = hashInt(spot + kinds.length * 31);
    const x = spot + (hash % 60);
    if (isLevelUnder(road.terrain, x, PROP_FOOTPRINT)) {
      props.push({ kind: kinds[hash % kinds.length], x, y: groundAt(road.terrain, x) });
    }
  }
  props.push(endWall(spec, road));
  return props;
}
