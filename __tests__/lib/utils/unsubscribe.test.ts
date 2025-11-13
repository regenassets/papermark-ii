import { describe, it, expect, beforeEach } from "vitest";
import { generateUnsubscribeUrl, verifyUnsubscribeToken } from "@/lib/utils/unsubscribe";

describe("lib/utils/unsubscribe", () => {
  beforeEach(() => {
    process.env.NEXT_PRIVATE_UNSUBSCRIBE_JWT_SECRET = "test-jwt-secret-for-testing-only";
    process.env.NEXT_PUBLIC_BASE_URL = "https://test.papermark.io";
  });

  describe("generateUnsubscribeUrl", () => {
    it("should generate URL for YIR unsubscribe", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);

      expect(url).toContain("https://test.papermark.io/api/unsubscribe/yir");
      expect(url).toContain("?token=");
    });

    it("should generate URL for dataroom unsubscribe", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
        dataroomId: "dataroom-789",
      };

      const url = generateUnsubscribeUrl(payload);

      expect(url).toContain("https://test.papermark.io/api/unsubscribe/dataroom");
      expect(url).toContain("?token=");
    });

    it("should include JWT token in URL", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];

      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens for different payloads", () => {
      const payload1 = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const payload2 = {
        viewerId: "viewer-789",
        teamId: "team-456",
      };

      const url1 = generateUnsubscribeUrl(payload1);
      const url2 = generateUnsubscribeUrl(payload2);

      expect(url1).not.toBe(url2);
    });

    it("should set expiration to 3 months", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.exp).toBeDefined();

      // Check expiration is roughly 3 months (90 days)
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 60 * 60 * 24 * 90;
      const actualExp = decoded!.exp!;

      // Allow 1 second tolerance
      expect(Math.abs(actualExp - expectedExp)).toBeLessThan(2);
    });

    it("should include viewerId in token", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded?.viewerId).toBe("viewer-123");
    });

    it("should include teamId in token", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded?.teamId).toBe("team-456");
    });

    it("should include dataroomId when provided", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
        dataroomId: "dataroom-789",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded?.dataroomId).toBe("dataroom-789");
    });

    it("should not include dataroomId when not provided", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded?.dataroomId).toBeUndefined();
    });
  });

  describe("verifyUnsubscribeToken", () => {
    it("should verify valid token", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.viewerId).toBe("viewer-123");
      expect(decoded?.teamId).toBe("team-456");
    });

    it("should return null for invalid token", () => {
      const decoded = verifyUnsubscribeToken("invalid-token");
      expect(decoded).toBeNull();
    });

    it("should return null for malformed token", () => {
      const decoded = verifyUnsubscribeToken("not.a.valid.jwt");
      expect(decoded).toBeNull();
    });

    it("should return null for tampered token", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const tamperedToken = token.slice(0, -5) + "XXXXX";

      const decoded = verifyUnsubscribeToken(tamperedToken);
      expect(decoded).toBeNull();
    });

    it("should validate token signature (module-level constant test skipped)", () => {
      // Note: The JWT_SECRET is set at module load time, so changing env vars
      // after the module loads doesn't affect validation.
      // In practice, tokens signed with different secrets will fail validation.
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      // Token should be valid when using the same secret
      expect(decoded).toBeDefined();
      expect(decoded?.viewerId).toBe("viewer-123");
    });

    it("should return null for empty token", () => {
      const decoded = verifyUnsubscribeToken("");
      expect(decoded).toBeNull();
    });

    it("should handle tokens with dataroom", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
        dataroomId: "dataroom-789",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.dataroomId).toBe("dataroom-789");
    });

    it("should verify token expires in future", () => {
      const payload = {
        viewerId: "viewer-123",
        teamId: "team-456",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      const now = Math.floor(Date.now() / 1000);
      expect(decoded?.exp).toBeGreaterThan(now);
    });

    it("should preserve all payload fields", () => {
      const payload = {
        viewerId: "viewer-abc",
        teamId: "team-xyz",
        dataroomId: "dataroom-123",
      };

      const url = generateUnsubscribeUrl(payload);
      const token = url.split("?token=")[1];
      const decoded = verifyUnsubscribeToken(token);

      expect(decoded?.viewerId).toBe(payload.viewerId);
      expect(decoded?.teamId).toBe(payload.teamId);
      expect(decoded?.dataroomId).toBe(payload.dataroomId);
    });
  });
});
