import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateJWT, verifyJWT } from "@/lib/utils/generate-jwt";

describe("lib/utils/generate-jwt", () => {
  beforeEach(() => {
    process.env.NEXT_PRIVATE_UNSUBSCRIBE_JWT_SECRET = "test-jwt-secret-key";
  });

  describe("generateJWT", () => {
    it("should generate a valid JWT token", () => {
      const payload = { userId: "123", email: "test@example.com" };
      const token = generateJWT(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should include payload data in token", () => {
      const payload = { userId: "456", role: "admin" };
      const token = generateJWT(payload);

      const decoded = verifyJWT(token);
      expect(decoded).toMatchObject({
        userId: "456",
        role: "admin",
      });
    });

    it("should set default expiration to 24 hours", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { userId: "123" };
      const token = generateJWT(payload);

      const decoded = verifyJWT<any>(token);
      expect(decoded?.exp).toBeDefined();
      expect(decoded?.exp).toBeGreaterThan(now);
      expect(decoded?.exp).toBeLessThanOrEqual(now + 60 * 60 * 24 + 1); // 24h + 1s tolerance
    });

    it("should accept custom expiration time", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { userId: "123" };
      const expiresIn = 3600; // 1 hour

      const token = generateJWT(payload, expiresIn);

      const decoded = verifyJWT<any>(token);
      expect(decoded?.exp).toBeGreaterThan(now);
      expect(decoded?.exp).toBeLessThanOrEqual(now + expiresIn + 1); // +1s tolerance
    });

    it("should respect pre-set exp in payload", () => {
      const customExp = Math.floor(Date.now() / 1000) + 7200; // 2 hours
      const payload = { userId: "123", exp: customExp };

      const token = generateJWT(payload);

      const decoded = verifyJWT<any>(token);
      expect(decoded?.exp).toBe(customExp);
    });

    it("should handle various payload types", () => {
      const payloads = [
        { string: "value" },
        { number: 42 },
        { boolean: true },
        { array: [1, 2, 3] },
        { nested: { object: { deep: "value" } } },
        { mixed: { str: "test", num: 123, bool: false } },
      ];

      payloads.forEach((payload) => {
        const token = generateJWT(payload);
        const decoded = verifyJWT(token);
        expect(decoded).toMatchObject(payload);
      });
    });

    it("should generate different tokens for same payload", async () => {
      const payload = { userId: "123" };

      const token1 = generateJWT(payload);
      // Wait 1 second to ensure different exp timestamp
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const token2 = generateJWT(payload);

      // Tokens should be different due to different exp timestamps
      expect(token1).not.toBe(token2);
    });

    it("should handle empty payload", () => {
      const payload = {};
      const token = generateJWT(payload);

      expect(token).toBeTruthy();

      const decoded = verifyJWT(token);
      expect(decoded).toHaveProperty("exp");
    });
  });

  describe("verifyJWT", () => {
    it("should verify and decode valid token", () => {
      const payload = { userId: "789", email: "verify@test.com" };
      const token = generateJWT(payload);

      const decoded = verifyJWT(token);

      expect(decoded).not.toBeNull();
      expect(decoded).toMatchObject({
        userId: "789",
        email: "verify@test.com",
      });
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.jwt.token";

      const decoded = verifyJWT(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should return null for malformed token", () => {
      const malformedToken = "not-a-jwt";

      const decoded = verifyJWT(malformedToken);

      expect(decoded).toBeNull();
    });

    it("should return null for token with wrong signature", () => {
      // Generate a valid token
      const token = generateJWT({ userId: "123" });

      // Tamper with the token by modifying the signature
      const parts = token.split(".");
      const tamperedToken = parts[0] + "." + parts[1] + ".TAMPERED_SIGNATURE";

      const decoded = verifyJWT(tamperedToken);

      expect(decoded).toBeNull();
    });

    it("should return null for expired token", () => {
      // Generate token that expired 1 hour ago
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { userId: "123", exp: expiredTime };
      const token = generateJWT(payload);

      const decoded = verifyJWT(token);

      expect(decoded).toBeNull();
    });

    it("should accept token with future expiration", () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { userId: "123", exp: futureTime };
      const token = generateJWT(payload);

      const decoded = verifyJWT(token);

      expect(decoded).not.toBeNull();
      expect(decoded).toMatchObject({ userId: "123" });
    });

    it("should support generic type parameter", () => {
      interface CustomPayload {
        userId: string;
        role: "admin" | "user";
        permissions: string[];
      }

      const payload: CustomPayload = {
        userId: "123",
        role: "admin",
        permissions: ["read", "write", "delete"],
      };

      const token = generateJWT(payload);
      const decoded = verifyJWT<CustomPayload>(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe("123");
      expect(decoded?.role).toBe("admin");
      expect(decoded?.permissions).toEqual(["read", "write", "delete"]);
    });

    it("should handle empty string token", () => {
      const decoded = verifyJWT("");

      expect(decoded).toBeNull();
    });
  });

  describe("JWT lifecycle", () => {
    it("should support generate-verify round trip", () => {
      const originalPayload = {
        userId: "999",
        email: "lifecycle@test.com",
        role: "user",
        metadata: { loginCount: 5 },
      };

      const token = generateJWT(originalPayload);
      const decoded = verifyJWT(token);

      expect(decoded).not.toBeNull();
      expect(decoded).toMatchObject(originalPayload);
    });

    it("should maintain data integrity through serialization", () => {
      const payload = {
        numbers: [1, 2, 3],
        nested: { deep: { value: "test" } },
        boolean: true,
        nullValue: null,
      };

      const token = generateJWT(payload);
      const decoded = verifyJWT(token);

      expect(decoded).toEqual(expect.objectContaining(payload));
    });
  });

  describe("security considerations", () => {
    it("should use secret for signing", () => {
      const payload = { userId: "123", timestamp: Date.now() };

      const token1 = generateJWT(payload);
      const token2 = generateJWT(payload);

      // Even with same payload and exp, tokens should be identical
      // (JWT is deterministic given same payload and secret)
      // This test verifies secret is being used consistently
      expect(token1).toBe(token2);

      // Verify token structure is correct
      expect(token1.split(".")).toHaveLength(3);
    });

    it("should prevent token tampering", () => {
      const payload = { userId: "123", role: "user" };
      const token = generateJWT(payload);

      // Try to tamper with token by changing payload
      const parts = token.split(".");
      // Decode payload, modify it, re-encode
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: "123", role: "admin" }),
      ).toString("base64url");
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const decoded = verifyJWT(tamperedToken);

      // Should fail verification due to signature mismatch
      expect(decoded).toBeNull();
    });
  });

  describe("expiration handling", () => {
    it("should support very short expiration times", () => {
      const payload = { userId: "123" };
      const token = generateJWT(payload, 1); // 1 second

      // Should be valid immediately
      const decoded = verifyJWT(token);
      expect(decoded).not.toBeNull();
    });

    it("should support long expiration times", () => {
      const payload = { userId: "123" };
      const oneYear = 365 * 24 * 60 * 60;
      const token = generateJWT(payload, oneYear);

      const decoded = verifyJWT<any>(token);
      expect(decoded).not.toBeNull();

      const now = Math.floor(Date.now() / 1000);
      expect(decoded?.exp).toBeGreaterThan(now + oneYear - 10); // Allow small tolerance
    });
  });

  describe("use cases", () => {
    it("should support unsubscribe token generation", () => {
      const unsubscribePayload = {
        email: "user@example.com",
        linkId: "link-123",
        purpose: "unsubscribe",
      };

      const token = generateJWT(unsubscribePayload, 30 * 24 * 60 * 60); // 30 days

      const decoded = verifyJWT(token);
      expect(decoded).toMatchObject(unsubscribePayload);
    });

    it("should support email verification tokens", () => {
      const verificationPayload = {
        email: "new@example.com",
        userId: "user-456",
        action: "verify-email",
      };

      const token = generateJWT(verificationPayload, 24 * 60 * 60); // 24 hours

      const decoded = verifyJWT(token);
      expect(decoded).toMatchObject(verificationPayload);
    });

    it("should support password reset tokens", () => {
      const resetPayload = {
        userId: "user-789",
        action: "reset-password",
        timestamp: Date.now(),
      };

      const token = generateJWT(resetPayload, 60 * 60); // 1 hour

      const decoded = verifyJWT(token);
      expect(decoded).toMatchObject(resetPayload);
    });
  });
});
