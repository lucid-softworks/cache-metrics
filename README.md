# `@lucid-softworks/cache-metrics`

A `CacheStore` decorator that records gets, hits, misses, writes, deletion
outcomes, and backing-store errors.

```ts
const measured = new MeasuredCacheStore(store);
await measured.get(key);
console.log(measured.metrics.snapshot());
```

Metrics can be reset or supplied as a shared accumulator.
