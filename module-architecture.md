# Feature Module Architecture Guide

This document outlines the standardized architecture for creating new, self-contained feature modules within this application. Adhering to this guide ensures that the codebase remains consistent, maintainable, and scalable as new features are added.

## Core Principles

The architecture is founded on the following core principles:

1.  **Consistency and Predictability:** By following a consistent structure for all feature modules, we create a predictable development environment. Any developer familiar with the project can quickly understand a new module's architecture, reducing the learning curve and speeding up development.

2.  **Separation of Concerns (SoC):** Each part of the module has a distinct and well-defined responsibility. This separation makes the code easier to reason about, test, and debug.

3.  **Scalability and Reusability:** The modular design is inherently scalable. As a feature grows in complexity, its internal structure can evolve without impacting other parts of the application. Furthermore, presentational components are designed to be highly reusable.

4.  **Reactive Architecture:** We leverage Angular Signals for state management to build a reactive system. This ensures that the UI automatically and efficiently reflects the latest application state, simplifying data flow and reducing boilerplate.

5.  **Dependency Inversion Principle (DIP):** To promote a decoupled architecture, components will depend on abstractions (contracts) rather than concrete implementations. In TypeScript/Angular, we will use `abstract class` for these contracts, as they are preserved at runtime and can be used with Angular's dependency injection system. This makes our components more modular and easier to test, as we can provide mock implementations of the dependencies.

## Architectural Components

Each feature module is composed of four primary types of components and services:

### 1. API Service

-   **Responsibility:** The API service is solely responsible for all communication with the backend for a specific feature. It handles the details of making HTTP requests (GET, POST, PUT, DELETE) and mapping the responses to the data models.
-   **Implementation:**
  -   It should be an injectable service (`providedIn: 'root'`).
  -   It abstracts away the `HttpClient` logic from the rest of the feature module.
  -   Methods should return Observables of the expected data types.
-   **Example Filename:** `inventory.service.ts`

### 2. State Management Service

-   **Responsibility:** This service acts as the **single source of truth** for all states related to the feature. It manages the data, loading status, and any potential errors.
-   **Implementation:**
  -   First, an **`abstract class`** is defined to serve as the contract (the abstraction). This class outlines the public API (signals and methods) that components will depend on.
  -   The concrete implementation of the state service will `extend` this `abstract class`.
  -   The concrete service will be injectable, typically at the feature or root level.
  -   It uses Angular Signals (`signal`, `computed`) to hold and derive state.
  -   It interacts with the API Service to fetch and update data.
-   **Example Filenames:** The contract would be `inventory-state.service.ts` and the implementation could be in the same file or a separate one like `inventory-state.service.impl.ts`.

### 3. Smart Component (Container/Page)

-   **Responsibility:** The smart component is the orchestrator for a specific view or page. It connects the state management service with the presentational components.
-   **Implementation:**
  -   It injects the state management service using the **`abstract class` as the injection token**. This decouples the component from the concrete implementation.
  -   In the component's `providers` array (or in the route's providers), the `abstract class` is mapped to its concrete implementation (e.g., `{ provide: InventoryStateService, useClass: InventoryStateServiceImpl }`).
  -   It passes data down to "dumb" components via `input()` bindings.
  -   It listens for events from "dumb" components via `output()` bindings and calls the appropriate methods on the state service to handle user actions.
-   **Example Filename:** `inventory-management-page.ts`

### 4. Presentational Components (Dumb)

-   **Responsibility:** Presentational components are responsible for rendering a piece of the UI.
-   **Implementation:**
  -   They receive all data via `input()`s.
  -   They communicate with their parent by emitting events through `output()`s.
  -   They use the service's contracts to GET or POST data on the `submit` event and then return the result to the Smart Component that handle the State contract.
  -   They are highly reusable and easy to test in isolation.
-   **Example Filenames:** `create-inventory-form.ts`, `inventory-list.ts`

## Benefits of This Architecture

-   **Enhanced Maintainability:** With a clear separation of concerns, locating and modifying code becomes straightforward.
-   **Improved Testability:** The Dependency Inversion Principle makes testing much easier. Smart components can be tested with mock implementations of the state service, allowing for isolated and predictable unit tests.
-   **Predictable Data Flow:** The unidirectional data flow makes the application easier to debug and understand.
-   **Developer Efficiency:** The standardized structure allows developers to work more efficiently and consistently.
