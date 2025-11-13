import { describe, it, expect } from "vitest";
import { createWebhookSignature } from "@/lib/webhook/signature";

describe("lib/webhook/signature", () => {
  describe("createWebhookSignature", () => {
    it("should create a valid HMAC-SHA256 signature", async () => {
      const secret = "test-webhook-secret";
      const body = { event: "document.viewed", data: { id: "123" } };

      const signature = await createWebhookSignature(secret, body);

      expect(signature).toBeTruthy();
      expect(typeof signature).toBe("string");
      expect(signature).toHaveLength(64); // SHA-256 hex is 64 characters
      expect(/^[a-f0-9]+$/.test(signature)).toBe(true);
    });

    it("should create consistent signatures for same input", async () => {
      const secret = "test-secret";
      const body = { event: "test", data: { value: 42 } };

      const sig1 = await createWebhookSignature(secret, body);
      const sig2 = await createWebhookSignature(secret, body);

      expect(sig1).toBe(sig2);
    });

    it("should create different signatures for different secrets", async () => {
      const body = { event: "test", data: {} };

      const sig1 = await createWebhookSignature("secret1", body);
      const sig2 = await createWebhookSignature("secret2", body);

      expect(sig1).not.toBe(sig2);
    });

    it("should create different signatures for different payloads", async () => {
      const secret = "test-secret";

      const sig1 = await createWebhookSignature(secret, { event: "event1" });
      const sig2 = await createWebhookSignature(secret, { event: "event2" });

      expect(sig1).not.toBe(sig2);
    });

    it("should throw error if secret is not provided", async () => {
      await expect(
        createWebhookSignature("", { event: "test" }),
      ).rejects.toThrow("A secret must be provided");
    });

    it("should handle complex nested objects", async () => {
      const secret = "test-secret";
      const body = {
        event: "document.viewed",
        data: {
          document: {
            id: "doc-123",
            name: "Test Document",
            metadata: {
              pages: 10,
              size: 1024000,
            },
          },
          viewer: {
            email: "viewer@example.com",
            timestamp: new Date().toISOString(),
          },
        },
      };

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
      expect(signature).toHaveLength(64);
    });

    it("should handle arrays in payload", async () => {
      const secret = "test-secret";
      const body = {
        event: "bulk.update",
        data: {
          items: [
            { id: "1", status: "active" },
            { id: "2", status: "inactive" },
          ],
        },
      };

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
    });

    it("should be sensitive to property order in JSON", async () => {
      const secret = "test-secret";
      const body1 = { a: 1, b: 2 };
      const body2 = { b: 2, a: 1 };

      const sig1 = await createWebhookSignature(secret, body1);
      const sig2 = await createWebhookSignature(secret, body2);

      // JSON.stringify maintains property order, so different order = different signature
      expect(sig1).not.toBe(sig2);
    });

    it("should handle empty payload", async () => {
      const secret = "test-secret";
      const body = {};

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
      expect(signature).toHaveLength(64);
    });

    it("should handle special characters in payload", async () => {
      const secret = "test-secret";
      const body = {
        message: "Hello, World! 🎉",
        special: "chars: <>&\"'",
      };

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
    });
  });

  describe("signature verification scenario", () => {
    it("should allow verification of webhook authenticity", async () => {
      // Simulate webhook sender
      const webhookSecret = "shared-secret-key";
      const payload = {
        event: "document.viewed",
        documentId: "doc-123",
        viewerId: "viewer-456",
        timestamp: new Date().toISOString(),
      };

      const sentSignature = await createWebhookSignature(webhookSecret, payload);

      // Simulate webhook receiver verifying signature
      const receivedSignature = await createWebhookSignature(
        webhookSecret,
        payload,
      );

      expect(sentSignature).toBe(receivedSignature);
    });

    it("should detect tampered payloads", async () => {
      const webhookSecret = "shared-secret-key";
      const originalPayload = {
        event: "document.viewed",
        documentId: "doc-123",
      };

      const originalSignature = await createWebhookSignature(
        webhookSecret,
        originalPayload,
      );

      // Attacker modifies payload
      const tamperedPayload = {
        event: "document.viewed",
        documentId: "doc-999", // Changed
      };

      const tamperedSignature = await createWebhookSignature(
        webhookSecret,
        tamperedPayload,
      );

      expect(originalSignature).not.toBe(tamperedSignature);
    });

    it("should reject signatures with wrong secret", async () => {
      const correctSecret = "correct-secret";
      const wrongSecret = "wrong-secret";
      const payload = { event: "test" };

      const correctSignature = await createWebhookSignature(
        correctSecret,
        payload,
      );
      const wrongSignature = await createWebhookSignature(wrongSecret, payload);

      expect(correctSignature).not.toBe(wrongSignature);
    });
  });

  describe("edge cases", () => {
    it("should handle null values in payload", async () => {
      const secret = "test-secret";
      const body = { value: null, event: "test" };

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
    });

    it("should handle undefined values in payload", async () => {
      const secret = "test-secret";
      const body = { value: undefined, event: "test" };

      const signature = await createWebhookSignature(secret, body);
      expect(signature).toBeTruthy();
    });

    it("should handle very long secrets", async () => {
      const longSecret = "a".repeat(1000);
      const body = { event: "test" };

      const signature = await createWebhookSignature(longSecret, body);
      expect(signature).toBeTruthy();
      expect(signature).toHaveLength(64);
    });

    it("should handle very large payloads", async () => {
      const secret = "test-secret";
      const largeBody = {
        event: "bulk.upload",
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `item-${i}`,
          data: "x".repeat(100),
        })),
      };

      const signature = await createWebhookSignature(secret, largeBody);
      expect(signature).toBeTruthy();
    });
  });
});
