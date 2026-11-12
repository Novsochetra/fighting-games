// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { stageOf } from '../../../src/data/stages.js';
import { openPage } from '../../support/open-page.js';

// The run pays a bill at the stage it was asked at, but the stage opens with that same payment,
// and the page priced the sale chip at the new stage: the sign ran 500 riel ahead of the takings
// from the 8th bill on, and further at every stage after.
describe('the payment that opens a new stage', () => {
  it('sends up chips that add up to what the run took', () => {
    const page = openPage();

    while (page.game.run.served < stageOf(0).from + 20) {
      page.serve();
    }

    page.wait(2000);

    expect(page.game.run.stage).toBeGreaterThan(2);
    expect(page.stage.banked).toBe(page.game.run.takings);
  });
});
