import type { RouteInterface, RouteList } from '../lib';

const createRoute = (calls: string[], name: string): RouteInterface => ({
  init: jest.fn(() => {
    calls.push(`${name}:init`);
  }),
  finalize: jest.fn(() => {
    calls.push(`${name}:finalize`);
  }),
});

const loadBrowser = (): { wpRouter: typeof import('../lib/browser').default; WpRouter: typeof import('../lib').WpRouter } => {
  jest.resetModules();

  return {
    wpRouter: require('../lib/browser').default,
    WpRouter: require('../lib').WpRouter,
  };
};

describe('browser entry', () => {
  beforeEach(() => {
    document.body.className = '';
    delete (globalThis as typeof globalThis & { wpRouter?: unknown }).wpRouter;
  });

  it('loads matching body-class routes immediately and returns the shared router instance', () => {
    const { wpRouter, WpRouter } = loadBrowser();
    const calls: string[] = [];
    const routes: RouteList = {
      common: () => createRoute(calls, 'common'),
      blogPost: () => createRoute(calls, 'blogPost'),
    };

    document.body.className = 'blog-post';
    const router = wpRouter(routes);

    expect(router).toBeInstanceOf(WpRouter);
    expect(calls).toEqual(['common:init', 'blogPost:init', 'blogPost:finalize', 'common:finalize']);
  });

  it('uses one shared router and automatically loads only newly registered routes', () => {
    const { wpRouter } = loadBrowser();
    const calls: string[] = [];

    document.body.className = 'blog-post';

    const firstRouter = wpRouter({
      blogPost: () => createRoute(calls, 'blogPostOne'),
    });
    const secondRouter = wpRouter({
      blogPost: () => createRoute(calls, 'blogPostTwo'),
    });

    expect(secondRouter).toBe(firstRouter);
    expect(calls).toEqual(['blogPostOne:init', 'blogPostOne:finalize', 'blogPostTwo:init', 'blogPostTwo:finalize']);
  });

  it('reuses an existing compatible global wpRouter api', () => {
    const { WpRouter } = loadBrowser();
    const calls: string[] = [];
    const existingRouter = new WpRouter({});
    const existingApi = Object.assign(
      (routes: RouteList) => {
        existingRouter.register(routes);
        existingRouter.loadEvents();
        return existingRouter;
      },
      {
        router: existingRouter,
        register: existingRouter.register.bind(existingRouter),
        loadEvents: existingRouter.loadEvents.bind(existingRouter),
        fire: existingRouter.fire.bind(existingRouter),
      },
    );

    (globalThis as typeof globalThis & { wpRouter?: unknown }).wpRouter = existingApi;
    document.body.className = 'blog-post';

    const { wpRouter } = loadBrowser();
    const router = wpRouter({
      blogPost: () => createRoute(calls, 'blogPost'),
    });

    expect((globalThis as typeof globalThis & { wpRouter?: unknown }).wpRouter).toBe(existingApi);
    expect(router).toBe(existingRouter);
    expect(calls).toEqual(['blogPost:init', 'blogPost:finalize']);
  });
});
