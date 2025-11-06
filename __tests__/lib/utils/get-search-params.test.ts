import { describe, it, expect } from "vitest";
import { getSearchParams } from "@/lib/utils/get-search-params";

describe("lib/utils/get-search-params", () => {
  describe("getSearchParams", () => {
    it("should extract single parameter", () => {
      const url = "https://example.com?foo=bar";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar" });
    });

    it("should extract multiple parameters", () => {
      const url = "https://example.com?foo=bar&baz=qux";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar", baz: "qux" });
    });

    it("should return empty object for URL without params", () => {
      const url = "https://example.com";
      const params = getSearchParams(url);

      expect(params).toEqual({});
    });

    it("should handle URL with path", () => {
      const url = "https://example.com/path/to/page?foo=bar";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar" });
    });

    it("should handle URL with hash", () => {
      const url = "https://example.com?foo=bar#section";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar" });
    });

    it("should decode URL-encoded values", () => {
      const url = "https://example.com?message=hello%20world";
      const params = getSearchParams(url);

      expect(params).toEqual({ message: "hello world" });
    });

    it("should handle special characters", () => {
      const url = "https://example.com?email=test%40example.com";
      const params = getSearchParams(url);

      expect(params).toEqual({ email: "test@example.com" });
    });

    it("should handle multiple values for same key (last wins)", () => {
      const url = "https://example.com?foo=bar&foo=baz";
      const params = getSearchParams(url);

      // URLSearchParams.forEach() overwrites duplicate keys
      expect(params.foo).toBe("baz");
    });

    it("should handle empty parameter values", () => {
      const url = "https://example.com?foo=&bar=value";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "", bar: "value" });
    });

    it("should handle parameters without values", () => {
      const url = "https://example.com?foo&bar=value";
      const params = getSearchParams(url);

      expect(params.foo).toBe("");
      expect(params.bar).toBe("value");
    });

    it("should handle complex query string", () => {
      const url = "https://example.com?a=1&b=2&c=3&d=4";
      const params = getSearchParams(url);

      expect(params).toEqual({ a: "1", b: "2", c: "3", d: "4" });
    });

    it("should handle parameters with numbers", () => {
      const url = "https://example.com?page=1&limit=10";
      const params = getSearchParams(url);

      expect(params).toEqual({ page: "1", limit: "10" });
    });

    it("should handle parameters with special characters in key", () => {
      const url = "https://example.com?utm_source=google&utm_medium=cpc";
      const params = getSearchParams(url);

      expect(params).toEqual({ utm_source: "google", utm_medium: "cpc" });
    });

    it("should handle parameters with plus signs", () => {
      const url = "https://example.com?query=hello+world";
      const params = getSearchParams(url);

      // URL constructor handles + as space
      expect(params.query).toBe("hello world");
    });

    it("should handle parameters with equals in value", () => {
      const url = "https://example.com?equation=a%3Db%2Bc";
      const params = getSearchParams(url);

      expect(params.equation).toBe("a=b+c");
    });

    it("should handle localhost URLs", () => {
      const url = "http://localhost:3000?foo=bar";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar" });
    });

    it("should handle URLs with port numbers", () => {
      const url = "https://example.com:8080?foo=bar";
      const params = getSearchParams(url);

      expect(params).toEqual({ foo: "bar" });
    });

    it("should handle long parameter values", () => {
      const longValue = "a".repeat(1000);
      const url = `https://example.com?data=${longValue}`;
      const params = getSearchParams(url);

      expect(params.data).toBe(longValue);
    });

    it("should handle unicode characters in parameters", () => {
      const url = "https://example.com?name=%E4%B8%96%E7%95%8C"; // 世界
      const params = getSearchParams(url);

      expect(params.name).toBe("世界");
    });

    it("should handle parameters with arrays (bracket notation)", () => {
      const url = "https://example.com?ids[]=1&ids[]=2";
      const params = getSearchParams(url);

      // Only the last value is kept with this implementation
      expect(params["ids[]"]).toBe("2");
    });
  });
});
