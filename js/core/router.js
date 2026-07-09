const listeners = [];

function parseHash() {
  const raw = window.location.hash.replace('#/', '') || 'home';
  const [route, param] = raw.split('/');
  return { route, param };
}

export function initRouter() {
  window.addEventListener('hashchange', () => {
    const { route, param } = parseHash();
    listeners.forEach((cb) => cb(route, param));
  });
}

export function onRouteChange(cb) {
  listeners.push(cb);
}

export function navigateTo(route, param) {
  window.location.hash = param ? `/${route}/${param}` : `/${route}`;
}

export function getCurrentRoute() {
  return parseHash();
}
