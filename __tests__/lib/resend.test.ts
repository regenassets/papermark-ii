import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// Mock dependencies
vi.mock("@react-email/render", () => ({
  render: vi.fn((component) => Promise.resolve(`<html>${component}</html>`)),
  toPlainText: vi.fn((html) => "Plain text version"),
}));

vi.mock("@/lib/utils", () => ({
  log: vi.fn(),
  nanoid: vi.fn(() => "test-nanoid-123"),
}));

// Mock Resend
vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      constructor(apiKey: string) {}
      emails = {
        send: vi.fn(),
      };
    },
  };
});

import { sendEmail, resend } from "@/lib/resend";

describe("lib/resend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the send method response
    if (resend) {
      vi.mocked(resend.emails.send).mockResolvedValue({
        data: { id: "email-id-123" },
        error: null,
      } as any);
    }
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const testEmail = {
        to: "test@example.com",
        subject: "Test Subject",
        react: React.createElement("div", {}, "Test email content"),
      };

      const result = await sendEmail(testEmail);

      expect(result).toEqual({ id: "email-id-123" });
      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test Subject",
        }),
      );
    });

    it("should use default from address for regular emails", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Marc from Papermark <marc@papermark.io>",
        }),
      );
    });

    it("should use marketing from address when marketing=true", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        marketing: true,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Marc from Papermark <marc@ship.papermark.io>",
        }),
      );
    });

    it("should use system from address when system=true", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        system: true,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Papermark <system@papermark.io>",
        }),
      );
    });

    it("should use verify from address when verify=true", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        verify: true,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Papermark <system@verify.papermark.io>",
        }),
      );
    });

    it("should use custom from address when provided", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        from: "custom@example.com",
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "custom@example.com",
        }),
      );
    });

    it("should send to test address when test=true", async () => {
      await sendEmail({
        to: "real@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        test: true,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "delivered@resend.dev",
        }),
      );
    });

    it("should include cc when provided", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        cc: "cc@example.com",
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: "cc@example.com",
        }),
      );
    });

    it("should include replyTo when provided", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        replyTo: "reply@example.com",
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: "reply@example.com",
        }),
      );
    });

    it("should use marc@papermark.io as replyTo for marketing emails", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        marketing: true,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: "marc@papermark.io",
        }),
      );
    });

    it("should include scheduledAt when provided", async () => {
      const scheduledAt = "2024-12-31T23:59:59Z";

      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        scheduledAt,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledAt,
        }),
      );
    });

    it("should include unsubscribe header when unsubscribeUrl provided", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
        unsubscribeUrl: "https://example.com/unsubscribe",
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "List-Unsubscribe": "https://example.com/unsubscribe",
          }),
        }),
      );
    });

    it("should include X-Entity-Ref-ID header", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Entity-Ref-ID": "test-nanoid-123",
          }),
        }),
      );
    });

    it("should throw error when resend returns error", async () => {
      const errorMessage = "Invalid email address";
      vi.mocked(resend!.emails.send).mockResolvedValue({
        data: null,
        error: { name: "ValidationError", message: errorMessage },
      } as any);

      await expect(
        sendEmail({
          to: "invalid-email",
          subject: "Test",
          react: React.createElement("div", {}, "Content"),
        }),
      ).rejects.toMatchObject({
        name: "ValidationError",
        message: errorMessage,
      });
    });

    it("should throw error when resend is not initialized", async () => {
      // Temporarily remove API key
      delete process.env.RESEND_API_KEY;

      // Force reimport to get null resend
      vi.resetModules();
      const { sendEmail: sendEmailNew } = await import("@/lib/resend");

      await expect(
        sendEmailNew({
          to: "test@example.com",
          subject: "Test",
          react: React.createElement("div", {}, "Content"),
        }),
      ).rejects.toThrow("Resend not initialized");

      // Restore API key
      process.env.RESEND_API_KEY = "test-api-key";
    });

    it("should handle send exceptions", async () => {
      const exception = new Error("Network error");
      vi.mocked(resend!.emails.send).mockRejectedValue(exception);

      await expect(
        sendEmail({
          to: "test@example.com",
          subject: "Test",
          react: React.createElement("div", {}, "Content"),
        }),
      ).rejects.toThrow("Network error");
    });

    it("should include plain text version of email", async () => {
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: React.createElement("div", {}, "Content"),
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Plain text version",
        }),
      );
    });

    it("should pass react component to send", async () => {
      const reactComponent = React.createElement("div", {}, "Test content");

      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: reactComponent,
      });

      expect(resend?.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          react: reactComponent,
        }),
      );
    });
  });
});
