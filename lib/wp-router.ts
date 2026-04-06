import camelCase from 'camelcase';
import type { ClassList, RouteList } from './interfaces';

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
  constructor(private readonly routes: RouteList, private readonly propagate = false) {
    this.classes = {};
  }

  /**
   * Fire Router events
   * @param route     DOM-based route derived from body classes (`<body class="...">`)
   * @param event     Events on the route. By default, `init` and `finalize` events are called.
   * @param propagate Should we trigger a global dispatch event
   */
  public fire(route: string, event: 'init' | 'finalize', propagate: boolean): boolean {
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

    // Route not found - bail out
    if (!this.routes[route]) {
      return false;
    }

    // Class not initialized - load it
    if (!this.classes[route]) {
      this.classes[route] = this.routes[route]();
    }

    try {
      this.classes[route][event]();
    } catch (e) {
      console.error(e);
    }

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
  public loadEvents(): void {
    // Fire common init JS
    this.fire('common', 'init', this.propagate);

    // Fire page-specific init JS, and then finalize JS
    [...new Set(
      document.body.className
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((bodyClass) => camelCase(bodyClass)),
    )].forEach((className) => {
        this.fire(className, 'init', this.propagate);
        this.fire(className, 'finalize', this.propagate);
      });

    // Fire common finalize JS
    this.fire('common', 'finalize', this.propagate);
  }
}
