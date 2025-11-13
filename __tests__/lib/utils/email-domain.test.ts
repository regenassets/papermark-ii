import { describe, it, expect } from "vitest";
import {
  extractEmailDomain,
  normalizeListEntry,
  isEmailMatched,
} from "@/lib/utils/email-domain";

describe("lib/utils/email-domain", () => {
  describe("extractEmailDomain", () => {
    it("should extract domain from valid email", () => {
      expect(extractEmailDomain("user@example.com")).toBe("@example.com");
    });

    it("should extract domain from email with subdomain", () => {
      expect(extractEmailDomain("user@mail.example.com")).toBe(
        "@mail.example.com",
      );
    });

    it("should handle email with uppercase", () => {
      expect(extractEmailDomain("User@Example.COM")).toBe("@example.com");
    });

    it("should handle email with whitespace", () => {
      expect(extractEmailDomain("  user@example.com  ")).toBe("@example.com");
    });

    it("should return null for email without @", () => {
      expect(extractEmailDomain("userexample.com")).toBeNull();
    });

    it("should return null for email with multiple @", () => {
      expect(extractEmailDomain("user@@example.com")).toBeNull();
      expect(extractEmailDomain("user@host@example.com")).toBeNull();
    });

    it("should return null for email ending with @", () => {
      expect(extractEmailDomain("user@")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(extractEmailDomain("")).toBeNull();
    });

    it("should return null for null input", () => {
      expect(extractEmailDomain(null as any)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(extractEmailDomain(undefined as any)).toBeNull();
    });

    it("should return null for non-string input", () => {
      expect(extractEmailDomain(123 as any)).toBeNull();
      expect(extractEmailDomain({} as any)).toBeNull();
      expect(extractEmailDomain([] as any)).toBeNull();
    });

    it("should handle email with plus addressing", () => {
      expect(extractEmailDomain("user+tag@example.com")).toBe("@example.com");
    });

    it("should handle email with dots in local part", () => {
      expect(extractEmailDomain("first.last@example.com")).toBe(
        "@example.com",
      );
    });

    it("should handle email with numbers", () => {
      expect(extractEmailDomain("user123@example123.com")).toBe(
        "@example123.com",
      );
    });

    it("should handle email with hyphens in domain", () => {
      expect(extractEmailDomain("user@my-domain.com")).toBe("@my-domain.com");
    });

    it("should handle email with country code TLD", () => {
      expect(extractEmailDomain("user@example.co.uk")).toBe("@example.co.uk");
    });

    it("should extract domain even when @ at start (edge case)", () => {
      // The function doesn't validate email format strictly, just extracts domain
      expect(extractEmailDomain("@example.com")).toBe("@example.com");
    });

    it("should handle very long domain", () => {
      expect(extractEmailDomain("user@subdomain.example.com")).toBe(
        "@subdomain.example.com",
      );
    });
  });

  describe("normalizeListEntry", () => {
    it("should normalize standard entry", () => {
      expect(normalizeListEntry("Example")).toBe("example");
    });

    it("should trim whitespace", () => {
      expect(normalizeListEntry("  entry  ")).toBe("entry");
    });

    it("should convert to lowercase", () => {
      expect(normalizeListEntry("UPPERCASE")).toBe("uppercase");
    });

    it("should handle email addresses", () => {
      expect(normalizeListEntry("User@Example.com")).toBe("user@example.com");
    });

    it("should handle domain entries", () => {
      expect(normalizeListEntry("@Example.com")).toBe("@example.com");
    });

    it("should return empty string for null", () => {
      expect(normalizeListEntry(null as any)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(normalizeListEntry(undefined as any)).toBe("");
    });

    it("should return empty string for empty string", () => {
      expect(normalizeListEntry("")).toBe("");
    });

    it("should return empty string for non-string input", () => {
      expect(normalizeListEntry(123 as any)).toBe("");
      expect(normalizeListEntry({} as any)).toBe("");
    });

    it("should handle special characters", () => {
      expect(normalizeListEntry("Test@Domain.COM")).toBe("test@domain.com");
    });

    it("should handle multiple spaces", () => {
      expect(normalizeListEntry("   test   ")).toBe("test");
    });

    it("should handle mixed case", () => {
      expect(normalizeListEntry("TeSt@DoMaIn.CoM")).toBe("test@domain.com");
    });
  });

  describe("isEmailMatched", () => {
    it("should match exact email", () => {
      expect(isEmailMatched("user@example.com", "user@example.com")).toBe(
        true,
      );
    });

    it("should match email case-insensitively", () => {
      expect(isEmailMatched("User@Example.COM", "user@example.com")).toBe(
        true,
      );
    });

    it("should match email with whitespace", () => {
      expect(isEmailMatched("  user@example.com  ", "user@example.com")).toBe(
        true,
      );
    });

    it("should match by domain", () => {
      expect(isEmailMatched("user@example.com", "@example.com")).toBe(true);
    });

    it("should match by domain case-insensitively", () => {
      expect(isEmailMatched("user@example.com", "@Example.COM")).toBe(true);
    });

    it("should not match different emails", () => {
      expect(isEmailMatched("user@example.com", "other@example.com")).toBe(
        false,
      );
    });

    it("should not match different domains", () => {
      expect(isEmailMatched("user@example.com", "@other.com")).toBe(false);
    });

    it("should not match partial email", () => {
      expect(isEmailMatched("user@example.com", "user")).toBe(false);
    });

    it("should return false for empty email", () => {
      expect(isEmailMatched("", "entry")).toBe(false);
    });

    it("should return false for empty entry", () => {
      expect(isEmailMatched("user@example.com", "")).toBe(false);
    });

    it("should return false for both empty", () => {
      expect(isEmailMatched("", "")).toBe(false);
    });

    it("should return false for null email", () => {
      expect(isEmailMatched(null as any, "entry")).toBe(false);
    });

    it("should return false for null entry", () => {
      expect(isEmailMatched("user@example.com", null as any)).toBe(false);
    });

    it("should match subdomain email with domain entry", () => {
      expect(isEmailMatched("user@mail.example.com", "@mail.example.com")).toBe(
        true,
      );
    });

    it("should not match subdomain when entry is parent domain", () => {
      expect(isEmailMatched("user@mail.example.com", "@example.com")).toBe(
        false,
      );
    });

    it("should handle multiple @ in entry gracefully", () => {
      expect(isEmailMatched("user@example.com", "@@example.com")).toBe(false);
    });

    it("should match with plus addressing", () => {
      expect(
        isEmailMatched("user+tag@example.com", "user+tag@example.com"),
      ).toBe(true);
    });

    it("should not match different plus tags", () => {
      expect(
        isEmailMatched("user+tag1@example.com", "user+tag2@example.com"),
      ).toBe(false);
    });

    it("should match domain with plus addressing", () => {
      expect(isEmailMatched("user+tag@example.com", "@example.com")).toBe(true);
    });

    it("should handle whitespace in both parameters", () => {
      expect(
        isEmailMatched("  user@example.com  ", "  user@example.com  "),
      ).toBe(true);
    });

    it("should not match when entry is not a domain pattern", () => {
      expect(isEmailMatched("user@example.com", "example.com")).toBe(false);
    });
  });
});
