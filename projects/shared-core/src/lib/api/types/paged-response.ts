export interface PagedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;

  page?: number;
  size?: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
