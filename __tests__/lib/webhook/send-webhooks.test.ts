import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies - use factory functions to avoid hoisting issues
vi.mock("@/lib/cron", () => ({
  qstash: {
    publishJSON: vi.fn(),
  },
}));

vi.mock("@/lib/webhook/signature", () => ({
  createWebhookSignature: vi.fn(),
}));

vi.mock("@/lib/webhook/transform", () => ({
  prepareWebhookPayload: vi.fn((trigger, data) => ({
    id: "evt_123",
    event: trigger,
    createdAt: new Date().toISOString(),
    data,
  })),
}));

// Import after mocking
import { sendWebhooks } from "@/lib/webhook/send-webhooks";
import { qstash } from "@/lib/cron";
import { createWebhookSignature } from "@/lib/webhook/signature";

const mockPublishJSON = vi.mocked(qstash.publishJSON);
const mockCreateWebhookSignature = vi.mocked(createWebhookSignature);

describe("lib/webhook/send-webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "https://app.papermark.io";
    mockCreateWebhookSignature.mockResolvedValue("mock-signature-abc123");
    mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });
  });

  describe("sendWebhooks", () => {
    it("should send webhooks to multiple endpoints", async () => {
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook1",
          secret: "secret-1",
        },
        {
          pId: "webhook-2",
          url: "https://example.com/webhook2",
          secret: "secret-2",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: {
          document: { id: "doc-123", name: "Test Doc" },
          link: { id: "link-123" },
          viewer: { email: "viewer@example.com" },
        },
      });

      expect(mockPublishJSON).toHaveBeenCalledTimes(2);
      expect(mockCreateWebhookSignature).toHaveBeenCalledTimes(2);
    });

    it("should include correct signature header", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook",
          secret: "webhook-secret",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: {
          document: { id: "doc-123" },
          link: { id: "link-123" },
        },
      });

      expect(mockPublishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://example.com/webhook",
          headers: expect.objectContaining({
            "X-Papermark-Signature": "mock-signature-abc123",
            "Upstash-Hide-Headers": "true",
          }),
        }),
      );
    });

    it("should include callback and failure callback URLs", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-xyz",
          url: "https://example.com/webhook",
          secret: "secret",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "link.created",
        data: { link: { id: "link-123" } },
      });

      const callArgs = mockPublishJSON.mock.calls[0][0];
      expect(callArgs.callback).toContain(
        "https://app.papermark.io/api/webhooks/callback",
      );
      expect(callArgs.callback).toContain("webhookId=webhook-xyz");
      expect(callArgs.callback).toContain("eventId=evt_123");
      expect(callArgs.callback).toContain("event=link.created");
      expect(callArgs.failureCallback).toBe(callArgs.callback);
    });

    it("should not send webhooks if array is empty", async () => {
      

      await sendWebhooks({
        webhooks: [],
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });

      expect(mockPublishJSON).not.toHaveBeenCalled();
    });

    it("should create signature with webhook secret", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhook = {
        pId: "webhook-1",
        url: "https://example.com/webhook",
        secret: "unique-webhook-secret-123",
      };

      await sendWebhooks({
        webhooks: [webhook],
        trigger: "document.downloaded",
        data: { document: { id: "doc-123" } },
      });

      expect(mockCreateWebhookSignature).toHaveBeenCalledWith(
        "unique-webhook-secret-123",
        expect.objectContaining({
          id: "evt_123",
          event: "document.downloaded",
        }),
      );
    });

    it("should handle QStash publish failures gracefully", async () => {
      
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockPublishJSON.mockResolvedValue({ messageId: null });

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook",
          secret: "secret",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to publish webhook event to QStash",
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it("should send different signatures for different webhooks", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      mockCreateWebhookSignature
        .mockResolvedValueOnce("signature-webhook-1")
        .mockResolvedValueOnce("signature-webhook-2");

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook1",
          secret: "secret-1",
        },
        {
          pId: "webhook-2",
          url: "https://example.com/webhook2",
          secret: "secret-2",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });

      const firstCall = mockPublishJSON.mock.calls[0][0];
      const secondCall = mockPublishJSON.mock.calls[1][0];

      expect(firstCall.headers["X-Papermark-Signature"]).toBe(
        "signature-webhook-1",
      );
      expect(secondCall.headers["X-Papermark-Signature"]).toBe(
        "signature-webhook-2",
      );
    });

    it("should handle various webhook triggers", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhook = {
        pId: "webhook-1",
        url: "https://example.com/webhook",
        secret: "secret",
      };

      const triggers = [
        "document.viewed",
        "document.downloaded",
        "link.created",
        "link.deleted",
        "dataroom.viewed",
      ];

      for (const trigger of triggers) {
        await sendWebhooks({
          webhooks: [webhook],
          trigger: trigger as any,
          data: { document: { id: "doc-123" } },
        });
      }

      expect(mockPublishJSON).toHaveBeenCalledTimes(triggers.length);
    });

    it("should send payload body to webhook URL", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook",
          secret: "secret",
        },
      ];

      const eventData = {
        document: { id: "doc-123", name: "Important Document" },
        link: { id: "link-456", slug: "test-slug" },
        viewer: { email: "viewer@example.com", id: "viewer-789" },
      };

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: eventData,
      });

      expect(mockPublishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            id: "evt_123",
            event: "document.viewed",
            data: eventData,
          }),
        }),
      );
    });

    it("should process webhooks in parallel", async () => {
      
      const delays: number[] = [];

      mockPublishJSON.mockImplementation(async () => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 10));
        delays.push(Date.now() - start);
        return { messageId: "msg_123" };
      });

      const webhooks = Array.from({ length: 5 }, (_, i) => ({
        pId: `webhook-${i}`,
        url: `https://example.com/webhook${i}`,
        secret: `secret-${i}`,
      }));

      const start = Date.now();
      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });
      const totalTime = Date.now() - start;

      // If processed sequentially, would take 5*10ms = 50ms+
      // If parallel, should take ~10ms (plus overhead)
      expect(totalTime).toBeLessThan(30); // Allow some overhead
      expect(mockPublishJSON).toHaveBeenCalledTimes(5);
    });
  });

  describe("webhook URL construction", () => {
    it("should use NEXT_PUBLIC_BASE_URL for callback", async () => {
      process.env.NEXT_PUBLIC_BASE_URL = "https://custom.papermark.app";

      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-1",
          url: "https://example.com/webhook",
          secret: "secret",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });

      const callArgs = mockPublishJSON.mock.calls[0][0];
      expect(callArgs.callback).toContain(
        "https://custom.papermark.app/api/webhooks/callback",
      );
    });

    it("should properly encode query parameters in callback URL", async () => {
      
      mockPublishJSON.mockResolvedValue({ messageId: "msg_123" });

      const webhooks = [
        {
          pId: "webhook-with-special-chars",
          url: "https://example.com/webhook",
          secret: "secret",
        },
      ];

      await sendWebhooks({
        webhooks,
        trigger: "document.viewed",
        data: { document: { id: "doc-123" } },
      });

      const callArgs = mockPublishJSON.mock.calls[0][0];
      const callbackUrl = new URL(callArgs.callback);

      expect(callbackUrl.searchParams.get("webhookId")).toBe(
        "webhook-with-special-chars",
      );
      expect(callbackUrl.searchParams.get("eventId")).toBe("evt_123");
      expect(callbackUrl.searchParams.get("event")).toBe("document.viewed");
    });
  });
});
