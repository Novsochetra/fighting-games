import { BLACK } from '../../art/backdrops/black.js';
import { VIEW } from '../../config.js';
import { drawLayer, setBackdropCanvasFactory } from './cache.js';
import { createRaster } from './raster.js';
import { AIRPORT } from './scenes/airport.js';
import { ANGKOR_SUNRISE } from './scenes/angkor-sunrise.js';
import { CITY_STREET } from './scenes/city-street.js';
import { DRESSING_ROOM } from './scenes/dressing-room.js';
import { FEDERATION_OFFICE } from './scenes/federation-office.js';
import { HIGH_SCHOOL } from './scenes/high-school.js';
import { HOME_NIGHT } from './scenes/home-night.js';
import { HOTEL_NIGHT } from './scenes/hotel-night.js';
import { SCHOOL_YARD } from './scenes/school-yard.js';
import { STADIUM_TUNNEL } from './scenes/stadium-tunnel.js';
import { TEMPLE_DAWN } from './scenes/temple-dawn.js';
import { TRAINING_GROUND } from './scenes/training-ground.js';
import { TROPHY_STAGE } from './scenes/trophy-stage.js';
import { VILLAGE_DAWN } from './scenes/village-dawn.js';
import { VILLAGE_DUSK } from './scenes/village-dusk.js';
import { VILLAGE_TV } from './scenes/village-tv.js';

export { setBackdropCanvasFactory };

// each scene paints its still layer once a frame of its slow motion (`frameOf`), and draws what
// moves every tick over it (`overlay`)
const SCENES = {
  'village-dawn': VILLAGE_DAWN,
  'village-dusk': VILLAGE_DUSK,
  'home-night': HOME_NIGHT,
  'school-yard': SCHOOL_YARD,
  'city-street': CITY_STREET,
  'high-school': HIGH_SCHOOL,
  'temple-dawn': TEMPLE_DAWN,
  'training-ground': TRAINING_GROUND,
  'dressing-room': DRESSING_ROOM,
  'federation-office': FEDERATION_OFFICE,
  airport: AIRPORT,
  'hotel-night': HOTEL_NIGHT,
  'stadium-tunnel': STADIUM_TUNNEL,
  'village-tv': VILLAGE_TV,
  'trophy-stage': TROPHY_STAGE,
  'angkor-sunrise': ANGKOR_SUNRISE,
};

export const BACKDROP_IDS = [...Object.keys(SCENES), 'black'];

function paintedLayer(scene, frame) {
  const raster = createRaster();

  scene.paint(raster, frame);

  return raster;
}

// fills the whole view; an id with no scene of its own draws black
export function drawBackdrop(context, id, { tick = 0 } = {}) {
  const scene = SCENES[id];

  context.save();
  context.imageSmoothingEnabled = false;
  context.fillStyle = BLACK;
  context.fillRect(0, 0, VIEW.width, VIEW.height);

  if (scene) {
    const frame = scene.frameOf ? scene.frameOf(tick) : 0;

    drawLayer(context, { key: `${id}:${frame}`, paint: () => paintedLayer(scene, frame) });
    scene.overlay?.(context, tick);
  }

  context.restore();
}
