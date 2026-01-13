
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthComponent } from './auth.component';
import { render, screen, RenderResult, within } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import userEvent from '@testing-library/user-event';
import { ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import {SignInServiceContract} from '../../api/auth/contracts/signin-service.contract';

describe('AuthComponent', () => {
  const mockSigningService = {
    registerAndSignIn: vi.fn(),
    signIn: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    mockSigningService.registerAndSignIn.mockClear();
    mockSigningService.signIn.mockClear();
    mockRouter.navigate.mockClear();

    const renderResult: RenderResult<AuthComponent, AuthComponent> = await render(AuthComponent, {
      providers: [
        provideZonelessChangeDetection(),
        { provide: SignInServiceContract, useValue: mockSigningService },
        { provide: Router, useValue: mockRouter },
      ],
      autoDetectChanges: false,
    });
    fixture = renderResult.fixture;
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should render the sign-in and sign-up forms', () => {
    expect(screen.getByRole('tab', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sign In/i })).toBeInTheDocument();
  });

  describe('Sign-Up', () => {
    beforeEach(async () => {
      // Act like a user: click the "Sign Up" tab to make its content visible
      const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });
      await userEvent.click(signUpTab);
      await fixture.whenStable();
    });

    it('should disable the submit button if the form is invalid', () => {
      const signUpPanel = screen.getByRole('tabpanel', { name: /Sign Up/i });
      const signUpButton = within(signUpPanel).getByRole('button', { name: /Sign Up/i });

      // Assert that the button is disabled
      expect(signUpButton).toBeDisabled();
    });

    it('should call registerAndSignIn on valid sign-up form submission', async () => {
      mockSigningService.registerAndSignIn.mockReturnValue(of({}));
      const signUpPanel = screen.getByRole('tabpanel', { name: /Sign Up/i });

      const emailInput = within(signUpPanel).getByLabelText(/Email/i, { selector: 'input' });
      const passwordInput = within(signUpPanel).getByLabelText(/Password/i, { selector: 'input' });
      const signUpButton = within(signUpPanel).getByRole('button', { name: /Sign Up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(signUpButton);
      await fixture.whenStable();

      expect(mockSigningService.registerAndSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should navigate to the main page on successful sign-up', async () => {
      mockSigningService.registerAndSignIn.mockReturnValue(of({}));
      const signUpPanel = screen.getByRole('tabpanel', { name: /Sign Up/i });

      const emailInput = within(signUpPanel).getByLabelText(/Email/i, { selector: 'input' });
      const passwordInput = within(signUpPanel).getByLabelText(/Password/i, { selector: 'input' });
      const signUpButton = within(signUpPanel).getByRole('button', { name: /Sign Up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(signUpButton);
      await fixture.whenStable();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
    });
  });

  describe('Sign-In', () => {
    beforeEach(async () => {
      // The "Sign In" tab is active by default, but clicking it makes the test more robust
      const signInTab = screen.getByRole('tab', { name: /Sign In/i });
      await userEvent.click(signInTab);
      await fixture.whenStable();
    });

    it('should call signIn on valid sign-in form submission', async () => {
      mockSigningService.signIn.mockReturnValue(of({}));
      const signInPanel = screen.getByRole('tabpanel', { name: /Sign In/i });

      const emailInput = within(signInPanel).getByLabelText(/Email/i, { selector: 'input' });
      const passwordInput = within(signInPanel).getByLabelText(/Password/i, { selector: 'input' });
      const signInButton = within(signInPanel).getByRole('button', { name: /Sign In/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password');
      await userEvent.click(signInButton);
      await fixture.whenStable();

      expect(mockSigningService.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should navigate to the main page on successful sign-in', async () => {
      mockSigningService.signIn.mockReturnValue(of({}));
      const signInPanel = screen.getByRole('tabpanel', { name: /Sign In/i });

      const emailInput = within(signInPanel).getByLabelText(/Email/i, { selector: 'input' });
      const passwordInput = within(signInPanel).getByLabelText(/Password/i, { selector: 'input' });
      const signInButton = within(signInPanel).getByRole('button', { name: /Sign In/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password');
      await userEvent.click(signInButton);
      await fixture.whenStable();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
    });

    it('should show an error message on sign-in failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockSigningService.signIn.mockReturnValue(throwError(() => new Error(errorMessage)));
      const signInPanel = screen.getByRole('tabpanel', { name: /Sign In/i });

      const emailInput = within(signInPanel).getByLabelText(/Email/i, { selector: 'input' });
      const passwordInput = within(signInPanel).getByLabelText(/Password/i, { selector: 'input' });
      const signInButton = within(signInPanel).getByRole('button', { name: /Sign In/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrong-password');
      await userEvent.click(signInButton);
      await fixture.whenStable();

      // Error messages might not be inside the tab panel, so we query the whole screen
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
