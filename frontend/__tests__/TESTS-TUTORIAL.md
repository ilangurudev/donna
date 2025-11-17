# Frontend Testing Tutorial for Non-JavaScript Developers

Welcome! This guide explains Donna's frontend testing infrastructure for developers who know how to code but are new to JavaScript/TypeScript testing. I'll bridge concepts from other languages and explain everything step-by-step.

## Table of Contents
1. [Introduction](#introduction)
2. [The Testing Ecosystem](#the-testing-ecosystem)
3. [Core Concepts for Non-JS Developers](#core-concepts-for-non-js-developers)
4. [Your Test Infrastructure](#your-test-infrastructure)
5. [Test Organization & File Structure](#test-organization--file-structure)
6. [Writing Your First Test](#writing-your-first-test)
7. [Common Testing Patterns](#common-testing-patterns)
8. [The Mocking System Deep Dive](#the-mocking-system-deep-dive)
9. [Running & Debugging Tests](#running--debugging-tests)
10. [Real Examples from the Codebase](#real-examples-from-the-codebase)
11. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Introduction

### What is Frontend Testing?

Frontend testing verifies that your user interface works correctly. Unlike backend testing where you test API endpoints or database operations, frontend testing focuses on:

- **Does the button render?** (Rendering tests)
- **Does clicking the button do what it should?** (Interaction tests)
- **Does the component handle API errors gracefully?** (Error handling tests)
- **Can users navigate through the app?** (E2E/Integration tests)

### Why Test the Frontend?

- **Catch bugs before users do**: Automated tests run on every code change
- **Refactor with confidence**: Tests tell you if you broke something
- **Documentation**: Tests show how components should behave
- **Prevent regressions**: Old bugs stay fixed

### Testing Philosophy

> "Test behavior, not implementation"

This means: Test what the **user sees and does**, not internal component state or function names. If you refactor the code but the behavior stays the same, tests should still pass.

---

## The Testing Ecosystem

Donna uses several tools that work together. Think of it like a toolbox - each tool has a specific job.

### 1. Vitest (The Test Runner)
**Role**: Executes your tests, reports results
**Similar to**: pytest (Python), RSpec (Ruby), JUnit (Java)

```bash
pnpm test                # Run tests (watch mode)
pnpm test run            # Run once and exit
pnpm test:coverage       # Generate coverage report
```

**Why Vitest over Jest?** Faster, modern, built for Vite/TypeScript projects.

### 2. Testing Library (The Component Tester)
**Role**: Renders components and queries the DOM
**Philosophy**: "Test like a user" - find elements by text/role, not implementation

```typescript
// Good: How a user finds things
screen.getByRole('button', { name: /submit/i })
screen.getByText('Welcome')

// Bad: Implementation details
wrapper.find('.submit-button')
wrapper.state().isLoading
```

### 3. Playwright (The Browser Automator)
**Role**: E2E tests in real browsers
**Similar to**: Selenium, Cypress

Playwright opens an actual browser and simulates a real user:
```typescript
await page.goto('/login');
await page.click('button[type="submit"]');
await expect(page).toHaveURL('/dashboard');
```

### 4. MSW - Mock Service Worker (The Network Interceptor)
**Role**: Intercepts HTTP requests and returns fake responses
**Why it's special**: Works at the network level - your app thinks it's making real API calls

```typescript
// Your component makes: fetch('/api/v1/me')
// MSW intercepts and returns: { user: { id: 'test-123' } }
// Your component never knows it's fake data!
```

### 5. happy-dom (The Fake Browser)
**Role**: Simulates browser environment (DOM, window, document) in Node.js
**Why needed**: Tests run in Node.js, which doesn't have a DOM
**Alternative**: jsdom (slower)

---

## Core Concepts for Non-JS Developers

### 1. Async/Await and Promises

JavaScript is **single-threaded and non-blocking**. Operations that take time (API calls, user interactions, animations) return a Promise.

**Promise**: An object representing a future value (like a Future in Rust or Task in C#)

```typescript
// Without async/await (Promise chains)
fetchUser().then(user => {
  console.log(user);
});

// With async/await (looks synchronous)
const user = await fetchUser();
console.log(user);
```

**In tests, this is critical**:
```typescript
// ❌ WRONG - test finishes before component updates
it('should display user', () => {
  renderWithProviders(<UserInfo />);
  expect(screen.getByText('John')).toBeInTheDocument(); // Fails!
});

// ✅ CORRECT - wait for async update
it('should display user', async () => {
  renderWithProviders(<UserInfo />);
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### 2. Mocking, Stubbing, Spying

**Mock**: A fake replacement for a real function/module
**Spy**: Wraps a real function to track calls
**Stub**: Returns hardcoded values

```typescript
// Mock: Complete fake implementation
const mockFn = vi.fn(() => 'fake value');

// Spy: Track calls to real function
const spy = vi.spyOn(console, 'log');
console.log('test');
expect(spy).toHaveBeenCalledWith('test');

// Stub: Return predetermined values
mockFn.mockReturnValue('stub value');
mockFn.mockResolvedValue('async stub'); // For promises
```

**Why mock?**
- **Speed**: Don't wait for real API calls
- **Isolation**: Test one component without dependencies
- **Predictability**: Same results every time
- **Test edge cases**: Simulate errors without breaking production

### 3. Test Lifecycle Hooks

Control setup and teardown:

```typescript
describe('Calculator', () => {
  let calculator;

  beforeAll(() => {
    // Runs ONCE before all tests in this describe
    console.log('Starting test suite');
  });

  beforeEach(() => {
    // Runs before EACH test
    calculator = new Calculator();
  });

  afterEach(() => {
    // Runs after EACH test
    calculator.reset();
  });

  afterAll(() => {
    // Runs ONCE after all tests
    console.log('Test suite complete');
  });

  it('should add numbers', () => {
    expect(calculator.add(2, 3)).toBe(5);
  });
});
```

**Similar to**:
- Python: `setUp()`, `tearDown()`, `setUpClass()`, `tearDownClass()`
- Ruby: `before(:each)`, `after(:each)`, `before(:all)`, `after(:all)`
- Java: `@Before`, `@After`, `@BeforeClass`, `@AfterClass`

### 4. Query Methods (Testing Library)

Three query types based on timing and expectations:

| Query Type | Returns | Throws if not found? | Waits? | Use case |
|------------|---------|---------------------|--------|----------|
| `getBy*()` | Element | ✅ Yes | ❌ No | Assert element exists NOW |
| `queryBy*()` | Element or null | ❌ No | ❌ No | Assert element does NOT exist |
| `findBy*()` | Promise<Element> | ✅ Yes | ✅ Yes (1s) | Wait for async element |

```typescript
// Element should be there immediately
const button = screen.getByRole('button');

// Check if element is NOT there
expect(screen.queryByText('Error')).not.toBeInTheDocument();

// Wait for element to appear (async data)
const userName = await screen.findByText('John Doe');
```

**Query suffixes**:
- `getByRole('button')` - One button (throws if multiple)
- `getAllByRole('button')` - Array of buttons
- `queryByRole('button')` - One button or null
- `queryAllByRole('button')` - Array of buttons (empty if none)
- `findByRole('button')` - Promise<button> (waits)
- `findAllByRole('button')` - Promise<button[]> (waits)

### 5. Matchers (Assertions)

Check expected outcomes:

```typescript
// Value equality
expect(value).toBe(5);              // Strict equality (===)
expect(obj).toEqual({ a: 1 });      // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeCloseTo(3.14, 2); // Within 2 decimal places

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// Functions/Mocks
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);

// DOM (from @testing-library/jest-dom)
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveAttribute('href', '/home');
expect(element).toHaveClass('active');
expect(input).toHaveValue('text');
```

---

## Your Test Infrastructure

### Configuration Files

#### 1. `vitest.config.ts` (Unit Test Configuration)

```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',     // Simulate browser in Node.js
    globals: true,                // No need to import describe/it/expect
    setupFiles: './vitest.setup.ts', // Runs before all tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**'                // E2E tests use Playwright
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), // @/components = /components
    },
  },
});
```

**Key settings explained**:
- `environment: 'happy-dom'` - Creates fake `window`, `document`, `localStorage`
- `globals: true` - Import-free testing (like RSpec's global `describe`)
- `setupFiles` - Global setup for all tests (like pytest's `conftest.py`)

#### 2. `playwright.config.ts` (E2E Test Configuration)

```typescript
export default defineConfig({
  testDir: './e2e',              // E2E test folder
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',     // Record video on failure
  },
  webServer: {
    command: 'pnpm dev',         // Auto-start dev server
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Can add 'firefox', 'webkit', 'Mobile Safari', etc.
  ],
});
```

**Why separate config?** E2E tests need a real browser and server, unit tests don't.

#### 3. `vitest.setup.ts` (Global Test Setup)

This file runs **once before all tests**. Think of it as your test bootstrap.

```typescript
import '@testing-library/jest-dom/vitest';  // Adds toBeInTheDocument() etc.
import { server } from '@/mocks/server';    // MSW mock server

// Start MSW before all tests
beforeAll(() => server.listen());

// Reset handlers between tests (isolation)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock window.alert globally
global.alert = vi.fn();

// Mock Supabase client globally
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient()),
}));
```

**What this achieves**:
- All tests automatically intercept API calls (MSW)
- All tests have access to DOM matchers
- Supabase is always mocked (no real auth calls)
- Tests are isolated (handlers reset between tests)

### Package Dependencies

From `package.json`:

```json
{
  "devDependencies": {
    "vitest": "^4.0.9",                      // Test runner
    "happy-dom": "^16.11.7",                 // Fake browser
    "@vitest/ui": "^4.0.9",                  // Visual test UI

    "@testing-library/react": "^16.3.0",     // Component testing
    "@testing-library/user-event": "^14.6.0", // Realistic interactions
    "@testing-library/jest-dom": "^6.6.5",   // DOM matchers

    "msw": "^2.12.2",                        // Mock Service Worker

    "@playwright/test": "^1.56.1"            // E2E testing
  }
}
```

---

## Test Organization & File Structure

```
frontend/
├── __tests__/                    # Unit tests (mirrors src structure)
│   ├── components/               # Component tests
│   │   ├── voice-recorder.test.tsx
│   │   ├── user-info.test.tsx
│   │   └── providers/
│   │       └── query-provider.test.tsx
│   ├── lib/                      # Business logic tests
│   │   └── api/
│   │       ├── client.test.ts    # API client
│   │       └── hooks.test.tsx    # React Query hooks
│   └── utils/                    # Test utilities (not tests!)
│       ├── test-utils.tsx        # Custom render function
│       ├── mock-supabase.ts      # Supabase mocking helpers
│       └── mock-media-devices.ts # MediaRecorder mocking
│
├── mocks/                        # MSW configuration
│   ├── server.ts                 # MSW server setup
│   └── handlers.ts               # API mock responses
│
├── e2e/                          # Playwright E2E tests
│   ├── auth.spec.ts              # Authentication flows
│   └── voice-recording.spec.ts   # Voice recording feature
│
├── vitest.config.ts              # Vitest configuration
├── vitest.setup.ts               # Global test setup
└── playwright.config.ts          # Playwright configuration
```

### Naming Conventions

- **Unit tests**: `*.test.ts` or `*.test.tsx` (for components)
- **E2E tests**: `*.spec.ts` (Playwright convention)
- **Test files**: Mirror the structure of `src/`
  - Testing `components/voice-recorder.tsx` → `__tests__/components/voice-recorder.test.tsx`
  - Testing `lib/api/client.ts` → `__tests__/lib/api/client.test.ts`

### The AAA Pattern (Arrange, Act, Assert)

Every test follows this structure:

```typescript
it('should do something', async () => {
  // ARRANGE: Set up the test
  const user = userEvent.setup();
  renderWithProviders(<MyComponent />);

  // ACT: Perform the action
  const button = screen.getByRole('button');
  await user.click(button);

  // ASSERT: Verify the outcome
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

**Why this pattern?**
- Clear structure (easy to read)
- Separates setup from verification
- Easy to spot what's being tested

---

## Writing Your First Test

Let's write a test for a simple component from scratch.

### Step 1: The Component

Imagine this simple component (`components/greeting.tsx`):

```tsx
export function Greeting({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <button onClick={() => alert(`Goodbye, ${name}!`)}>
        Say Goodbye
      </button>
    </div>
  );
}
```

### Step 2: The Test File

Create `__tests__/components/greeting.test.tsx`:

```tsx
// 1. IMPORTS
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/test-utils';
import { Greeting } from '@/components/greeting';

// 2. TEST SUITE
describe('Greeting', () => {
  // 3. TEST: Rendering
  it('should display the greeting message', () => {
    // Arrange
    renderWithProviders(<Greeting name="Alice" />);

    // Assert (no act needed - just checking render)
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
  });

  // 4. TEST: Button exists
  it('should render a goodbye button', () => {
    renderWithProviders(<Greeting name="Bob" />);

    const button = screen.getByRole('button', { name: /say goodbye/i });
    expect(button).toBeInTheDocument();
  });

  // 5. TEST: Interaction
  it('should show alert when goodbye button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderWithProviders(<Greeting name="Charlie" />);

    // Act
    const button = screen.getByRole('button', { name: /say goodbye/i });
    await user.click(button);

    // Assert
    expect(alertSpy).toHaveBeenCalledWith('Goodbye, Charlie!');
  });
});
```

### Step 3: Run the Test

```bash
pnpm test greeting
```

### Breaking Down the Test

**Import structure**:
```typescript
// Vitest testing functions
import { describe, it, expect, vi } from 'vitest';

// Testing Library utilities
import { screen } from '@testing-library/react';

// User interaction simulator
import userEvent from '@testing-library/user-event';

// Custom test helper (wraps in providers)
import { renderWithProviders } from '@/__tests__/utils/test-utils';

// The component being tested
import { Greeting } from '@/components/greeting';
```

**Why `renderWithProviders` instead of `render`?**

Many components need context providers (React Query, Auth, Theme). `renderWithProviders` wraps your component automatically:

```typescript
// This:
renderWithProviders(<MyComponent />);

// Is equivalent to:
render(
  <QueryClientProvider client={testQueryClient}>
    <MyComponent />
  </QueryClientProvider>
);
```

**User interaction pattern**:
```typescript
const user = userEvent.setup({ delay: null }); // delay: null = instant clicks
await user.click(button);      // Click
await user.type(input, 'text'); // Type
await user.hover(element);      // Hover
```

**Why `await`?** User interactions trigger state updates which are asynchronous in React.

---

## Common Testing Patterns

### Pattern 1: Testing Component Rendering

**Test**: Does the component show up with correct content?

```typescript
it('should display user information', async () => {
  // Arrange: Render component
  renderWithProviders(<UserInfo />);

  // Assert: Check content appears (async data)
  await waitFor(() => {
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  expect(screen.getByText('test-user-id')).toBeInTheDocument();
});
```

**Key techniques**:
- Use `await waitFor()` for async data
- Query by user-visible text, not test IDs
- Check multiple elements to ensure correct render

### Pattern 2: Testing User Interactions

**Test**: Does clicking/typing do what it should?

```typescript
it('should start recording when button is pressed', async () => {
  // Arrange
  const user = userEvent.setup({ delay: null });
  const mocks = setupMediaDeviceMocks(); // Mock microphone
  renderWithProviders(<VoiceRecorder />);

  // Act
  const button = screen.getByRole('button', { name: /voice recorder/i });
  await user.pointer({ target: button, keys: '[MouseLeft>]' }); // Mouse down

  // Assert
  await waitFor(() => {
    expect(mocks.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });
});
```

**Key techniques**:
- `userEvent.setup()` at the start
- `await user.click()`, `await user.type()`, etc.
- Check side effects (function calls, state changes)

### Pattern 3: Testing API Calls

**Test**: Does the component fetch and display data correctly?

```typescript
it('should fetch current user on mount', async () => {
  // Arrange: Render component (triggers useEffect fetch)
  renderWithProviders(<UserProfile />);

  // Assert: Check loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Assert: Check data appears after fetch
  await waitFor(() => {
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  // Assert: Loading state is gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

**What's happening under the hood**:
1. Component renders and calls `fetch('/api/v1/me')`
2. MSW intercepts the request
3. MSW returns fake data: `{ user: { email: 'test@example.com' } }`
4. Component updates with the data
5. Test verifies the email appears

### Pattern 4: Testing Error Handling

**Test**: Does the component handle errors gracefully?

```typescript
it('should display error message when API fails', async () => {
  // Arrange: Override MSW to return error
  server.use(
    http.get('/api/v1/me', () => {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    })
  );

  renderWithProviders(<UserProfile />);

  // Assert: Error message appears
  await waitFor(() => {
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
  });

  // Assert: No user data shown
  expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
});
```

**Key techniques**:
- `server.use()` to override default handlers
- Test both error state AND absence of success state
- Verify error messages are user-friendly

### Pattern 5: Testing React Hooks

**Test**: Does a custom hook work correctly?

```typescript
import { renderHook, waitFor } from '@testing-library/react';

it('should fetch user data', async () => {
  // Arrange: Render hook with providers
  const { result } = renderHook(() => useCurrentUser(), {
    wrapper: TestProviders, // Wraps in QueryClientProvider
  });

  // Assert: Initially loading
  expect(result.current.isLoading).toBe(true);

  // Assert: Eventually has data
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toEqual({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  });
});
```

**Key differences from component tests**:
- Use `renderHook()` instead of `render()`
- Access hook result via `result.current`
- Still need providers (TanStack Query, etc.)

### Pattern 6: Testing Accessibility

**Test**: Can users with assistive tech use this?

```typescript
it('should have accessible voice recorder button', () => {
  renderWithProviders(<VoiceRecorder />);

  // Query by ARIA role and accessible name
  const button = screen.getByRole('button', {
    name: /voice recorder/i
  });

  expect(button).toHaveAttribute('aria-label');
  expect(button).not.toHaveAttribute('aria-disabled');
});
```

**Why this matters**:
- Ensures screen readers can describe elements
- Enforces semantic HTML (buttons should be `<button>`, not `<div>`)
- Tests keyboard navigation (can you tab to it?)

### Pattern 7: Testing UI Text and Conditional Rendering

**Test**: Does the component display different content based on props or state?

Example from `glowy-orb.test.tsx`:

```typescript
describe('Greeting Message', () => {
  it('should display greeting message without firstName', () => {
    renderWithProviders(<GlowyOrb />);
    const greeting = screen.getByText(/welcome to Donna!/i);
    expect(greeting).toBeInTheDocument();
  });

  it('should display greeting message with firstName', () => {
    renderWithProviders(<GlowyOrb firstName="Alice" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Alice');
    expect(heading.textContent).toContain('welcome to Donna!');
  });

  it('should display one of the valid greetings', () => {
    const VALID_GREETINGS = ['Hello', 'Hola', 'Bonjour', 'Ciao'];
    const { container } = renderWithProviders(<GlowyOrb />);

    const heading = container.querySelector('h1');
    const hasValidGreeting = VALID_GREETINGS.some(greeting =>
      heading?.textContent?.includes(greeting)
    );
    expect(hasValidGreeting).toBe(true);
  });
});
```

**Key techniques**:
- Test both with and without optional props
- Use `.textContent` when elements have nested components
- Test randomized/dynamic content using arrays of valid values
- Always use semantic queries when possible (`getByRole`, not selectors)

**When to use `.textContent` vs `getByText`**:
- `getByText()` - When the entire text is in one element
- `.textContent` - When text is split across multiple child elements (e.g., `<h1>Hello <span>Alice</span></h1>`)

---

## The Mocking System Deep Dive

Mocking is the art of **replacing real dependencies with fake ones** for testing. Let's understand why and how.

### Why Mock?

**Problem**: Your component depends on external systems:
- **Supabase Auth** - User authentication
- **Backend API** - User data, voice uploads
- **Browser APIs** - MediaRecorder, getUserMedia

**Without mocking**:
- Tests would need real Supabase accounts
- Tests would need the backend server running
- Tests would need microphone permissions
- Tests would be slow (network calls)
- Tests would be flaky (network issues)
- Tests would affect production data

**With mocking**:
- Tests run in isolation (no external dependencies)
- Tests are fast (no network calls)
- Tests are predictable (same results every time)
- Tests can simulate edge cases (API errors, no microphone)

### Mock Utility 1: `renderWithProviders()`

**Location**: `__tests__/utils/test-utils.tsx`

**What it does**: Wraps components in providers needed for testing.

```typescript
export function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

**Why needed?**

Many components use React Query (`useQuery`, `useMutation`). React Query requires a `QueryClientProvider` at the root. Without it, components crash.

**`createTestQueryClient()` configuration**:

```typescript
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,        // Don't retry failed queries in tests
        gcTime: Infinity,    // Keep data in cache forever
        staleTime: Infinity, // Data never goes stale
      },
      mutations: {
        retry: false,        // Don't retry failed mutations
      },
    },
    logger: {
      log: vi.fn(),          // Silence logs
      warn: vi.fn(),
      error: vi.fn(),
    },
  });
}
```

**Why these settings?**
- `retry: false` - Tests should fail fast, not retry 3 times
- `gcTime: Infinity` - Prevent cache cleanup during tests
- Mocked logger - No console spam during test runs

**Usage**:
```typescript
// Instead of:
render(<MyComponent />); // ❌ Crashes if component uses useQuery

// Use:
renderWithProviders(<MyComponent />); // ✅ Works!
```

### Mock Utility 2: Supabase Client Mock

**Location**: `__tests__/utils/mock-supabase.ts`

**What it does**: Creates a fake Supabase client with mock auth.

```typescript
export function mockSupabaseClient(options?: { session?: Session | null }) {
  const mockSession = options?.session ?? {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      // ... other user fields
    },
  };

  return {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: mockSession } })
      ),
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockSession?.user } })
      ),
      signOut: vi.fn(() =>
        Promise.resolve({ error: null })
      ),
    },
  };
}
```

**How it's used globally** (`vitest.setup.ts`):

```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient()),
}));
```

**What this means**:
- Every test gets a fake Supabase client
- User is always authenticated as 'test-user-id'
- No real auth calls are made
- Tests don't need valid API keys

**Testing logged-out state**:

```typescript
it('should redirect to login when not authenticated', () => {
  // Override global mock for this test
  vi.mocked(createClient).mockReturnValue(
    mockSupabaseClient({ session: null }) // Logged out
  );

  renderWithProviders(<ProtectedPage />);

  expect(screen.getByText('Please log in')).toBeInTheDocument();
});
```

### Mock Utility 3: Media Devices Mock

**Location**: `__tests__/utils/mock-media-devices.ts`

**What it does**: Mocks browser APIs for audio recording.

**The problem**:
- `navigator.mediaDevices.getUserMedia()` asks for microphone permission
- `MediaRecorder` records actual audio
- `AudioContext` analyzes real sound
- Tests would require user interaction and microphone access

**The solution**:

```typescript
export function setupMediaDeviceMocks() {
  // Mock getUserMedia (microphone access)
  const mockStream = {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  };

  const getUserMedia = vi.fn(() => Promise.resolve(mockStream));

  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia },
    writable: true,
  });

  // Mock MediaRecorder (audio recording)
  const mockMediaRecorder = vi.fn((stream) => ({
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    state: 'inactive',
    ondataavailable: null,
    onstop: null,
  }));

  global.MediaRecorder = mockMediaRecorder as any;

  // Mock AudioContext (audio analysis)
  global.AudioContext = vi.fn(() => ({
    createAnalyser: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      getByteTimeDomainData: vi.fn(),
    })),
    createMediaStreamSource: vi.fn(() => ({
      connect: vi.fn(),
    })),
  })) as any;

  return { getUserMedia, mockMediaRecorder };
}
```

**Usage in tests**:

```typescript
beforeEach(() => {
  const mocks = setupMediaDeviceMocks();
  // Now your component can "access the microphone" safely
});

it('should request microphone access', async () => {
  const { getUserMedia } = setupMediaDeviceMocks();
  renderWithProviders(<VoiceRecorder />);

  // Trigger recording
  const button = screen.getByRole('button');
  await user.click(button);

  // Verify mock was called
  expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
});
```

### Mock Utility 4: MSW (Mock Service Worker)

**Location**: `mocks/handlers.ts`, `mocks/server.ts`

**What it does**: Intercepts HTTP requests at the network level.

**The magic**: Your app code makes real `fetch()` calls. MSW intercepts them **before they leave the browser** and returns fake responses. Your app never knows!

**Setting up handlers** (`mocks/handlers.ts`):

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Health check
  http.get('/health', () => {
    return HttpResponse.json({ status: 'healthy' });
  }),

  // Get current user
  http.get('/api/v1/me', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      },
    });
  }),

  // Upload voice recording
  http.post('/api/v1/voice-recordings', () => {
    return HttpResponse.json({
      id: 'recording-123',
      url: 'https://storage.example.com/recording.mp3',
    });
  }),
];

