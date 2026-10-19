const TIPS = [
  '<b>Break crates</b> for weapons and rations. Weapons break after a number of hits; your fists never do.',
  'Raiders <b>flash red</b> just before they strike. Dash through the hit: you are invincible while dashing.',
  '<b>Launch</b> raiders with up or down + heavy, follow them into the air and keep hitting.',
  "A fifth light hit chases a knocked-back raider and launches them. Down + light sweeps low, under a Bulwark's shield.",
  'Dashing the wrong way? Hold the other direction to turn, or dash again to dash back.',
  'Up + light lifts you into the air with the raider. In the air, down + light bounces off their head, up to three times a jump.',
  'The thin bar under the combo counter shows how long you have to land the next hit.',
  'Landing hits and taking damage fill the <b>ULT</b> bar. When it is full, Shade Requiem hits every raider on screen.',
  '<b>Slingers</b> throw knives from a distance: jump or dash over them, or hit a knife back at them.',
  '<b>Bulwarks</b> block light hits from the front. Break the guard with a heavy, charged or launching attack, or get behind them.',
  'The boss marks the ground in <b>red</b> before a slam or a charge. Get out of the red.',
  'Too hard or too easy? Change the <b>difficulty</b> in Settings at any time.',
];

export function tipsHtml() {
  return `<ul class="tips">${TIPS.map((tip) => `<li>${tip}</li>`).join('')}</ul>`;
}
