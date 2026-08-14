import type { LinkDto } from './link.dto';

export type Link = LinkDto;

export interface Resource<T> {
  data: T;
  _links: Record<string, Link>;
}
