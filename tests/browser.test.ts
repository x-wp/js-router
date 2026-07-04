import wpRouter from '../lib/browser';
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

describe('browser entry', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  it('loads matching body-class routes immediately and returns the router instance', () => {
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
});
