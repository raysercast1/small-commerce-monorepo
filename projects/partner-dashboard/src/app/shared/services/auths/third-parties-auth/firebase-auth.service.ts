import { Injectable, inject } from '@angular/core';
import {  Auth, authState, User } from '@angular/fire/auth';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth: Auth = inject(Auth);

  public readonly authState$: Observable<User | null> = authState(this.auth);

  constructor() { }

  /**
   * Signs in a user with a custom token provided by the backend.
   * @param customToken The custom token from the backend.
   * @returns A Promise with the UserCredential.
   */
  signInWithCustomToken(customToken: string) {
    return signInWithCustomToken(this.auth, customToken);
  }

  /**
   * Signs out the current user from Firebase.
   * @returns A Promise that resolves when the sign-out is complete.
   */
  signOut() {
    return signOut(this.auth);
  }
}
