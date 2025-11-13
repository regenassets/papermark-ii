import { describe, it, expect } from "vitest";
import { decodeBase64Url } from "@/lib/utils/decode-base64url";

describe("lib/utils/decode-base64url", () => {
  describe("decodeBase64Url", () => {
    it("should decode standard base64url string", () => {
      // "Hello World" in base64url
      const encoded = "SGVsbG8gV29ybGQ";
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("Hello World");
    });

    it("should handle base64url with URL-safe characters", () => {
      // Base64url uses - instead of + and _ instead of /
      const encoded = "PDw_Pz8-Pg"; // "<<???>>" in base64url
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("<<???>>");
    });

    it("should add padding if missing", () => {
      // Without padding
      const encoded = "SGVsbG8";
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("Hello");
    });

    it("should handle already padded input", () => {
      const encoded = "SGVsbG8gV29ybGQ=";
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("Hello World");
    });

    it("should decode short strings", () => {
      const encoded = "YQ"; // "a"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("a");
    });

    it("should decode single character", () => {
      const encoded = "eA"; // "x"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("x");
    });

    it("should handle empty parts in URL", () => {
      const encoded = "dGVzdA"; // "test"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("test");
    });

    it("should decode numbers", () => {
      const encoded = "MTIzNDU2Nzg5MA"; // "1234567890"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("1234567890");
    });

    it("should decode special characters", () => {
      const encoded = "IUAjJCVeJigp"; // "!@#$%^&()"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("!@#$%^&()");
    });

    it("should handle unicode characters", () => {
      const encoded = "4LiW55WM"; // "ถ界"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("ถ界");
    });

    it("should handle emojis", () => {
      const encoded = "8J-YgA"; // "😀"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("😀");
    });

    it("should decode JSON-like strings", () => {
      const encoded = "eyJ0ZXN0IjoidmFsdWUifQ"; // '{"test":"value"}'
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe('{"test":"value"}');
    });

    it("should handle newlines", () => {
      const encoded = "bGluZTEKbGluZTI"; // "line1\nline2"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("line1\nline2");
    });

    it("should handle tabs", () => {
      const encoded = "Y29sdW1uMQljb2x1bW4y"; // "column1\tcolumn2"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("column1\tcolumn2");
    });

    it("should handle strings with spaces", () => {
      const encoded = "aGVsbG8gd29ybGQgZnJvbSB0ZXN0"; // "hello world from test"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("hello world from test");
    });

    it("should decode email addresses", () => {
      const encoded = "dXNlckBleGFtcGxlLmNvbQ"; // "user@example.com"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("user@example.com");
    });

    it("should decode URLs", () => {
      const encoded = "aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRo"; // "https://example.com/path"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("https://example.com/path");
    });

    it("should handle long strings", () => {
      const original = "a".repeat(1000);
      const encoded = btoa(original).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe(original);
    });

    it("should decode mixed content", () => {
      const encoded = "VXNlcjogam9obkBleGFtcGxlLmNvbSwgSUQ6IDEyMzQ1"; // "User: john@example.com, ID: 12345"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("User: john@example.com, ID: 12345");
    });

    it("should handle base64url with multiple underscores", () => {
      const encoded = "X19fX18"; // "_____"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("_____");
    });

    it("should handle base64url with multiple hyphens", () => {
      const encoded = "LS0tLS0"; // "-----"
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe("-----");
    });

    it("should decode complex JWT-like payload", () => {
      const encoded = "eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE2MDAwMDAwMDB9"; // '{"userId":"123","exp":1600000000}'
      const decoded = decodeBase64Url(encoded);

      expect(decoded).toBe('{"userId":"123","exp":1600000000}');
    });
  });
});
