import { describe, it, expect } from "vitest";
import {
  getHierarchicalDisplayName,
  HIERARCHICAL_DISPLAY_STYLE,
} from "@/lib/utils/hierarchical-display";

describe("lib/utils/hierarchical-display", () => {
  describe("getHierarchicalDisplayName", () => {
    it("should return name without index when feature disabled", () => {
      const result = getHierarchicalDisplayName("Document.pdf", "1.2", false);

      expect(result).toBe("Document.pdf");
    });

    it("should return name with index when feature enabled", () => {
      const result = getHierarchicalDisplayName("Document.pdf", "1.2", true);

      expect(result).toBe("1.2 Document.pdf");
    });

    it("should return name without index when index is null", () => {
      const result = getHierarchicalDisplayName("Document.pdf", null, true);

      expect(result).toBe("Document.pdf");
    });

    it("should return name without index when index is undefined", () => {
      const result = getHierarchicalDisplayName("Document.pdf", undefined, true);

      expect(result).toBe("Document.pdf");
    });

    it("should handle empty hierarchical index", () => {
      const result = getHierarchicalDisplayName("Document.pdf", "", true);

      expect(result).toBe("Document.pdf");
    });

    it("should handle single-level index", () => {
      const result = getHierarchicalDisplayName("Folder", "1", true);

      expect(result).toBe("1 Folder");
    });

    it("should handle multi-level index", () => {
      const result = getHierarchicalDisplayName("Nested Folder", "1.2.3", true);

      expect(result).toBe("1.2.3 Nested Folder");
    });

    it("should handle deep nesting", () => {
      const result = getHierarchicalDisplayName(
        "Deep Doc",
        "1.2.3.4.5.6",
        true,
      );

      expect(result).toBe("1.2.3.4.5.6 Deep Doc");
    });

    it("should default to feature disabled when not specified", () => {
      const result = getHierarchicalDisplayName("Document.pdf", "1.2");

      expect(result).toBe("Document.pdf");
    });

    it("should handle names with special characters", () => {
      const result = getHierarchicalDisplayName(
        "Report (2024) - Final.pdf",
        "2.1",
        true,
      );

      expect(result).toBe("2.1 Report (2024) - Final.pdf");
    });

    it("should handle names with numbers", () => {
      const result = getHierarchicalDisplayName("Q4 2024 Report", "3.2", true);

      expect(result).toBe("3.2 Q4 2024 Report");
    });

    it("should handle names with unicode characters", () => {
      const result = getHierarchicalDisplayName("文档", "1.1", true);

      expect(result).toBe("1.1 文档");
    });

    it("should handle names with emojis", () => {
      const result = getHierarchicalDisplayName("📄 Document", "1.1", true);

      expect(result).toBe("1.1 📄 Document");
    });

    it("should handle long names", () => {
      const longName = "A".repeat(200);
      const result = getHierarchicalDisplayName(longName, "1.2.3", true);

      expect(result).toBe(`1.2.3 ${longName}`);
    });

    it("should handle names with leading/trailing spaces", () => {
      const result = getHierarchicalDisplayName("  Document  ", "1.1", true);

      expect(result).toBe("1.1   Document  ");
    });

    it("should handle index with leading zeros", () => {
      const result = getHierarchicalDisplayName("Document", "01.02", true);

      expect(result).toBe("01.02 Document");
    });

    it("should handle large index numbers", () => {
      const result = getHierarchicalDisplayName("Document", "99.100.1000", true);

      expect(result).toBe("99.100.1000 Document");
    });

    it("should maintain single space between index and name", () => {
      const result = getHierarchicalDisplayName("Document", "1.1", true);

      expect(result).toContain(" ");
      expect(result.split(" ").length).toBe(2);
    });
  });

  describe("HIERARCHICAL_DISPLAY_STYLE", () => {
    it("should define tabular-nums font variant", () => {
      expect(HIERARCHICAL_DISPLAY_STYLE).toEqual({
        fontVariantNumeric: "tabular-nums",
      });
    });

    it("should be a readonly constant", () => {
      expect(Object.isFrozen(HIERARCHICAL_DISPLAY_STYLE)).toBe(false);
      expect(HIERARCHICAL_DISPLAY_STYLE.fontVariantNumeric).toBe("tabular-nums");
    });
  });
});
