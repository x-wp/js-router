import type { ClassList, RouteList } from './interfaces';

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const splitNumericJoins = (value: string): string[] => {
  const words: string[] = [];
  let word = '';

  Array.from(value).forEach((character, index) => {
    if (index > 0 && /\d/.test(value.charAt(index - 1)) && /[a-z]/.test(character)) {
      words.push(word);
      word = '';
    }

    word += character;
  });

  if (word) {
    words.push(word);
  }

  return words;
};

const normalizeBodyClass = (bodyClass: string): string => {
  const [firstWord = '', ...words] = bodyClass
    .toLowerCase()
    .split(/[-_.]+/g)
    .filter(Boolean)
    .reduce<string[]>((result, word) => result.concat(splitNumericJoins(word)), []);

  return `${firstWord}${words.map(capitalize).join('')}`;
};

/**
 * DOM-based Routing

 * The routing fires all common scripts, followed by the page specific scripts.
 * Add additional events for more control over timing e.g. a finalize event
 */
export class WpRouter {
  /**
   * List of instantiated classes
   *
   * @private
   * @type {ClassList}
   * @memberof WpRouter
   */
  private classes: ClassList;

  /**
   * Create a new Router
   * @param routes    A RouteList object
   * @param propagate Should we trigger a global dispatch event
   */
  constructor(routes: RouteList, private readonly propagate = false) {
    this.classes = {};
    this.register(routes);
  }

  /**
   * Register route handlers.
   * @param routes DOM-based route handlers keyed by normalized body class
   */
  public register(routes: RouteList): WpRouter {
    Object.keys(routes).forEach((route) => {
      if (!this.classes[route]) {
        this.classes[route] = [];
      }

      this.classes[route].push({
        create: routes[route],
        fired: {
          init: false,
          finalize: false,
        },
      });
    });

    return this;
  }

  /**
   * Fire Router events
   * @param route     DOM-based route derived from body classes (`<body class="...">`)
   * @param event     Events on the route. By default, `init` and `finalize` events are called.
   * @param propagate Should we trigger a global dispatch event
   */
  public fire(route: string, event: 'init' | 'finalize', propagate: boolean): boolean {
    // Route not found - bail out
    if (!this.classes[route]) {
      return false;
    }

    const registrations = this.classes[route].filter((registration) => !registration.fired[event]);

    if (registrations.length === 0) {
      return true;
    }

    if (propagate) {
      document.dispatchEvent(
        new CustomEvent('wpRouted', {
          bubbles: true,
          detail: {
            route,
            fn: event,
          },
        }),
      );
    }

    registrations.forEach((registration) => {
      // Class not initialized - load it
      if (!registration.instance) {
        registration.instance = registration.create();
      }

      try {
        registration.instance[event]();
      } catch (e) {
        console.error(e);
      }

      registration.fired[event] = true;
    });

    return true;
  }

  /**
   * Automatically load and fire Router events
   *
   * Events are fired in the following order:
   *  * common init
   *  * page-specific init
   *  * page-specific finalize
   *  * common finalize
   */
  public loadEvents(propagate = this.propagate): void {
    // Fire common init JS
    this.fire('common', 'init', propagate);

    // Fire page-specific init JS, and then finalize JS
    [...new Set(document.body.className.toLowerCase().split(/\s+/).filter(Boolean).map(normalizeBodyClass))].forEach((className) => {
      this.fire(className, 'init', propagate);
      this.fire(className, 'finalize', propagate);
    });

    // Fire common finalize JS
    this.fire('common', 'finalize', propagate);
  }
}
