import { describe, it, expect, beforeEach } from "vitest";
import { generateChecksum } from "@/lib/utils/generate-checksum";

describe("lib/utils/generate-checksum", () => {
  beforeEach(() => {
    // Ensure secret is set for tests
    process.env.NEXT_PRIVATE_VERIFICATION_SECRET = "test-secret-key";
  });

  describe("generateChecksum", () => {
    it("should generate checksum for URL", () => {
      const url = "https://example.com/document/123";
      const checksum = generateChecksum(url);

      expect(checksum).toBeDefined();
      expect(typeof checksum).toBe("string");
      expect(checksum.length).toBeGreaterThan(0);
    });

    it("should generate hex string", () => {
      const url = "https://example.com";
      const checksum = generateChecksum(url);

      // Hex string should only contain 0-9 and a-f
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate 64 character hex (SHA-256)", () => {
      const url = "https://example.com";
      const checksum = generateChecksum(url);

      // SHA-256 produces 64 hex characters
      expect(checksum).toHaveLength(64);
    });

    it("should generate same checksum for same URL", () => {
      const url = "https://example.com/document/123";
      const checksum1 = generateChecksum(url);
      const checksum2 = generateChecksum(url);

      expect(checksum1).toBe(checksum2);
    });

    it("should generate different checksums for different URLs", () => {
      const url1 = "https://example.com/document/123";
      const url2 = "https://example.com/document/456";

      const checksum1 = generateChecksum(url1);
      const checksum2 = generateChecksum(url2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should be case sensitive", () => {
      const url1 = "https://example.com/Document";
      const url2 = "https://example.com/document";

      const checksum1 = generateChecksum(url1);
      const checksum2 = generateChecksum(url2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should handle URLs with query parameters", () => {
      const url = "https://example.com/doc?id=123&page=1";
      const checksum = generateChecksum(url);

      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });

    it("should handle URLs with fragments", () => {
      const url = "https://example.com/doc#section1";
      const checksum = generateChecksum(url);

      expect(checksum).toHaveLength(64);
    });

    it("should handle URLs with special characters", () => {
      const url = "https://example.com/doc/file%20name.pdf";
      const checksum = generateChecksum(url);

      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });

    it("should handle very long URLs", () => {
      const url = "https://example.com/" + "a".repeat(1000);
      const checksum = generateChecksum(url);

      expect(checksum).toHaveLength(64);
    });

    it("should handle empty string", () => {
      const checksum = generateChecksum("");

      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });

    it("should handle different protocols", () => {
      const https = generateChecksum("https://example.com");
      const http = generateChecksum("http://example.com");

      expect(https).not.toBe(http);
    });

    it("should handle URLs with ports", () => {
      const url1 = "https://example.com:443/doc";
      const url2 = "https://example.com:8443/doc";

      const checksum1 = generateChecksum(url1);
      const checksum2 = generateChecksum(url2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should handle trailing slashes consistently", () => {
      const url1 = "https://example.com/doc";
      const url2 = "https://example.com/doc/";

      const checksum1 = generateChecksum(url1);
      const checksum2 = generateChecksum(url2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should be deterministic", () => {
      const url = "https://example.com/test";
      const checksums = Array.from({ length: 10 }, () => generateChecksum(url));

      const allSame = checksums.every((c) => c === checksums[0]);
      expect(allSame).toBe(true);
    });

    it("should handle international characters", () => {
      const url = "https://example.com/文档/documento";
      const checksum = generateChecksum(url);

      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate different checksums with different secrets", () => {
      const url = "https://example.com/doc";

      process.env.NEXT_PRIVATE_VERIFICATION_SECRET = "secret1";
      const checksum1 = generateChecksum(url);

      process.env.NEXT_PRIVATE_VERIFICATION_SECRET = "secret2";
      const checksum2 = generateChecksum(url);

      expect(checksum1).not.toBe(checksum2);

      // Restore
      process.env.NEXT_PRIVATE_VERIFICATION_SECRET = "test-secret-key";
    });

    it("should handle numeric strings", () => {
      const checksum = generateChecksum("12345");

      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]+$/);
    });
  });
});
