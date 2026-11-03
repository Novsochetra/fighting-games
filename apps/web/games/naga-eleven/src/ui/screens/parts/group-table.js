import { fillSlot, make, showSlot } from '../dom.js';
import { tableRowsOf } from '../table-rows.js';

const NUMBER_CELLS = ['played', 'won', 'drawn', 'lost'];

function cell(view, text, className) {
  return make(view.document, 'td', { className, text });
}

function tableRow(view, row) {
  const line = make(view.document, 'tr', { className: 'table-row' });

  line.classList.toggle('is-own', row.own);
  line.classList.toggle('is-through', row.through);
  line.append(
    cell(view, view.number(row.rank), 'cell-rank'),
    cell(view, row.short, 'cell-short'),
    cell(view, view.text(row.name), 'cell-name'),
    ...NUMBER_CELLS.map((key) => cell(view, view.number(row[key]), 'cell-number')),
    cell(view, view.number(row.diff), 'cell-number'),
    cell(view, view.number(row.points), 'cell-points'),
  );

  return line;
}

// only a group match has a table to show
export function renderGroup(section, group, view) {
  const rows = group?.rows ?? [];

  showSlot(section, 'group', rows.length > 0);
  fillSlot(
    section,
    'table',
    tableRowsOf(rows, group ?? {}).map((row) => tableRow(view, row)),
  );
}
