export interface IQueryPagination {
  page: string;
  size: string;
}

export interface IQueryFilter {
  categories?: string;
  dates?: string;
  priceMin?: string;
  priceMax?: string;
  dateMin?: string;
  dateMax?: string;
  intervalId?: string;
  subscribersMin?: string;
  subscribersMax?: string;
}

export interface IQueryFilterAndPagination
  extends IQueryPagination,
    IQueryFilter {}
