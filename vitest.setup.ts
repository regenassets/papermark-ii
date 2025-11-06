import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing-only";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/papermark_test";
process.env.POSTGRES_PRISMA_URL = "postgresql://test:test@localhost:5432/papermark_test";
process.env.QSTASH_URL = "https://qstash.test.com";
process.env.QSTASH_TOKEN = "test-qstash-token";
process.env.QSTASH_CURRENT_SIGNING_KEY = "test-signing-key";
process.env.QSTASH_NEXT_SIGNING_KEY = "test-next-signing-key";
process.env.NEXT_PRIVATE_UNSUBSCRIBE_JWT_SECRET = "test-jwt-secret-for-testing-only";
process.env.RESEND_API_KEY = "test-resend-api-key-for-testing-only";

// Mock external services
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn(),
  head: vi.fn(),
  list: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn(),
  })),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(() => Promise.resolve("https://signed-url.test.com")),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ id: "test-email-id" })),
    },
  })),
}));

vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

vi.mock("openai", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [{ message: { content: "Test AI response" } }],
          }),
        ),
      },
    },
  })),
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  })),
}));

vi.mock("@upstash/qstash", () => ({
  Client: vi.fn(() => ({
    publishJSON: vi.fn(() => Promise.resolve({ messageId: "test-message-id" })),
  })),
  Receiver: vi.fn(() => ({
    verify: vi.fn(() => Promise.resolve(true)),
  })),
}));

// Mock Tinybird
vi.mock("@chronark/zod-bird", () => ({
  Tinybird: vi.fn(() => ({
    buildPipe: vi.fn(() => ({
      pipe: vi.fn(() => Promise.resolve({ data: [] })),
    })),
  })),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Global test utilities
global.fetch = vi.fn();

// Suppress console warnings in tests (optional)
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
