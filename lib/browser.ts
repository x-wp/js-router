import type { RouteList } from './interfaces';
import { WpRouter } from './wp-router';

export default function wpRouter(routes: RouteList, propagate = false): WpRouter {
  const router = new WpRouter(routes, propagate);

  router.loadEvents();

  return router;
}
