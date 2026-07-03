import { WpRouter, RouteList } from '../lib';

type Calls = string[];

const createRoute = (calls: Calls, name: string) => () => ({
  init: () => calls.push(`${name}:init`),
  finalize: () => calls.push(`${name}:finalize`),
});

describe('WpRouter', () => {
  beforeEach(() => {
    document.body.className = '';
    jest.restoreAllMocks();
  });

  it('fires common init before page routes and common finalize after them', () => {
    const calls: Calls = [];
    const routes: RouteList = {
      common: createRoute(calls, 'common'),
      pageTemplateDefault: createRoute(calls, 'pageTemplateDefault'),
      home: createRoute(calls, 'home'),
    };

    document.body.className = 'page-template-default home';

    new WpRouter(routes).loadEvents();

    expect(calls).toEqual([
      'common:init',
      'pageTemplateDefault:init',
      'pageTemplateDefault:finalize',
      'home:init',
      'home:finalize',
      'common:finalize',
    ]);
  });

  it('normalizes body classes, drops empty values, and fires duplicate routes once', () => {
    const calls: Calls = [];
    const routes: RouteList = {
      common: createRoute(calls, 'common'),
      singlePost: createRoute(calls, 'singlePost'),
    };

    document.body.className = ' single-post  SINGLE_POST single_post ';

    new WpRouter(routes).loadEvents();

    expect(calls).toEqual(['common:init', 'singlePost:init', 'singlePost:finalize', 'common:finalize']);
  });

  it('reuses a route instance across init and finalize events', () => {
    const init = jest.fn();
    const finalize = jest.fn();
    const factory = jest.fn(() => ({ init, finalize }));
    const router = new WpRouter({ common: factory });

    expect(router.fire('common', 'init', false)).toBe(true);
    expect(router.fire('common', 'finalize', false)).toBe(true);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledTimes(1);
    expect(finalize).toHaveBeenCalledTimes(1);
  });

  it('returns false for missing routes without instantiating anything', () => {
    const factory = jest.fn(createRoute([], 'common'));
    const router = new WpRouter({ common: factory });

    expect(router.fire('missing', 'init', false)).toBe(false);

    expect(factory).not.toHaveBeenCalled();
  });

  it('dispatches wpRouted events before route lookup when propagation is enabled', () => {
    const listener = jest.fn();
    document.addEventListener('wpRouted', listener);

    new WpRouter({}).fire('missing', 'init', true);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      bubbles: true,
      detail: {
        route: 'missing',
        fn: 'init',
      },
    });
  });

  it('logs route errors and still reports the route as handled', () => {
    const error = new Error('Route failed');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const router = new WpRouter({
      common: () => ({
        init: () => {
          throw error;
        },
        finalize: jest.fn(),
      }),
    });

    expect(router.fire('common', 'init', false)).toBe(true);
    expect(consoleError).toHaveBeenCalledWith(error);
  });
});
