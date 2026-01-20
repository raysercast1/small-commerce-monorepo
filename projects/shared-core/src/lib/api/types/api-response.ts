export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}
