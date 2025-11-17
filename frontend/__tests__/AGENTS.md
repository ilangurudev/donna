# Frontend Testing Infrastructure - Agent Guide

This document explains Donna's frontend testing setup for AI agents contributing to the codebase. It covers architecture, conventions, and patterns to follow when writing or modifying tests.

## Quick Reference

**Test Runner**: Vitest v4.0.9 | **Component Testing**: @testing-library/react v16.3.0 | **E2E Testing**: Playwright v1.56.1
**API Mocking**: MSW (Mock Service Worker) v2.12.2 | **DOM Simulation**: happy-dom v16.11.7

**Run Tests**:
```bash
pnpm test                    # Unit tests (watch mode)
pnpm test run                # Unit tests (once)
pnpm test:coverage           # With coverage report
pnpm test:ui                 # Visual UI
pnpm test:e2e                # E2E tests
```

## Directory Structure

```
frontend/
├── __tests__/                          # Unit/integration tests (mirrors src/)
│   ├── components/                     # Component tests
│   │   ├── voice-recorder.test.tsx     # Example: Complex component with media APIs
│   │   ├── user-info.test.tsx          # Example: Simple component with API
│   │   └── providers/query-provider.test.tsx
│   ├── lib/api/                        # Business logic tests
│   │   ├── client.test.ts              # API client tests
│   │   └── hooks.test.tsx              # React Query hook tests
│   ├── utils/                          # Test utilities (NOT tests)
│   │   ├── test-utils.tsx              # renderWithProviders, TestProviders
│   │   ├── mock-supabase.ts            # Supabase client mocking
│   │   └── mock-media-devices.ts       # MediaRecorder/AudioContext mocking
│   ├── AGENTS.md                       # This file
│   └── TESTS-TUTORIAL.md               # Human-readable tutorial
├── mocks/                              # MSW configuration
│   ├── server.ts                       # MSW server setup
│   └── handlers.ts                     # Default API mock responses + error handlers
├── e2e/                                # Playwright E2E tests
├── vitest.config.ts                    # Vitest configuration
├── vitest.setup.ts                     # Global test setup (runs before all tests)
└── playwright.config.ts                # Playwright configuration
```

## Configuration Files

### `vitest.config.ts`
- `environment: 'happy-dom'` - DOM simulation in Node.js
- `globals: true` - No need to import `describe`, `it`, `expect`
- `setupFiles: './vitest.setup.ts'` - Global setup
- `alias: { '@': './' }` - Path alias for imports

### `vitest.setup.ts`
Global setup that runs once before all tests:
1. Imports DOM matchers: `@testing-library/jest-dom/vitest`
2. Starts MSW server: `server.listen()` before all tests
3. Resets MSW handlers: `server.resetHandlers()` after each test
4. Mocks window.alert and Supabase globally

## Test Utilities

### 1. `renderWithProviders()` (`__tests__/utils/test-utils.tsx`)
Wraps components in necessary providers (QueryClientProvider, etc.)

```typescript
import { renderWithProviders } from '@/__tests__/utils/test-utils';
renderWithProviders(<MyComponent />);
```

**Why needed**: Components using React Query hooks require `QueryClientProvider`.

### 2. `TestProviders` Component
Provider wrapper for `renderHook()`:

```typescript
import { renderHook } from '@testing-library/react';
import { TestProviders } from '@/__tests__/utils/test-utils';

const { result } = renderHook(() => useCurrentUser(), { wrapper: TestProviders });
```

### 3. `mockSupabaseClient()` (`__tests__/utils/mock-supabase.ts`)
Creates fake Supabase client with mock authentication. Default returns authenticated user session.

**Testing logged-out state**:
```typescript
import { mockSupabaseClient } from '@/__tests__/utils/mock-supabase';
import { createClient } from '@/lib/supabase/client';

vi.mocked(createClient).mockReturnValue(mockSupabaseClient({ session: null }));
```

### 4. `setupMediaDeviceMocks()` (`__tests__/utils/mock-media-devices.ts`)
Mocks browser media APIs: `navigator.mediaDevices.getUserMedia()`, `MediaRecorder`, `AudioContext`, `requestAnimationFrame`

```typescript
import { setupMediaDeviceMocks } from '@/__tests__/utils/mock-media-devices';

beforeEach(() => {
  const mocks = setupMediaDeviceMocks();
});
```

## MSW (Mock Service Worker)

MSW intercepts HTTP requests at the network level and returns mock responses. Your app makes real `fetch()` calls, but MSW intercepts them.

### `mocks/handlers.ts` Structure:
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/me', () => {
    return HttpResponse.json({ user: { id: 'test-user-id', email: 'test@example.com' } });
  }),
];

