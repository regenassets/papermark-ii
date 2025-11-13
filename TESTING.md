# Papermark Testing Documentation

This document provides comprehensive information about the test suite for the Papermark project.

## Overview

Papermark uses **Vitest** as its testing framework, chosen for its speed, modern TypeScript support, and compatibility with the Next.js ecosystem.

### Current Test Coverage

- **145 tests** passing across 5 test suites
- **Critical business logic** covered
- **Security-critical functions** thoroughly tested
- **Utility functions** with comprehensive edge cases

## Test Framework: Vitest

### Why Vitest?

- ⚡ **Fast**: ESM-native, powered by Vite
- 🔧 **Better TypeScript support** out of the box
- 🔄 **Jest-compatible API** (easy migration if needed)
- 📦 **Built-in coverage** with c8/istanbul
- 🚀 **Modern** and actively maintained

## Running Tests

### Available Commands

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Files Location

Tests are located in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
├── helpers/
│   └── test-utils.ts          # Shared test utilities
├── lib/
│   ├── utils.test.ts          # Utility function tests (77 tests)
│   ├── api/
│   │   └── auth/
│   │       └── token.test.ts  # Auth token tests (19 tests)
│   ├── auth/
│   │   └── preview-auth.test.ts  # Preview session auth (20 tests)
│   └── webhook/
│       ├── signature.test.ts   # Webhook signatures (17 tests)
│       └── send-webhooks.test.ts  # Webhook delivery (12 tests)
```

## Test Categories

### 1. **Unit Tests** - Core Business Logic

#### lib/utils.test.ts (77 tests)
Tests for utility functions including:
- Class name merging (`cn`)
- File extension handling
- Byte size formatting
- Domain parsing
- Date/time formatting
- Password hashing and encryption
- Email/domain sanitization
- Data serialization

#### lib/api/auth/token.test.ts (19 tests)
Critical authentication token hashing:
- SHA-256 token hashing with secrets
- Consistent hash generation
- Security properties (collision resistance, avalanche effect)
- Use cases (API tokens, session tokens, verification tokens)

### 2. **Security Tests** - Critical Path Testing

#### lib/webhook/signature.test.ts (17 tests)
HMAC-SHA256 webhook signature generation:
- Signature creation and verification
- Payload tampering detection
- Secret validation
- Edge cases (empty payloads, special characters, large payloads)

#### lib/auth/preview-auth.test.ts (20 tests)
Preview session authentication:
- Session creation and verification
- Expiration handling
- User/link isolation
- Security boundaries
- Session lifecycle

### 3. **Integration Tests** - Business Workflows

#### lib/webhook/send-webhooks.test.ts (12 tests)
Webhook delivery via QStash:
- Multi-endpoint delivery
- Signature headers
- Callback URL construction
- Parallel processing
- Failure handling

## Test Utilities

### Mock Helpers (`__tests__/helpers/test-utils.ts`)

Shared utilities for consistent test setup:

```typescript
// Mock database clients
const mockPrisma = createMockPrismaClient();

// Mock HTTP requests/responses
const req = createMockRequest({ method: "POST", body: {...} });
const res = createMockResponse();

// Mock sessions
const session = createMockSession({ user: { id: "test-user" } });

// Test data factories
const user = createTestUser({ email: "test@example.com" });
const document = createTestDocument({ name: "Test Doc" });
const link = createTestLink({ slug: "test-slug" });
```

## Mocking Strategy

### External Services (Mocked)

All external services are mocked to ensure fast, reliable tests:

- ✅ **Stripe** - Payment processing
- ✅ **Resend** - Email delivery
- ✅ **OpenAI** - AI completions
- ✅ **Upstash QStash** - Queue/webhooks
- ✅ **Upstash Redis** - Caching
- ✅ **Tinybird** - Analytics
- ✅ **AWS S3** - File storage
- ✅ **Vercel Blob** - File storage
- ✅ **Next-Auth** - Authentication

### Database Strategy

- Tests use mocked Prisma client for unit tests
- TODO (Phase 2): Add integration tests with test database

## Coverage Goals

### Current Coverage

```
Lines      : 1.26% (goal: 70%+)
Functions  : 1.05% (goal: 70%+)
Statements : 1.29% (goal: 70%+)
Branches   : 0.96% (goal: 70%+)
```

### Phase 1 ✅ (Current) - Critical Business Logic

**Status**: Complete - 145 tests passing

Coverage areas:
- Core utilities (77 tests)
- Security functions (36 tests)
- Authentication (39 tests)
- Webhooks (29 tests)

### Phase 2 📋 (Next) - Broad Coverage

**TODO**: Expand test coverage across more areas

Planned coverage:
- API route handlers
- Database operations with test DB
- Document processing logic
- Dataroom access control
- Link management CRUD
- Email utilities
- Validation schemas

### Phase 3 📋 (Future) - End-to-End

**TODO**: Add E2E tests for critical user workflows

Planned E2E tests:
- Document upload → share → view
- Team creation and collaboration
- Dataroom creation and access
- Payment/subscription flows

## Writing Tests

### Test Structure

Follow this pattern for consistency:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies BEFORE imports (hoisting)
vi.mock("@/lib/external-service", () => ({
  service: {
    method: vi.fn(),
  },
}));

// Import modules AFTER mocking
import { functionToTest } from "@/lib/module";
import { service } from "@/lib/external-service";

describe("module/functionName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("specific functionality", () => {
    it("should do expected behavior", () => {
      // Arrange
      vi.mocked(service.method).mockResolvedValue("result");

      // Act
      const result = functionToTest();

      // Assert
      expect(result).toBe("expected");
      expect(service.method).toHaveBeenCalledWith("args");
    });
  });
});
```

