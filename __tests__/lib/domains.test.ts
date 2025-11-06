import { describe, it, expect } from "vitest";
import {
  getSubdomain,
  getApexDomain,
  validDomainRegex,
} from "@/lib/domains";

describe("lib/domains", () => {
  describe("getSubdomain", () => {
    it("should return null for apex domain", () => {
      const result = getSubdomain("example.com", "example.com");

      expect(result).toBeNull();
    });

    it("should extract subdomain from full domain", () => {
      const result = getSubdomain("www.example.com", "example.com");

      expect(result).toBe("www");
    });

    it("should handle multi-level subdomain", () => {
      const result = getSubdomain("api.staging.example.com", "example.com");

      expect(result).toBe("api.staging");
    });

    it("should handle single character subdomain", () => {
      const result = getSubdomain("a.example.com", "example.com");

      expect(result).toBe("a");
    });

    it("should handle long subdomain", () => {
      const result = getSubdomain(
        "very-long-subdomain-name.example.com",
        "example.com",
      );

      expect(result).toBe("very-long-subdomain-name");
    });

    it("should handle subdomain with hyphens", () => {
      const result = getSubdomain("my-api.example.com", "example.com");

      expect(result).toBe("my-api");
    });

    it("should handle subdomain with numbers", () => {
      const result = getSubdomain("api123.example.com", "example.com");

      expect(result).toBe("api123");
    });
  });

  describe("getApexDomain", () => {
    it("should extract apex from normal domain", () => {
      const result = getApexDomain("https://example.com");

      expect(result).toBe("example.com");
    });

    it("should extract apex from subdomain", () => {
      const result = getApexDomain("https://www.example.com");

      expect(result).toBe("example.com");
    });

    it("should extract apex from multi-level subdomain", () => {
      const result = getApexDomain("https://api.staging.example.com");

      expect(result).toBe("example.com");
    });

    it("should handle URL with path", () => {
      const result = getApexDomain("https://example.com/path/to/page");

      expect(result).toBe("example.com");
    });

    it("should handle URL with query params", () => {
      const result = getApexDomain("https://example.com?foo=bar");

      expect(result).toBe("example.com");
    });

    it("should handle URL with port", () => {
      const result = getApexDomain("https://example.com:8080");

      expect(result).toBe("example.com");
    });

    it("should handle vercel domain", () => {
      const result = getApexDomain("https://papermark.vercel.app");

      expect(result).toBe("vercel.app");
    });

    it("should handle co.uk domain", () => {
      const result = getApexDomain("https://www.example.co.uk");

      // Note: This will return "co.uk" not "example.co.uk"
      // The function doesn't handle TLDs with multiple parts specially
      expect(result).toBe("co.uk");
    });

    it("should handle localhost", () => {
      const result = getApexDomain("http://localhost:3000");

      expect(result).toBe("localhost");
    });

    it("should handle IP address", () => {
      const result = getApexDomain("http://192.168.1.1");

      expect(result).toBe("1.1");
    });

    it("should return empty string for invalid URL", () => {
      const result = getApexDomain("not-a-url");

      expect(result).toBe("");
    });

    it("should handle URL without protocol", () => {
      const result = getApexDomain("example.com");

      expect(result).toBe("");
    });

    it("should handle URL with www", () => {
      const result = getApexDomain("https://www.example.com");

      expect(result).toBe("example.com");
    });

    it("should handle URL with multiple subdomains", () => {
      const result = getApexDomain("https://a.b.c.example.com");

      expect(result).toBe("example.com");
    });

    it("should handle http protocol", () => {
      const result = getApexDomain("http://example.com");

      expect(result).toBe("example.com");
    });

    it("should handle URL with fragment", () => {
      const result = getApexDomain("https://example.com#section");

      expect(result).toBe("example.com");
    });
  });

  describe("validDomainRegex", () => {
    it("should match valid domain", () => {
      expect(validDomainRegex.test("example.com")).toBe(true);
    });

    it("should match domain with subdomain", () => {
      expect(validDomainRegex.test("www.example.com")).toBe(true);
    });

    it("should match domain with multiple subdomains", () => {
      expect(validDomainRegex.test("api.staging.example.com")).toBe(true);
    });

    it("should match domain with hyphens", () => {
      expect(validDomainRegex.test("my-domain.com")).toBe(true);
    });

    it("should match domain with numbers", () => {
      expect(validDomainRegex.test("example123.com")).toBe(true);
    });

    it("should match domain with long TLD", () => {
      expect(validDomainRegex.test("example.design")).toBe(true);
    });

    it("should match co.uk domain", () => {
      expect(validDomainRegex.test("example.co.uk")).toBe(true);
    });

    it("should not match domain without TLD", () => {
      expect(validDomainRegex.test("example")).toBe(false);
    });

    it("should not match domain starting with hyphen", () => {
      expect(validDomainRegex.test("-example.com")).toBe(false);
    });

    it("should not match domain ending with hyphen", () => {
      expect(validDomainRegex.test("example-.com")).toBe(false);
    });

    it("should not match domain with spaces", () => {
      expect(validDomainRegex.test("example .com")).toBe(false);
    });

    it("should not match domain with underscores", () => {
      expect(validDomainRegex.test("example_domain.com")).toBe(false);
    });

    it("should not match empty string", () => {
      expect(validDomainRegex.test("")).toBe(false);
    });

    it("should not match URL with protocol", () => {
      expect(validDomainRegex.test("https://example.com")).toBe(false);
    });

    it("should not match URL with path", () => {
      expect(validDomainRegex.test("example.com/path")).toBe(false);
    });

    it("should not match IP address", () => {
      expect(validDomainRegex.test("192.168.1.1")).toBe(false);
    });

    it("should not match localhost", () => {
      expect(validDomainRegex.test("localhost")).toBe(false);
    });

    it("should match single letter subdomain", () => {
      expect(validDomainRegex.test("a.example.com")).toBe(true);
    });

    it("should match single letter domain", () => {
      expect(validDomainRegex.test("x.co")).toBe(true);
    });

    it("should not match domain with consecutive dots", () => {
      expect(validDomainRegex.test("example..com")).toBe(false);
    });

    it("should not match domain starting with dot", () => {
      expect(validDomainRegex.test(".example.com")).toBe(false);
    });

    it("should not match domain ending with dot", () => {
      expect(validDomainRegex.test("example.com.")).toBe(false);
    });

    it("should match very long domain name", () => {
      const longDomain = "a".repeat(63) + ".com";
      expect(validDomainRegex.test(longDomain)).toBe(true);
    });

    it("should not match too long domain segment", () => {
      // Each segment can be max 63 characters
      const tooLong = "a".repeat(64) + ".com";
      expect(validDomainRegex.test(tooLong)).toBe(false);
    });
  });
});
