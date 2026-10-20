import { heroById } from '../../data/heroes.js';
import { MOVE_INPUTS, MOVE_ORDER, MOVE_TAGS } from '../../data/move-list.js';
import { heroMoves, styleOf } from '../../data/styles/index.js';
import { ultimateOf } from '../../data/ultimates/index.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { inputLabel, touchWords } from './key-label.js';

function weaponTabs(selected) {
  const tabs = Object.entries(WEAPONS)
    .map(
      ([id, weapon]) =>
        `<button type="button" data-w="${id}" aria-selected="${id === selected}">${weapon.name}</button>`,
    )
    .join('');
  return `<div class="tabs" id="wTabs">${tabs}</div>`;
}

function weaponSummary(weapon) {
  const breaks =
    weapon.durability === Infinity ? '' : ` Breaks after <b>${weapon.durability} hits</b>.`;
  return `<p class="wmeta"><b>${weapon.name}.</b> ${weapon.description}${breaks}</p>`;
}

function styleSummary(heroId) {
  const style = styleOf(heroId);
  return `<p class="wmeta"><b>${heroById(heroId).name}: ${style.name}.</b> ${style.summary}</p>`;
}

function moveRow(id, move, touch) {
  const hits = move.multiHit ? Math.ceil(move.active / move.multiHit) : 1;
  const tags = MOVE_TAGS.filter(([property]) => move[property])
    .map(([, label]) => `<span class="tag-l">${label}</span>`)
    .join('');
  const damage = hits > 1 ? `${move.damage}×${hits}` : move.damage;
  return `<tr><td>${inputLabel(MOVE_INPUTS[id], touch)}</td><td>${move.name}</td><td class="num">${damage}</td><td>${tags || '–'}</td></tr>`;
}

function ultimateRow(heroId, touch) {
  const ult = ultimateOf(heroId);
  const tags = '<span class="tag-l">Ultimate</span><span class="tag-l">Invincible</span>';
  return `<tr><td>${inputLabel('L', touch)} (full bar)</td><td>${ult.name}</td><td class="num">${ult.damageText}</td><td>${tags}</td></tr>`;
}

// the chosen Shade's take on the weapon: its style reshapes every move, and its ultimate closes the list
export function movesHtml({ weaponId, heroId, touch }) {
  const weapon = WEAPONS[weaponId];
  const moves = heroMoves(heroId, weaponId);
  const rows = MOVE_ORDER.map((id) => moveRow(id, moves[id], touch)).join('');
  const header =
    '<thead><tr><th>Input</th><th>Move</th><th style="text-align:right">Dmg</th><th>Notes</th></tr></thead>';
  const tries = weapon.tryCombos
    .map((combo) => `<p class="try"><b>TRY</b>${touchWords(combo, touch)}</p>`)
    .join('');
  const table = `<table class="moves">${header}<tbody>${rows}${ultimateRow(heroId, touch)}</tbody></table>`;
  return `${weaponTabs(weaponId)}${styleSummary(heroId)}${weaponSummary(weapon)}${table}${tries}`;
}
