import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cn,
  classNames,
  getExtension,
  getFileNameWithPdfExtension,
  bytesToSize,
  getDomainWithoutWWW,
  capitalize,
  timeAgo,
  timeIn,
  durationFormat,
  nFormatter,
  getDateTimeLocal,
  formatDateTime,
  hashPassword,
  checkPassword,
  getFirstAndLastDay,
  formatDate,
  nanoid,
  daysLeft,
  calculateDaysLeft,
  hexToRgb,
  trim,
  getBreadcrumbPath,
  sanitizeList,
  generateGravatarHash,
  generateEncrpytedPassword,
  decryptEncrpytedPassword,
  convertDataUrlToBuffer,
  isDataUrl,
  formatExpirationTime,
  safeTemplateReplace,
  serializeFileSize,
} from "@/lib/utils";

describe("lib/utils", () => {
  describe("cn - className merging", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should merge tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });
  });

  describe("classNames", () => {
    it("should join unique class names", () => {
      expect(classNames("foo", "bar", "baz")).toBe("foo bar baz");
    });

    it("should deduplicate class names", () => {
      expect(classNames("foo", "bar", "foo")).toBe("foo bar");
    });
  });

  describe("getExtension", () => {
    it("should extract file extension from URL", () => {
      expect(getExtension("file.pdf")).toBe("pdf");
      expect(getExtension("document.docx")).toBe("docx");
    });

    it("should handle URLs with query params", () => {
      expect(getExtension("file.pdf?token=123")).toBe("pdf");
    });

    it("should handle URLs with hash", () => {
      expect(getExtension("file.pdf#page=2")).toBe("pdf");
    });
  });

  describe("getFileNameWithPdfExtension", () => {
    it("should add .pdf extension to filename", () => {
      expect(getFileNameWithPdfExtension("document")).toBe("document.pdf");
    });

    it("should replace existing extension with .pdf", () => {
      expect(getFileNameWithPdfExtension("document.docx")).toBe("document.pdf");
      expect(getFileNameWithPdfExtension("image.png")).toBe("image.pdf");
    });

    it("should return default name if no filename provided", () => {
      expect(getFileNameWithPdfExtension()).toBe("document.pdf");
      expect(getFileNameWithPdfExtension("")).toBe("document.pdf");
    });
  });

  describe("bytesToSize", () => {
    it("should convert bytes to human readable format", () => {
      expect(bytesToSize(0)).toBe("n/a");
      expect(bytesToSize(500)).toBe("500 Bytes");
      expect(bytesToSize(1024)).toBe("1 KB");
      expect(bytesToSize(1000)).toBe("1 KB");
      expect(bytesToSize(1000000)).toBe("1 MB");
      expect(bytesToSize(1000000000)).toBe("1 GB");
    });

    it("should handle large file sizes", () => {
      expect(bytesToSize(1000000000000)).toBe("1 TB");
    });

    it("should round up when approaching next unit", () => {
      expect(bytesToSize(999999)).toBe("1000 KB");
    });
  });

  describe("getDomainWithoutWWW", () => {
    it("should extract domain from URL", () => {
      expect(getDomainWithoutWWW("https://example.com")).toBe("example.com");
      expect(getDomainWithoutWWW("https://www.example.com")).toBe(
        "example.com",
      );
    });

    it("should handle URLs without protocol", () => {
      expect(getDomainWithoutWWW("example.com")).toBe("example.com");
      expect(getDomainWithoutWWW("www.example.com")).toBe("example.com");
    });

    it("should return (direct) for invalid URLs", () => {
      expect(getDomainWithoutWWW("not a url")).toBeUndefined();
      expect(getDomainWithoutWWW("just words")).toBeUndefined();
    });

    it("should handle subdomains", () => {
      expect(getDomainWithoutWWW("https://app.example.com")).toBe(
        "app.example.com",
      );
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle non-string input", () => {
      expect(capitalize(null as any)).toBe(null);
      expect(capitalize(undefined as any)).toBe(undefined);
    });
  });

  describe("timeAgo", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should return 'Just now' for recent timestamps", () => {
      const now = new Date();
      expect(timeAgo(now)).toBe("Just now");
    });

    it("should return time ago for older timestamps", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      vi.setSystemTime(Date.now());
      expect(timeAgo(twoHoursAgo)).toContain("ago");
    });

    it("should return formatted date for very old timestamps", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      vi.setSystemTime(Date.now());
      expect(timeAgo(yesterday)).toMatch(/\w+ \d+/); // e.g., "Dec 24"
    });

    it("should handle undefined timestamp", () => {
      expect(timeAgo(undefined)).toBe("Just now");
    });

    vi.useRealTimers();
  });

  describe("timeIn", () => {
    it("should return 'Just now' for current time", () => {
      const now = new Date();
      expect(timeIn(now)).toBe("Just now");
    });

    it("should return future time format", () => {
      const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
      expect(timeIn(future)).toContain("in");
    });

    it("should handle undefined timestamp", () => {
      expect(timeIn(undefined)).toBe("Just now");
    });
  });

  describe("durationFormat", () => {
    it("should format durations in seconds", () => {
      expect(durationFormat(30000)).toBe("30 secs");
      expect(durationFormat(45000)).toBe("45 secs");
    });

    it("should format durations in minutes", () => {
      expect(durationFormat(90000)).toBe("1:30 mins");
      expect(durationFormat(125000)).toBe("2:05 mins");
    });

    it("should handle zero duration", () => {
      expect(durationFormat(0)).toBe("0 secs");
      expect(durationFormat(undefined)).toBe("0 secs");
    });
  });

  describe("nFormatter", () => {
    it("should format numbers with suffixes", () => {
      expect(nFormatter(0)).toBe("0");
      expect(nFormatter(100)).toBe("100");
      expect(nFormatter(1000)).toBe("1K");
      expect(nFormatter(1500)).toBe("1.5K");
      expect(nFormatter(1000000)).toBe("1M");
      expect(nFormatter(1500000)).toBe("1.5M");
      expect(nFormatter(1000000000)).toBe("1G");
    });

    it("should handle custom digits parameter", () => {
      expect(nFormatter(1234, 2)).toBe("1.23K");
      expect(nFormatter(1234567, 3)).toBe("1.235M");
    });

    it("should handle undefined", () => {
      expect(nFormatter(undefined)).toBe("0");
    });
  });

  describe("hashPassword and checkPassword", () => {
    it("should hash and verify passwords", async () => {
      const password = "test-password-123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(password);
      expect(await checkPassword(password, hashed)).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "correct-password";
      const hashed = await hashPassword(password);

      expect(await checkPassword("wrong-password", hashed)).toBe(false);
    });
  });

  describe("generateGravatarHash", () => {
    it("should generate consistent hash for email", () => {
      const hash1 = generateGravatarHash("test@example.com");
      const hash2 = generateGravatarHash("test@example.com");
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex is 64 chars
    });

    it("should trim and lowercase email", () => {
      const hash1 = generateGravatarHash("Test@Example.com");
      const hash2 = generateGravatarHash("  test@example.com  ");
      expect(hash1).toBe(hash2);
    });

    it("should handle null email", () => {
      expect(generateGravatarHash(null)).toBe("");
    });
  });

  describe("generateEncrpytedPassword and decryptEncrpytedPassword", () => {
    beforeEach(() => {
      process.env.NEXT_PRIVATE_DOCUMENT_PASSWORD_KEY =
        "test-encryption-key-for-testing";
    });

    it("should encrypt and decrypt password", async () => {
      const password = "my-secret-password";
      const encrypted = await generateEncrpytedPassword(password);

      expect(encrypted).not.toBe(password);
      expect(encrypted).toContain(":");

      const decrypted = decryptEncrpytedPassword(encrypted);
      expect(decrypted).toBe(password);
    });

    it("should return empty string for empty password", async () => {
      const encrypted = await generateEncrpytedPassword("");
      expect(encrypted).toBe("");
    });

    it("should return already encrypted password as-is", async () => {
      const password = "test-password";
      const encrypted1 = await generateEncrpytedPassword(password);
      const encrypted2 = await generateEncrpytedPassword(encrypted1);
      expect(encrypted1).toBe(encrypted2);
    });

    it("should return plaintext if decryption fails", () => {
      const invalidEncrypted = "not-a-valid-encrypted-password";
      const result = decryptEncrpytedPassword(invalidEncrypted);
      expect(result).toBe(invalidEncrypted);
    });
  });

  describe("sanitizeList", () => {
    it("should filter valid emails", () => {
      const input = "test@example.com\nuser@test.com\ninvalid-email";
      const result = sanitizeList(input, "email");
      expect(result).toEqual(["test@example.com", "user@test.com"]);
    });

    it("should filter valid domains", () => {
      const input = "@example.com\n@test.com\ninvalid";
      const result = sanitizeList(input, "domain");
      expect(result).toEqual(["@example.com", "@test.com"]);
    });

    it("should filter both emails and domains", () => {
      const input = "test@example.com\n@domain.com\ninvalid";
      const result = sanitizeList(input, "both");
      expect(result).toEqual(["test@example.com", "@domain.com"]);
    });

    it("should deduplicate entries", () => {
      const input = "test@example.com\ntest@example.com\nuser@test.com";
      const result = sanitizeList(input, "email");
      expect(result).toEqual(["test@example.com", "user@test.com"]);
    });

    it("should lowercase all entries", () => {
      const input = "Test@Example.COM\nUser@TEST.com";
      const result = sanitizeList(input, "email");
      expect(result).toEqual(["test@example.com", "user@test.com"]);
    });
  });

  describe("hexToRgb", () => {
    it("should convert hex color to RGB", () => {
      const result = hexToRgb("#FF0000");
      expect(result).toBeDefined();
    });

    it("should handle different hex formats", () => {
      const red = hexToRgb("#FF0000");
      const green = hexToRgb("#00FF00");
      const blue = hexToRgb("#0000FF");
      expect(red).toBeDefined();
      expect(green).toBeDefined();
      expect(blue).toBeDefined();
    });
  });

  describe("trim", () => {
    it("should trim strings", () => {
      expect(trim("  hello  ")).toBe("hello");
      expect(trim("world")).toBe("world");
    });

    it("should return non-strings as-is", () => {
      expect(trim(123)).toBe(123);
      expect(trim(null)).toBe(null);
      expect(trim(undefined)).toBe(undefined);
    });
  });

  describe("getBreadcrumbPath", () => {
    it("should generate breadcrumb for empty path", () => {
      const result = getBreadcrumbPath([]);
      expect(result).toEqual([{ name: "Home", pathLink: "/documents" }]);
    });

    it("should generate breadcrumb for single segment", () => {
      const result = getBreadcrumbPath(["folder1"]);
      expect(result).toEqual([
        { name: "Home", pathLink: "/documents" },
        { name: "folder1", pathLink: "documents/tree/folder1" },
      ]);
    });

    it("should generate breadcrumb for nested path", () => {
      const result = getBreadcrumbPath(["folder1", "folder2", "folder3"]);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ name: "Home", pathLink: "/documents" });
      expect(result[result.length - 1].name).toBe("folder3");
    });
  });

  describe("daysLeft", () => {
    it("should calculate days remaining correctly", () => {
      const creationDate = new Date();
      const maxDays = 14;
      const result = daysLeft(creationDate, maxDays);
      expect(result).toBeGreaterThanOrEqual(13);
      expect(result).toBeLessThanOrEqual(14);
    });

    it("should return negative for past dates", () => {
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const maxDays = 14;
      const result = daysLeft(pastDate, maxDays);
      expect(result).toBeLessThan(0);
    });
  });

  describe("calculateDaysLeft", () => {
    it("should calculate trial days for new accounts", () => {
      const recentDate = new Date();
      const result = calculateDaysLeft(recentDate);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(14);
    });

    it("should use 30-day trial for old accounts", () => {
      const oldDate = new Date("2023-10-01T00:00:00.000Z");
      const result = calculateDaysLeft(oldDate);
      expect(result).toBeLessThanOrEqual(30);
    });
  });

  describe("isDataUrl", () => {
    it("should identify data URLs", () => {
      expect(isDataUrl("data:image/png;base64,iVBORw0KG...")).toBe(true);
      expect(isDataUrl("data:text/plain;charset=UTF-8,Hello")).toBe(true);
    });

    it("should return false for regular URLs", () => {
      expect(isDataUrl("https://example.com/image.png")).toBe(false);
      expect(isDataUrl("http://test.com")).toBe(false);
    });
  });

  describe("convertDataUrlToBuffer", () => {
    it("should convert PNG data URL to buffer", () => {
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const result = convertDataUrlToBuffer(dataUrl);

      expect(result.mimeType).toBe("image/png");
      expect(result.filename).toBe("image.png");
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should convert JPEG data URL to buffer", () => {
      const dataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const result = convertDataUrlToBuffer(dataUrl);

      expect(result.mimeType).toBe("image/jpeg");
      expect(result.filename).toBe("image.jpg");
    });
  });

  describe("formatExpirationTime", () => {
    it("should format seconds correctly", () => {
      expect(formatExpirationTime(3600)).toBe("1 hour");
      expect(formatExpirationTime(7200)).toBe("2 hours");
      expect(formatExpirationTime(86400)).toBe("1 day");
      expect(formatExpirationTime(172800)).toBe("2 days");
    });

    it("should handle mixed units", () => {
      expect(formatExpirationTime(90060)).toContain("day");
      expect(formatExpirationTime(3660)).toContain("hour");
    });

    it("should handle years", () => {
      expect(formatExpirationTime(31536000)).toBe("1 year");
      expect(formatExpirationTime(63072000)).toBe("2 years");
    });
  });

  describe("safeTemplateReplace", () => {
    it("should replace allowed variables", () => {
      const template = "Hello {{email}}, the time is {{time}}";
      const data = { email: "test@example.com", time: "12:00 PM" };
      const result = safeTemplateReplace(template, data);
      expect(result).toBe("Hello test@example.com, the time is 12:00 PM");
    });

    it("should ignore non-whitelisted variables", () => {
      const template = "{{email}} - {{malicious}}";
      const data = { email: "test@example.com", malicious: "HACK" };
      const result = safeTemplateReplace(template, data);
      expect(result).toBe("test@example.com - {{malicious}}");
    });

    it("should handle whitespace in templates", () => {
      const template = "{{ email }} and {{ date }}";
      const data = { email: "test@example.com", date: "2024-01-01" };
      const result = safeTemplateReplace(template, data);
      expect(result).toBe("test@example.com and 2024-01-01");
    });
  });

  describe("serializeFileSize", () => {
    it("should convert BigInt fileSize to number", () => {
      const obj = { fileSize: BigInt(1024), name: "test" };
      const result = serializeFileSize(obj);
      expect(result.fileSize).toBe(1024);
      expect(typeof result.fileSize).toBe("number");
    });

    it("should handle arrays", () => {
      const arr = [
        { fileSize: BigInt(1024) },
        { fileSize: BigInt(2048) },
      ];
      const result = serializeFileSize(arr);
      expect(result[0].fileSize).toBe(1024);
      expect(result[1].fileSize).toBe(2048);
    });

    it("should handle nested objects", () => {
      const obj = {
        document: {
          fileSize: BigInt(1024),
          nested: {
            fileSize: BigInt(2048),
          },
        },
      };
      const result = serializeFileSize(obj);
      expect(result.document.fileSize).toBe(1024);
      expect(result.document.nested.fileSize).toBe(2048);
    });

    it("should preserve non-fileSize BigInt values", () => {
      const obj = {
        fileSize: BigInt(1024),
        otherBigInt: BigInt(9999),
      };
      const result = serializeFileSize(obj);
      expect(result.fileSize).toBe(1024);
      expect(result.otherBigInt).toBe(BigInt(9999));
    });
  });

  describe("getFirstAndLastDay", () => {
    it("should calculate billing period correctly", () => {
      const result = getFirstAndLastDay(1);
      expect(result.firstDay).toBeInstanceOf(Date);
      expect(result.lastDay).toBeInstanceOf(Date);
      expect(result.lastDay.getTime()).toBeGreaterThan(
        result.firstDay.getTime(),
      );
    });
  });

  describe("formatDate", () => {
    it("should format date string", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("January");
      expect(result).toContain("15");
    });
  });

  describe("nanoid", () => {
    it("should generate random 7-character string", () => {
      const id = nanoid();
      expect(id).toHaveLength(7);
      expect(/^[0-9A-Za-z]+$/.test(id)).toBe(true);
    });

    it("should generate unique IDs", () => {
      const id1 = nanoid();
      const id2 = nanoid();
      expect(id1).not.toBe(id2);
    });
  });
});
