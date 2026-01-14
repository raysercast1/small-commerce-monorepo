# Project Guidelines (Partner Dashboard)

These notes target advanced contributors working on this Angular 20 application configured with Vite and Vitest. They cover build/config specifics, testing setup, and development conventions unique to this repo.

## Tech stack summary
- Angular 20 (standalone, strict mode) with Angular Material.
- Builder: @angular/build (Angular CLI) with SSR outputMode: server.
- Dev server: `ng serve [name of the project]` (Angular build dev-server).
- Bundler/Tests: Vite 7 + Vitest 3 via @analogjs/vite-plugin-angular and @analogjs/vitest-angular.
- DOM env for tests: happy-dom. Snapshots via @analogjs/vitest-angular/setup-snapshots.

Key project files:
- angular.json: Angular build/serve/ssr config and unit test runner mapping (Vitest).
- vite.config.ts: Vite + Vitest configuration (globals, setupFiles, environment, inline deps).
- tsconfig.json/tsconfig.app.json/tsconfig.spec.json: strict TS, testing types and includes.
- src/test-setup.ts: global test setup and Angular test environment initialization.

Recommended Node: >= 18 (Vite 7 requirement); Node 20 LTS preferred. Package manager: npm (package-lock.json present).

## Build and configuration
- Install deps: `npm ci` (preferred in CI) or `npm install`.
- Development server: `npm start` (ng serve) → http://localhost:4200.
- Production build: `npm run build` (ng build). Output under dist/myapp. Production build enables service worker (ngsw-config.json) and uses src/environments/environment.prod.ts.
- SSR: The Angular configuration produces server output. To serve the built SSR bundle locally after build: `npm run serve:ssr:myapp` (runs node dist/myapp/server/server.mjs).
- Environments: src/environments/environment.ts and environment.prod.ts are statically replaced by Angular during production build. Update baseUrl/domain/Firebase only through these files. Do not rely on Vite env variables for runtime; Angular’s fileReplacements handle prod env.

Vite specifics (tests/build tooling):
- vite.config.ts test.server.deps.inline includes `["rxfire", "@angular/fire"]` to avoid SSR-related resolution issues in Vitest.
- define: `{ 'import.meta.vitest': mode !== 'production' }` is set; you can guard test-only code with `if (import.meta.vitest) { ... }`.


## Unit Tests and Integrated Tests
Runner: Vitest with happy-dom, Angular TestBed, and Testing Library/Jest-DOM types enabled.

Commands:
- Run all tests (watch mode): `npm test:<partner || micro>` (vitest). Vitest watches by default unless mode is set to "ci" in vite config.
- Run once (no watch): `npx vitest --run --passWithNoTests`.
- CI-friendly (disables watch via mode): `npx vitest --run --mode ci`.
- Vitest UI (local exploration): `npm run test:ui` (vitest --ui) then open the shown URL.

Discovery/config:
- Test files: `src/**/*.spec.ts` (vite.config.ts include, tsconfig.spec.json include).
- Environment: happy-dom (suitable for Angular component tests without a real browser).
- Global setup: `src/test-setup.ts` initializes Angular test environment (platformBrowserTesting/BrowserTestingModule), installs @testing-library/jest-dom matchers, and sets up Analog snapshot helpers. It also mocks Element.prototype.scrollIntoView.
- Types for tests are declared in tsconfig.spec.json (vitest/globals and @testing-library/jest-dom/vitest), so globals like describe/test/expect are available.

Angular testing patterns used in this repo:
- Use `provideZonelessChangeDetection()` in the TestBed configuration, also add `provideNoopAnimations()` if needed.
- Completely avoid `fixture.detectChanges()`.
- Rely exclusively on `await fixture.whenStable()` to wait for UI updates after an action.
- Use direct DOM interaction and form control manipulation.
- Include the explicit Vitest imports `describe`, `it`, `expect`, `vi`, `afterEach` and `beforeEach` if you're going to use it in the code implementation.

### Example (from existing tests):
  ```
  await TestBed.configureTestingModule({
    imports: [MyStandaloneComponent, MatIconModule, MatButtonModule],
    providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
  }).compileComponents();
  ```
