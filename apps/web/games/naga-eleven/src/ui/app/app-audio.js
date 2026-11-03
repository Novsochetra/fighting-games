// how loud each venue's crowd is, from a few kids on a village fence to a world final
const CROWDS = {
  'village-field': 0.3,
  'provincial-ground': 0.45,
  'city-school-stadium': 0.55,
  'national-stadium': 0.8,
  'asia-stadium': 0.9,
  'world-stadium': 1,
};

const MUSIC = { painted: 'title', card: 'hope', training: 'training', match: 'match' };

function musicFor(screen) {
  if (screen.kind === 'scene') {
    return screen.mood ?? 'calm';
  }

  return MUSIC[screen.kind];
}

// a match on screen has its crowd, a card over a still match keeps it, anything else is quiet
const crowdFor = (screen) =>
  screen.kind === 'match' || screen.kind === 'still' ? (CROWDS[screen.venue] ?? 0.6) : 0;

export function applyVolumes(app) {
  app.audio?.setVolumes({ sound: app.settings.sound / 10, music: app.settings.music / 10 });
}

// with no audio the game plays on in silence: every call below is safe without it
export function wireAudio(app, audio) {
  app.audio = audio;
  app.hear = (events, match) => audio.hear(events, match);
  app.sound = (cue, options) => audio.play(cue, options);
  app.music = (mood) => audio.setMusic(mood);
  app.onPlay = (screen) => {
    const mood = musicFor(screen);

    if (mood) {
      audio.setMusic(mood);
    }

    audio.setCrowd(crowdFor(screen));
  };
  applyVolumes(app);
}
