export const scene = (backdrop, mood, lines) => ({ backdrop, mood, lines });

export const say = (speaker, mood, side, text) => ({ speaker, mood, side, text });

export const narrate = (text) => ({ speaker: 'narrator', mood: 'neutral', side: 'left', text });

// a villager has no face of their own, so one who speaks more than once is named to keep one
export const villager = (who, text) => ({
  speaker: 'villager',
  mood: 'happy',
  side: 'right',
  ...who,
  text,
});
