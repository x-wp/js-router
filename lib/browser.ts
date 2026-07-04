import type { RouteList } from './interfaces';
import { WpRouter } from './wp-router';

export interface BrowserWpRouter {
  (routes: RouteList, propagate?: boolean): WpRouter;
  fire(route: string, event: 'init' | 'finalize', propagate?: boolean): boolean;
  loadEvents(propagate?: boolean): void;
  register(routes: RouteList): WpRouter;
  router: WpRouter;
}

interface GlobalWithWpRouter {
  wpRouter?: unknown;
}

const getGlobalScope = (): GlobalWithWpRouter | undefined => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  return globalThis as GlobalWithWpRouter;
};

const isBrowserWpRouter = (value: unknown): value is BrowserWpRouter =>
  typeof value === 'function' &&
  typeof (value as BrowserWpRouter).fire === 'function' &&
  typeof (value as BrowserWpRouter).loadEvents === 'function' &&
  typeof (value as BrowserWpRouter).register === 'function' &&
  (value as BrowserWpRouter).router !== null &&
  typeof (value as BrowserWpRouter).router === 'object';

const createBrowserWpRouter = (): BrowserWpRouter => {
  const router = new WpRouter({});

  const api = ((routes: RouteList, propagate = false): WpRouter => {
    api.register(routes);
    api.loadEvents(propagate);

    return api.router;
  }) as BrowserWpRouter;

  api.router = router;
  api.register = (routes: RouteList): WpRouter => api.router.register(routes);
  api.loadEvents = (propagate = false): void => api.router.loadEvents(propagate);
  api.fire = (route: string, event: 'init' | 'finalize', propagate = false): boolean => api.router.fire(route, event, propagate);

  return api;
};

const getBrowserWpRouter = (): BrowserWpRouter => {
  const globalScope = getGlobalScope();

  if (globalScope && isBrowserWpRouter(globalScope.wpRouter)) {
    return globalScope.wpRouter;
  }

  const api = createBrowserWpRouter();

  if (globalScope) {
    globalScope.wpRouter = api;
  }

  return api;
};

export default getBrowserWpRouter();
