import { fillSlot, make } from '../dom.js';
import { moveName } from '../hero-moves.js';
import { goalsInOrder, scorerName } from '../match-result.js';

function goalRow(view, { goal, teams }) {
  const { document } = view;
  const row = make(document, 'li', { className: `goal-row side-${goal.team}` });
  const scorer = scorerName(teams, goal);

  row.classList.toggle('by-hero', Boolean(goal.byHero));
  row.append(
    make(document, 'span', {
      className: 'goal-minute',
      text: view.sayWith('minute', { minute: goal.minute }),
    }),
    make(document, 'span', { className: 'goal-team', text: teams[goal.team]?.short ?? '' }),
    make(document, 'span', { className: 'goal-scorer', text: scorer ? view.text(scorer) : '-' }),
  );

  if (goal.move) {
    row.append(
      make(document, 'span', { className: 'goal-move', text: view.text(moveName(goal.move)) }),
    );
  }

  return row;
}

export function renderGoals(section, data, view) {
  const teams = data.teams ?? [];
  const goals = goalsInOrder(data.goals);
  const rows = goals.map((goal) => goalRow(view, { goal, teams }));

  fillSlot(
    section,
    'goals',
    rows.length
      ? rows
      : [make(view.document, 'li', { className: 'goal-none', text: view.say('noGoals') })],
  );
}
