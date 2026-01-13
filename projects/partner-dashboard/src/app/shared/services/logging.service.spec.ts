import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoggingService } from './logging.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggingService,
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(LoggingService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call console.info with the correct format', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    service.info('Test message', { data: 'test' });
    expect(infoSpy).toHaveBeenCalledWith('[INFO] Test message', { data: 'test' });
  });

  it('should call console.warn with the correct format', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.warn('Test warning', { data: 'test' });
    expect(warnSpy).toHaveBeenCalledWith('[WARN] Test warning', { data: 'test' });
  });

  it('should call console.error with the correct format', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.error('Test error', new Error('test error'));
    expect(errorSpy).toHaveBeenCalledWith('[ERROR] Test error', new Error('test error'));
  });

  it('should call console.debug with the correct format', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    service.debug('Test debug message', { data: 'test' });
    expect(debugSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', { data: 'test' });
  });
});
