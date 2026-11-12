import { drawPerson, drawStool } from './figures.js';

// where a customer comes into view, in widths of a stool from the left of the row
const DOOR = 6.2;
const LEAVING_MS = 320;
const GOING_MS = 640;
const STORMING_MS = 760;
const LEAVING_FOR = { 'is-going': GOING_MS, 'is-storming': STORMING_MS };

function guestOf(document, customer) {
  const guest = document.createElement('span');
  const body = document.createElement('span');

  guest.className = `guest guest-${customer.kind}`;
  body.className = 'guest-body';
  body.append(drawPerson(document, customer.kind));
  guest.append(body);

  return guest;
}

function seat(guest, index) {
  if (guest.classList.contains('is-walking')) {
    guest.classList.remove('is-walking');
    guest.classList.add('is-seated');
  }

  guest.classList.toggle('is-front', index === 0);
  guest.style.transform = '';
  guest.style.setProperty('--seat', String(index));
}

// The walker's place is worked out from the run each frame, so a pause or a lock holds them
// where they stand: their walk to the first free stool is the only clock on the screen.
function walk(guest, { left, total }, seats) {
  const along = seats + (DOOR - seats) * (left / total);

  guest.classList.add('is-walking');
  guest.classList.remove('is-front');
  guest.style.transform = `translateX(${along * 100}%)`;
}

function buildStools(row) {
  const stools = [];

  for (let i = 0; i < 5; i++) {
    const stool = row.ownerDocument.createElement('span');

    stool.className = 'stool';
    stool.append(drawStool(row.ownerDocument));
    stools.push(stool);
  }

  row.replaceChildren(...stools);

  return stools;
}

// those who got up go on being drawn until their walk away is over
function createDepartures() {
  const how = new Map();
  const words = new Map();
  let leaving = [];

  function sayOnTheWay(guest, said) {
    const bubble = guest.ownerDocument.createElement('span');

    bubble.className = 'guest-bubble';
    bubble.textContent = said;
    guest.append(bubble);
  }

  return {
    nextDoor: (customer) => how.set(customer.id, 'is-going'),

    storming(customer, said) {
      how.set(customer.id, 'is-storming');
      words.set(customer.id, said);
    },

    send(guest, id, now) {
      const way = how.get(id) ?? 'is-leaving';

      if (words.has(id)) {
        sayOnTheWay(guest, words.get(id));
      }

      how.delete(id);
      words.delete(id);
      guest.classList.remove('is-front', 'is-restless');
      guest.classList.add(way);
      leaving.push({ guest, at: now + (LEAVING_FOR[way] ?? LEAVING_MS) });
    },

    sweep(now) {
      leaving.filter((gone) => gone.at <= now).forEach((gone) => gone.guest.remove());
      leaving = leaving.filter((gone) => gone.at > now);
    },

    clear() {
      how.clear();
      words.clear();
      leaving = [];
    },
  };
}

function markLastStool(stools, run) {
  const last = run.phase !== 'closed' && run.queue.length === stools.length - 1;

  stools.forEach((stool, i) => stool.classList.toggle('is-last', last && i === run.queue.length));
}

export function createStoolsView({ row }) {
  const document = row.ownerDocument;
  const stools = buildStools(row);
  const guests = new Map();
  const departures = createDepartures();

  function guestFor(customer) {
    if (!guests.has(customer.id)) {
      guests.set(customer.id, guestOf(document, customer));
      row.append(guests.get(customer.id));
    }

    return guests.get(customer.id);
  }

  return {
    nextDoor: departures.nextDoor,
    storming: departures.storming,

    restless(isRestless) {
      row.querySelector('.guest.is-front')?.classList.toggle('is-restless', isRestless);
    },

    sync(run, now) {
      const here = new Set(run.queue.map((customer) => customer.id));

      run.queue.forEach((customer, i) => seat(guestFor(customer), i));

      if (run.arriving && run.phase !== 'closed') {
        here.add(run.arriving.customer.id);
        walk(guestFor(run.arriving.customer), run.arriving, run.queue.length);
      }

      for (const id of [...guests.keys()].filter((gone) => !here.has(gone))) {
        departures.send(guests.get(id), id, now);
        guests.delete(id);
      }

      departures.sweep(now);
      markLastStool(stools, run);
    },

    clear() {
      row.querySelectorAll('.guest').forEach((guest) => guest.remove());
      guests.clear();
      departures.clear();
    },
  };
}
