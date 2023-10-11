import { resolve } from "path";
import { ApiAdapter } from "../../modules/ApiAdapter";
import { RateLimitFollower } from "../../modules/RateLimitFollower";

const rateLimitFollower = new RateLimitFollower({
  maxLimit: 180,
  PerTime: 60000,
});

const wait = async (ms: number) => {
  await new Promise((r) => setTimeout(r, ms));
};

describe("RateLimitFollower module", () => {
  test("Good Rate Check", async () => {
    expect(rateLimitFollower.GoodRate()).toBe(true);
    expect(rateLimitFollower.checkforAllow()).toBeLessThanOrEqual(0);
    await wait(2000);
    expect(rateLimitFollower.addToFollow(1)).toBe(true);
    expect(rateLimitFollower.checkforAllow()).toBeLessThanOrEqual(0);
  });

  test("Good Rate Check 2", async () => {
    expect(rateLimitFollower.checkforAllow(10)).toBeLessThanOrEqual(0);
    expect(rateLimitFollower.addToFollow(10)).toBe(true);
    expect(rateLimitFollower.GoodRate()).toBe(false);
    expect(rateLimitFollower.checkforAllow()).toBeLessThanOrEqual(0);
    await wait(2000);
    expect(rateLimitFollower.GoodRate()).toBe(true);
  });

  test("Good Rate Check 3", async () => {
    expect(rateLimitFollower.addToFollow(180)).toBe(false);
    expect(rateLimitFollower.addToFollow(169)).toBe(true);
    expect(rateLimitFollower.checkforAllow()).toBeGreaterThan(0);
    expect(rateLimitFollower.addToFollow(1)).toBe(false);
  });
});
