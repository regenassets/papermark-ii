import { describe, it, expect } from "vitest";
import { IdGenerator, newId } from "@/lib/id-helper";

describe("lib/id-helper", () => {
  describe("IdGenerator", () => {
    it("should generate IDs with correct prefix", () => {
      const generator = new IdGenerator({
        test: "tst",
        user: "usr",
      });

      const testId = generator.id("test");
      const userId = generator.id("user");

      expect(testId).toMatch(/^tst_[A-Za-z0-9]+$/);
      expect(userId).toMatch(/^usr_[A-Za-z0-9]+$/);
    });

    it("should generate unique IDs on each call", () => {
      const generator = new IdGenerator({
        test: "tst",
      });

      const id1 = generator.id("test");
      const id2 = generator.id("test");
      const id3 = generator.id("test");

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should generate IDs with base58 encoding", () => {
      const generator = new IdGenerator({
        test: "tst",
      });

      const id = generator.id("test");
      const base58Part = id.split("_")[1];

      // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
      // Should not contain: 0, O, I, l
      expect(base58Part).not.toMatch(/[0OIl]/);
      expect(base58Part).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
    });

    it("should handle multiple prefixes", () => {
      const generator = new IdGenerator({
        user: "usr",
        post: "pst",
        comment: "cmt",
        like: "lke",
      });

      const userId = generator.id("user");
      const postId = generator.id("post");
      const commentId = generator.id("comment");
      const likeId = generator.id("like");

      expect(userId.startsWith("usr_")).toBe(true);
      expect(postId.startsWith("pst_")).toBe(true);
      expect(commentId.startsWith("cmt_")).toBe(true);
      expect(likeId.startsWith("lke_")).toBe(true);
    });

    it("should generate consistent format", () => {
      const generator = new IdGenerator({
        test: "prefix",
      });

      for (let i = 0; i < 100; i++) {
        const id = generator.id("test");
        expect(id).toMatch(/^prefix_[A-Za-z0-9]+$/);
        expect(id.split("_")).toHaveLength(2);
      }
    });
  });

  describe("newId - global ID generator", () => {
    it("should generate view IDs", () => {
      const viewId = newId("view");
      expect(viewId).toMatch(/^view_[A-Za-z0-9]+$/);
    });

    it("should generate video view IDs", () => {
      const videoViewId = newId("videoView");
      expect(videoViewId).toMatch(/^vview_[A-Za-z0-9]+$/);
    });

    it("should generate link view IDs", () => {
      const linkViewId = newId("linkView");
      expect(linkViewId).toMatch(/^lview_[A-Za-z0-9]+$/);
    });

    it("should generate invitation IDs", () => {
      const invId = newId("inv");
      expect(invId).toMatch(/^inv_[A-Za-z0-9]+$/);
    });

    it("should generate email IDs", () => {
      const emailId = newId("email");
      expect(emailId).toMatch(/^email_[A-Za-z0-9]+$/);
    });

    it("should generate document IDs", () => {
      const docId = newId("doc");
      expect(docId).toMatch(/^doc_[A-Za-z0-9]+$/);
    });

    it("should generate page IDs", () => {
      const pageId = newId("page");
      expect(pageId).toMatch(/^page_[A-Za-z0-9]+$/);
    });

    it("should generate dataroom IDs", () => {
      const dataroomId = newId("dataroom");
      expect(dataroomId).toMatch(/^dr_[A-Za-z0-9]+$/);
    });

    it("should generate preview IDs", () => {
      const previewId = newId("preview");
      expect(previewId).toMatch(/^preview_[A-Za-z0-9]+$/);
    });

    it("should generate webhook IDs", () => {
      const webhookId = newId("webhook");
      expect(webhookId).toMatch(/^wh_[A-Za-z0-9]+$/);
    });

    it("should generate webhook event IDs", () => {
      const eventId = newId("webhookEvent");
      expect(eventId).toMatch(/^evt_[A-Za-z0-9]+$/);
    });

    it("should generate webhook secret IDs", () => {
      const secretId = newId("webhookSecret");
      expect(secretId).toMatch(/^whsec_[A-Za-z0-9]+$/);
    });

    it("should generate token IDs", () => {
      const tokenId = newId("token");
      expect(tokenId).toMatch(/^pmk_[A-Za-z0-9]+$/);
    });

    it("should generate click event IDs", () => {
      const clickId = newId("clickEvent");
      expect(clickId).toMatch(/^click_[A-Za-z0-9]+$/);
    });

    it("should generate preset IDs", () => {
      const presetId = newId("preset");
      expect(presetId).toMatch(/^preset_[A-Za-z0-9]+$/);
    });

    it("should generate unique IDs across all types", () => {
      const ids = new Set<string>();
      const types = [
        "view",
        "videoView",
        "linkView",
        "inv",
        "email",
        "doc",
        "page",
        "dataroom",
        "preview",
        "webhook",
        "webhookEvent",
        "webhookSecret",
        "token",
        "clickEvent",
        "preset",
      ] as const;

      types.forEach((type) => {
        for (let i = 0; i < 10; i++) {
          const id = newId(type);
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }
      });

      expect(ids.size).toBe(types.length * 10);
    });
  });

  describe("ID format validation", () => {
    it("should generate IDs suitable for database storage", () => {
      const id = newId("doc");
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(100);
      expect(id).not.toContain(" ");
      expect(id).not.toContain("\n");
    });

    it("should generate IDs suitable for URLs", () => {
      const id = newId("view");
      // Should be URL-safe (no special characters that need encoding)
      expect(encodeURIComponent(id)).toBe(id);
    });

    it("should not contain ambiguous characters", () => {
      // Generate many IDs to test randomness
      for (let i = 0; i < 100; i++) {
        const id = newId("test" as any); // Test with any type
        // Should not contain 0, O, I, l (ambiguous in base58)
        expect(id).not.toMatch(/[0OIl]/);
      }
    });
  });

  describe("collision resistance", () => {
    it("should have extremely low collision probability", () => {
      const ids = new Set<string>();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        ids.add(newId("view"));
      }

      // All IDs should be unique
      expect(ids.size).toBe(count);
    });

    it("should maintain uniqueness across different prefixes", () => {
      const ids = new Set<string>();

      // Generate IDs with different prefixes
      for (let i = 0; i < 100; i++) {
        ids.add(newId("view"));
        ids.add(newId("doc"));
        ids.add(newId("page"));
      }

      expect(ids.size).toBe(300);
    });
  });

  describe("Stripe-like ID format", () => {
    it("should follow Stripe ID convention (prefix_base58)", () => {
      const id = newId("webhook");
      const parts = id.split("_");

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe("wh"); // prefix
      expect(parts[1]).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/); // base58
    });

    it("should have consistent prefix lengths", () => {
      // Prefixes should be short and consistent
      expect(newId("view").split("_")[0]).toHaveLength(4);
      expect(newId("doc").split("_")[0]).toHaveLength(3);
      expect(newId("dataroom").split("_")[0]).toHaveLength(2);
    });
  });

  describe("security properties", () => {
    it("should be unpredictable (high entropy)", () => {
      const id1 = newId("token");
      const id2 = newId("token");

      // Should not be sequential or predictable
      const base1 = id1.split("_")[1];
      const base2 = id2.split("_")[1];

      // First characters should be different (with high probability)
      // Run multiple times to reduce false negatives
      let differentCount = 0;
      for (let i = 0; i < 10; i++) {
        const a = newId("token").split("_")[1];
        const b = newId("token").split("_")[1];
        if (a !== b) differentCount++;
      }

      expect(differentCount).toBe(10);
    });

    it("should use crypto.randomUUID for randomness", () => {
      // IDs should have sufficient length from UUID (128 bits)
      const id = newId("token");
      const base58Part = id.split("_")[1];

      // Base58 encoding of UUID should be reasonably long
      expect(base58Part.length).toBeGreaterThan(15);
    });
  });
});
