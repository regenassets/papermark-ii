import { describe, it, expect } from "vitest";
import {
  getSupportedContentType,
  getExtensionFromContentType,
  supportsAdvancedExcelMode,
} from "@/lib/utils/get-content-type";

describe("lib/utils/get-content-type", () => {
  describe("getSupportedContentType", () => {
    it("should return 'pdf' for PDF files", () => {
      expect(getSupportedContentType("application/pdf")).toBe("pdf");
    });

    it("should return 'sheet' for Excel files", () => {
      expect(getSupportedContentType("application/vnd.ms-excel")).toBe("sheet");
      expect(
        getSupportedContentType(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
      ).toBe("sheet");
      expect(
        getSupportedContentType(
          "application/vnd.ms-excel.sheet.macroEnabled.12",
        ),
      ).toBe("sheet");
    });

    it("should return 'sheet' for CSV and TSV files", () => {
      expect(getSupportedContentType("text/csv")).toBe("sheet");
      expect(getSupportedContentType("text/tab-separated-values")).toBe(
        "sheet",
      );
    });

    it("should return 'sheet' for OpenDocument spreadsheets", () => {
      expect(
        getSupportedContentType(
          "application/vnd.oasis.opendocument.spreadsheet",
        ),
      ).toBe("sheet");
    });

    it("should return 'docs' for Word documents", () => {
      expect(getSupportedContentType("application/msword")).toBe("docs");
      expect(
        getSupportedContentType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
      ).toBe("docs");
    });

    it("should return 'docs' for text files", () => {
      expect(getSupportedContentType("text/plain")).toBe("docs");
      expect(getSupportedContentType("application/rtf")).toBe("docs");
      expect(getSupportedContentType("text/rtf")).toBe("docs");
    });

    it("should return 'docs' for OpenDocument text", () => {
      expect(
        getSupportedContentType("application/vnd.oasis.opendocument.text"),
      ).toBe("docs");
    });

    it("should return 'slides' for PowerPoint files", () => {
      expect(getSupportedContentType("application/vnd.ms-powerpoint")).toBe(
        "slides",
      );
      expect(
        getSupportedContentType(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ),
      ).toBe("slides");
    });

    it("should return 'slides' for Keynote files", () => {
      expect(getSupportedContentType("application/vnd.apple.keynote")).toBe(
        "slides",
      );
      expect(
        getSupportedContentType("application/x-iwork-keynote-sffkey"),
      ).toBe("slides");
    });

    it("should return 'slides' for OpenDocument presentations", () => {
      expect(
        getSupportedContentType(
          "application/vnd.oasis.opendocument.presentation",
        ),
      ).toBe("slides");
    });

    it("should return 'image' for image files", () => {
      expect(getSupportedContentType("image/png")).toBe("image");
      expect(getSupportedContentType("image/jpeg")).toBe("image");
      expect(getSupportedContentType("image/jpg")).toBe("image");
    });

    it("should return 'cad' for CAD files", () => {
      expect(getSupportedContentType("image/vnd.dwg")).toBe("cad");
      expect(getSupportedContentType("image/vnd.dxf")).toBe("cad");
    });

    it("should return 'zip' for archive files", () => {
      expect(getSupportedContentType("application/zip")).toBe("zip");
      expect(getSupportedContentType("application/x-zip-compressed")).toBe(
        "zip",
      );
    });

    it("should return 'video' for video files", () => {
      expect(getSupportedContentType("video/mp4")).toBe("video");
      expect(getSupportedContentType("video/quicktime")).toBe("video");
      expect(getSupportedContentType("video/x-msvideo")).toBe("video");
      expect(getSupportedContentType("video/webm")).toBe("video");
      expect(getSupportedContentType("video/ogg")).toBe("video");
    });

    it("should return 'video' for audio files", () => {
      expect(getSupportedContentType("audio/mp4")).toBe("video");
      expect(getSupportedContentType("audio/x-m4a")).toBe("video");
      expect(getSupportedContentType("audio/m4a")).toBe("video");
      expect(getSupportedContentType("audio/mpeg")).toBe("video");
    });

    it("should return 'map' for KML/KMZ files", () => {
      expect(
        getSupportedContentType("application/vnd.google-earth.kml+xml"),
      ).toBe("map");
      expect(getSupportedContentType("application/vnd.google-earth.kmz")).toBe(
        "map",
      );
    });

    it("should return 'email' for Outlook messages", () => {
      expect(getSupportedContentType("application/vnd.ms-outlook")).toBe(
        "email",
      );
    });

    it("should return null for unsupported types", () => {
      expect(getSupportedContentType("application/octet-stream")).toBeNull();
      expect(getSupportedContentType("unknown/type")).toBeNull();
      expect(getSupportedContentType("")).toBeNull();
    });
  });

  describe("getExtensionFromContentType", () => {
    it("should return correct extension for PDF", () => {
      expect(getExtensionFromContentType("application/pdf")).toBe("pdf");
    });

    it("should return correct extensions for Excel files", () => {
      expect(getExtensionFromContentType("application/vnd.ms-excel")).toBe(
        "xls",
      );
      expect(
        getExtensionFromContentType(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
      ).toBe("xlsx");
      expect(
        getExtensionFromContentType(
          "application/vnd.ms-excel.sheet.macroEnabled.12",
        ),
      ).toBe("xlsm");
    });

    it("should return correct extensions for CSV/TSV", () => {
      expect(getExtensionFromContentType("text/csv")).toBe("csv");
      expect(getExtensionFromContentType("text/tab-separated-values")).toBe(
        "tsv",
      );
    });

    it("should return correct extension for OpenDocument spreadsheet", () => {
      expect(
        getExtensionFromContentType(
          "application/vnd.oasis.opendocument.spreadsheet",
        ),
      ).toBe("ods");
    });

    it("should return correct extensions for Word documents", () => {
      expect(getExtensionFromContentType("application/msword")).toBe("doc");
      expect(
        getExtensionFromContentType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
      ).toBe("docx");
      expect(
        getExtensionFromContentType("application/vnd.oasis.opendocument.text"),
      ).toBe("odt");
    });

    it("should return correct extensions for text formats", () => {
      expect(getExtensionFromContentType("text/plain")).toBe("txt");
      expect(getExtensionFromContentType("application/rtf")).toBe("rtf");
      expect(getExtensionFromContentType("text/rtf")).toBe("rtf");
    });

    it("should return correct extensions for PowerPoint", () => {
      expect(
        getExtensionFromContentType("application/vnd.ms-powerpoint"),
      ).toBe("ppt");
      expect(
        getExtensionFromContentType(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ),
      ).toBe("pptx");
      expect(
        getExtensionFromContentType(
          "application/vnd.oasis.opendocument.presentation",
        ),
      ).toBe("odp");
    });

    it("should return correct extension for Keynote", () => {
      expect(
        getExtensionFromContentType("application/vnd.apple.keynote"),
      ).toBe("key");
      expect(
        getExtensionFromContentType("application/x-iwork-keynote-sffkey"),
      ).toBe("key");
    });

    it("should return correct extensions for CAD files", () => {
      expect(getExtensionFromContentType("image/vnd.dwg")).toBe("dwg");
      expect(getExtensionFromContentType("image/vnd.dxf")).toBe("dxf");
    });

    it("should return correct extensions for images", () => {
      expect(getExtensionFromContentType("image/png")).toBe("png");
      expect(getExtensionFromContentType("image/jpeg")).toBe("jpeg");
      expect(getExtensionFromContentType("image/jpg")).toBe("jpg");
    });

    it("should return correct extensions for video files", () => {
      expect(getExtensionFromContentType("video/mp4")).toBe("mp4");
      expect(getExtensionFromContentType("video/quicktime")).toBe("mov");
      expect(getExtensionFromContentType("video/x-msvideo")).toBe("avi");
      expect(getExtensionFromContentType("video/webm")).toBe("webm");
      expect(getExtensionFromContentType("video/ogg")).toBe("ogg");
    });

    it("should return correct extensions for audio files", () => {
      expect(getExtensionFromContentType("audio/mp4")).toBe("m4a");
      expect(getExtensionFromContentType("audio/x-m4a")).toBe("m4a");
      expect(getExtensionFromContentType("audio/m4a")).toBe("m4a");
      expect(getExtensionFromContentType("audio/mpeg")).toBe("mp3");
    });

    it("should return correct extensions for map files", () => {
      expect(
        getExtensionFromContentType("application/vnd.google-earth.kml+xml"),
      ).toBe("kml");
      expect(
        getExtensionFromContentType("application/vnd.google-earth.kmz"),
      ).toBe("kmz");
    });

    it("should return correct extension for Outlook", () => {
      expect(getExtensionFromContentType("application/vnd.ms-outlook")).toBe(
        "msg",
      );
    });

    it("should return null for unsupported types", () => {
      expect(getExtensionFromContentType("application/octet-stream")).toBeNull();
      expect(getExtensionFromContentType("unknown/type")).toBeNull();
      expect(getExtensionFromContentType("")).toBeNull();
    });
  });

  describe("supportsAdvancedExcelMode", () => {
    it("should return true for XLS files", () => {
      expect(supportsAdvancedExcelMode("application/vnd.ms-excel")).toBe(true);
    });

    it("should return true for XLSX files", () => {
      expect(
        supportsAdvancedExcelMode(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
      ).toBe(true);
    });

    it("should return true for XLSM files", () => {
      expect(
        supportsAdvancedExcelMode(
          "application/vnd.ms-excel.sheet.macroEnabled.12",
        ),
      ).toBe(true);
    });

    it("should return false for CSV files", () => {
      expect(supportsAdvancedExcelMode("text/csv")).toBe(false);
    });

    it("should return false for other spreadsheet formats", () => {
      expect(
        supportsAdvancedExcelMode(
          "application/vnd.oasis.opendocument.spreadsheet",
        ),
      ).toBe(false);
    });

    it("should return false for non-spreadsheet types", () => {
      expect(supportsAdvancedExcelMode("application/pdf")).toBe(false);
      expect(supportsAdvancedExcelMode("image/png")).toBe(false);
      expect(supportsAdvancedExcelMode("video/mp4")).toBe(false);
    });

    it("should return false for null", () => {
      expect(supportsAdvancedExcelMode(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(supportsAdvancedExcelMode(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(supportsAdvancedExcelMode("")).toBe(false);
    });

    it("should be case sensitive", () => {
      expect(supportsAdvancedExcelMode("APPLICATION/VND.MS-EXCEL")).toBe(false);
    });

    it("should only match exact Excel MIME types", () => {
      expect(
        supportsAdvancedExcelMode("application/vnd.ms-excel-extra"),
      ).toBe(false);
    });
  });
});
