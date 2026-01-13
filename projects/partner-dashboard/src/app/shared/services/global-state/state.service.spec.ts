import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import {StateServiceImpl} from './state.service';


describe('StateService', () => {
  let service: StateServiceImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StateServiceImpl, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(StateServiceImpl);
  });

  it('should have loading signal initialized to false', () => {
    expect(service.loading()).toBe(false);
  });

  it('should have error signal initialized to null', () => {
    expect(service.error()).toBeNull();
  });

  it('should set loading signal', () => {
    service.setLoading(true);
    expect(service.loading()).toBe(true);
  });

  it('should set error signal', () => {
    service.setError('Test Error');
    expect(service.error()).toBe('Test Error');
  });

  it('should clear error signal', () => {
    service.setError('Test Error');
    service.clearError();
    expect(service.error()).toBeNull();
  });
});
