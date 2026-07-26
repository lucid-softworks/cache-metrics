# `@lucid-softworks/cache-metrics`

A `CacheStore` decorator that records gets, hits, misses, writes, deletion
outcomes, and backing-store errors.

```ts
import { MeasuredCacheStore } from "@lucid-softworks/cache-metrics";
import { MemoryCacheStore } from "@lucid-softworks/cache-store-memory";

const store = new MemoryCacheStore();
const measured = new MeasuredCacheStore(store);
await measured.get("user-42");
console.log(measured.metrics.snapshot());
```

Metrics can be reset or supplied as a shared accumulator.
