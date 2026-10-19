function holdsUp(buffer, held) {
  return buffer.up || held.up;
}

function holdsDown(buffer, held) {
  return buffer.down || held.down;
}

function nextInChain(buffer, current) {
  return current.next[buffer.action] || null;
}

export function pickAirMove(buffer, held, current) {
  const down = holdsDown(buffer, held);
  if (buffer.action === 'heavy' && down && !current?.dive) {
    return 'ADK';
  }
  if (buffer.action === 'light' && down) {
    return 'ADL';
  }
  if (current) {
    return nextInChain(buffer, current);
  }
  return buffer.action === 'heavy' ? 'AK' : 'AL';
}

function wantsLauncher(buffer, held, current) {
  const vertical = holdsUp(buffer, held) || holdsDown(buffer, held);
  return buffer.action === 'heavy' && vertical && !current?.launch;
}

// up or down inside a string needs a fresh push, so a held direction does not hijack the chain
function wantsLightSpecial(buffer, held, current, { direction, moveId }) {
  const holding = direction === 'down' ? holdsDown(buffer, held) : holdsUp(buffer, held);
  const fresh = direction === 'down' ? buffer.downNew : buffer.upNew;
  return buffer.action === 'light' && holding && (!current || fresh) && current?.id !== moveId;
}

export function pickGroundMove(buffer, held, current) {
  if (wantsLauncher(buffer, held, current)) {
    return 'UK';
  }
  if (wantsLightSpecial(buffer, held, current, { direction: 'down', moveId: 'DL' })) {
    return 'DL';
  }
  if (wantsLightSpecial(buffer, held, current, { direction: 'up', moveId: 'UL' })) {
    return 'UL';
  }
  if (current) {
    return nextInChain(buffer, current);
  }
  return buffer.action === 'heavy' ? 'K1' : 'L1';
}