// Error handlers for testing error cases
export const errorHandlers = {
  userUnauthorized: http.get('/api/v1/me', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  voiceUploadError: http.post('/api/v1/voice-recordings', () => {
    return HttpResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }),
};
```

**Starting the server** (`mocks/server.ts`):

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Global activation** (`vitest.setup.ts`):

```typescript
import { server } from '@/mocks/server';

beforeAll(() => server.listen());          // Start before all tests
afterEach(() => server.resetHandlers());   // Reset between tests
afterAll(() => server.close());            // Clean up after all tests
```

**Using error handlers in tests**:

```typescript
it('should display error when upload fails', async () => {
  // Override default handler for this test
  server.use(errorHandlers.voiceUploadError);

  const user = userEvent.setup();
  renderWithProviders(<VoiceRecorder />);

  // Trigger upload
  await user.click(screen.getByRole('button'));

  // Verify error handling
  await waitFor(() => {
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });
});
```

**Why MSW is powerful**:
- Works with any HTTP client (fetch, axios, etc.)
- No code changes needed (drop-in mocking)
- Can mock GraphQL, REST, anything over HTTP
- Reusable between tests and Storybook

---

## Running & Debugging Tests

### Running Tests

```bash
# Watch mode (re-runs on file changes)
pnpm test

# Run all tests once
pnpm test run

# Run specific test file
pnpm test voice-recorder

# Run specific test file (full path)
pnpm test __tests__/components/voice-recorder.test.tsx

# Run tests matching pattern
pnpm test "user-info"

# Run with coverage report
pnpm test:coverage

# Open visual UI
pnpm test:ui

# E2E tests (Playwright)
pnpm test:e2e

# E2E with visual UI
pnpm test:e2e:ui
```

### Filtering Tests

**Run only one test**:
```typescript
it.only('should do something', () => {
  // Only this test runs
});
```

**Skip a test**:
```typescript
it.skip('should do something', () => {
  // This test is skipped
});
```

**Run only one describe block**:
```typescript
describe.only('Component', () => {
  // Only tests in this block run
});
```

### Reading Test Output

**Successful test**:
```
✓ components/voice-recorder.test.tsx (5)
  ✓ VoiceRecorder (5)
    ✓ should render the voice recorder button
    ✓ should start recording on mouse down
    ✓ should stop recording on mouse up
    ✓ should handle upload errors
    ✓ should have accessible button

Test Files  1 passed (1)
     Tests  5 passed (5)
  Start at  10:30:00
  Duration  2.34s
```

**Failed test**:
```
✗ components/user-info.test.tsx (1)
  ✗ should display user email
    Expected: 'test@example.com'
    Received: ''

    ❯ __tests__/components/user-info.test.tsx:15:5
       13| renderWithProviders(<UserInfo />);
       14|
       15| expect(screen.getByText('test@example.com')).toBeInTheDocument();
         |     ^
       16| });
