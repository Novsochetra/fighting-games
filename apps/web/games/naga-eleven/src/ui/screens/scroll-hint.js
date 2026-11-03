// a screen taller than the phone docks its buttons at its foot (styles/buttons.css) and points
// down while there is more below; a pixel's slack keeps a rounded height from counting as more
const SLACK = 1;

export function markScroll(section) {
  if (!section) {
    return;
  }

  const { scrollTop, scrollHeight, clientHeight } = section;
  const scrollable = scrollHeight > clientHeight + SLACK;

  section.classList.toggle('is-scrollable', scrollable);
  section.classList.toggle(
    'has-more',
    scrollable && scrollTop + clientHeight < scrollHeight - SLACK,
  );
}

const screenOf = (node) => node?.closest?.('.screen') ?? null;

// scrolling, a turned phone, a font come in or a screen filled again each change what is below
export function watchScroll(root) {
  const ResizeWatch = root.ownerDocument.defaultView?.ResizeObserver;

  root.addEventListener('scroll', (event) => markScroll(screenOf(event.target)), {
    capture: true,
    passive: true,
  });

  if (typeof ResizeWatch !== 'function') {
    return;
  }

  const watch = new ResizeWatch((entries) => {
    for (const entry of entries) {
      markScroll(screenOf(entry.target));
    }
  });

  for (const node of root.querySelectorAll('.screen, .screen > .panel')) {
    watch.observe(node);
  }
}
