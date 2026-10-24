export const STATIC_METHODS = ['GET', 'HEAD'];

export function allowedMethods(handlers) {
  const methods = Object.keys(handlers);
  return methods.includes('GET') ? [...methods, 'HEAD'] : methods;
}

export function chooseRoute(routes, { method, pathname }) {
  const route = routes.find((candidate) => candidate.path === pathname);
  if (!route) {
    return STATIC_METHODS.includes(method)
      ? { type: 'static' }
      : { type: 'method-not-allowed', allow: STATIC_METHODS };
  }
  const handle = route.handlers[method === 'HEAD' ? 'GET' : method];
  return handle
    ? { type: 'handler', handle }
    : { type: 'method-not-allowed', allow: allowedMethods(route.handlers) };
}
