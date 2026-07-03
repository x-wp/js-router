import type { RouteInterface } from './route.interface';

export interface RouteList {
  [key: string]: () => RouteInterface;
}
