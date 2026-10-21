// the loading screen's markup is in index.html, so it is up from the first paint, before any script;
// this only moves Bokator and the bar, and fades the screen in and out
function drawPercent(element, parts, percent) {
  element.style.setProperty('--progress', String(percent / 100));
  parts.label.textContent = `${percent}%`;
  parts.bar.setAttribute('aria-valuenow', String(percent));
}

function drawPhase(element, phase) {
  const down = phase === 'hidden' || phase === 'pending';
  if (!down && element.hidden) {
    element.hidden = false;
    // a layout in between, so the fade in starts from transparent
    element.getBoundingClientRect();
  }
  element.classList.toggle('done', down);
  element.classList.toggle('complete', phase === 'complete');
}

export function createLoaderView(element) {
  const parts = {
    bar: element.querySelector('[role="progressbar"]'),
    label: element.querySelector('.loader-percent'),
  };
  const drawn = { percent: null, phase: null };
  // once faded out it leaves the page, so Bokator's walk costs nothing while the game runs
  element.addEventListener('transitionend', (event) => {
    if (event.target === element && element.classList.contains('done')) {
      element.hidden = true;
    }
  });
  return {
    // the words are kept out of sight until the pixel font is in
    showWords() {
      element.classList.add('lettered');
    },
    render(phase, percent) {
      if (percent !== drawn.percent) {
        drawPercent(element, parts, percent);
        drawn.percent = percent;
      }
      if (phase !== drawn.phase) {
        drawPhase(element, phase);
        drawn.phase = phase;
      }
    },
  };
}
