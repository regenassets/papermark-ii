import { vi } from "vitest";

/**
 * Test utilities for Papermark tests
 */

/**
 * Mock Prisma client for database testing
 */
export const createMockPrismaClient = () => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  team: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  document: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  link: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  view: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  dataroom: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  viewer: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  webhook: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(createMockPrismaClient())),
  $disconnect: vi.fn(),
  $connect: vi.fn(),
});

/**
 * Mock NextApiRequest with common fields
 */
export const createMockRequest = (overrides: any = {}) => ({
  method: "GET",
  headers: {},
  query: {},
  body: {},
  cookies: {},
  ...overrides,
});

/**
 * Mock NextApiResponse with response tracking
 */
export const createMockResponse = () => {
  const res: any = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    send: vi.fn(() => res),
    end: vi.fn(() => res),
    setHeader: vi.fn(() => res),
    getHeader: vi.fn(),
    statusCode: 200,
    _json: null,
    _status: null,
  };

  // Track what was sent
  res.status.mockImplementation((code: number) => {
    res._status = code;
    res.statusCode = code;
    return res;
  });

  res.json.mockImplementation((data: any) => {
    res._json = data;
    return res;
  });

  return res;
};

/**
 * Mock session for authenticated requests
 */
export const createMockSession = (overrides: any = {}) => ({
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    ...overrides.user,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

/**
 * Test data factories
 */
export const createTestUser = (overrides: any = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestTeam = (overrides: any = {}) => ({
  id: "test-team-id",
  name: "Test Team",
  slug: "test-team",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestDocument = (overrides: any = {}) => ({
  id: "test-document-id",
  name: "Test Document",
  file: "test-file.pdf",
  teamId: "test-team-id",
  ownerId: "test-user-id",
  type: "pdf",
  createdAt: new Date(),
  updatedAt: new Date(),
  versions: [],
  ...overrides,
});

export const createTestLink = (overrides: any = {}) => ({
  id: "test-link-id",
  slug: "test-slug",
  documentId: "test-document-id",
  teamId: "test-team-id",
  name: "Test Link",
  createdAt: new Date(),
  updatedAt: new Date(),
  enableNotification: true,
  ...overrides,
});

export const createTestDataroom = (overrides: any = {}) => ({
  id: "test-dataroom-id",
  name: "Test Dataroom",
  teamId: "test-team-id",
  pId: "test-public-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestView = (overrides: any = {}) => ({
  id: "test-view-id",
  linkId: "test-link-id",
  viewerEmail: "viewer@example.com",
  viewedAt: new Date(),
  ...overrides,
});

/**
 * Helper to wait for async operations in tests
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to generate mock webhook payload
 */
export const createMockWebhookPayload = (event: string, data: any) => ({
  event,
  data,
  timestamp: new Date().toISOString(),
  id: `evt_${Date.now()}`,
});
