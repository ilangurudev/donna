import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

/**
 * Create a fresh QueryClient for each test to avoid state pollution
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests for faster failures
        gcTime: 0, // Disable caching to ensure fresh data each test
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  });

/**
 * Test wrapper that provides QueryClient and other necessary providers
 */
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function TestProviders({ children, queryClient }: TestProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * Custom render function that wraps components with necessary providers
 *
 * @example
 * ```ts
 * import { renderWithProviders } from '@/__tests__/utils/test-utils';
 *
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Wait for all promises to resolve
 * Useful for waiting for async state updates
 */
export const waitForPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock window.matchMedia for components that use responsive design
 */
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

/**
 * Mock environment variables for testing
 */
export const mockEnv = (env: Record<string, string>) => {
  const original = { ...process.env };

  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return () => {
    process.env = original;
  };
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
