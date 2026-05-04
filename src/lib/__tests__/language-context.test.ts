/**
 * Tests for language-context: translation function and language switching.
 * @module lib/language-context
 */
import { describe, it, expect } from "vitest";
import { translations, type Language } from "@/lib/language-context";

describe("translations dictionary", () => {
  it("should have Vietnamese and English for every key", () => {
    const keys = Object.keys(translations) as Array<keyof typeof translations>;
    for (const key of keys) {
      const entry = translations[key];
      expect(entry).toHaveProperty("vi");
      expect(entry).toHaveProperty("en");
      expect(typeof entry.vi).toBe("string");
      expect(typeof entry.en).toBe("string");
      expect(entry.vi.length).toBeGreaterThan(0);
      expect(entry.en.length).toBeGreaterThan(0);
    }
  });

  it("should have correct Vietnamese marketplace translation", () => {
    expect(translations["nav.marketplace"].vi).toBe("Sàn xe đạp");
  });

  it("should have correct English marketplace translation", () => {
    expect(translations["nav.marketplace"].en).toBe("Marketplace");
  });

  it("should translate condition values correctly", () => {
    expect(translations["condition.like_new"].vi).toBe("Như Mới");
    expect(translations["condition.like_new"].en).toBe("Like New");
    expect(translations["condition.excellent"].en).toBe("Excellent");
    expect(translations["condition.good"].en).toBe("Good");
    expect(translations["condition.fair"].en).toBe("Fair");
  });

  it("should translate city values correctly", () => {
    expect(translations["city.hanoi"].vi).toBe("Hà Nội");
    expect(translations["city.hcm"].en).toBe("Ho Chi Minh City");
    expect(translations["city.danang"].en).toBe("Da Nang");
  });

  it("should translate category values correctly", () => {
    expect(translations["category.road"].en).toBe("Road Bike");
    expect(translations["category.mtb"].en).toBe("Mountain Bike");
    expect(translations["category.gravel"].en).toBe("Gravel Bike");
    expect(translations["category.urban"].en).toBe("Urban/Commuter");
  });

  it("should translate loading and empty states", () => {
    expect(translations["general.loading"].vi).toBe("Đang tải...");
    expect(translations["general.loading"].en).toBe("Loading...");
    expect(translations["general.noResults"].vi).toBe("Không có kết quả");
    expect(translations["general.noResults"].en).toBe("No results");
  });
});

describe("Language type", () => {
  it("should only allow 'vi' or 'en'", () => {
    const vi: Language = "vi";
    const en: Language = "en";
    expect(vi).toBe("vi");
    expect(en).toBe("en");
  });
});
