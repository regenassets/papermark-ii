import { describe, it, expect } from "vitest";
import { getIpAddress } from "@/lib/utils/ip";

describe("lib/utils/ip", () => {
  describe("getIpAddress", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const headers = {
        "x-forwarded-for": "192.168.1.1",
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should extract first IP from x-forwarded-for with multiple IPs", () => {
      const headers = {
        "x-forwarded-for": "192.168.1.1, 10.0.0.1, 172.16.0.1",
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should trim whitespace from x-forwarded-for", () => {
      const headers = {
        "x-forwarded-for": "  192.168.1.1  ",
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should handle x-forwarded-for as array", () => {
      const headers = {
        "x-forwarded-for": ["192.168.1.1"],
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should handle x-forwarded-for array with multiple IPs", () => {
      const headers = {
        "x-forwarded-for": ["192.168.1.1, 10.0.0.1"],
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const headers = {
        "x-real-ip": "192.168.1.1",
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should prefer x-forwarded-for over x-real-ip", () => {
      const headers = {
        "x-forwarded-for": "192.168.1.1",
        "x-real-ip": "10.0.0.1",
      };
      expect(getIpAddress(headers)).toBe("192.168.1.1");
    });

    it("should fallback to x-real-ip when x-forwarded-for is missing", () => {
      const headers = {
        "x-real-ip": "10.0.0.1",
      };
      expect(getIpAddress(headers)).toBe("10.0.0.1");
    });

    it("should trim whitespace from x-real-ip", () => {
      const headers = {
        "x-real-ip": "  10.0.0.1  ",
      };
      expect(getIpAddress(headers)).toBe("10.0.0.1");
    });

    it("should handle x-real-ip as array", () => {
      const headers = {
        "x-real-ip": ["10.0.0.1"],
      };
      expect(getIpAddress(headers)).toBe("10.0.0.1");
    });

    it("should return localhost when no headers present", () => {
      const headers = {};
      expect(getIpAddress(headers)).toBe("127.0.0.1");
    });

    it("should return localhost when headers are empty strings", () => {
      const headers = {
        "x-forwarded-for": "",
        "x-real-ip": "",
      };
      expect(getIpAddress(headers)).toBe("127.0.0.1");
    });

    it("should return localhost when headers are empty arrays", () => {
      const headers = {
        "x-forwarded-for": [],
        "x-real-ip": [],
      };
      expect(getIpAddress(headers)).toBe("127.0.0.1");
    });

    it("should handle IPv6 addresses", () => {
      const headers = {
        "x-forwarded-for": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
      };
      expect(getIpAddress(headers)).toBe(
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
      );
    });

    it("should handle compressed IPv6 addresses", () => {
      const headers = {
        "x-forwarded-for": "2001:db8::1",
      };
      expect(getIpAddress(headers)).toBe("2001:db8::1");
    });

    it("should handle private IP ranges", () => {
      const privateIps = [
        "10.0.0.1",
        "172.16.0.1",
        "192.168.1.1",
        "192.168.0.1",
      ];

      privateIps.forEach((ip) => {
        const headers = { "x-forwarded-for": ip };
        expect(getIpAddress(headers)).toBe(ip);
      });
    });

    it("should handle public IP addresses", () => {
      const headers = {
        "x-forwarded-for": "8.8.8.8",
      };
      expect(getIpAddress(headers)).toBe("8.8.8.8");
    });

    it("should handle proxy chain correctly", () => {
      const headers = {
        "x-forwarded-for":
          "203.0.113.1, 198.51.100.1, 192.168.1.1, 10.0.0.1",
      };
      // Should return the first (client) IP
      expect(getIpAddress(headers)).toBe("203.0.113.1");
    });

    it("should handle undefined header values", () => {
      const headers = {
        "x-forwarded-for": undefined,
        "x-real-ip": undefined,
      };
      expect(getIpAddress(headers)).toBe("127.0.0.1");
    });

    it("should handle headers with only whitespace", () => {
      const headers = {
        "x-forwarded-for": "   ",
      };
      expect(getIpAddress(headers)).toBe("127.0.0.1");
    });
  });
});
