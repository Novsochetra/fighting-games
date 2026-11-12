const BLINK_EVERY = 3.4;
const BLINK_FOR = 0.14;
const HOP_FOR = 0.28;
const HOP_HEIGHT = 3;

export function createPiggy() {
  return { clock: 0, mood: 'idle', moodLeft: 0, hopLeft: 0 };
}

export function cheer(piggy, seconds = 0.7) {
  piggy.mood = 'happy';
  piggy.moodLeft = seconds;
  piggy.hopLeft = HOP_FOR;
}

export function upset(piggy, seconds = 0.9) {
  piggy.mood = 'sad';
  piggy.moodLeft = seconds;
}

// each coin landing gives a small hop, without cutting a hop short
export function gulp(piggy) {
  if (piggy.hopLeft <= 0) {
    piggy.hopLeft = HOP_FOR;
  }
}

export function stepPiggy(piggy, seconds) {
  piggy.clock += seconds;
  piggy.moodLeft = Math.max(0, piggy.moodLeft - seconds);
  piggy.hopLeft = Math.max(0, piggy.hopLeft - seconds);

  if (piggy.moodLeft === 0) {
    piggy.mood = 'idle';
  }
}

export function piggyPose(piggy) {
  const blinking = piggy.mood === 'idle' && piggy.clock % BLINK_EVERY < BLINK_FOR;
  const hop = Math.sin((piggy.hopLeft / HOP_FOR) * Math.PI);

  return { mood: blinking ? 'blink' : piggy.mood, lift: Math.round(hop * HOP_HEIGHT) };
}
