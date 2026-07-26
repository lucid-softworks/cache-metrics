import { createCacheRecord } from "@lucid-softworks/cache-core";
import { MemoryCacheStore } from "@lucid-softworks/cache-store-memory";
import { describe, expect, it } from "vitest";

import { CacheMetrics, MeasuredCacheStore } from "../src/index.js";

describe("cache metrics", () => {
  it("counts hits, misses, writes, and deletion outcomes", async () => {
    const cache = new MeasuredCacheStore(
      new MemoryCacheStore({ now: () => 0 }),
    );
    const record = createCacheRecord("value", { now: 0, ttl: 10 });
    await expect(cache.get("missing")).resolves.toBeUndefined();
    await cache.set("key", record);
    await expect(cache.get("key")).resolves.toBe(record);
    await expect(cache.delete("key")).resolves.toBe(true);
    await expect(cache.delete("key")).resolves.toBe(false);
    expect(cache.metrics.snapshot()).toEqual({
      deleteHits: 1,
      deleteMisses: 1,
      errors: 0,
      gets: 2,
      hits: 1,
      misses: 1,
      sets: 1,
    });
    cache.metrics.reset();
    expect(Object.values(cache.metrics.snapshot())).toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("counts and rethrows backing store errors", async () => {
    const error = new Error("failed");
    const cache = new MeasuredCacheStore({
      delete: () => false,
      get: () => {
        throw error;
      },
      set: () => undefined,
    });
    await expect(cache.get("key")).rejects.toBe(error);
    expect(cache.metrics.errors).toBe(1);
  });

  it("accepts an external metrics accumulator", () => {
    const metrics = new CacheMetrics();
    const cache = new MeasuredCacheStore(
      new MemoryCacheStore({ now: () => 0 }),
      metrics,
    );
    expect(cache.metrics).toBe(metrics);
  });
});
