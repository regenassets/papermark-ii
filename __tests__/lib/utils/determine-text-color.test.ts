import { describe, it, expect } from "vitest";
import { determineTextColor } from "@/lib/utils/determine-text-color";

describe("lib/utils/determine-text-color", () => {
  describe("determineTextColor", () => {
    it("should return white for null", () => {
      expect(determineTextColor(null)).toBe("white");
    });

    it("should return white for undefined", () => {
      expect(determineTextColor(undefined)).toBe("white");
    });

    it("should return black for white background", () => {
      expect(determineTextColor("#ffffff")).toBe("black");
      expect(determineTextColor("#fff")).toBe("black");
    });

    it("should return white for black background", () => {
      expect(determineTextColor("#000000")).toBe("white");
      expect(determineTextColor("#000")).toBe("white");
    });

    it("should return black for light colors", () => {
      expect(determineTextColor("#ffff00")).toBe("black"); // Yellow
      expect(determineTextColor("#00ff00")).toBe("black"); // Green
      expect(determineTextColor("#00ffff")).toBe("black"); // Cyan
    });

    it("should return white for dark colors", () => {
      expect(determineTextColor("#0000ff")).toBe("white"); // Blue
      expect(determineTextColor("#ff0000")).toBe("white"); // Red
      expect(determineTextColor("#800080")).toBe("white"); // Purple
    });

    it("should handle 3-digit hex colors", () => {
      expect(determineTextColor("#fff")).toBe("black");
      expect(determineTextColor("#000")).toBe("white");
      expect(determineTextColor("#f00")).toBe("white"); // Red
      expect(determineTextColor("#0f0")).toBe("black"); // Green
    });

    it("should handle 6-digit hex colors", () => {
      expect(determineTextColor("#ffffff")).toBe("black");
      expect(determineTextColor("#000000")).toBe("white");
      expect(determineTextColor("#ff0000")).toBe("white");
      expect(determineTextColor("#00ff00")).toBe("black");
    });

    it("should return black for light gray", () => {
      expect(determineTextColor("#cccccc")).toBe("black");
      expect(determineTextColor("#d3d3d3")).toBe("black");
    });

    it("should return white for dark gray", () => {
      expect(determineTextColor("#333333")).toBe("white");
      expect(determineTextColor("#666666")).toBe("white");
    });

    it("should handle medium colors at threshold", () => {
      // Colors around the 0.5 luminance threshold
      // #808080 has luminance 0.502 which is > 0.5, so black text
      expect(determineTextColor("#808080")).toBe("black"); // Medium gray
      expect(determineTextColor("#888888")).toBe("black");
      expect(determineTextColor("#777777")).toBe("white"); // Darker gray
    });

    it("should handle brand colors", () => {
      expect(determineTextColor("#1da1f2")).toBe("black"); // Twitter blue
      expect(determineTextColor("#0077b5")).toBe("white"); // LinkedIn blue
      expect(determineTextColor("#25d366")).toBe("black"); // WhatsApp green
      expect(determineTextColor("#ff0000")).toBe("white"); // YouTube red
    });

    it("should return white for empty string", () => {
      expect(determineTextColor("")).toBe("white");
    });

    it("should handle colors with different casing", () => {
      expect(determineTextColor("#FFFFFF")).toBe("black");
      expect(determineTextColor("#FFF")).toBe("black");
    });
  });
});
