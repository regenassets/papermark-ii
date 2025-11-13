import { describe, it, expect } from "vitest";
import {
  isSystemFile,
  determineFolderPaths,
} from "@/lib/folders/create-folder";

describe("lib/folders/create-folder", () => {
  describe("isSystemFile", () => {
    it("should identify .DS_Store as system file (dot prefix)", () => {
      expect(isSystemFile(".DS_Store")).toBe(true);
    });

    it("should not identify Thumbs.db (mixed case) from list", () => {
      // SYSTEM_FILES has "Thumbs.db" but we lowercase to "thumbs.db"
      // which doesn't match, so it returns false
      expect(isSystemFile("Thumbs.db")).toBe(false);
    });

    it("should identify node_modules as system file", () => {
      expect(isSystemFile("node_modules")).toBe(true);
    });

    it("should identify any file starting with dot", () => {
      expect(isSystemFile(".hidden")).toBe(true);
      expect(isSystemFile(".gitignore")).toBe(true);
      expect(isSystemFile(".env")).toBe(true);
    });

    it("should match system files case-insensitively for lowercase items", () => {
      // SYSTEM_FILES has [".DS_Store", "Thumbs.db", "node_modules"]
      // Function lowercases input, so "node_modules" (already lowercase) matches
      expect(isSystemFile("node_modules")).toBe(true);
      expect(isSystemFile("NODE_MODULES")).toBe(true); // Lowercases to "node_modules"
      expect(isSystemFile(".ds_store")).toBe(true); // dot prefix
    });

    it("should not identify normal files", () => {
      expect(isSystemFile("document.pdf")).toBe(false);
      expect(isSystemFile("README.md")).toBe(false);
      expect(isSystemFile("index.html")).toBe(false);
    });

    it("should handle files with dots in the middle", () => {
      expect(isSystemFile("my.document.pdf")).toBe(false);
    });

    it("should identify hidden files starting with dot", () => {
      expect(isSystemFile(".bashrc")).toBe(true);
      expect(isSystemFile(".config")).toBe(true);
    });

    it("should handle dot-prefixed files case-insensitively", () => {
      expect(isSystemFile(".ds_store")).toBe(true);
      expect(isSystemFile(".DS_STORE")).toBe(true);
    });

    it("should match system file names from list", () => {
      expect(isSystemFile("node_modules")).toBe(true);
      expect(isSystemFile(".DS_Store")).toBe(true); // Matches via dot prefix
      // Note: "Thumbs.db" in SYSTEM_FILES won't match because we lowercase
    });

    it("should not match files that just contain system file names", () => {
      expect(isSystemFile("my_node_modules_backup")).toBe(false);
    });

    it("should handle empty string", () => {
      // Empty string doesn't match system files
      expect(isSystemFile("")).toBe(false);
    });

    it("should handle single dot", () => {
      expect(isSystemFile(".")).toBe(true);
    });

    it("should handle double dots", () => {
      expect(isSystemFile("..")).toBe(true);
    });

    it("should handle files with numbers", () => {
      expect(isSystemFile("document123.pdf")).toBe(false);
    });

    it("should handle files with special characters", () => {
      expect(isSystemFile("my-document.pdf")).toBe(false);
      expect(isSystemFile("my_document.pdf")).toBe(false);
    });

    it("should identify .git as system file", () => {
      expect(isSystemFile(".git")).toBe(true);
    });

    it("should identify .svn as system file", () => {
      expect(isSystemFile(".svn")).toBe(true);
    });
  });

  describe("determineFolderPaths", () => {
    it("should return both paths when not first level", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom/folder1",
        currentMainDocsPath: "/docs/folder1",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: "/dataroom/folder1",
        parentMainDocsPath: "/docs/folder1",
      });
    });

    it("should return undefined mainDocsPath for first level folder", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom",
        currentMainDocsPath: "/docs",
        isFirstLevelFolder: true,
      });

      expect(result).toEqual({
        parentDataroomPath: "/dataroom",
        parentMainDocsPath: undefined,
      });
    });

    it("should handle undefined currentDataroomPath", () => {
      const result = determineFolderPaths({
        currentMainDocsPath: "/docs/folder1",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: undefined,
        parentMainDocsPath: "/docs/folder1",
      });
    });

    it("should handle undefined currentMainDocsPath", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom/folder1",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: "/dataroom/folder1",
        parentMainDocsPath: undefined,
      });
    });

    it("should handle both paths undefined", () => {
      const result = determineFolderPaths({
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: undefined,
        parentMainDocsPath: undefined,
      });
    });

    it("should always set mainDocsPath to undefined for first level", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom",
        currentMainDocsPath: "/docs/folder1",
        isFirstLevelFolder: true,
      });

      expect(result.parentMainDocsPath).toBeUndefined();
    });

    it("should preserve dataroomPath regardless of level", () => {
      const path = "/dataroom/nested/folder";

      const resultFirstLevel = determineFolderPaths({
        currentDataroomPath: path,
        isFirstLevelFolder: true,
      });

      const resultNotFirstLevel = determineFolderPaths({
        currentDataroomPath: path,
        isFirstLevelFolder: false,
      });

      expect(resultFirstLevel.parentDataroomPath).toBe(path);
      expect(resultNotFirstLevel.parentDataroomPath).toBe(path);
    });

    it("should handle deeply nested paths", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom/a/b/c/d",
        currentMainDocsPath: "/docs/a/b/c/d",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: "/dataroom/a/b/c/d",
        parentMainDocsPath: "/docs/a/b/c/d",
      });
    });

    it("should handle paths with special characters", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom/folder-with-dashes",
        currentMainDocsPath: "/docs/folder_with_underscores",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: "/dataroom/folder-with-dashes",
        parentMainDocsPath: "/docs/folder_with_underscores",
      });
    });

    it("should handle root level paths", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/",
        currentMainDocsPath: "/",
        isFirstLevelFolder: true,
      });

      expect(result).toEqual({
        parentDataroomPath: "/",
        parentMainDocsPath: undefined,
      });
    });

    it("should return object with correct properties", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "/dataroom",
        currentMainDocsPath: "/docs",
        isFirstLevelFolder: false,
      });

      expect(result).toHaveProperty("parentDataroomPath");
      expect(result).toHaveProperty("parentMainDocsPath");
    });

    it("should handle empty string paths", () => {
      const result = determineFolderPaths({
        currentDataroomPath: "",
        currentMainDocsPath: "",
        isFirstLevelFolder: false,
      });

      expect(result).toEqual({
        parentDataroomPath: "",
        parentMainDocsPath: "",
      });
    });
  });
});
