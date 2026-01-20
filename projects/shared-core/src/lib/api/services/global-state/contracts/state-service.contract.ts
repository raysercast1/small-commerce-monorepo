export interface StateServiceInterface {
  setError(error: string | null): void;
  clearError(): void;
  setLoading(loading: boolean): void;
}
