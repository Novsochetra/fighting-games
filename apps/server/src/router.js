const ALLOWED_METHODS = new Set(['GET', 'HEAD']);

export function chooseRoute(routes, { method, pathname }) {
  if (!ALLOWED_METHODS.has(method)) {
    return { type: 'method-not-allowed' };
  }
  const route = routes.find((candidate) => candidate.path === pathname);
  return route ? { type: 'handler', handle: route.handle } : { type: 'static' };
}
