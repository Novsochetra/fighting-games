import { actionButton, fillSlot, make, showSlot } from '../dom.js';
import { renderProgress } from '../parts/xp-meter.js';

const STATE_STRINGS = { done: 'chapterDone', current: 'chapterNow', locked: 'chapterLocked' };

function stateOf(chapter) {
  if (chapter.done) {
    return 'done';
  }

  return chapter.current ? 'current' : 'locked';
}

function chapterCard(view, chapter) {
  const { document } = view;
  const state = stateOf(chapter);
  const card = make(document, 'li', { className: `chapter-card is-${state}` });

  card.append(
    make(document, 'span', { className: 'chapter-number', text: view.number(chapter.number) }),
    make(document, 'span', {
      className: 'chapter-label',
      text: view.sayWith('chapterNumber', { number: chapter.number }),
    }),
    make(document, 'span', { className: 'chapter-title', text: view.text(chapter.title) }),
    make(document, 'span', { className: 'chapter-state', text: view.say(STATE_STRINGS[state]) }),
  );

  if (state === 'current') {
    card.setAttribute('aria-current', 'step');
  }

  return card;
}

// data: progressSummary(save, CHAPTERS); Play goes on with the chapter the story is in
export const CHAPTERS_SCREEN = {
  render(section, { data, view }) {
    const chapters = data.chapters ?? [];
    const playable = !data.finished && chapters.some((chapter) => chapter.current);

    fillSlot(
      section,
      'chapters',
      chapters.map((chapter) => chapterCard(view, chapter)),
    );
    renderProgress(section, { level: data.level ?? 1, xp: data.xp ?? 0 }, view);
    showSlot(section, 'story-done', Boolean(data.finished));
    actionButton(section, 'play-chapter').hidden = !playable;
  },
  act(action, _button, app) {
    if (action !== 'play-chapter') {
      return false;
    }

    const chapter = (app.current.data.chapters ?? []).find((item) => item.current);

    app.emit('play-chapter', { chapter: chapter?.id ?? null, number: chapter?.number ?? null });

    return true;
  },
};
