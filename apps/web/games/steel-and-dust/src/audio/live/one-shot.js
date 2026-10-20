function releaseWhenEnded({ nodes, sources }) {
  let playing = sources.length;
  const release = () => {
    for (const node of nodes) {
      node.disconnect();
    }
  };
  if (!playing) {
    release();
    return;
  }
  for (const source of sources) {
    source.onended = () => {
      playing -= 1;
      if (!playing) {
        release();
      }
    };
  }
}

// builds a one-shot sound (a live effect, one step of the music) that cleans up after itself: once
// its last source has ended, every node it built is disconnected. Safari keeps connected nodes in
// the audio graph, so a long session would otherwise pile up thousands of them and stutter
export function playOneShot(audio, build) {
  const live = { context: audio.context, chain: audio.chain, nodes: [], sources: [] };
  try {
    build(live);
  } finally {
    releaseWhenEnded(live);
  }
}
