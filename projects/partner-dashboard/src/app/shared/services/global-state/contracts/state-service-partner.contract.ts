export abstract class StateServicePartnerContract {
  abstract setUserId(id: string | null): void;
  abstract setPartnerId(id: string | null): void;
  abstract setStoreId(id: string | null): void;

  abstract getCurrentUser(): any;
  abstract setCurrentUser(user: any): void;
  abstract getThemePreference(): any;
  abstract setThemePreference(preference: any): void;

  abstract clearUser(): void;
}