export const errorHandlers = {
  userUnauthorized: http.get('/api/v1/me', () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),
};
```

### Using MSW in Tests:
```typescript
import { server } from '@/mocks/server';
import { errorHandlers } from '@/mocks/handlers';

it('should handle API error', async () => {
  server.use(errorHandlers.userUnauthorized); // Override default handler
  renderWithProviders(<UserProfile />);
  await waitFor(() => {
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
  });
});
```

**Custom handler**: `server.use(http.get('/api/v1/me', () => HttpResponse.json({ ... })))`
**Network error**: `server.use(http.get('/api/v1/me', () => HttpResponse.error()))`

## Testing Patterns

### Pattern 1: Component Rendering

```typescript
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils/test-utils';

describe('MyComponent', () => {
  it('should display content after loading', async () => {
    renderWithProviders(<MyComponent />);
    await waitFor(() => {
      expect(screen.getByText('Loaded content')).toBeInTheDocument();
    });
  });
});
```

**Key points**: Use `renderWithProviders()` for React Query components, `await waitFor()` for async content, query by user-visible text/roles.

### Pattern 2: User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup({ delay: null }); // Instant interactions
  renderWithProviders(<MyComponent />);

  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

**Available interactions**: `user.click()`, `user.type()`, `user.clear()`, `user.hover()`, `user.pointer({ target, keys: '[MouseLeft>]' })` (mouse down), `user.pointer({ target, keys: '[/MouseLeft]' })` (mouse up)

### Pattern 3: Testing with Media APIs

```typescript
import { setupMediaDeviceMocks } from '@/__tests__/utils/mock-media-devices';

describe('VoiceRecorder', () => {
  let mocks: ReturnType<typeof setupMediaDeviceMocks>;

  beforeEach(() => {
    mocks = setupMediaDeviceMocks();
  });

  it('should request microphone access', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<VoiceRecorder />);

    await user.click(screen.getByRole('button', { name: /record/i }));
    await waitFor(() => {
      expect(mocks.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });
  });

  it('should handle permission denial', async () => {
    mocks.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<VoiceRecorder />);

    await user.click(screen.getByRole('button', { name: /record/i }));
    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });
  });
});
```

## Testing Library Queries

### Query Priority (Recommended Order)
1. **`getByRole()`** - Most accessible, semantic
2. **`getByLabelText()`** - Good for form elements
3. **`getByText()`** - Non-interactive content
4. **`getByTestId()`** - Last resort

### Query Types
- `getBy*()` - Returns element, throws if not found (use for elements that exist NOW)
- `queryBy*()` - Returns element or null (use to assert element does NOT exist)
- `findBy*()` - Returns Promise<Element>, waits up to 1s (use for async elements)

**Multiple elements**: `getAllBy*()`, `queryAllBy*()`, `findAllBy*()`

### Common Queries
```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByText('Exact text')
screen.getByText(/partial text/i)
screen.getByLabelText('Email')
```

### Async Queries
```typescript
// Option 1: findBy (built-in wait)
const element = await screen.findByText('Loaded');

// Option 2: waitFor (for multiple assertions or custom conditions)
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Mock Functions (Vitest)

### Creating & Using Mocks
```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
const mockFn = vi.fn(() => 'return value');
mockFn.mockReturnValue('value');
mockFn.mockReturnValueOnce('first');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('Async error'));

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);

// Cleanup
mockFn.mockClear();
vi.clearAllMocks();
```

### Spying on Functions
```typescript
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
expect(spy).toHaveBeenCalled();
spy.mockRestore(); // Restore original
```

## Mocking Modules

### Module Mock (Global)
Place at **top of file** before imports:

```typescript
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: 'mock' })),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api/client'; // Now mocked
```

### Accessing Mocked Module
```typescript
import { vi } from 'vitest';
import { createClient } from '@/lib/supabase/client';

vi.mocked(createClient).mockReturnValue(mockSupabaseClient());
```

## Test Organization

### File Naming & Structure
- **Unit tests**: `<component-name>.test.tsx` or `<file-name>.test.ts`
- **E2E tests**: `<feature>.spec.ts`
- **Location**: Mirror `src/` structure in `__tests__/`

### Test Structure (AAA Pattern)
```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Arrange: Set up common state
  });

  afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  it('should do something specific', async () => {
    // ARRANGE: Set up test-specific state
    const user = userEvent.setup();
    renderWithProviders(<Component />);

    // ACT: Perform action
    await user.click(button);

    // ASSERT: Verify outcome
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Grouping Tests
```typescript
describe('VoiceRecorder', () => {
  describe('Rendering', () => { /* ... */ });
  describe('Recording Flow', () => { /* ... */ });
  describe('Error Handling', () => { /* ... */ });
});
```

## Best Practices

### 1. Test User Behavior, Not Implementation
```typescript
// ❌ BAD: Implementation details
expect(wrapper.state().isLoading).toBe(false);