```

### Common Errors and Solutions

#### Error: "Unable to find element with text: X"

**Problem**: Element doesn't exist or hasn't appeared yet.

**Solutions**:
```typescript
// ❌ WRONG - element may not be there yet
expect(screen.getByText('John')).toBeInTheDocument();

// ✅ CORRECT - wait for element
await waitFor(() => {
  expect(screen.getByText('John')).toBeInTheDocument();
});

// ✅ ALSO CORRECT - use findBy (built-in wait)
expect(await screen.findByText('John')).toBeInTheDocument();
```

#### Error: "Not wrapped in QueryClientProvider"

**Problem**: Component uses React Query but no provider.

**Solution**:
```typescript
// ❌ WRONG
render(<MyComponent />);

// ✅ CORRECT
renderWithProviders(<MyComponent />);
```

#### Error: "Cannot call vi.mock() after the module is imported"

**Problem**: Mock must be at the top of the file, before imports.

**Solution**:
```typescript
// ❌ WRONG
import { MyComponent } from './component';
vi.mock('./api');

// ✅ CORRECT
vi.mock('./api');
import { MyComponent } from './component';
```

#### Error: "Test timeout exceeded"

**Problem**: Async operation never completes.

**Solutions**:
1. Check if `await` is missing
2. Increase timeout: `it('test', async () => {...}, 10000)` (10s)
3. Check if mock is returning a response

#### Error: "Cannot read properties of undefined (reading 'getByText')"

**Problem**: Missing `screen` import or wrong query method.

**Solution**:
```typescript
import { screen } from '@testing-library/react';

