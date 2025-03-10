import type { IQueryPagination } from './pagination.types';

export function pagination({ page = '1', size = '10' }: IQueryPagination) {
  const limit = +size;
  const offset = (+page - 1) * +size;
  return {
    limit,
    offset,
  };
}
