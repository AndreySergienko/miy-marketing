import type { IQueryPagination } from './pagination.types';

export function pagination({ page, size }: IQueryPagination) {
  const limit = +size;
  const offset = (+page - 1) * +size;
  return {
    limit,
    offset,
  };
}
