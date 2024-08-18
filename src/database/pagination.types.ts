export interface IQueryPagination {
  page: string;
  size: string;
}

export interface IQueryFilter {
  categories?: string;
  dates?: string
}

export interface IQueryFilterAndPagination
  extends IQueryPagination,
    IQueryFilter {}
