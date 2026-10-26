// Whether the worker has taken over (true) or given up on the build it was installing (false).
function settled(worker) {
  return new Promise((resolve) => {
    const onState = () => {
      if (worker.state === 'activated' || worker.state === 'redundant') {
        worker.removeEventListener('statechange', onState);
        resolve(worker.state === 'activated');
      }
    };

    worker.addEventListener('statechange', onState);
    onState();
  });
}

// The arcade's pages come from what its worker keeps, so a reload opens the new build only once the
// worker holding it has taken over: this has the worker fetch the newest build and waits for it to,
// true once it has (or where no worker keeps the arcade, so a reload goes to the server), false
// where it could not (offline, or a download cut short).
export async function takeNewestWorker(workers, root) {
  try {
    const registration = await workers?.getRegistration(root.href);

    if (!registration) {
      return true;
    }

    await registration.update();

    const incoming = registration.installing ?? registration.waiting;

    return incoming ? await settled(incoming) : true;
  } catch {
    return false;
  }
}
