import { createBot } from './bot.js';

export function runScenario(driver, scenario) {
  const bot = createBot(driver, scenario.scheduled);
  const samples = [];
  const renders = [];
  driver.act('play');
  for (let tick = 0; tick < scenario.ticks; tick++) {
    if (tick === scenario.spawnBossAt) {
      driver.spawn(scenario.boss ?? 'brute', 1);
    }
    bot.step(tick);
    driver.tick();
    driver.afterTick();
    if (tick % scenario.sampleEvery === 0) {
      samples.push({ tick, ...driver.snapshot() });
    }
    if (tick % scenario.renderEvery === 0) {
      renders.push({ tick, frame: driver.render() });
    }
  }
  return { samples, renders };
}