// ✅ GOOD: User-observable behavior
expect(screen.queryByText('Loading')).not.toBeInTheDocument();
```

### 2. Use Semantic Queries
```typescript
// ❌ BAD: Test IDs, CSS selectors
screen.getByTestId('submit-button')

// ✅ GOOD: Semantic queries
screen.getByRole('button', { name: /submit/i })
```

### 3. Test Edge Cases
- ✅ Loading states, error states, empty states, disabled states
- ✅ Permission denied, network errors, boundary conditions

### 4. Keep Tests Independent
Each test should work in isolation, not depend on other tests, clean up after itself, and not rely on execution order.

### 5. Use Descriptive Names
`it('should display user email after successful fetch', () => {})` not `it('test 1', () => {})`

### 6. Avoid Testing External Libraries
Test your component's behavior, not React Query or other libraries.

### 7. Clean Up Side Effects
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  server.resetHandlers();
});
```

## Common Matchers Reference

```typescript
// Most used matchers:
expect(value).toBe(5) / .toEqual(obj) / .toBeTruthy()
expect(element).toBeInTheDocument() / .toBeVisible() / .toHaveTextContent('text')
expect(mockFn).toHaveBeenCalled() / .toHaveBeenCalledWith(args) / .toHaveBeenCalledTimes(n)
await expect(promise).resolves.toBe(value) / .rejects.toThrow()
```

## Adding New Tests

### For a New Component
1. Create `__tests__/components/<component-name>.test.tsx`
2. Import: `describe, it, expect, vi` from vitest; `screen, waitFor` from @testing-library/react; `userEvent`; `renderWithProviders`
3. Structure with `describe` blocks (Rendering, User Interactions, Error Handling)
4. Run: `pnpm test my-component`

### For a New API Endpoint
Add handlers to `mocks/handlers.ts` (success + error), then test client/hook and components using it.

### For a New Mock Utility
Create `__tests__/utils/mock-<feature>.ts`, export setup function, document in AGENTS.md.

## Debugging Tests

```typescript
screen.debug(); // Print current DOM
screen.getByRole('nonexistent'); // See available queries in error message
it.only('run only this test', () => {}); // Focus specific test
it.skip('skip this test', () => {}); // Skip test
```

**Vitest UI**: `pnpm test:ui` - Visual interface with real-time execution, console logs, time travel debugging

## E2E Tests (Playwright)

Location: `e2e/<feature>.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/success');
  });
});
```

**E2E**: Multi-page flows, auth flows, critical paths, real browser | **Unit**: Component rendering, interactions, hooks, fast feedback

## Common Issues

### "Not wrapped in QueryClientProvider"
**Fix**: Use `renderWithProviders()` instead of `render()`

### "Unable to find element"
**Fix**: Use `await waitFor()` or `findBy*()` for async content:
```typescript
await waitFor(() => expect(screen.getByText('Text')).toBeInTheDocument());
// OR
expect(await screen.findByText('Text')).toBeInTheDocument();
```

### "Test timeout exceeded"
**Fixes**:
1. Check if `await` is missing
2. Increase timeout: `it('test', async () => {...}, 10000)`
3. Verify MSW handler exists and returns response

### "vi.mock() must be called at the top"
**Fix**: Move `vi.mock()` before all imports

### "Cannot read properties of undefined"
**Fix**: Verify imports and use correct query type

## Summary

**Key Files**:
- `vitest.setup.ts` - Global test setup
- `__tests__/utils/test-utils.tsx` - Custom render helpers
- `__tests__/utils/mock-supabase.ts` - Supabase mocking
- `__tests__/utils/mock-media-devices.ts` - Media API mocking
- `mocks/handlers.ts` - API mock responses
- `mocks/server.ts` - MSW server setup

**Key Patterns**:
- Use `renderWithProviders()` for components with React Query
- Use `await waitFor()` for async assertions
- Use `screen.getByRole()` for semantic queries
- Override MSW handlers with `server.use()` for errors
- Test behavior, not implementation
- Keep tests independent and descriptive

**Running Tests**:
- `pnpm test` - Watch mode
- `pnpm test run` - Run once
- `pnpm test <name>` - Run specific file
- `pnpm test:ui` - Visual UI
- `pnpm test:e2e` - E2E tests

For human-readable tutorial, see `TESTS-TUTORIAL.md`.
