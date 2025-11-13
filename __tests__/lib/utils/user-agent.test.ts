import { describe, it, expect } from "vitest";
import { isBot, userAgentFromString } from "@/lib/utils/user-agent";

describe("lib/utils/user-agent", () => {
  describe("isBot", () => {
    it("should detect Googlebot", () => {
      expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    });

    it("should detect Bingbot", () => {
      expect(isBot("Mozilla/5.0 (compatible; Bingbot/2.0)")).toBe(true);
    });

    it("should detect ChatGPT", () => {
      expect(isBot("Mozilla/5.0 AppleWebKit ChatGPT-User")).toBe(true);
    });

    it("should detect facebookexternalhit", () => {
      expect(isBot("facebookexternalhit/1.1")).toBe(true);
    });

    it("should detect Twitterbot", () => {
      expect(isBot("Twitterbot/1.0")).toBe(true);
    });

    it("should detect Slackbot", () => {
      expect(isBot("Slackbot-LinkExpanding 1.0")).toBe(true);
    });

    it("should detect WhatsApp", () => {
      expect(isBot("WhatsApp/2.0")).toBe(true);
    });

    it("should detect LinkedIn bot", () => {
      expect(isBot("LinkedInBot/1.0")).toBe(true);
    });

    it("should detect various bots case-insensitively", () => {
      expect(isBot("BOT")).toBe(true);
      expect(isBot("Bot")).toBe(true);
      expect(isBot("bot")).toBe(true);
    });

    it("should not detect regular Chrome browser", () => {
      expect(
        isBot(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ),
      ).toBe(false);
    });

    it("should not detect regular Firefox browser", () => {
      expect(
        isBot(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        ),
      ).toBe(false);
    });

    it("should not detect Safari browser", () => {
      expect(
        isBot(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        ),
      ).toBe(false);
    });

    it("should not detect mobile Chrome", () => {
      expect(
        isBot(
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        ),
      ).toBe(false);
    });

    it("should not detect regular user string", () => {
      expect(isBot("regular user agent")).toBe(false);
    });

    it("should handle empty string", () => {
      expect(isBot("")).toBe(false);
    });

    it("should detect DuckDuckBot", () => {
      expect(isBot("DuckDuckBot/1.0")).toBe(true);
    });

    it("should detect Discordbot", () => {
      expect(isBot("Mozilla/5.0 (compatible; Discordbot/2.0)")).toBe(true);
    });

    it("should detect multiple bot keywords", () => {
      expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +bot)")).toBe(true);
    });
  });

  describe("userAgentFromString", () => {
    it("should parse Chrome user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.browser.name).toBe("Chrome");
      expect(ua.browser.version).toContain("120");
      expect(ua.os.name).toBe("Windows");
      expect(ua.os.version).toBe("10");
    });

    it("should parse Firefox user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.browser.name).toBe("Firefox");
      expect(ua.os.name).toBe("Windows");
    });

    it("should parse Safari user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.browser.name).toBe("Safari");
      expect(ua.os.name).toBe("Mac OS");
    });

    it("should detect bot in user agent", () => {
      const ua = userAgentFromString("Mozilla/5.0 (compatible; Googlebot/2.1)");

      expect(ua.isBot).toBe(true);
    });

    it("should handle undefined input", () => {
      const ua = userAgentFromString(undefined);

      expect(ua.isBot).toBe(false);
      expect(ua).toHaveProperty("browser");
      expect(ua).toHaveProperty("device");
      expect(ua).toHaveProperty("engine");
      expect(ua).toHaveProperty("os");
      expect(ua).toHaveProperty("cpu");
    });

    it("should parse mobile user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.device.type).toBe("mobile");
      expect(ua.os.name).toBe("iOS");
    });

    it("should parse Android user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.os.name).toBe("Android");
      expect(ua.device.type).toBe("mobile");
    });

    it("should include ua string", () => {
      const testUa = "Mozilla/5.0 Test";
      const ua = userAgentFromString(testUa);

      expect(ua.ua).toBe(testUa);
    });

    it("should include engine information", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      expect(ua.engine.name).toBeDefined();
      expect(ua.engine.name).toBe("Blink");
    });

    it("should include CPU architecture", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      );

      expect(ua.cpu).toBeDefined();
      expect(ua.cpu.architecture).toBeDefined();
    });

    it("should handle empty string input", () => {
      const ua = userAgentFromString("");

      expect(ua.isBot).toBe(false);
      expect(ua).toHaveProperty("browser");
    });

    it("should parse tablet user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.device.type).toBe("tablet");
    });

    it("should have correct structure", () => {
      const ua = userAgentFromString("Mozilla/5.0");

      expect(ua).toHaveProperty("isBot");
      expect(ua).toHaveProperty("ua");
      expect(ua).toHaveProperty("browser");
      expect(ua).toHaveProperty("device");
      expect(ua).toHaveProperty("engine");
      expect(ua).toHaveProperty("os");
      expect(ua).toHaveProperty("cpu");
    });

    it("should parse Edge user agent", () => {
      const ua = userAgentFromString(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      );

      expect(ua.isBot).toBe(false);
      expect(ua.browser.name).toBe("Edge");
    });
  });
});
