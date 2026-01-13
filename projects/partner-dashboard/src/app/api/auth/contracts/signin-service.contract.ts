import {Observable} from 'rxjs';

export type CredentialsParameters = { email: string, password: string };

export abstract class SignInServiceContract {
  abstract registerAndSignIn(credentials: CredentialsParameters): Observable<any>;
  abstract signIn(credentials: CredentialsParameters): Observable<string>;
  abstract signOut(): Observable<void>;
}
