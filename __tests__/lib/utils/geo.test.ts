import { describe, it, expect } from "vitest";
import { getGeoData, LOCALHOST_GEO_DATA, LOCALHOST_IP } from "@/lib/utils/geo";

describe("lib/utils/geo", () => {
  describe("LOCALHOST_GEO_DATA", () => {
    it("should provide default Munich geo data", () => {
      expect(LOCALHOST_GEO_DATA).toEqual({
        continent: "Europe",
        country: "DE",
        city: "Munich",
        region: "BY",
        latitude: "48.137154",
        longitude: "11.576124",
      });
    });

    it("should have all required fields", () => {
      expect(LOCALHOST_GEO_DATA).toHaveProperty("continent");
      expect(LOCALHOST_GEO_DATA).toHaveProperty("country");
      expect(LOCALHOST_GEO_DATA).toHaveProperty("city");
      expect(LOCALHOST_GEO_DATA).toHaveProperty("region");
      expect(LOCALHOST_GEO_DATA).toHaveProperty("latitude");
      expect(LOCALHOST_GEO_DATA).toHaveProperty("longitude");
    });

    it("should use valid German coordinates", () => {
      const lat = parseFloat(LOCALHOST_GEO_DATA.latitude);
      const lon = parseFloat(LOCALHOST_GEO_DATA.longitude);

      // Munich coordinates range
      expect(lat).toBeGreaterThan(48);
      expect(lat).toBeLessThan(49);
      expect(lon).toBeGreaterThan(11);
      expect(lon).toBeLessThan(12);
    });

    it("should specify Germany as country", () => {
      expect(LOCALHOST_GEO_DATA.country).toBe("DE");
      expect(LOCALHOST_GEO_DATA.region).toBe("BY"); // Bavaria
      expect(LOCALHOST_GEO_DATA.continent).toBe("Europe");
    });
  });

  describe("LOCALHOST_IP", () => {
    it("should be localhost IP address", () => {
      expect(LOCALHOST_IP).toBe("127.0.0.1");
    });

    it("should be valid IPv4 address", () => {
      expect(LOCALHOST_IP).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });
  });

  describe("getGeoData", () => {
    it("should extract geo data from Vercel headers", () => {
      const headers = {
        "x-vercel-ip-country": "GB",
        "x-vercel-ip-city": "London",
        "x-vercel-ip-region": "ENG",
        "x-vercel-ip-latitude": "51.5074",
        "x-vercel-ip-longitude": "-0.1278",
      };

      const geo = getGeoData(headers);

      expect(geo).toEqual({
        country: "GB",
        city: "London",
        region: "ENG",
        latitude: "51.5074",
        longitude: "-0.1278",
      });
    });

    it("should handle missing headers with undefined values", () => {
      const headers = {};

      const geo = getGeoData(headers);

      expect(geo).toEqual({
        country: undefined,
        city: undefined,
        region: undefined,
        latitude: undefined,
        longitude: undefined,
      });
    });

    it("should handle partial headers", () => {
      const headers = {
        "x-vercel-ip-country": "FR",
        "x-vercel-ip-city": "Paris",
      };

      const geo = getGeoData(headers);

      expect(geo).toMatchObject({
        country: "FR",
        city: "Paris",
        region: undefined,
        latitude: undefined,
        longitude: undefined,
      });
    });

    it("should preserve empty string values", () => {
      const headers = {
        "x-vercel-ip-country": "",
        "x-vercel-ip-city": "",
      };

      const geo = getGeoData(headers);

      expect(geo.country).toBe("");
      expect(geo.city).toBe("");
    });

    it("should preserve all provided values", () => {
      const headers = {
        "x-vercel-ip-country": "JP",
        "x-vercel-ip-city": "Tokyo",
        "x-vercel-ip-region": "13",
        "x-vercel-ip-latitude": "35.6762",
        "x-vercel-ip-longitude": "139.6503",
      };

      const geo = getGeoData(headers);

      expect(geo.country).toBe("JP");
      expect(geo.city).toBe("Tokyo");
      expect(geo.region).toBe("13");
      expect(geo.latitude).toBe("35.6762");
      expect(geo.longitude).toBe("139.6503");
    });

    it("should handle headers with Record<string, string> type", () => {
      const headers: Record<string, string> = {
        "x-vercel-ip-country": "DE",
        "x-vercel-ip-city": "Berlin",
      };

      const geo = getGeoData(headers);

      expect(geo.country).toBe("DE");
      expect(geo.city).toBe("Berlin");
    });

    it("should handle array headers by taking first value", () => {
      const headers = {
        "x-vercel-ip-country": ["CA", "US"] as any,
        "x-vercel-ip-city": ["Toronto", "New York"] as any,
        "x-vercel-ip-region": ["ON", "NY"] as any,
      };

      const geo = getGeoData(headers);

      expect(geo.country).toBe("CA");
      expect(geo.city).toBe("Toronto");
      expect(geo.region).toBe("ON");
    });

    it("should return correct type structure", () => {
      const headers = {
        "x-vercel-ip-country": "AU",
      };

      const geo = getGeoData(headers);

      expect(geo).toHaveProperty("country");
      expect(geo).toHaveProperty("city");
      expect(geo).toHaveProperty("region");
      expect(geo).toHaveProperty("latitude");
      expect(geo).toHaveProperty("longitude");
    });

    it("should handle headers from different regions", () => {
      const regions = [
        {
          headers: {
            "x-vercel-ip-country": "BR",
            "x-vercel-ip-city": "São Paulo",
            "x-vercel-ip-region": "SP",
            "x-vercel-ip-latitude": "-23.5505",
            "x-vercel-ip-longitude": "-46.6333",
          },
          expected: "BR",
        },
        {
          headers: {
            "x-vercel-ip-country": "IN",
            "x-vercel-ip-city": "Mumbai",
            "x-vercel-ip-region": "MH",
            "x-vercel-ip-latitude": "19.0760",
            "x-vercel-ip-longitude": "72.8777",
          },
          expected: "IN",
        },
      ];

      regions.forEach(({ headers, expected }) => {
        const geo = getGeoData(headers);
        expect(geo.country).toBe(expected);
      });
    });

    it("should handle coordinates in different formats", () => {
      const headers = {
        "x-vercel-ip-latitude": "37.7749",
        "x-vercel-ip-longitude": "-122.4194",
      };

      const geo = getGeoData(headers);

      expect(geo.latitude).toBe("37.7749");
      expect(geo.longitude).toBe("-122.4194");
      expect(typeof geo.latitude).toBe("string");
      expect(typeof geo.longitude).toBe("string");
    });

    it("should handle undefined header values", () => {
      const headers = {
        "x-vercel-ip-country": undefined,
        "x-vercel-ip-city": "TestCity",
      };

      const geo = getGeoData(headers);

      expect(geo.country).toBeUndefined();
      expect(geo.city).toBe("TestCity");
    });
  });
});