// Then use:
screen.getByText('...');
```

### Debugging Techniques

#### 1. Print current DOM

```typescript
it('debug test', () => {
  renderWithProviders(<MyComponent />);

  // Print entire DOM
  screen.debug();

  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

#### 2. Check what queries are available

```typescript
it('debug test', () => {
  renderWithProviders(<MyComponent />);

  // Suggests available queries
  screen.getByRole('nonexistent'); // Error shows all available roles
});
```

#### 3. Use Vitest UI

```bash
pnpm test:ui
```

Opens browser with visual test runner:
- See test execution in real-time
- Click tests to focus
- View console logs
- Time travel through test execution

#### 4. Console log in tests

```typescript
it('debug test', async () => {
  renderWithProviders(<MyComponent />);

  console.log('Before click');
  await user.click(button);
  console.log('After click');

  // Logs appear in terminal
});
```

#### 5. Pause test execution

```typescript
it('debug test', async () => {
  renderWithProviders(<MyComponent />);

  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

  // Gives you time to inspect browser dev tools
});
```

---

## Real Examples from the Codebase

### Example 1: Simple Component Test (`user-info.test.tsx`)

**Component**: `components/user-info.tsx` (displays user information)

**Test**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils/test-utils';
import { UserInfo } from '@/components/user-info';

describe('UserInfo', () => {
  it('should display user data when loaded', async () => {
    // ARRANGE: Render component
    renderWithProviders(<UserInfo />);

    // Component will:
    // 1. Mount and call useCurrentUser() hook
    // 2. Hook makes fetch('/api/v1/me')
    // 3. MSW intercepts and returns mock user data
    // 4. Component updates with data

    // ASSERT: Wait for async data to appear
    await waitFor(() => {
      expect(screen.getByText('test-user-id')).toBeInTheDocument();
    });

    // ASSERT: Check email is also displayed
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    // ARRANGE
    renderWithProviders(<UserInfo />);

    // ASSERT: Loading indicator present immediately
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    // ARRANGE: Override MSW to return error
    server.use(
      http.get('/api/v1/me', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    renderWithProviders(<UserInfo />);

    // ASSERT: Error message appears
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

**Key takeaways**:
- Test loading → success → error states
- Use `waitFor()` for async data
- Override MSW handlers to test errors

### Example 2: Complex Component Test (`glowy-orb.test.tsx`)

**Component**: `components/glowy-orb.tsx` (voice recording interface with animated orb and greeting)

**Challenges**:
- Uses `getUserMedia()` (microphone access)
- Uses `MediaRecorder` (audio recording)
- Uses `AudioContext` (audio visualization)
- Has complex mouse/touch/keyboard interactions (press & hold)
- Uploads data to API
- Has randomized UI state (greeting selection)

**Test**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/test-utils';
import { setupMediaDeviceMocks } from '@/__tests__/utils/mock-media-devices';
import { GlowyOrb } from '@/components/glowy-orb';

describe('GlowyOrb', () => {
  let mocks: ReturnType<typeof setupMediaDeviceMocks>;

  beforeEach(() => {
    // Setup: Mock browser media APIs before each test
    mocks = setupMediaDeviceMocks();
  });

  describe('Rendering', () => {
    it('should render the glowy orb button', () => {
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });
      expect(button).toBeInTheDocument();
    });

    it('should display greeting message', () => {
      renderWithProviders(<GlowyOrb firstName="Alice" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toContain('Alice');
      expect(heading.textContent).toContain('welcome to Donna!');
    });
  });

  describe('Recording Flow', () => {
    it('should start recording on mouse down', async () => {
      // ARRANGE
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // ACT: Mouse down (press and hold)
      await user.pointer({
        target: button,
        keys: '[MouseLeft>]' // > means "hold down"
      });

      // ASSERT: Microphone access requested
      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalledWith({
          audio: true
        });
      });

      // ASSERT: MediaRecorder started
      expect(mocks.mockMediaRecorder).toHaveBeenCalled();
    });

    it('should stop recording on mouse up', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // Start recording
      await user.pointer({ target: button, keys: '[MouseLeft>]' });
      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      // ACT: Mouse up (release)
      await user.pointer({
        target: button,
        keys: '[/MouseLeft]' // / means "release"
      });

      // ASSERT: Recording stopped
      await waitFor(() => {
        expect(mocks.mockMediaRecorder().stop).toHaveBeenCalled();
      });
    });

    it('should upload recording after stopping', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // Start recording
      await user.pointer({ target: button, keys: '[MouseLeft>]' });
      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      // Stop recording (triggers upload)
      await user.pointer({ target: button, keys: '[/MouseLeft]' });

      // ASSERT: Upload API called
      // MSW intercepts POST to /api/v1/voice-recordings
      await waitFor(() => {
        expect(screen.getByText(/uploaded/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle microphone access denial', async () => {
      // ARRANGE: Mock getUserMedia to reject
      mocks.getUserMedia.mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // ACT: Try to start recording
      await user.pointer({ target: button, keys: '[MouseLeft>]' });

      // ASSERT: Error message shown
      await waitFor(() => {
        expect(screen.getByText(/microphone access denied/i))
          .toBeInTheDocument();
      });
    });

    it('should handle upload errors', async () => {
      // ARRANGE: Override MSW to return error
      server.use(errorHandlers.voiceUploadError);

      const onUploadError = vi.fn(); // Mock callback
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <GlowyOrb onUploadError={onUploadError} />
      );

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // Start and stop recording
      await user.pointer({ target: button, keys: '[MouseLeft>]' });
      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      await user.pointer({ target: button, keys: '[/MouseLeft]' });

      // ASSERT: Error callback invoked
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(
          expect.any(Error)
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button with label', () => {
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      expect(button).toHaveAttribute('aria-label');
    });

    it('should announce recording state to screen readers', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const button = screen.getByRole('button', {
        name: /hold to speak/i
      });

      // Start recording
      await user.pointer({ target: button, keys: '[MouseLeft>]' });

      // ASSERT: ARIA live region updated
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(
          /recording/i
        );
      });
    });
  });
});
```

**Key takeaways**:
- Group related tests with nested `describe` blocks
- Use `beforeEach` for common setup (mocks)
- Test user flows step-by-step (start → stop → upload)
- Test error cases explicitly
- Don't forget accessibility tests

### Example 3: API Client Test (`client.test.ts`)

**File**: `lib/api/client.ts` (API client with auth headers)

**Test**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it('should include Authorization header when session exists', async () => {
    // ARRANGE: Supabase client already mocked in vitest.setup.ts

    // ACT: Make API call
    const response = await api.get('/api/v1/me');

    // ASSERT: Response contains user data
    expect(response).toHaveProperty('user');
    expect(response.user).toMatchObject({
      id: 'test-user-id',
      email: 'test@example.com',
    });
  });

  it('should not include Authorization header when no session', async () => {
    // ARRANGE: Override mock to return no session
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: null } })
        ),
      },
    } as any);

    // ACT: Make API call (should fail or return 401)
    await expect(api.get('/api/v1/me')).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    // ARRANGE: Override MSW to fail
    server.use(
      http.get('/api/v1/me', () => {
        return HttpResponse.error(); // Network error
      })
    );

    // ACT & ASSERT: Should throw
    await expect(api.get('/api/v1/me')).rejects.toThrow();
  });

  it('should parse JSON responses', async () => {
    // ARRANGE: Default MSW handler returns JSON

    // ACT
    const response = await api.get('/api/v1/me');

    // ASSERT: Response is parsed object, not string
    expect(typeof response).toBe('object');
    expect(response.user.email).toBe('test@example.com');
  });
});
```

**Key takeaways**:
- Test both success and failure cases
- Mock external dependencies (Supabase)
- Test error handling explicitly
- Verify data is parsed correctly

### Example 4: React Hook Test (`hooks.test.tsx`)

**File**: `lib/api/hooks.tsx` (React Query hooks)

**Test**:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentUser } from '@/lib/api/hooks';
import { TestProviders } from '@/__tests__/utils/test-utils';

describe('useCurrentUser', () => {
  it('should fetch and return current user data', async () => {
    // ARRANGE & ACT: Render hook
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: TestProviders, // Wraps in QueryClientProvider
    });

    // ASSERT: Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // ASSERT: Eventually succeeds
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT: Has correct data
    expect(result.current.data).toEqual({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: expect.any(String),
      },
    });
  });

  it('should handle fetch errors', async () => {
    // ARRANGE: Override MSW to return error
    server.use(
      http.get('/api/v1/me', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    // ACT
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: TestProviders,
    });

    // ASSERT: Eventually errors
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should not refetch on window focus', async () => {
    // ARRANGE
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Clear MSW call history
    vi.clearAllMocks();

    // ACT: Simulate window focus
    window.dispatchEvent(new Event('focus'));

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // ASSERT: No additional fetch
    // (Would need to spy on fetch or check MSW call count)
  });
});
```

**Key takeaways**:
- Use `renderHook()` for testing hooks
- Access hook state via `result.current`
- Test loading, success, error states
- Verify hook configuration (refetch behavior, etc.)

### Example 5: E2E Test (`e2e/auth.spec.ts`)

**Test**: Authentication flow with Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to /login', async ({ page }) => {
    // ARRANGE & ACT: Navigate to protected page
    await page.goto('/');

    // ASSERT: Redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should display login page content', async ({ page }) => {
    // ARRANGE & ACT
    await page.goto('/login');

    // ASSERT: Login UI visible
    await expect(page.getByText('Welcome to Donna')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test.skip('should log in with valid credentials', async ({ page }) => {
    // Skipped: Requires real Supabase auth setup
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test.skip('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});
```

