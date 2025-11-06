import { describe, it, expect } from "vitest";
import {
  FADE_IN_ANIMATION_SETTINGS,
  STAGGER_CHILD_VARIANTS,
  PAPERMARK_HEADERS,
  REACTIONS,
  ONE_SECOND,
  ONE_MINUTE,
  ONE_HOUR,
  ONE_DAY,
  ONE_WEEK,
  BLOCKED_PATHNAMES,
  EXCLUDED_PATHS,
  LIMITS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
  FREE_PLAN_ACCEPTED_FILE_TYPES,
  FULL_PLAN_ACCEPTED_FILE_TYPES,
  VIEWER_ACCEPTED_FILE_TYPES,
  SUPPORTED_DOCUMENT_SIMPLE_TYPES,
  VIDEO_EVENT_TYPES,
  COUNTRIES,
  COUNTRY_CODES,
  EU_COUNTRY_CODES,
  SYSTEM_FILES,
} from "@/lib/constants";

describe("lib/constants", () => {
  describe("Animation constants", () => {
    it("should have fade in animation settings", () => {
      expect(FADE_IN_ANIMATION_SETTINGS).toEqual({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      });
    });

    it("should have stagger child variants", () => {
      expect(STAGGER_CHILD_VARIANTS).toEqual({
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, type: "spring" },
        },
      });
    });
  });

  describe("Headers", () => {
    it("should have Papermark headers", () => {
      expect(PAPERMARK_HEADERS).toEqual({
        headers: {
          "x-powered-by":
            "Papermark - Secure Data Room Infrastructure for the modern web",
        },
      });
    });
  });

  describe("Reactions", () => {
    it("should have 4 reactions", () => {
      expect(REACTIONS).toHaveLength(4);
    });

    it("should include heart reaction", () => {
      expect(REACTIONS).toContainEqual({ emoji: "❤️", label: "heart" });
    });

    it("should include money reaction", () => {
      expect(REACTIONS).toContainEqual({ emoji: "💸", label: "money" });
    });

    it("should include thumbs up reaction", () => {
      expect(REACTIONS).toContainEqual({ emoji: "👍", label: "up" });
    });

    it("should include thumbs down reaction", () => {
      expect(REACTIONS).toContainEqual({ emoji: "👎", label: "down" });
    });
  });

  describe("Time constants", () => {
    it("should define one second as 1000ms", () => {
      expect(ONE_SECOND).toBe(1000);
    });

    it("should define one minute as 60 seconds", () => {
      expect(ONE_MINUTE).toBe(60000);
    });

    it("should define one hour as 60 minutes", () => {
      expect(ONE_HOUR).toBe(3600000);
    });

    it("should define one day as 24 hours", () => {
      expect(ONE_DAY).toBe(86400000);
    });

    it("should define one week as 7 days", () => {
      expect(ONE_WEEK).toBe(604800000);
    });

    it("should have correct time multipliers", () => {
      expect(ONE_MINUTE / ONE_SECOND).toBe(60);
      expect(ONE_HOUR / ONE_MINUTE).toBe(60);
      expect(ONE_DAY / ONE_HOUR).toBe(24);
      expect(ONE_WEEK / ONE_DAY).toBe(7);
    });
  });

  describe("Blocked pathnames", () => {
    it("should block phpmyadmin", () => {
      expect(BLOCKED_PATHNAMES).toContain("/phpmyadmin");
    });

    it("should block server-status", () => {
      expect(BLOCKED_PATHNAMES).toContain("/server-status");
    });

    it("should block wordpress paths", () => {
      expect(BLOCKED_PATHNAMES).toContain("/wordpress");
    });

    it("should have at least 5 blocked pathnames", () => {
      expect(BLOCKED_PATHNAMES.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Excluded paths", () => {
    it("should exclude root path", () => {
      expect(EXCLUDED_PATHS).toContain("/");
    });

    it("should exclude register path", () => {
      expect(EXCLUDED_PATHS).toContain("/register");
    });

    it("should exclude privacy path", () => {
      expect(EXCLUDED_PATHS).toContain("/privacy");
    });

    it("should exclude view path", () => {
      expect(EXCLUDED_PATHS).toContain("/view");
    });
  });

  describe("Limits", () => {
    it("should have views limit of 20", () => {
      expect(LIMITS.views).toBe(20);
    });
  });

  describe("Document MIME types", () => {
    it("should support PDF", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("application/pdf");
    });

    it("should support Excel formats", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("application/vnd.ms-excel");
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });

    it("should support PowerPoint formats", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain(
        "application/vnd.ms-powerpoint",
      );
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    });

    it("should support Word formats", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("application/msword");
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    });

    it("should support video formats", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("video/mp4");
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("video/quicktime");
    });

    it("should support image formats", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("image/png");
      expect(SUPPORTED_DOCUMENT_MIME_TYPES).toContain("image/jpeg");
    });

    it("should be a non-empty array", () => {
      expect(SUPPORTED_DOCUMENT_MIME_TYPES.length).toBeGreaterThan(0);
    });
  });

  describe("File type configurations", () => {
    it("should have free plan accepted types", () => {
      expect(FREE_PLAN_ACCEPTED_FILE_TYPES).toHaveProperty("application/pdf");
      expect(FREE_PLAN_ACCEPTED_FILE_TYPES).toHaveProperty("image/png");
    });

    it("should have full plan accepted types", () => {
      expect(FULL_PLAN_ACCEPTED_FILE_TYPES).toHaveProperty("application/pdf");
      expect(FULL_PLAN_ACCEPTED_FILE_TYPES).toHaveProperty("video/mp4");
    });

    it("should have viewer accepted types", () => {
      expect(VIEWER_ACCEPTED_FILE_TYPES).toHaveProperty("application/pdf");
      expect(VIEWER_ACCEPTED_FILE_TYPES).toHaveProperty("image/jpeg");
    });

    it("should have more types in full plan than free plan", () => {
      const freeCount = Object.keys(FREE_PLAN_ACCEPTED_FILE_TYPES).length;
      const fullCount = Object.keys(FULL_PLAN_ACCEPTED_FILE_TYPES).length;

      expect(fullCount).toBeGreaterThan(freeCount);
    });
  });

  describe("Document simple types", () => {
    it("should include pdf type", () => {
      expect(SUPPORTED_DOCUMENT_SIMPLE_TYPES).toContain("pdf");
    });

    it("should include notion type", () => {
      expect(SUPPORTED_DOCUMENT_SIMPLE_TYPES).toContain("notion");
    });

    it("should include sheet type", () => {
      expect(SUPPORTED_DOCUMENT_SIMPLE_TYPES).toContain("sheet");
    });

    it("should include video type", () => {
      expect(SUPPORTED_DOCUMENT_SIMPLE_TYPES).toContain("video");
    });

    it("should be readonly array", () => {
      expect(Array.isArray(SUPPORTED_DOCUMENT_SIMPLE_TYPES)).toBe(true);
    });
  });

  describe("Video event types", () => {
    it("should include loaded event", () => {
      expect(VIDEO_EVENT_TYPES).toContain("loaded");
    });

    it("should include played event", () => {
      expect(VIDEO_EVENT_TYPES).toContain("played");
    });

    it("should include seeked event", () => {
      expect(VIDEO_EVENT_TYPES).toContain("seeked");
    });

    it("should include volume events", () => {
      expect(VIDEO_EVENT_TYPES).toContain("volume_up");
      expect(VIDEO_EVENT_TYPES).toContain("volume_down");
      expect(VIDEO_EVENT_TYPES).toContain("muted");
      expect(VIDEO_EVENT_TYPES).toContain("unmuted");
    });

    it("should include fullscreen events", () => {
      expect(VIDEO_EVENT_TYPES).toContain("enterfullscreen");
      expect(VIDEO_EVENT_TYPES).toContain("exitfullscreen");
    });

    it("should include focus events", () => {
      expect(VIDEO_EVENT_TYPES).toContain("focus");
      expect(VIDEO_EVENT_TYPES).toContain("blur");
    });
  });

  describe("Countries", () => {
    it("should include United States", () => {
      expect(COUNTRIES.US).toBe("United States");
    });

    it("should include United Kingdom", () => {
      expect(COUNTRIES.GB).toBe("United Kingdom");
    });

    it("should include Germany", () => {
      expect(COUNTRIES.DE).toBe("Germany");
    });

    it("should include France", () => {
      expect(COUNTRIES.FR).toBe("France");
    });

    it("should include Canada", () => {
      expect(COUNTRIES.CA).toBe("Canada");
    });

    it("should have over 200 countries", () => {
      expect(Object.keys(COUNTRIES).length).toBeGreaterThan(200);
    });

    it("should use ISO 3166-1 alpha-2 codes", () => {
      Object.keys(COUNTRIES).forEach((code) => {
        expect(code).toHaveLength(2);
        expect(code).toMatch(/^[A-Z]{2}$/);
      });
    });
  });

  describe("Country codes", () => {
    it("should be an array", () => {
      expect(Array.isArray(COUNTRY_CODES)).toBe(true);
    });

    it("should include US", () => {
      expect(COUNTRY_CODES).toContain("US");
    });

    it("should have same length as COUNTRIES", () => {
      expect(COUNTRY_CODES.length).toBe(Object.keys(COUNTRIES).length);
    });
  });

  describe("EU country codes", () => {
    it("should include major EU countries", () => {
      expect(EU_COUNTRY_CODES).toContain("DE"); // Germany
      expect(EU_COUNTRY_CODES).toContain("FR"); // France
      expect(EU_COUNTRY_CODES).toContain("IT"); // Italy
      expect(EU_COUNTRY_CODES).toContain("ES"); // Spain
    });

    it("should include UK", () => {
      expect(EU_COUNTRY_CODES).toContain("GB");
    });

    it("should be a subset of all countries", () => {
      EU_COUNTRY_CODES.forEach((code) => {
        expect(COUNTRIES).toHaveProperty(code);
      });
    });

    it("should have reasonable size", () => {
      // EU has around 27-30 countries
      expect(EU_COUNTRY_CODES.length).toBeGreaterThan(20);
      expect(EU_COUNTRY_CODES.length).toBeLessThan(40);
    });
  });

  describe("System files", () => {
    it("should include .DS_Store", () => {
      expect(SYSTEM_FILES).toContain(".DS_Store");
    });

    it("should include Thumbs.db", () => {
      expect(SYSTEM_FILES).toContain("Thumbs.db");
    });

    it("should include node_modules", () => {
      expect(SYSTEM_FILES).toContain("node_modules");
    });

    it("should have at least 3 system files", () => {
      expect(SYSTEM_FILES).toHaveLength(3);
    });
  });
});
