# Testing Documentation

## Overview

This project uses two main testing approaches:

- **Unit Tests**: Using Vitest with React Testing Library
- **End-to-End Tests**: Using Playwright

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run tests in watch mode (development)
npm run test -- --watch
```

### E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests in UI mode
npm run test:e2e:ui

# Run e2e tests in debug mode
npm run test:e2e:debug

# Run e2e tests with visible browser
npm run test:e2e:headed
```

## Test Structure

### Unit Tests

- **Location**: `src/**/*.{test,spec}.{ts,tsx}`
- **Setup**: `src/test/setup.ts`
- **Helpers**: `src/test/test-helpers.ts`
- **Utils**: `src/test/test-utils.tsx`

### E2E Tests

- **Location**: `tests/e2e/**/*.spec.ts`
- **Page Objects**: `tests/e2e/pages/`
- **Fixtures**: `tests/fixtures/`
- **Config**: `playwright.config.ts`

## Writing Tests

### Unit Tests Best Practices

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should render correctly', () => {
    // Arrange
    render(<ComponentName />);

    // Act & Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();

    render(<ComponentName onAction={mockHandler} />);

    await user.click(screen.getByRole('button'));

    expect(mockHandler).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests Best Practices

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Feature Name", () => {
  test("should perform user flow", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.gotoLogin();
    await loginPage.login("user@example.com", "password");

    await expect(page).toHaveURL("/dashboard");
  });
});
```

## Page Object Model

E2E tests use the Page Object Model pattern for maintainability:

```typescript
// tests/e2e/pages/PageName.ts
import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PageName extends BasePage {
  readonly element: Locator;

  constructor(page: Page) {
    super(page);
    this.element = page.locator('[data-testid="element"]');
  }

  async performAction() {
    await this.element.click();
  }
}
```

## Mocking

### Vitest Mocks

```typescript
// Mock external modules
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => createMockSupabaseClient(),
}));

// Mock functions
const mockFn = vi.fn();
mockFn.mockReturnValue("mocked value");
mockFn.mockResolvedValue(Promise.resolve("async value"));
```

### Playwright Mocks

```typescript
// Mock API responses
await page.route("**/api/auth/login", (route) => {
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  });
});
```

## Coverage Requirements

The project maintains minimum coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Push to main branch
- Scheduled runs (nightly)

### GitHub Actions Workflow

```yaml
- name: Run Unit Tests
  run: npm run test:coverage

- name: Run E2E Tests
  run: npm run test:e2e
```

## Debugging Tests

### Unit Tests

- Use `test.only()` to run specific tests
- Use `console.log()` for debugging (will be visible in test output)
- Use VS Code debugger with breakpoints

### E2E Tests

- Use `test.slow()` for tests that need more time
- Use `page.pause()` to pause execution
- Use `--debug` flag to step through tests
- Use trace viewer for failed tests

## Common Patterns

### Testing Hooks

```typescript
import { renderHook, act } from "@testing-library/react";

test("should handle hook state", () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.updateState("new value");
  });

  expect(result.current.state).toBe("new value");
});
```

### Testing Async Components

```typescript
test('should handle async data loading', async () => {
  render(<AsyncComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing Error Boundaries

```typescript
test('should handle errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout in config or use `test.slow()`
2. **Mock not working**: Ensure mock is declared before imports
3. **DOM cleanup**: Use `afterEach(() => cleanup())` in setup
4. **Async operations**: Use `waitFor()` or `findBy*` queries

### Performance Tips

- Use `screen.getByRole()` over `getByTestId()` when possible
- Mock heavy dependencies
- Run tests in parallel where possible
- Use `test.concurrent()` for independent tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