### Best Practices

1. **Descriptive test names**: Use "should..." pattern
2. **Arrange-Act-Assert**: Structure tests clearly
3. **One assertion per test**: Keep tests focused
4. **Mock external dependencies**: Ensure fast, isolated tests
5. **Test edge cases**: Empty strings, null, undefined, large inputs
6. **Test error handling**: Verify error paths work correctly
7. **Security tests**: Test for injection, tampering, unauthorized access

### Common Patterns

#### Testing async functions

```typescript
it("should handle async operations", async () => {
  mockService.fetch.mockResolvedValue({ data: "result" });

  const result = await asyncFunction();

  expect(result).toBeDefined();
});
```

#### Testing errors

```typescript
it("should throw error for invalid input", async () => {
  await expect(functionThatThrows()).rejects.toThrow("Error message");
});
```

#### Testing with timers

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01"));
});

afterEach(() => {
  vi.useRealTimers();
});

it("should expire after timeout", () => {
  const result = createSession();

  vi.advanceTimersByTime(1000 * 60 * 20); // 20 minutes

  expect(isExpired(result)).toBe(true);
});
```

## Continuous Integration

### GitHub Actions (TODO)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## Debugging Tests

### Run specific test file

```bash
npm test -- __tests__/lib/utils.test.ts
```

### Run specific test by name

```bash
npm test -- -t "should hash token"
```

### Debug with breakpoints

```bash
npm test -- --inspect-brk
```

Then connect your debugger (VS Code, Chrome DevTools)

### View test coverage for specific file

```bash
npm run test:coverage -- __tests__/lib/utils.test.ts
```

## Adding New Tests

### Checklist for New Features

When adding new functionality, ensure:

- [ ] Unit tests for new functions
- [ ] Integration tests for workflows
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Security implications tested
- [ ] Mocks for external services
- [ ] Documentation updated

### Example: Adding Tests for New Module

```typescript
// 1. Create test file: __tests__/lib/new-module.test.ts

import { describe, it, expect } from "vitest";
import { newFunction } from "@/lib/new-module";

describe("lib/new-module", () => {
  describe("newFunction", () => {
    it("should handle basic case", () => {
      expect(newFunction("input")).toBe("output");
    });

    it("should handle edge case", () => {
      expect(newFunction("")).toBe("");
    });

    it("should throw on invalid input", () => {
      expect(() => newFunction(null)).toThrow();
    });
  });
});

// 2. Run tests
npm test

// 3. Check coverage
npm run test:coverage
```

## Known Issues / TODO

### Current Limitations

- ❌ No E2E tests yet (Playwright/Cypress)
- ❌ No database integration tests (test DB needed)
- ❌ API route tests need more coverage
- ❌ React component tests not yet implemented
- ❌ CI/CD pipeline not configured

### Roadmap

1. **Phase 2**: Add comprehensive API route tests
2. **Phase 2**: Set up test database for integration tests
3. **Phase 2**: Add React component tests with Testing Library
4. **Phase 3**: Add E2E tests for critical workflows
5. **Phase 3**: Set up CI/CD with GitHub Actions
6. **Future**: Add performance/load testing
7. **Future**: Add visual regression testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/) (for future E2E tests)
- [Jest to Vitest Migration](https://vitest.dev/guide/migration.html)

## Questions?

For questions about testing:
1. Check this documentation
2. Review existing test files for patterns
3. Consult Vitest documentation
4. Ask the team

---

**Last Updated**: January 2025
**Test Framework**: Vitest 4.0.7
**Total Tests**: 145
**Coverage Target**: 70%+
