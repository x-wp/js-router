<div align="center">

# @x-wp/router

DOM-based WordPress router powered by `<body>` classes

[![npm](https://img.shields.io/npm/v/@x-wp/router?logo=npm)](https://www.npmjs.com/package/@x-wp/router)
[![Node](https://img.shields.io/node/v/@x-wp/router?logo=node.js)](https://www.npmjs.com/package/@x-wp/router)
![npm](https://img.shields.io/npm/dm/@x-wp/router)
[![License](https://img.shields.io/github/license/x-wp/js-router)](https://github.com/x-wp/js-router/blob/master/LICENSE)
[![Release](https://github.com/x-wp/js-router/actions/workflows/release.yml/badge.svg)](https://github.com/x-wp/js-router/actions/workflows/release.yml)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

</div>

Small TypeScript router for WordPress front ends. Register route handlers keyed by normalized WordPress body classes, then let the router run common and page-specific `init()` / `finalize()` methods in a predictable order.

It works as an imported module in bundled applications and as a browser global through the UMD build.

## Compatibility

| Runtime / output | Supported range / file | Notes |
| ---------------- | ---------------------- | ----- |
| Node.js | `>= 20` | Matches `engines.node` for install, build, and release tooling |
| CommonJS | `dist/index.js` | Exposed through `main` and `exports.require` |
| ESM | `dist/index.mjs` | Exposed through `module` and `exports.import` |
| Types | `dist/index.d.ts` | Generated from `lib/index.ts` |
| Browser global | `dist/index.umd.js` | Exposes the shared `wpRouter` callable API |

The router expects a DOM when `loadEvents()` is called because it reads `document.body.className`. Event propagation also requires `document.dispatchEvent()`.

## Installation

```sh
$ npm install @x-wp/router
```

## Usage

Create a `WpRouter` instance with route factories keyed by normalized body class names, then call `loadEvents()` after the DOM body classes are available.

```ts
import { WpRouter, type RouteList } from '@x-wp/router';

const routes: RouteList = {
  common: () => ({
    init() {
      // Runs before page-specific routes.
    },
    finalize() {
      // Runs after page-specific routes.
    },
  }),
  blogPost: () => ({
    init() {
      // Runs when <body> contains "blog-post".
    },
    finalize() {
      // Runs after blogPost.init().
    },
  }),
};

new WpRouter(routes).loadEvents();
```

Each route factory returns an object with `init()` and `finalize()` methods.

```ts
import type { RouteInterface } from '@x-wp/router';

class ProductArchiveRoute implements RouteInterface {
  init(): void {
    // Set up product archive behavior.
  }

  finalize(): void {
    // Run after route-specific init.
  }
}
```

## Route Matching

Routes are matched from the current `<body>` class list. WordPress class names are normalized into camel case before route lookup.

| Body class | Route key |
| ---------- | --------- |
| `home` | `home` |
| `blog-post` | `blogPost` |
| `page-id-2` | `pageId2` |
| `post-type-archive-product` | `postTypeArchiveProduct` |
| `foo--bar` | `fooBar` |
| `foo1bar` | `foo1Bar` |

Events fire in this order:

1. `common.init()`
2. matched route `init()`
3. matched route `finalize()`
4. `common.finalize()`

Duplicate body classes are ignored for matching, and route methods are only fired once per router registration.

## Registering Routes Later

You can register more handlers on an existing router. Later registrations are appended and `loadEvents()` only fires handlers that have not already run.

```ts
const router = new WpRouter({
  blogPost: () => firstBlogPostRoute,
});

router.loadEvents();

router.register({
  blogPost: () => secondBlogPostRoute,
});

router.loadEvents();
```

## Browser Bundle

The UMD build exposes one shared `wpRouter` function. Calling it registers routes and immediately loads pending events.

```html
<script src="https://unpkg.com/@x-wp/router/dist/index.umd.js"></script>
<script>
  wpRouter({
    common: function () {
      return {
        init: function () {},
        finalize: function () {},
      };
    },
    blogPost: function () {
      return {
        init: function () {},
        finalize: function () {},
      };
    },
  });
</script>
```

The same file is also available through jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@x-wp/router/dist/index.umd.js"></script>
```

The browser API keeps a shared router instance on `globalThis.wpRouter`, so multiple bundles can register route handlers without replacing each other.

## Event Propagation

Pass `true` as the second constructor argument, to `loadEvents()`, or to the browser global call to dispatch a `wpRouted` event before each matched route event fires.

```ts
document.addEventListener('wpRouted', (event) => {
  const routedEvent = event as CustomEvent<{ route: string; fn: 'init' | 'finalize' }>;

  console.log(routedEvent.detail.route, routedEvent.detail.fn);
});

new WpRouter(routes, true).loadEvents();
```

Event details use this shape:

| Property | Description |
| -------- | ----------- |
| `route` | Normalized route key, for example `blogPost` |
| `fn` | Fired route method: `init` or `finalize` |

## API

| Export | Description |
| ------ | ----------- |
| `WpRouter` | Router class for module consumers |
| `RouteInterface` | Route object shape with `init()` and `finalize()` |
| `RouteList` | Map of route keys to route factories |

### `new WpRouter(routes, propagate?)`

Creates a router and registers the supplied routes. Set `propagate` to `true` to dispatch `wpRouted` events by default.

### `router.register(routes)`

Adds route factories to an existing router and returns the router instance.

### `router.loadEvents(propagate?)`

Loads route events from the current `document.body.className`.

### `router.fire(route, event, propagate)`

Fires one route event manually. Returns `false` when the route is not registered and `true` when the route exists.

## Notes

> [!NOTE]
> Route method errors are caught and sent to `console.error()` so one failing route does not stop the rest of the routing cycle.

> [!IMPORTANT]
> Route keys should use normalized body class names, not raw WordPress class strings. Use `blogPost`, not `blog-post`, when registering a route.

> [!TIP]
> Use the module entry (`@x-wp/router`) in bundled TypeScript applications and the UMD file (`@x-wp/router/umd` or `dist/index.umd.js`) when you need the shared browser global.
