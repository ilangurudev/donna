import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Example component test
function ExampleComponent() {
  return <div>Hello, Vitest!</div>;
}

describe("ExampleComponent", () => {
  it("renders hello message", () => {
    render(<ExampleComponent />);
    expect(screen.getByText("Hello, Vitest!")).toBeInTheDocument();
  });
});
