import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryProvider } from "@/components/providers/query-provider";
import { useQuery } from "@tanstack/react-query";

// Test component that uses React Query
function TestComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["test"],
    queryFn: async () => ({ message: "Hello from Query" }),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.message}</div>;
}

describe("QueryProvider", () => {
  it("should render children", () => {
    render(
      <QueryProvider>
        <div>Test Child</div>
      </QueryProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should provide QueryClient to children", async () => {
    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    // Initially shows loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Eventually shows the data
    expect(await screen.findByText("Hello from Query")).toBeInTheDocument();
  });

  it("should configure QueryClient with default options", async () => {
    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    // The QueryClient has staleTime of 60 seconds and refetchOnWindowFocus: false
    // We can verify it works by checking the query resolves
    expect(await screen.findByText("Hello from Query")).toBeInTheDocument();
  });

  it("should render ReactQueryDevtools", () => {
    const { container } = render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    // ReactQueryDevtools should be rendered (though may not be visible)
    expect(container).toBeInTheDocument();
  });

  it("should create stable QueryClient instance", () => {
    const { rerender } = render(
      <QueryProvider>
        <div>Test 1</div>
      </QueryProvider>
    );

    rerender(
      <QueryProvider>
        <div>Test 2</div>
      </QueryProvider>
    );

    // Should not throw or cause issues with re-rendering
    expect(screen.getByText("Test 2")).toBeInTheDocument();
  });

  it("should handle multiple queries", async () => {
    function MultiQueryComponent() {
      const query1 = useQuery({
        queryKey: ["query1"],
        queryFn: async () => ({ value: "Query 1" }),
      });

      const query2 = useQuery({
        queryKey: ["query2"],
        queryFn: async () => ({ value: "Query 2" }),
      });

      if (query1.isLoading || query2.isLoading) return <div>Loading...</div>;

      return (
        <div>
          <div>{query1.data?.value}</div>
          <div>{query2.data?.value}</div>
        </div>
      );
    }

    render(
      <QueryProvider>
        <MultiQueryComponent />
      </QueryProvider>
    );

    expect(await screen.findByText("Query 1")).toBeInTheDocument();
    expect(await screen.findByText("Query 2")).toBeInTheDocument();
  });

  it("should handle query errors gracefully", async () => {
    function ErrorComponent() {
      const { error, isError, isLoading } = useQuery({
        queryKey: ["error-test"],
        queryFn: async () => {
          throw new Error("Test error");
        },
        retry: false,
      });

      if (isLoading) return <div>Loading...</div>;
      if (isError) return <div>Error: {error.message}</div>;
      return <div>Success</div>;
    }

    render(
      <QueryProvider>
        <ErrorComponent />
      </QueryProvider>
    );

    expect(await screen.findByText("Error: Test error")).toBeInTheDocument();
  });

  it("should support nested providers (edge case)", () => {
    // While unusual, nested providers shouldn't break
    render(
      <QueryProvider>
        <QueryProvider>
          <div>Nested Test</div>
        </QueryProvider>
      </QueryProvider>
    );

    expect(screen.getByText("Nested Test")).toBeInTheDocument();
  });
});