**Key differences from unit tests**:
- Uses real browser (`page` object)
- Tests complete user flows (multi-page)
- No mocking (tests real integration)
- Slower but more realistic

**Why tests are skipped**:
- Require real Supabase project with test users
- Need environment variables configured
- Would slow down CI pipeline

---

## Quick Reference Cheat Sheet

### Test Structure

```typescript
describe('Feature', () => {
  beforeEach(() => { /* setup */ });
  afterEach(() => { /* cleanup */ });

  it('should do something', async () => {
    // Arrange
    renderWithProviders(<Component />);

    // Act
    await user.click(button);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Query Methods

```typescript
// Immediate (throws if not found)
screen.getByRole('button')
screen.getByText('Hello')
screen.getByLabelText('Email')

// Nullable (returns null if not found)
screen.queryByText('Error')

// Async (waits up to 1s)
await screen.findByText('Loaded')
```

### Common Queries

```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })
screen.getByText('Exact text')
screen.getByText(/partial text/i)
screen.getByLabelText('Password')
screen.getByPlaceholderText('Enter email')
screen.getByAltText('Company logo')
screen.getByTitle('Close dialog')
screen.getByTestId('custom-element') // Last resort!
```

### User Interactions

```typescript
const user = userEvent.setup({ delay: null });

