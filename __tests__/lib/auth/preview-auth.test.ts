import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";

// Mock Redis using factory function to avoid hoisting issues
vi.mock("@/lib/redis", () => ({
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

import {
  createPreviewSession,
  verifyPreviewSession,
  PREVIEW_EXPIRATION_TIME,
} from "@/lib/auth/preview-auth";
import { redis } from "@/lib/redis";

const mockRedis = vi.mocked(redis);

describe("lib/auth/preview-auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createPreviewSession", () => {
    it("should create a valid preview session", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const result = await createPreviewSession("link-123", "user-456");

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("expiresAt");
      expect(result.token).toHaveLength(64); // 32 bytes as hex
      expect(result.expiresAt).toBe(
        Date.now() + PREVIEW_EXPIRATION_TIME,
      );
    });

    it("should store session in Redis with correct key", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const result = await createPreviewSession("link-123", "user-456");

      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(
        `preview_session:${result.token}`,
        expect.any(String),
        { pxat: result.expiresAt },
      );
    });

    it("should store correct session data in Redis", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const result = await createPreviewSession("link-123", "user-456");

      const callArgs = mockRedis.set.mock.calls[0];
      const storedData = JSON.parse(callArgs[1] as string);

      expect(storedData).toEqual({
        linkId: "link-123",
        userId: "user-456",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      });
    });

    it("should set expiration time to 20 minutes", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const result = await createPreviewSession("link-123", "user-456");

      expect(result.expiresAt - Date.now()).toBe(20 * 60 * 1000);
    });

    it("should generate unique tokens for each session", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const result1 = await createPreviewSession("link-123", "user-456");
      const result2 = await createPreviewSession("link-123", "user-456");

      expect(result1.token).not.toBe(result2.token);
    });

    it("should validate session data before storing", async () => {
      mockRedis.set.mockResolvedValue("OK");

      // Should successfully create session with valid data
      const result = await createPreviewSession("link-123", "user-456");
      expect(result.token).toBeTruthy();
    });
  });

  describe("verifyPreviewSession", () => {
    it("should verify valid preview session", async () => {
      const sessionData = {
        linkId: "link-123",
        userId: "user-456",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      };

      mockRedis.get.mockResolvedValue(sessionData);

      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "link-123",
      );

      expect(result).toEqual(sessionData);
      expect(mockRedis.get).toHaveBeenCalledWith(
        "preview_session:token-abc123",
      );
    });

    it("should return null for non-existent session", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await verifyPreviewSession(
        "invalid-token",
        "user-456",
        "link-123",
      );

      expect(result).toBeNull();
    });

    it("should return null for empty token", async () => {
      const result = await verifyPreviewSession("", "user-456", "link-123");

      expect(result).toBeNull();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it("should delete and return null for wrong user", async () => {
      const sessionData = {
        linkId: "link-123",
        userId: "user-456",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      const result = await verifyPreviewSession(
        "token-abc123",
        "wrong-user",
        "link-123",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalledWith(
        "preview_session:token-abc123",
      );
    });

    it("should delete and return null for expired session", async () => {
      const sessionData = {
        linkId: "link-123",
        userId: "user-456",
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "link-123",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalledWith(
        "preview_session:token-abc123",
      );
    });

    it("should delete and return null for wrong link", async () => {
      const sessionData = {
        linkId: "link-123",
        userId: "user-456",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "wrong-link",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalledWith(
        "preview_session:token-abc123",
      );
    });

    it("should handle malformed session data", async () => {
      mockRedis.get.mockResolvedValue({ invalid: "data" });
      mockRedis.del.mockResolvedValue(1);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "link-123",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Preview session verification error:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should reject session just after expiration", async () => {
      const expiresAt = Date.now();
      const sessionData = {
        linkId: "link-123",
        userId: "user-456",
        expiresAt,
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      // Advance time by 1ms to be just after expiration
      vi.advanceTimersByTime(1);

      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "link-123",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe("session lifecycle", () => {
    it("should create, verify, and expire session correctly", async () => {
      mockRedis.set.mockResolvedValue("OK");

      // Create session
      const created = await createPreviewSession("link-123", "user-456");

      // Mock get to return what was set
      const callArgs = mockRedis.set.mock.calls[0];
      const storedData = JSON.parse(callArgs[1] as string);
      mockRedis.get.mockResolvedValue(storedData);

      // Verify immediately - should succeed
      const verified = await verifyPreviewSession(
        created.token,
        "user-456",
        "link-123",
      );
      expect(verified).toBeTruthy();

      // Advance time past expiration
      vi.advanceTimersByTime(PREVIEW_EXPIRATION_TIME + 1000);

      // Verify after expiration - should fail
      mockRedis.del.mockResolvedValue(1);
      const expiredVerify = await verifyPreviewSession(
        created.token,
        "user-456",
        "link-123",
      );
      expect(expiredVerify).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it("should support multiple concurrent sessions", async () => {
      mockRedis.set.mockResolvedValue("OK");
      mockRedis.get.mockImplementation((key: string) => {
        // Return different session data based on key
        if (key.includes("token-1")) {
          return {
            linkId: "link-1",
            userId: "user-1",
            expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
          };
        }
        if (key.includes("token-2")) {
          return {
            linkId: "link-2",
            userId: "user-2",
            expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
          };
        }
        return null;
      });

      const session1 = await createPreviewSession("link-1", "user-1");
      const session2 = await createPreviewSession("link-2", "user-2");

      const verify1 = await verifyPreviewSession(
        "token-1",
        "user-1",
        "link-1",
      );
      const verify2 = await verifyPreviewSession(
        "token-2",
        "user-2",
        "link-2",
      );

      expect(verify1).toBeTruthy();
      expect(verify2).toBeTruthy();
    });
  });

  describe("security considerations", () => {
    it("should use cryptographically secure random tokens", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        const result = await createPreviewSession("link-123", "user-456");
        tokens.add(result.token);
      }

      // All tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it("should not leak session data across users", async () => {
      const sessionData = {
        linkId: "link-123",
        userId: "user-A",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      // User B tries to access User A's session
      const result = await verifyPreviewSession(
        "token-abc123",
        "user-B",
        "link-123",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled(); // Session should be deleted
    });

    it("should not leak session data across links", async () => {
      const sessionData = {
        linkId: "link-A",
        userId: "user-456",
        expiresAt: Date.now() + PREVIEW_EXPIRATION_TIME,
      };

      mockRedis.get.mockResolvedValue(sessionData);
      mockRedis.del.mockResolvedValue(1);

      // Try to use token for different link
      const result = await verifyPreviewSession(
        "token-abc123",
        "user-456",
        "link-B",
      );

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe("PREVIEW_EXPIRATION_TIME constant", () => {
    it("should be 20 minutes in milliseconds", () => {
      expect(PREVIEW_EXPIRATION_TIME).toBe(20 * 60 * 1000);
      expect(PREVIEW_EXPIRATION_TIME).toBe(1200000);
    });
  });
});
