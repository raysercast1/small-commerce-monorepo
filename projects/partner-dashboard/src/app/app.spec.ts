import { TestBed } from '@angular/core/testing';
import { App } from './app';
import {describe, test, expect, beforeEach} from 'vitest';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import { provideRouter } from '@angular/router';
import {StateServiceContract} from './shared/services/global-state/contracts/state-service.contract';
import {StateServicePartnerContract} from './shared/services/global-state/contracts/state-service-partner.contract';


class MockStateService {
  loading = signal(false);
  partnerId = signal(null);
  error = signal(null);
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {provide: StateServiceContract, useClass: MockStateService},
        {provide: StateServicePartnerContract, useClass: MockStateService},
        provideZonelessChangeDetection(),
        provideRouter([])],
    }).compileComponents();
  });

  test('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  test('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