- Standalone components: add components under test to imports, not declarations.
- For template queries, use Angular’s `By.css` and `fixture.debugElement`, or integrate Testing Library if preferred.

Adding a new unit test
- Location: Any path under `src/` with a `.spec.ts` suffix will be picked up (e.g., src/feature/foo.spec.ts).
- Minimal demo spec (works with this setup):
  ```
  import { describe, test, expect } from 'vitest';
  describe('Demo', () => {
    test('adds numbers correctly', () => {
      const add = (a: number, b: number) => a + b;
      expect(add(2, 3)).toBe(5);
    });
  }); 
  ```
- Run locally: `npm test:<partner || micro>` (watch) or `npx vitest --run`.
- Snapshots: @analogjs/vitest-angular/setup-snapshots is loaded; you can create Angular snapshots with `expect(component).toMatchSnapshot()` where appropriate.

Notes and caveats
- The repo is configured for Vitest, not Karma; ignore legacy README references to Karma/ng test. Use `npm test:<partner || micro>` (Vitest) instead.
- If interacting with `@angular/fire` or `rxfire` in tests, the vite.config.ts inline deps setting already handles module resolution for Vitest.
- DOM gaps: `happy-dom` lacks some browser APIs; add mocks in `src/test-setup.ts` as needed.
- Strict TypeScript is enabled. Favor explicit types, avoid any, and keep public APIs typed. Angular compiler strict templates are on; template type issues will fail builds.
- Service worker: Enabled in production via `angular.json` (ngsw-config.json). Verify PWA behavior with a production build and an HTTPS server if needed.
- SSR: Build generates a server bundle; use `npm run serve:ssr:myapp` to run locally. Ensure any browser-only APIs are guarded (e.g., isPlatformBrowser) to avoid SSR crashes. --This command may need modification since now we're using an Angular workspace monorepo.

## Verified test run
We validated the test configuration by running the existing suite with npm test and by adding a temporary demo spec (see snippet above). The suite passed locally under happy-dom. The temporary file was removed after verification; use the snippet as a reference if you need to add similar tests.

## Quick reference
- Install: `npm ci`
- Dev: `npm start`
- Build: `npm run build`
- Unit tests: `npm test:<partner || micro>` (watch) | `npx vitest --run` | `npm run test:ui`
- CI test (no watch): `npx vitest --run --mode ci`
- SSR serve (after build): `npm run serve:ssr:myapp`

## TypeScript Best Practices

- Use strict type checking.
- Prefer type inference when the type is obvious.
- Avoid the `any` type; use `unknown` when type is uncertain.

## Angular Best Practices

- Always use standalone components over NgModules.
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management.
- Implement lazy loading for feature routes.
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator.
- Prefer inline templates for small components.
- Prefer Reactive forms instead of Template-driven ones.
- Do NOT use `ngClass`, use `class` bindings instead.
- DO NOT use `ngStyle`, use `style` bindings instead.

## State Management

- Use signals for local component state.
- Use `computed()` for derived state.
- Keep state transformations pure and predictable.
- Do NOT use `mutate` on signals, use `update` or `set` instead.

## Templates

- Keep templates simple and avoid complex logic.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use the async pipe to handle observables.

## Services

- Design services around a single responsibility.
- Use the `providedIn: 'root'` option for singleton services.
- Use the `inject()` function instead of constructor injection.

## Common pitfalls

- Control flow (`@if`):
  - You cannot use `as` expressions in `@else if (...)`. E.g. invalid code: `@else if (bla(); as x)`.

## Higher-Order RxJs Mapping Operators choices for common use cases.
- if we need to do things in sequence while waiting for completion, then `concatMap` is the right choice.
- for doing things in parallel, `mergeMap` is the best option.
- in case we need cancellation logic, `switchMap` is the way to go.
- for ignoring new Observables while the current one is still ongoing, `exhaustMap` does just that.

Choosing the right operator is all about choosing the right inner Observable combination strategy.
Choosing the wrong operator often does not result in an immediately broken program, but it might lead to some hard to troubleshoot issues over time.
