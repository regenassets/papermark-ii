import { describe, it, expect } from "vitest";
import {
  getFileSizeLimits,
  getFileSizeLimit,
} from "@/lib/utils/get-file-size-limits";

describe("lib/utils/get-file-size-limits", () => {
  describe("getFileSizeLimits", () => {
    it("should return default limits for free users", () => {
      const limits = getFileSizeLimits({
        isFree: true,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 500,
        document: 100,
        image: 30,
        excel: 40,
        maxFiles: 150,
        maxPages: 100,
      });
    });

    it("should return default limits for trial users (same as paid)", () => {
      const limits = getFileSizeLimits({
        isFree: true,
        isTrial: true,
      });

      expect(limits).toEqual({
        video: 500,
        document: 350,
        image: 100,
        excel: 40,
        maxFiles: 150,
        maxPages: 500,
      });
    });

    it("should return default limits for paid users", () => {
      const limits = getFileSizeLimits({
        isFree: false,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 500,
        document: 350,
        image: 100,
        excel: 40,
        maxFiles: 150,
        maxPages: 500,
      });
    });

    it("should merge custom limits with defaults", () => {
      const limits = getFileSizeLimits({
        limits: {
          fileSizeLimits: {
            video: 1000,
            document: 500,
          },
        },
        isFree: true,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 1000, // Custom
        document: 500, // Custom
        image: 30, // Default for free
        excel: 40, // Default
        maxFiles: 150, // Default
        maxPages: 100, // Default for free
      });
    });

    it("should use all custom limits when provided", () => {
      const limits = getFileSizeLimits({
        limits: {
          fileSizeLimits: {
            video: 2000,
            document: 1000,
            image: 500,
            excel: 200,
            maxFiles: 300,
            maxPages: 1000,
          },
        },
        isFree: true,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 2000,
        document: 1000,
        image: 500,
        excel: 200,
        maxFiles: 300,
        maxPages: 1000,
      });
    });

    it("should handle null limits object", () => {
      const limits = getFileSizeLimits({
        limits: null,
        isFree: false,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 500,
        document: 350,
        image: 100,
        excel: 40,
        maxFiles: 150,
        maxPages: 500,
      });
    });

    it("should handle empty fileSizeLimits object", () => {
      const limits = getFileSizeLimits({
        limits: {
          fileSizeLimits: {},
        },
        isFree: false,
        isTrial: false,
      });

      expect(limits).toEqual({
        video: 500,
        document: 350,
        image: 100,
        excel: 40,
        maxFiles: 150,
        maxPages: 500,
      });
    });

    it("should handle partial custom limits", () => {
      const limits = getFileSizeLimits({
        limits: {
          fileSizeLimits: {
            video: 1500,
          },
        },
        isFree: true,
        isTrial: false,
      });

      expect(limits.video).toBe(1500);
      expect(limits.document).toBe(100); // Free tier default
      expect(limits.image).toBe(30); // Free tier default
      expect(limits.maxPages).toBe(100); // Free tier default
    });

    it("should differentiate between free trial and free non-trial", () => {
      const freeLimits = getFileSizeLimits({
        isFree: true,
        isTrial: false,
      });

      const trialLimits = getFileSizeLimits({
        isFree: true,
        isTrial: true,
      });

      // Trial should have higher limits than free
      expect(trialLimits.document).toBeGreaterThan(freeLimits.document);
      expect(trialLimits.image).toBeGreaterThan(freeLimits.image);
      expect(trialLimits.maxPages).toBeGreaterThan(freeLimits.maxPages);
    });

    it("should use 0 as valid custom limit", () => {
      const limits = getFileSizeLimits({
        limits: {
          fileSizeLimits: {
            maxFiles: 0,
          },
        },
        isFree: false,
        isTrial: false,
      });

      expect(limits.maxFiles).toBe(0);
    });
  });

  describe("getFileSizeLimit", () => {
    const testLimits = {
      video: 500,
      document: 350,
      image: 100,
      excel: 40,
      maxFiles: 150,
      maxPages: 500,
    };

    it("should return video limit for video types", () => {
      expect(getFileSizeLimit("video/mp4", testLimits)).toBe(500);
      expect(getFileSizeLimit("video/quicktime", testLimits)).toBe(500);
      expect(getFileSizeLimit("video/x-msvideo", testLimits)).toBe(500);
      expect(getFileSizeLimit("video/webm", testLimits)).toBe(500);
    });

    it("should return image limit for image types", () => {
      expect(getFileSizeLimit("image/jpeg", testLimits)).toBe(100);
      expect(getFileSizeLimit("image/png", testLimits)).toBe(100);
      expect(getFileSizeLimit("image/gif", testLimits)).toBe(100);
      expect(getFileSizeLimit("image/webp", testLimits)).toBe(100);
      expect(getFileSizeLimit("image/svg+xml", testLimits)).toBe(100);
    });

    it("should return excel limit for Excel XLSX files", () => {
      expect(
        getFileSizeLimit(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          testLimits,
        ),
      ).toBe(40);
    });

    it("should return excel limit for legacy Excel XLS files", () => {
      expect(getFileSizeLimit("application/vnd.ms-excel", testLimits)).toBe(40);
    });

    it("should return excel limit for OpenDocument spreadsheets", () => {
      expect(
        getFileSizeLimit(
          "application/vnd.oasis.opendocument.spreadsheet",
          testLimits,
        ),
      ).toBe(40);
    });

    it("should return document limit for PDF files", () => {
      expect(getFileSizeLimit("application/pdf", testLimits)).toBe(350);
    });

    it("should return document limit for Word documents", () => {
      expect(
        getFileSizeLimit(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          testLimits,
        ),
      ).toBe(350);
      expect(getFileSizeLimit("application/msword", testLimits)).toBe(350);
    });

    it("should return document limit for PowerPoint files", () => {
      expect(
        getFileSizeLimit(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          testLimits,
        ),
      ).toBe(350);
      expect(getFileSizeLimit("application/vnd.ms-powerpoint", testLimits)).toBe(
        350,
      );
    });

    it("should return document limit for text files", () => {
      expect(getFileSizeLimit("text/plain", testLimits)).toBe(350);
      expect(getFileSizeLimit("text/csv", testLimits)).toBe(350);
      expect(getFileSizeLimit("text/html", testLimits)).toBe(350);
    });

    it("should return document limit for unknown types", () => {
      expect(getFileSizeLimit("application/octet-stream", testLimits)).toBe(350);
      expect(getFileSizeLimit("unknown/type", testLimits)).toBe(350);
      expect(getFileSizeLimit("", testLimits)).toBe(350);
    });

    it("should handle case sensitivity in file types", () => {
      // File types should be lowercase, but test anyway
      expect(getFileSizeLimit("VIDEO/MP4", testLimits)).toBe(350); // Won't match, returns document
      expect(getFileSizeLimit("video/MP4", testLimits)).toBe(500); // Will match video/
    });

    it("should prioritize more specific type checks", () => {
      // Excel files should return excel limit, not document limit
      expect(
        getFileSizeLimit("application/vnd.ms-excel", testLimits),
      ).not.toBe(350);
      expect(getFileSizeLimit("application/vnd.ms-excel", testLimits)).toBe(40);
    });

    it("should work with custom limits object", () => {
      const customLimits = {
        video: 2000,
        document: 1000,
        image: 500,
        excel: 200,
        maxFiles: 300,
        maxPages: 1000,
      };

      expect(getFileSizeLimit("video/mp4", customLimits)).toBe(2000);
      expect(getFileSizeLimit("image/png", customLimits)).toBe(500);
      expect(getFileSizeLimit("application/pdf", customLimits)).toBe(1000);
      expect(
        getFileSizeLimit("application/vnd.ms-excel", customLimits),
      ).toBe(200);
    });
  });
});
