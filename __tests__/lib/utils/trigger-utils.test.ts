import { describe, it, expect } from "vitest";
import { conversionQueue } from "@/lib/utils/trigger-utils";

describe("lib/utils/trigger-utils", () => {
  describe("conversionQueue", () => {
    it("should return config for free plan", () => {
      const config = conversionQueue("free");

      expect(config).toEqual({
        name: "conversion-free",
        concurrencyLimit: 1,
      });
    });

    it("should return config for starter plan", () => {
      const config = conversionQueue("starter");

      expect(config).toEqual({
        name: "conversion-starter",
        concurrencyLimit: 1,
      });
    });

    it("should return config for pro plan", () => {
      const config = conversionQueue("pro");

      expect(config).toEqual({
        name: "conversion-pro",
        concurrencyLimit: 2,
      });
    });

    it("should return config for business plan", () => {
      const config = conversionQueue("business");

      expect(config).toEqual({
        name: "conversion-business",
        concurrencyLimit: 10,
      });
    });

    it("should return config for datarooms plan", () => {
      const config = conversionQueue("datarooms");

      expect(config).toEqual({
        name: "conversion-datarooms",
        concurrencyLimit: 10,
      });
    });

    it("should return config for datarooms-plus plan", () => {
      const config = conversionQueue("datarooms-plus");

      expect(config).toEqual({
        name: "conversion-datarooms-plus",
        concurrencyLimit: 10,
      });
    });

    it("should handle plan with + suffix", () => {
      const config = conversionQueue("pro+addon");

      // The function splits on '+' and takes the first part
      expect(config).toEqual({
        name: "conversion-pro",
        concurrencyLimit: 2,
      });
    });

    it("should handle plan with multiple + signs", () => {
      const config = conversionQueue("business+addon1+addon2");

      expect(config).toEqual({
        name: "conversion-business",
        concurrencyLimit: 10,
      });
    });

    it("should set concurrency to 1 for free plan", () => {
      const config = conversionQueue("free");

      expect(config.concurrencyLimit).toBe(1);
    });

    it("should set concurrency to 2 for pro plan", () => {
      const config = conversionQueue("pro");

      expect(config.concurrencyLimit).toBe(2);
    });

    it("should set concurrency to 10 for business plan", () => {
      const config = conversionQueue("business");

      expect(config.concurrencyLimit).toBe(10);
    });

    it("should set concurrency to 10 for datarooms plan", () => {
      const config = conversionQueue("datarooms");

      expect(config.concurrencyLimit).toBe(10);
    });

    it("should generate correct queue name", () => {
      const config = conversionQueue("starter");

      expect(config.name).toBe("conversion-starter");
    });

    it("should handle uppercase plan name (if passed)", () => {
      // The function doesn't normalize case, but test behavior
      const config = conversionQueue("FREE");

      expect(config.name).toBe("conversion-FREE");
      expect(config.concurrencyLimit).toBeUndefined();
    });

    it("should return queue config with name property", () => {
      const config = conversionQueue("pro");

      expect(config).toHaveProperty("name");
      expect(typeof config.name).toBe("string");
    });

    it("should return queue config with concurrencyLimit property", () => {
      const config = conversionQueue("pro");

      expect(config).toHaveProperty("concurrencyLimit");
      expect(typeof config.concurrencyLimit).toBe("number");
    });

    it("should handle empty string plan", () => {
      const config = conversionQueue("");

      expect(config.name).toBe("conversion-");
      expect(config.concurrencyLimit).toBeUndefined();
    });

    it("should handle unknown plan", () => {
      const config = conversionQueue("unknown-plan");

      expect(config.name).toBe("conversion-unknown-plan");
      expect(config.concurrencyLimit).toBeUndefined();
    });

    it("should maintain consistent naming pattern", () => {
      const plans = ["free", "starter", "pro", "business", "datarooms"];
      const configs = plans.map(conversionQueue);

      configs.forEach((config, index) => {
        expect(config.name).toBe(`conversion-${plans[index]}`);
      });
    });

    it("should have higher concurrency for premium plans", () => {
      const freeConfig = conversionQueue("free");
      const businessConfig = conversionQueue("business");

      expect(businessConfig.concurrencyLimit).toBeGreaterThan(
        freeConfig.concurrencyLimit,
      );
    });

    it("should have same concurrency for all enterprise plans", () => {
      const businessConfig = conversionQueue("business");
      const dataroomsConfig = conversionQueue("datarooms");
      const dataroomsPlusConfig = conversionQueue("datarooms-plus");

      expect(businessConfig.concurrencyLimit).toBe(10);
      expect(dataroomsConfig.concurrencyLimit).toBe(10);
      expect(dataroomsPlusConfig.concurrencyLimit).toBe(10);
    });
  });
});
