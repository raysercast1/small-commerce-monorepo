
import { vi } from 'vitest';
// This file is loaded by Vitest before running tests.
// You can add global mocks or configuration here.
// For a zoneless Angular application, we avoid importing 'zone.js'.

// Mock browser APIs that are not implemented in happy-dom
Element.prototype.scrollIntoView = vi.fn();

import '@analogjs/vitest-angular/setup-snapshots';
import '@angular/compiler';
// import '@testing-library/jest-dom';

import { platformBrowserTesting, BrowserTestingModule } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
