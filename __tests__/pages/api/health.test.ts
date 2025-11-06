import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/health";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe("pages/api/health", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {};
    res = {
      json: jsonMock,
      status: statusMock,
    };
  });

  it("should return OK status when database is healthy", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(jsonMock).toHaveBeenCalledWith({
      status: "ok",
      message: "All systems operational",
    });
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("should execute SELECT 1 query", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(prisma.default.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when database query fails", async () => {
    const prisma = await import("@/lib/prisma");
    const error = new Error("Database connection failed");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce(error);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Database connection failed",
    });
  });

  it("should return error message from exception", async () => {
    const prisma = await import("@/lib/prisma");
    const error = new Error("Custom error message");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce(error);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Custom error message",
    });
  });

  it("should handle non-Error exceptions", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce("string error");

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it("should work with any HTTP method", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    const methods = ["GET", "POST", "PUT", "DELETE"];

    for (const method of methods) {
      req.method = method;
      await handler(req as NextApiRequest, res as NextApiResponse);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "ok",
        message: "All systems operational",
      });
      vi.clearAllMocks();
      vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);
    }
  });

  it("should ignore request body", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    req.body = { data: "test" };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(jsonMock).toHaveBeenCalledWith({
      status: "ok",
      message: "All systems operational",
    });
  });

  it("should ignore query parameters", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    req.query = { test: "value" };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(jsonMock).toHaveBeenCalledWith({
      status: "ok",
      message: "All systems operational",
    });
  });

  it("should respond with JSON content", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(jsonMock).toHaveBeenCalled();
  });

  it("should return consistent response structure on success", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockResolvedValueOnce(undefined);

    await handler(req as NextApiRequest, res as NextApiResponse);

    const response = jsonMock.mock.calls[0][0];
    expect(response).toHaveProperty("status");
    expect(response).toHaveProperty("message");
    expect(response.status).toBe("ok");
  });

  it("should return consistent response structure on error", async () => {
    const prisma = await import("@/lib/prisma");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce(
      new Error("test error"),
    );

    await handler(req as NextApiRequest, res as NextApiResponse);

    const response = jsonMock.mock.calls[0][0];
    expect(response).toHaveProperty("status");
    expect(response).toHaveProperty("message");
    expect(response.status).toBe("error");
  });

  it("should handle database timeout", async () => {
    const prisma = await import("@/lib/prisma");
    const timeoutError = new Error("Connection timeout");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce(timeoutError);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Connection timeout",
    });
  });

  it("should handle database authentication errors", async () => {
    const prisma = await import("@/lib/prisma");
    const authError = new Error("Authentication failed");
    vi.mocked(prisma.default.$queryRaw).mockRejectedValueOnce(authError);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "error",
      message: "Authentication failed",
    });
  });
});