await user.click(button)
await user.dblClick(button)
await user.type(input, 'Hello')
await user.clear(input)
await user.selectOptions(select, 'option-value')
await user.upload(fileInput, file)
await user.hover(element)
await user.unhover(element)
await user.tab() // Focus next element
```

### Async Testing

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Done')).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});

// Use findBy (built-in wait)
const element = await screen.findByText('Done');

// Wait for multiple assertions
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
  expect(screen.getByText('Done')).toBeInTheDocument();
});
```

### Mocking Functions

```typescript
// Create mock
const mockFn = vi.fn();

// Mock implementation
mockFn.mockImplementation(() => 'result');
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue('async result');
mockFn.mockRejectedValue(new Error('error'));

// Assert calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenLastCalledWith(arg);

// Reset mock
mockFn.mockClear(); // Clear call history
mockFn.mockReset(); // Clear history + implementation
```

### Mocking Modules

```typescript
// Mock entire module
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: 'mock' })),
    post: vi.fn(),
  },
}));

// Mock with implementation
vi.mock('@/lib/api/client', () => {
  return {
    api: {
      get: vi.fn((url) => {
        if (url === '/me') return Promise.resolve({ user: 'test' });
        return Promise.reject(new Error('Not found'));
      }),
    },
  };
});

// Spy on existing function
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
```

