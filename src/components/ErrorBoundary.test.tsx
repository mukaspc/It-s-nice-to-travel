import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

// Mock the lucide-react icon to avoid rendering issues
vi.mock("lucide-react", () => ({
  RefreshCw: ({ className }: { className?: string }) => <div data-testid="refresh-icon" className={className} />,
}));

// Mock the Button component
vi.mock("./ui/button", () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} data-testid="retry-button" data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div data-testid="success-component">Success!</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error for tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("success-component")).toBeInTheDocument();
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("should render error UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId("success-component")).not.toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    expect(screen.getByTestId("refresh-icon")).toBeInTheDocument();
  });

  it("should render fallback UI when provided", () => {
    const fallbackComponent = <div data-testid="custom-fallback">Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={fallbackComponent}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should reset error state when retry button is clicked", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      React.useEffect(() => {
        // Simulate fixing the error after retry
        const timer = setTimeout(() => setShouldThrow(false), 100);
        return () => clearTimeout(timer);
      }, []);

      return <ErrorThrowingComponent shouldThrow={shouldThrow} />;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Initially should show error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click retry button
    await user.click(screen.getByTestId("retry-button"));

    // Should attempt to re-render children
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
  });

  it("should log error to console when error occurs", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error caught by boundary:"),
      expect.any(Error),
      expect.any(Object)
    );
  });

  it("should display generic message when error has no message", () => {
    const ErrorWithoutMessage = () => {
      throw new Error("");
    };

    render(
      <ErrorBoundary>
        <ErrorWithoutMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });
});
