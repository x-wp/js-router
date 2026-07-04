import type { RouteInterface } from './route.interface';

export interface RouteRegistrationInterface {
  create(): RouteInterface;
  instance?: RouteInterface;
  fired: {
    init: boolean;
    finalize: boolean;
  };
}
