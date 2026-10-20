import { describe, expect, it } from 'vitest';
import { controlsHtml } from '../../../src/ui/help/controls.js';
import { inputLabel, touchWords } from '../../../src/ui/help/key-label.js';
import { movesHtml } from '../../../src/ui/help/moves.js';
import { soundTestHtml } from '../../../src/ui/help/sound-test.js';

describe('help text', () => {
  it('names keys for keyboard players and buttons for touch players', () => {
    expect(inputLabel('↑ + J', false)).toBe('<kbd class="k">↑</kbd> + <kbd class="k">J</kbd>');
    expect(inputLabel('J J K', true)).toContain('ATTACK');
    expect(touchWords('J J K', true)).toBe('ATTACK ATTACK HEAVY');
    expect(touchWords('J J K', false)).toBe('J J K');
  });

  it('lists the touch controls first on touch screens', () => {
    expect(controlsHtml({ touch: true, stick: 'fixed' }).indexOf('Touch')).toBeLessThan(
      controlsHtml({ touch: true, stick: 'fixed' }).indexOf('Keyboard'),
    );
    expect(controlsHtml({ touch: false, stick: 'float' })).toContain('drag anywhere');
  });

  it('shows every move with its damage and notes', () => {
    const html = movesHtml({ weaponId: 'spear', heroId: 'moss', touch: false });
    expect(html).toContain('Cyclone');
    expect(html).toContain('Pulls in');
    expect(html).toContain('Breaks after <b>40 hits</b>');
    expect(html).toContain('Thornwood Requiem');
  });

  it("shows the chosen Shade's style, signatures and ultimate", () => {
    const blue = movesHtml({ weaponId: 'sword', heroId: 'blue', touch: false });
    expect(blue).toContain('Blue Shade: Frost Iai.');
    expect(blue).toContain('Freezes');
    expect(blue).toContain('Absolute Zero');
    const firefly = movesHtml({ weaponId: 'fists', heroId: 'firefly', touch: false });
    expect(firefly).toContain('Fireflies');
    expect(firefly).toContain('Swarm Nova');
    expect(firefly).not.toContain('Thornwood Requiem');
  });

  it('offers every take of the voices in the sound test', () => {
    const html = soundTestHtml();
    expect(html).toContain('Scream 5');
    expect(html).toContain('data-snd="voiceBossKo"');
  });
});
