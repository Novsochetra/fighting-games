const TIPS = [
  '<b>Break crates</b> for rations that heal you.',
  'Raiders <b>flash red</b> just before they strike. Dash through the hit: you are invincible while dashing.',
  '<b>Launch</b> raiders with up or down + heavy, follow them into the air and keep hitting.',
  "A fifth light hit chases a knocked-back raider and launches them. Down + light sweeps low, under a Bulwark's shield.",
  'Dashing the wrong way? Hold the other direction to turn, or dash again to dash back.',
  'Up + light lifts you into the air with the raider. In the air, down + light bounces off their head, up to three times a jump.',
  'The thin bar under the combo counter shows how long you have to land the next hit.',
  'Each hero has four <b>techniques</b> of its own, on every weapon: heavy then light (K J), K K J, K K K J, and Air K J. The help lists them for your hero.',
  "Landing hits and taking damage fill the <b>ULT</b> bar. When it is full, your hero's own ultimate hits every raider on screen.",
  'Pick your <b>hero</b> after pressing Play. Each one fights in its own style: Moss raises thorns, Firefly looses fireflies, Antler sends spirit stags, Blue freezes raiders solid, Ember sets them burning, Bokator sends a golden lion pouncing and the Angkor Warrior calls carved soldiers out of the stone.',
  '<b>Knife Slingers</b> and <b>Crossbow Sentries</b> shoot from a distance: jump or dash over the shot, or hit it back at them.',
  '<b>Fire-Pot Bombers</b> lob pots that burst into fire. Step out of the flames.',
  'The <b>Mirage Witch</b> and the <b>Dune Assassin</b> vanish in a puff of sand. The witch runs away; the assassin appears behind you.',
  '<b>Sand Scorpions</b> are low to the ground: sweep them with down + light, or bounce on them from the air.',
  'The <b>Brass Juggernaut</b> shrugs off small hits. Launch it or use heavy and charged attacks.',
  '<b>Bulwarks</b> block light hits from the front. Break the guard with a heavy, charged or launching attack, or get behind them.',
  'Bosses you have beaten come back to guard later roads, and the Bayon Guardian waits at the very end. Every boss marks the ground in <b>red</b> before a slam or a charge. Get out of the red.',
  'Too hard or too easy? Change the <b>difficulty</b> in Settings at any time.',
];

export function tipsHtml() {
  return `<ul class="tips">${TIPS.map((tip) => `<li>${tip}</li>`).join('')}</ul>`;
}
