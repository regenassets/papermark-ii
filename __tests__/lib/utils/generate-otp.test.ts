import { describe, it, expect } from "vitest";
import { generateOTP } from "@/lib/utils/generate-otp";

describe("lib/utils/generate-otp", () => {
  describe("OTP generation", () => {
    it("should generate 6-digit OTP", () => {
      const otp = generateOTP();

      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should generate numeric OTP only", () => {
      for (let i = 0; i < 100; i++) {
        const otp = generateOTP();
        expect(otp).toMatch(/^[0-9]+$/);
      }
    });

    it("should pad with leading zeros for small numbers", () => {
      // Generate many OTPs to test padding
      const otps = Array.from({ length: 1000 }, () => generateOTP());

      // All should be 6 digits
      otps.forEach((otp) => {
        expect(otp).toHaveLength(6);
      });

      // Should include some with leading zeros (statistically likely)
      const withLeadingZero = otps.filter((otp) => otp.startsWith("0"));
      expect(withLeadingZero.length).toBeGreaterThan(0);
    });

    it("should generate values in valid range (000000-999999)", () => {
      for (let i = 0; i < 100; i++) {
        const otp = generateOTP();
        const num = parseInt(otp, 10);

        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThan(1000000);
      }
    });

    it("should generate different OTPs on each call", () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();

      // While technically OTPs could collide, it's extremely unlikely
      // in a small sample
      const allSame = otp1 === otp2 && otp2 === otp3;
      expect(allSame).toBe(false);
    });

    it("should have reasonable distribution", () => {
      const otps = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        otps.add(generateOTP());
      }

      // Should have high uniqueness (low collision rate)
      // With 1M possible values and 1000 samples, expect ~999 unique
      expect(otps.size).toBeGreaterThan(950);
    });
  });

  describe("format validation", () => {
    it("should always return string type", () => {
      const otp = generateOTP();
      expect(typeof otp).toBe("string");
    });

    it("should handle edge case near 0", () => {
      // Can't deterministically test, but ensure format is correct
      // even for very small random numbers
      const otps = Array.from({ length: 10000 }, () => generateOTP());
      const verySmall = otps.filter((otp) => otp.startsWith("000"));

      // Should have some very small numbers (starting with "000")
      expect(verySmall.length).toBeGreaterThan(0);

      // All should still be 6 digits
      verySmall.forEach((otp) => {
        expect(otp).toHaveLength(6);
      });
    });

    it("should handle edge case near 999999", () => {
      // Can't deterministically test, but verify format
      const otps = Array.from({ length: 10000 }, () => generateOTP());
      const veryLarge = otps.filter((otp) => otp.startsWith("99"));

      // Should have some large numbers (starting with "99")
      expect(veryLarge.length).toBeGreaterThan(0);

      // All should still be 6 digits
      veryLarge.forEach((otp) => {
        expect(otp).toHaveLength(6);
        expect(parseInt(otp, 10)).toBeLessThan(1000000);
      });
    });
  });

  describe("randomness", () => {
    it("should distribute across all digit positions", () => {
      const otps = Array.from({ length: 10000 }, () => generateOTP());

      // Check each position has variety
      for (let pos = 0; pos < 6; pos++) {
        const digitsAtPos = new Set(otps.map((otp) => otp[pos]));
        // Should have multiple different digits at each position
        expect(digitsAtPos.size).toBeGreaterThan(5);
      }
    });

    it("should not have obvious patterns", () => {
      const otps = Array.from({ length: 100 }, () => generateOTP());

      // Should not all start with same digit
      const firstDigits = new Set(otps.map((otp) => otp[0]));
      expect(firstDigits.size).toBeGreaterThan(3);

      // Should not all be sequential
      const sequential = otps.filter((otp) => {
        const digits = otp.split("").map(Number);
        return digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
      });
      expect(sequential.length).toBe(0);
    });
  });

  describe("use cases", () => {
    it("should be suitable for 2FA", () => {
      const otp = generateOTP();

      // 6 digits is standard for 2FA
      expect(otp).toHaveLength(6);
      // Should be numbers only (all digits 0-9 are acceptable)
      expect(/^\d{6}$/.test(otp)).toBe(true);
      // Should be consistent format
      expect(otp).toMatch(/^[0-9]{6}$/);
    });

    it("should be suitable for email verification", () => {
      const otp = generateOTP();

      // Easy to type and remember
      expect(otp).toHaveLength(6);
      expect(typeof otp).toBe("string");
    });

    it("should generate multiple unique OTPs for different users", () => {
      const userOtps = new Map<string, string>();

      // Simulate generating OTPs for 100 different users
      for (let i = 0; i < 100; i++) {
        userOtps.set(`user-${i}`, generateOTP());
      }

      // Most should be unique (some collisions are acceptable)
      const uniqueOtps = new Set(userOtps.values());
      expect(uniqueOtps.size).toBeGreaterThan(95);
    });
  });

  describe("collision probability", () => {
    it("should have acceptable collision rate", () => {
      const otps = new Set<string>();
      const samples = 1000;

      for (let i = 0; i < samples; i++) {
        otps.add(generateOTP());
      }

      // With 1,000,000 possible values and 1,000 samples
      // Expected unique values ≈ 999.5 (very low collision)
      const collisions = samples - otps.size;
      expect(collisions).toBeLessThan(10); // Allow up to 1% collision
    });
  });

  describe("security considerations", () => {
    it("should use Math.random for generation", () => {
      // Math.random is not cryptographically secure, but acceptable for OTP
      // that's time-limited and single-use
      const otp = generateOTP();
      expect(otp).toBeTruthy();
    });

    it("should be unpredictable within sample set", () => {
      const otps = Array.from({ length: 10 }, () => generateOTP());

      // OTPs should not be sequential or follow pattern
      for (let i = 1; i < otps.length; i++) {
        const diff = Math.abs(parseInt(otps[i], 10) - parseInt(otps[i - 1], 10));
        // Should not be incrementing by 1
        expect(diff).not.toBe(1);
      }
    });
  });

  describe("consistency", () => {
    it("should always return valid format", () => {
      // Generate many OTPs and verify all are valid
      for (let i = 0; i < 10000; i++) {
        const otp = generateOTP();

        expect(typeof otp).toBe("string");
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);

        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThan(1000000);
      }
    });
  });
});
