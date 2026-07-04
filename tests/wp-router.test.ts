import { WpRouter } from '../lib';
import type { RouteInterface, RouteList } from '../lib';

const createRoute = (calls: string[], name: string): RouteInterface => ({
  init: jest.fn(() => {
    calls.push(`${name}:init`);
  }),
  finalize: jest.fn(() => {
    calls.push(`${name}:finalize`);
  }),
});

describe('WpRouter', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  it('instantiates a matched route once and fires the requested event', () => {
    const calls: string[] = [];
    const route = createRoute(calls, 'home');
    const homeFactory = jest.fn(() => route);
    const router = new WpRouter({ home: homeFactory });

    expect(router.fire('home', 'init', false)).toBe(true);
    expect(router.fire('home', 'finalize', false)).toBe(true);

    expect(homeFactory).toHaveBeenCalledTimes(1);
    expect(route.init).toHaveBeenCalledTimes(1);
    expect(route.finalize).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['home:init', 'home:finalize']);
  });

  it('returns false when a route does not exist', () => {
    const router = new WpRouter({});

    expect(router.fire('missing', 'init', false)).toBe(false);
  });

  it('dispatches a wpRouted event when propagation is enabled', () => {
    const route = createRoute([], 'home');
    const router = new WpRouter({ home: () => route });
    const listener = jest.fn();

    document.addEventListener('wpRouted', listener);

    router.fire('home', 'init', true);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        bubbles: true,
        detail: {
          route: 'home',
          fn: 'init',
        },
      }),
    );
  });

  it('continues routing when a route method throws', () => {
    const error = new Error('route failed');
    const route: RouteInterface = {
      init: jest.fn(() => {
        throw error;
      }),
      finalize: jest.fn(),
    };
    const router = new WpRouter({ home: () => route });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(router.fire('home', 'init', false)).toBe(true);
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });

  it('loads common and body class routes in router order with unique camel-cased classes', () => {
    const calls: string[] = [];
    const routes: RouteList = {
      common: () => createRoute(calls, 'common'),
      home: () => createRoute(calls, 'home'),
      blogPost: () => createRoute(calls, 'blogPost'),
    };
    const router = new WpRouter(routes);

    document.body.className = 'home blog-post home missing-route';
    router.loadEvents();

    expect(calls).toEqual(['common:init', 'home:init', 'home:finalize', 'blogPost:init', 'blogPost:finalize', 'common:finalize']);
  });

  it('normalizes WordPress body classes into route names', () => {
    const calls: string[] = [];
    const routes: RouteList = {
      common: () => createRoute(calls, 'common'),
      blogPost: () => createRoute(calls, 'blogPost'),
      pageId2: () => createRoute(calls, 'pageId2'),
      postTypeArchiveProduct: () => createRoute(calls, 'postTypeArchiveProduct'),
      fooBar: () => createRoute(calls, 'fooBar'),
      foo1Bar: () => createRoute(calls, 'foo1Bar'),
    };
    const router = new WpRouter(routes);

    document.body.className = 'blog-post page-id-2 post-type-archive-product foo--bar foo1bar';
    router.loadEvents();

    expect(calls).toEqual([
      'common:init',
      'blogPost:init',
      'blogPost:finalize',
      'pageId2:init',
      'pageId2:finalize',
      'postTypeArchiveProduct:init',
      'postTypeArchiveProduct:finalize',
      'fooBar:init',
      'fooBar:finalize',
      'foo1Bar:init',
      'foo1Bar:finalize',
      'common:finalize',
    ]);
  });
});
