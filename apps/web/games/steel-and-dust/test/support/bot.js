import { compileProgram, PROGRAMS, usesHeavy } from './bot-programs.js';

const REACH = 26;
const RESUME_AFTER = 20;
const CONTINUE_AFTER = 40;

function nearestEnemy(view) {
  let best = null;
  for (const enemy of view.enemies) {
    if (enemy.state === 'ko') {
      continue;
    }
    if (!best || Math.abs(enemy.x - view.player.x) < Math.abs(best.x - view.player.x)) {
      best = enemy;
    }
  }
  return best;
}

export function createBot(driver, scheduled) {
  const bot = { events: [], programIndex: 0, heldDirection: 0, modeSince: 0, lastMode: null };

  function holdDirection(direction) {
    if (direction === bot.heldDirection) {
      return;
    }
    if (bot.heldDirection) {
      driver.release(bot.heldDirection < 0 ? 'left' : 'right');
    }
    if (direction) {
      driver.press(direction < 0 ? 'left' : 'right');
    }
    bot.heldDirection = direction;
  }

  // a step too tall to walk up is jumped
  function walkToward(direction, view) {
    holdDirection(direction);
    if (view.wallAhead) {
      driver.tap('jump');
    }
  }

  // with too little bar for a heavy, a player plays light to fill it
  function nextProgram(view) {
    for (let tries = 0; tries < PROGRAMS.length; tries++) {
      const program = PROGRAMS[bot.programIndex % PROGRAMS.length];
      bot.programIndex += 1;
      if (view.canHeavy || !usesHeavy(program)) {
        return program;
      }
    }
    return PROGRAMS[0];
  }

  function startProgram(tick, view) {
    holdDirection(0);
    bot.events = compileProgram(nextProgram(view), tick + 1);
  }

  function runEvents(tick) {
    const due = bot.events.filter((event) => event.tick === tick);
    bot.events = bot.events.filter((event) => event.tick > tick);
    for (const event of due) {
      if (event.type === 'press') {
        driver.press(event.key);
      } else {
        driver.release(event.key);
      }
    }
  }

  function fight(tick, view) {
    if (bot.events.length) {
      runEvents(tick);
      return;
    }
    if (view.meter >= 100) {
      driver.tap('ult');
      return;
    }
    const target = nearestEnemy(view);
    if (!target) {
      walkToward(1, view);
      return;
    }
    const dx = target.x - view.player.x;
    if (Math.abs(dx) > REACH) {
      walkToward(Math.sign(dx), view);
      return;
    }
    startProgram(tick, view);
  }

  function handleMenus(tick, view) {
    if (view.mode !== bot.lastMode) {
      bot.lastMode = view.mode;
      bot.modeSince = tick;
    }
    const waited = tick - bot.modeSince;
    if (view.mode === 'pause' && waited === RESUME_AFTER) {
      driver.act('resume');
    }
    if (view.mode === 'over' && waited === CONTINUE_AFTER) {
      driver.act('continue');
    }
  }

  return {
    step(tick) {
      const view = driver.observe();
      handleMenus(tick, view);
      for (const key of scheduled[tick] ?? []) {
        driver.tap(key);
      }
      if (view.mode === 'play') {
        fight(tick, view);
      }
    },
  };
}
