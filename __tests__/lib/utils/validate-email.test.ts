import { describe, it, expect } from "vitest";
import { validateEmail, simpleEmailRegex, fullyCompliantEmailRegex } from "@/lib/utils/validate-email";

describe("lib/utils/validate-email", () => {
  describe("validateEmail", () => {
    it("should validate standard email", () => {
      expect(validateEmail("user@example.com")).toBe(true);
    });

    it("should validate email with subdomain", () => {
      expect(validateEmail("user@mail.example.com")).toBe(true);
    });

    it("should validate email with plus addressing", () => {
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    it("should validate email with dots", () => {
      expect(validateEmail("first.last@example.com")).toBe(true);
    });

    it("should validate email with numbers", () => {
      expect(validateEmail("user123@example123.com")).toBe(true);
    });

    it("should validate email with hyphens in domain", () => {
      expect(validateEmail("user@my-domain.com")).toBe(true);
    });

    it("should validate university email", () => {
      expect(validateEmail("student@cs.university.edu")).toBe(true);
    });

    it("should handle uppercase", () => {
      expect(validateEmail("User@Example.COM")).toBe(true);
    });

    it("should handle whitespace", () => {
      expect(validateEmail("  user@example.com  ")).toBe(true);
    });

    it("should reject email without @", () => {
      expect(validateEmail("userexample.com")).toBe(false);
    });

    it("should reject email without domain", () => {
      expect(validateEmail("user@")).toBe(false);
    });

    it("should reject email without local part", () => {
      expect(validateEmail("@example.com")).toBe(false);
    });

    it("should reject email with spaces", () => {
      expect(validateEmail("user name@example.com")).toBe(false);
    });

    it("should reject email with multiple @", () => {
      expect(validateEmail("user@@example.com")).toBe(false);
    });

    it("should reject email without TLD", () => {
      expect(validateEmail("user@localhost")).toBe(false);
    });

    it("should validate email with country TLD", () => {
      expect(validateEmail("user@example.co.uk")).toBe(true);
    });

    it("should validate email with new TLDs", () => {
      expect(validateEmail("user@example.tech")).toBe(true);
      expect(validateEmail("user@example.io")).toBe(true);
    });

    it("should reject empty string", () => {
      expect(validateEmail("")).toBe(false);
    });

    it("should validate email with underscores", () => {
      expect(validateEmail("user_name@example.com")).toBe(true);
    });

    it("should validate email with percent", () => {
      expect(validateEmail("user%test@example.com")).toBe(true);
    });

    it("should reject email with invalid characters", () => {
      expect(validateEmail("user!#$@example.com")).toBe(false);
    });
  });

  describe("simpleEmailRegex", () => {
    it("should match valid emails", () => {
      expect(simpleEmailRegex.test("user@example.com")).toBe(true);
      expect(simpleEmailRegex.test("first.last@example.co.uk")).toBe(true);
    });

    it("should not match invalid emails", () => {
      expect(simpleEmailRegex.test("invalid")).toBe(false);
      expect(simpleEmailRegex.test("@example.com")).toBe(false);
    });
  });

  describe("fullyCompliantEmailRegex", () => {
    it("should match RFC 5322 compliant emails", () => {
      expect(fullyCompliantEmailRegex.test("user@example.com")).toBe(true);
    });

    it("should match emails with quotes", () => {
      expect(fullyCompliantEmailRegex.test('"user"@example.com')).toBe(true);
    });

    it("should match emails with IP addresses", () => {
      expect(fullyCompliantEmailRegex.test("user@[192.168.1.1]")).toBe(true);
    });
  });
});
