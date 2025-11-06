import { describe, it, expect, beforeEach } from "vitest";
import { hashToken } from "@/lib/api/auth/token";

describe("lib/api/auth/token", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-nextauth-secret-for-testing";
  });

  describe("hashToken", () => {
    it("should hash token with secret by default", () => {
      const token = "test-token-123";
      const hashed = hashToken(token);

      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(token);
      expect(hashed).toHaveLength(64); // SHA-256 produces 64 hex chars
      expect(/^[a-f0-9]+$/.test(hashed)).toBe(true);
    });

    it("should produce consistent hashes for same token", () => {
      const token = "consistent-token";

      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const token1 = "token-one";
      const token2 = "token-two";

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it("should hash without secret when noSecret is true", () => {
      const token = "test-token";

      const hashWithSecret = hashToken(token);
      const hashWithoutSecret = hashToken(token, { noSecret: true });

      expect(hashWithSecret).not.toBe(hashWithoutSecret);
      expect(hashWithoutSecret).toHaveLength(64);
    });

    it("should produce same hash with noSecret for same token", () => {
      const token = "test-token";

      const hash1 = hashToken(token, { noSecret: true });
      const hash2 = hashToken(token, { noSecret: true });

      expect(hash1).toBe(hash2);
    });

    it("should incorporate NEXTAUTH_SECRET into hash", () => {
      const token = "test-token";
      const originalSecret = process.env.NEXTAUTH_SECRET;

      const hash1 = hashToken(token);

      // Change secret
      process.env.NEXTAUTH_SECRET = "different-secret";
      const hash2 = hashToken(token);

      expect(hash1).not.toBe(hash2);

      // Restore original secret
      process.env.NEXTAUTH_SECRET = originalSecret;
    });

    it("should handle empty token", () => {
      const hash = hashToken("");
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64);
    });

    it("should handle very long tokens", () => {
      const longToken = "a".repeat(10000);
      const hash = hashToken(longToken);
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64); // SHA-256 always produces 64 hex chars
    });

    it("should handle tokens with special characters", () => {
      const specialToken = "token!@#$%^&*()_+-=[]{}|;:,.<>?";
      const hash = hashToken(specialToken);
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64);
    });

    it("should handle tokens with unicode characters", () => {
      const unicodeToken = "token-🔐-secure-🎉";
      const hash = hashToken(unicodeToken);
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64);
    });
  });

  describe("security properties", () => {
    it("should be deterministic for replay protection", () => {
      const token = "api-token-xyz";
      const hashes = Array.from({ length: 10 }, () => hashToken(token));
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1); // All hashes should be identical
    });

    it("should resist rainbow table attacks with secret", () => {
      // Same token without secret would have predictable hash
      const token = "common-token";

      const hashWithSecret = hashToken(token);
      const hashWithoutSecret = hashToken(token, { noSecret: true });

      // These should be completely different
      expect(hashWithSecret).not.toBe(hashWithoutSecret);

      // Both should be valid SHA-256 hashes
      expect(hashWithSecret).toHaveLength(64);
      expect(hashWithoutSecret).toHaveLength(64);
    });

    it("should have high entropy in output", () => {
      // Test that small changes in input create large changes in output
      const token1 = "token123";
      const token2 = "token124"; // One char different

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      // Count different characters
      let differences = 0;
      for (let i = 0; i < 64; i++) {
        if (hash1[i] !== hash2[i]) differences++;
      }

      // Should have significant avalanche effect
      expect(differences).toBeGreaterThan(20);
    });

    it("should handle collision resistance test", () => {
      // Generate multiple hashes and ensure no collisions
      const tokens = Array.from({ length: 1000 }, (_, i) => `token-${i}`);
      const hashes = tokens.map((token) => hashToken(token));
      const uniqueHashes = new Set(hashes);

      expect(uniqueHashes.size).toBe(tokens.length); // No collisions
    });
  });

  describe("use cases", () => {
    it("should hash API tokens for storage", () => {
      const apiToken = "sk_live_abc123xyz789";
      const hashed = hashToken(apiToken);

      // Can safely store hashed version
      expect(hashed).not.toContain("sk_live");
      expect(hashed).not.toContain("abc123");
    });

    it("should hash verification tokens", () => {
      const verificationToken = "verify_email_abc123";
      const hashed = hashToken(verificationToken);

      expect(hashed).toBeTruthy();
      expect(hashed).toHaveLength(64);
    });

    it("should hash session tokens", () => {
      const sessionToken = "session_xyz789def456";
      const hashed = hashToken(sessionToken);

      expect(hashed).toBeTruthy();
      expect(hashed).toHaveLength(64);
    });

    it("should support token verification workflow", () => {
      // User creates API token
      const userToken = "user_generated_token_12345";

      // Server hashes and stores it
      const storedHash = hashToken(userToken);

      // User later provides token for authentication
      const providedToken = "user_generated_token_12345";
      const providedHash = hashToken(providedToken);

      // Server can verify by comparing hashes
      expect(providedHash).toBe(storedHash);
    });

    it("should reject invalid token attempts", () => {
      const correctToken = "correct_token";
      const storedHash = hashToken(correctToken);

      const wrongToken = "wrong_token";
      const attemptHash = hashToken(wrongToken);

      expect(attemptHash).not.toBe(storedHash);
    });
  });
});
