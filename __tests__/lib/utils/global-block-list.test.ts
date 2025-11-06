import { describe, it, expect } from "vitest";
import { checkGlobalBlockList } from "@/lib/utils/global-block-list";

describe("lib/utils/global-block-list", () => {
  describe("checkGlobalBlockList", () => {
    it("should return not blocked for valid email not in list", () => {
      const result = checkGlobalBlockList("user@example.com", [
        "blocked@example.com",
      ]);

      expect(result.isBlocked).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it("should return blocked for email in list", () => {
      const result = checkGlobalBlockList("blocked@example.com", [
        "blocked@example.com",
      ]);

      expect(result.isBlocked).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return blocked for email matching domain pattern", () => {
      const result = checkGlobalBlockList("user@blocked.com", [
        "@blocked.com",
      ]);

      expect(result.isBlocked).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return not blocked when email is undefined", () => {
      const result = checkGlobalBlockList(undefined, ["blocked@example.com"]);

      expect(result.isBlocked).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it("should return not blocked when block list is undefined", () => {
      const result = checkGlobalBlockList("user@example.com", undefined);

      expect(result.isBlocked).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it("should return not blocked when block list is empty", () => {
      const result = checkGlobalBlockList("user@example.com", []);

      expect(result.isBlocked).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it("should return error for invalid email format", () => {
      const result = checkGlobalBlockList("invalid-email", [
        "blocked@example.com",
      ]);

      expect(result.isBlocked).toBe(false);
      expect(result.error).toBe("Invalid email address");
    });

    it("should check against multiple entries in block list", () => {
      const blockList = [
        "blocked1@example.com",
        "blocked2@example.com",
        "@spam.com",
      ];

      expect(checkGlobalBlockList("user@example.com", blockList).isBlocked).toBe(
        false,
      );
      expect(
        checkGlobalBlockList("blocked1@example.com", blockList).isBlocked,
      ).toBe(true);
      expect(
        checkGlobalBlockList("blocked2@example.com", blockList).isBlocked,
      ).toBe(true);
      expect(checkGlobalBlockList("any@spam.com", blockList).isBlocked).toBe(
        true,
      );
    });

    it("should be case-insensitive", () => {
      const result = checkGlobalBlockList("User@Example.COM", [
        "user@example.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should trim whitespace in email", () => {
      const result = checkGlobalBlockList("  user@example.com  ", [
        "user@example.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should handle empty string email", () => {
      const result = checkGlobalBlockList("", ["blocked@example.com"]);

      expect(result.isBlocked).toBe(false);
    });

    it("should match domain pattern case-insensitively", () => {
      const result = checkGlobalBlockList("User@Blocked.COM", [
        "@blocked.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should not match parent domain", () => {
      const result = checkGlobalBlockList("user@mail.example.com", [
        "@example.com",
      ]);

      // Should not block subdomain when only parent domain is blocked
      expect(result.isBlocked).toBe(false);
    });

    it("should match exact subdomain", () => {
      const result = checkGlobalBlockList("user@mail.example.com", [
        "@mail.example.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should handle multiple domain patterns", () => {
      const blockList = ["@spam.com", "@junk.net", "@trash.org"];

      expect(checkGlobalBlockList("user@spam.com", blockList).isBlocked).toBe(
        true,
      );
      expect(checkGlobalBlockList("user@junk.net", blockList).isBlocked).toBe(
        true,
      );
      expect(checkGlobalBlockList("user@trash.org", blockList).isBlocked).toBe(
        true,
      );
      expect(checkGlobalBlockList("user@good.com", blockList).isBlocked).toBe(
        false,
      );
    });

    it("should handle mixed email and domain patterns", () => {
      const blockList = [
        "specific@example.com",
        "@blocked-domain.com",
        "another@test.com",
      ];

      expect(
        checkGlobalBlockList("specific@example.com", blockList).isBlocked,
      ).toBe(true);
      expect(
        checkGlobalBlockList("any@blocked-domain.com", blockList).isBlocked,
      ).toBe(true);
      expect(
        checkGlobalBlockList("another@test.com", blockList).isBlocked,
      ).toBe(true);
      expect(checkGlobalBlockList("safe@example.com", blockList).isBlocked).toBe(
        false,
      );
    });

    it("should return not blocked for invalid email with empty block list", () => {
      const result = checkGlobalBlockList("not-an-email", []);

      expect(result.isBlocked).toBe(false);
    });

    it("should handle block list with one entry", () => {
      const result = checkGlobalBlockList("user@example.com", [
        "user@example.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should handle very long block list", () => {
      const blockList = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
      blockList.push("target@blocked.com");

      const result = checkGlobalBlockList("target@blocked.com", blockList);

      expect(result.isBlocked).toBe(true);
    });

    it("should handle email with plus addressing", () => {
      const result = checkGlobalBlockList("user+tag@example.com", [
        "user+tag@example.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should not match different plus tags", () => {
      const result = checkGlobalBlockList("user+tag1@example.com", [
        "user+tag2@example.com",
      ]);

      expect(result.isBlocked).toBe(false);
    });

    it("should match domain with plus addressing", () => {
      const result = checkGlobalBlockList("user+tag@blocked.com", [
        "@blocked.com",
      ]);

      expect(result.isBlocked).toBe(true);
    });

    it("should handle ASCII domain names", () => {
      // Note: International domain names may not work with the current implementation
      const result = checkGlobalBlockList("user@example.de", [
        "@example.de",
      ]);

      expect(result.isBlocked).toBe(true);
    });
  });
});
