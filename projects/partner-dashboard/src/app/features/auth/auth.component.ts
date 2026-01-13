import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { I18nService } from '../../shared/services/i18n.service';
import {SignInServiceContract} from '../../api/auth/contracts/signin-service.contract';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private signInService = inject(SignInServiceContract);
  private router = inject(Router);
  public i18n = inject(I18nService);

  signUpForm: FormGroup;
  signInForm: FormGroup;

  hidePassword = signal(true);
  authStatus = signal<{ state: 'idle' | 'loading' | 'error', error?: string }>({ state: 'idle' });

  constructor() {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSignUp(): void {
    if (this.signUpForm.invalid) {
      return;
    }
    this.authStatus.set({ state: 'loading' });
    this.signInService.registerAndSignIn(this.signUpForm.value).subscribe({
      next: () => {
        this.authStatus.set({ state: 'idle' });
        this.router.navigate(['/main']);
      },
      error: (err) => this.authStatus.set({ state: 'error', error: err.message })
    });
  }

  onSignIn(): void {
    if (this.signInForm.invalid) {
      return;
    }
    this.authStatus.set({ state: 'loading' });
    this.signInService.signIn(this.signInForm.value).subscribe({
      next: () => {
        this.authStatus.set({ state: 'idle' });
        this.router.navigate(['/main']);
      },
      error: (err) => this.authStatus.set({ state: 'error', error: err.message })
    });
  }
}
