import { describe, it, expect } from "vitest";
import {
  sortItemsByIndexAndName,
  sortByIndexThenName,
} from "@/lib/utils/sort-items-by-index-name";

describe("lib/utils/sort-items-by-index-name", () => {
  describe("sortItemsByIndexAndName", () => {
    it("should sort by orderIndex when both items have it", () => {
      const items = [
        { orderIndex: 3, document: { name: "C" } },
        { orderIndex: 1, document: { name: "A" } },
        { orderIndex: 2, document: { name: "B" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("A");
      expect(sorted[1].document.name).toBe("B");
      expect(sorted[2].document.name).toBe("C");
    });

    it("should sort by name when orderIndex is null", () => {
      const items = [
        { orderIndex: null, document: { name: "C" } },
        { orderIndex: null, document: { name: "A" } },
        { orderIndex: null, document: { name: "B" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("A");
      expect(sorted[1].document.name).toBe("B");
      expect(sorted[2].document.name).toBe("C");
    });

    it("should sort by numerical prefix in name", () => {
      const items = [
        { orderIndex: null, document: { name: "3-Document" } },
        { orderIndex: null, document: { name: "1-Document" } },
        { orderIndex: null, document: { name: "2-Document" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("1-Document");
      expect(sorted[1].document.name).toBe("2-Document");
      expect(sorted[2].document.name).toBe("3-Document");
    });

    it("should handle mixed numerical and non-numerical names", () => {
      const items = [
        { orderIndex: null, document: { name: "Document" } },
        { orderIndex: null, document: { name: "2-Doc" } },
        { orderIndex: null, document: { name: "1-Doc" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      // Items without numerical prefix (0) come before numerical items
      expect(sorted[0].document.name).toBe("Document");
      expect(sorted[1].document.name).toBe("1-Doc");
      expect(sorted[2].document.name).toBe("2-Doc");
    });

    it("should fall back to lexicographical sort when numbers are same", () => {
      const items = [
        { orderIndex: null, document: { name: "1-C" } },
        { orderIndex: null, document: { name: "1-A" } },
        { orderIndex: null, document: { name: "1-B" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("1-A");
      expect(sorted[1].document.name).toBe("1-B");
      expect(sorted[2].document.name).toBe("1-C");
    });

    it("should handle same orderIndex with different names", () => {
      const items = [
        { orderIndex: 1, document: { name: "C" } },
        { orderIndex: 1, document: { name: "A" } },
        { orderIndex: 1, document: { name: "B" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("A");
      expect(sorted[1].document.name).toBe("B");
      expect(sorted[2].document.name).toBe("C");
    });

    it("should handle large numbers in names", () => {
      const items = [
        { orderIndex: null, document: { name: "100-Doc" } },
        { orderIndex: null, document: { name: "10-Doc" } },
        { orderIndex: null, document: { name: "1-Doc" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("1-Doc");
      expect(sorted[1].document.name).toBe("10-Doc");
      expect(sorted[2].document.name).toBe("100-Doc");
    });

    it("should handle empty name", () => {
      const items = [
        { orderIndex: null, document: { name: "" } },
        { orderIndex: null, document: { name: "A" } },
      ];

      const sorted = sortItemsByIndexAndName(items);

      expect(sorted[0].document.name).toBe("");
      expect(sorted[1].document.name).toBe("A");
    });
  });

  describe("sortByIndexThenName", () => {
    it("should sort by orderIndex when both have it", () => {
      const items = [
        { orderIndex: 3, name: "C" },
        { orderIndex: 1, name: "A" },
        { orderIndex: 2, name: "B" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
      expect(sorted[2].name).toBe("C");
    });

    it("should put items with orderIndex before nulls", () => {
      const items = [
        { orderIndex: null, name: "A" },
        { orderIndex: 1, name: "B" },
        { orderIndex: null, name: "C" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("B");
      expect(sorted[1].name).toBe("A");
      expect(sorted[2].name).toBe("C");
    });

    it("should sort null orderIndex items by name", () => {
      const items = [
        { orderIndex: null, name: "C" },
        { orderIndex: null, name: "A" },
        { orderIndex: null, name: "B" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
      expect(sorted[2].name).toBe("C");
    });

    it("should handle items with document.name property", () => {
      const items = [
        { orderIndex: null, document: { name: "C" } },
        { orderIndex: null, document: { name: "A" } },
        { orderIndex: null, document: { name: "B" } },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].document?.name).toBe("A");
      expect(sorted[1].document?.name).toBe("B");
      expect(sorted[2].document?.name).toBe("C");
    });

    it("should prefer name over document.name", () => {
      const items = [
        { orderIndex: null, name: "A", document: { name: "Z" } },
        { orderIndex: null, name: "B", document: { name: "Y" } },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
    });

    it("should handle items without name properties", () => {
      const items = [
        { orderIndex: null },
        { orderIndex: null },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted).toHaveLength(2);
    });

    it("should handle mixed orderIndex types", () => {
      const items = [
        { orderIndex: null, name: "D" },
        { orderIndex: 2, name: "B" },
        { orderIndex: null, name: "C" },
        { orderIndex: 1, name: "A" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
      expect(sorted[2].name).toBe("C");
      expect(sorted[3].name).toBe("D");
    });

    it("should handle same orderIndex with different names", () => {
      const items = [
        { orderIndex: 1, name: "C" },
        { orderIndex: 1, name: "A" },
        { orderIndex: 1, name: "B" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
      expect(sorted[2].name).toBe("C");
    });

    it("should handle zero as valid orderIndex", () => {
      const items = [
        { orderIndex: 2, name: "C" },
        { orderIndex: 0, name: "A" },
        { orderIndex: 1, name: "B" },
      ];

      const sorted = sortByIndexThenName(items);

      expect(sorted[0].name).toBe("A");
      expect(sorted[1].name).toBe("B");
      expect(sorted[2].name).toBe("C");
    });

    it("should use localeCompare for name sorting", () => {
      const items = [
        { orderIndex: null, name: "Zebra" },
        { orderIndex: null, name: "apple" },
        { orderIndex: null, name: "Banana" },
      ];

      const sorted = sortByIndexThenName(items);

      // localeCompare handles case-insensitive sorting
      expect(sorted[0].name).toBe("apple");
      expect(sorted[1].name).toBe("Banana");
      expect(sorted[2].name).toBe("Zebra");
    });
  });
});
