import { make } from '../dom.js';

const FORMAT_STRINGS = { 7: 'format7', 11: 'format11' };

function kitChip(document, kit) {
  const chip = make(document, 'span', { className: 'kit-chip' });

  chip.setAttribute('aria-hidden', 'true');
  chip.append(
    make(document, 'span', { className: 'kit-shirt' }),
    make(document, 'span', { className: 'kit-shorts' }),
  );

  if (kit) {
    chip.style.setProperty('--kit-shirt', kit.shirt);
    chip.style.setProperty('--kit-shorts', kit.shorts);
    chip.style.setProperty('--kit-trim', kit.trim);
  }

  return chip;
}

export function teamBadge(view, team, kit, { format = false } = {}) {
  const { document } = view;

  if (!team) {
    return [make(document, 'span', { className: 'team-name', text: '-' })];
  }

  const nodes = [
    kitChip(document, kit),
    make(document, 'span', { className: 'team-short', text: team.short ?? '' }),
    make(document, 'span', { className: 'team-name', text: view.text(team.name) }),
  ];

  if (format && FORMAT_STRINGS[team.format]) {
    nodes.push(
      make(document, 'span', {
        className: 'team-format',
        text: view.say(FORMAT_STRINGS[team.format]),
      }),
    );
  }

  return nodes;
}