### MSW Handlers

```typescript
// Override default handler
server.use(
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ data: 'override' });
  })
);

// Return error
server.use(
  http.get('/api/endpoint', () => {
    return HttpResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  })
);

// Network error
server.use(
  http.get('/api/endpoint', () => {
    return HttpResponse.error();
  })
);
```

### Common Matchers

```typescript
// Equality
expect(value).toBe(5)
expect(obj).toEqual({ a: 1 })
expect(arr).toStrictEqual([1, 2, 3])

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// Numbers
expect(num).toBeGreaterThan(10)
expect(num).toBeLessThan(5)
expect(num).toBeCloseTo(3.14, 2)

// Strings
expect(str).toMatch(/regex/)
expect(str).toContain('substring')

// Arrays/Objects
expect(arr).toContain(item)
expect(arr).toHaveLength(3)
expect(obj).toHaveProperty('key')
expect(obj).toHaveProperty('key', 'value')

// Exceptions
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('Error message')
expect(() => fn()).toThrow(TypeError)

// Promises
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()

// DOM
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveAttribute('href')
expect(element).toHaveClass('active')
expect(element).toHaveTextContent('Hello')
expect(input).toHaveValue('text')
```

### Running Tests

```bash
pnpm test                    # Watch mode
pnpm test run                # Run once
pnpm test voice-recorder     # Specific test
pnpm test:coverage           # Coverage report
pnpm test:ui                 # Visual UI
pnpm test:e2e                # E2E tests
```

