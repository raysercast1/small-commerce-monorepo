import { StateServiceContract } from "./state-service.contract";

export abstract class StateServiceAuthContract extends StateServiceContract {
  abstract setAuthToken(token: string | null): void;
  abstract clearAuth(): void;
}