### Debugging

```typescript
// Print DOM
screen.debug()
screen.debug(element)

// Check available roles
screen.getByRole('') // Error shows all roles

// Pause execution
await new Promise(r => setTimeout(r, 5000))

// Focus single test
it.only('test', () => { /* ... */ })
```

---

## Final Tips

### 1. Test User Behavior, Not Implementation

```typescript
// ❌ BAD: Testing implementation
expect(component.state.isLoading).toBe(false);
expect(wrapper.find('.button').length).toBe(1);

// ✅ GOOD: Testing behavior
expect(screen.queryByText('Loading')).not.toBeInTheDocument();
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
```

### 2. Prefer User-Centric Queries

**Query priority** (Testing Library recommendation):
1. `getByRole` - Accessible to screen readers
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - If no label
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort (implementation detail)

### 3. Don't Test External Libraries

```typescript
// ❌ BAD: Testing React Query
expect(queryClient.getQueryData(['user'])).toBeDefined();

// ✅ GOOD: Testing your component's behavior
expect(screen.getByText('test@example.com')).toBeInTheDocument();
```

### 4. Keep Tests Simple and Focused

Each test should verify **one behavior**. If you need multiple assertions, group them logically.

```typescript
// ✅ GOOD: Single behavior, multiple assertions
it('should display user information', async () => {
  renderWithProviders(<UserInfo />);

  await waitFor(() => {
    expect(screen.getByText('test-user-id')).toBeInTheDocument();
  });

  // Related assertions for same behavior
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
});
```

### 5. Use Descriptive Test Names

```typescript
// ❌ BAD
it('should work', () => { /* ... */ });
it('test 1', () => { /* ... */ });

// ✅ GOOD
it('should display user email after successful fetch', () => { /* ... */ });
it('should show error message when API returns 401', () => { /* ... */ });
```

### 6. Test Edge Cases

Don't just test the happy path:
- Empty states (no data)
- Loading states
- Error states
- Boundary conditions (max length, null values)
- Disabled states
- Permission denied

### 7. Avoid Test Interdependence

Each test should work in isolation. Never rely on test execution order.

```typescript
// ❌ BAD: Tests depend on each other
let user;

it('should create user', () => {
  user = createUser(); // Sets variable
});

it('should update user', () => {
  updateUser(user); // Depends on previous test
});

// ✅ GOOD: Tests are independent
it('should create user', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

it('should update user', () => {
  const user = createUser(); // Create own user
  updateUser(user);
});
```

### 8. Clean Up Side Effects

```typescript
beforeEach(() => {
  vi.clearAllMocks();      // Clear mock call history
  server.resetHandlers();   // Reset MSW handlers
});

afterEach(() => {
  cleanup();                // Unmount components
});
```

---

## Congratulations!

You now understand Donna's frontend testing infrastructure. You've learned:

✅ Why we test frontends
✅ The testing ecosystem (Vitest, Testing Library, MSW, Playwright)
✅ Core concepts (async/await, mocking, query methods)
✅ How to write and run tests
✅ How the mocking system works
✅ Real patterns from the codebase

### Next Steps

1. **Read existing tests**: Start with simple ones (`user-info.test.tsx`)
2. **Run tests**: `pnpm test` and experiment
3. **Write a test**: Pick a simple component and test it
4. **Explore Vitest UI**: `pnpm test:ui` for visual debugging
5. **Experiment with mocks**: Try overriding MSW handlers

### Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/react)
- [MSW Docs](https://mswjs.io/)
- [Playwright Docs](https://playwright.dev/)

**Remember**: Testing is a skill that improves with practice. Start small, test behavior (not implementation), and write tests that give you confidence to ship code! 🚀
