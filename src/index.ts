import { type CacheRecord, type CacheStore } from "@lucid-softworks/cache-core";

export type CacheMetricsSnapshot = Readonly<{
  gets: number;
  hits: number;
  misses: number;
  sets: number;
  deleteHits: number;
  deleteMisses: number;
  errors: number;
}>;

export class CacheMetrics {
  gets = 0;
  hits = 0;
  misses = 0;
  sets = 0;
  deleteHits = 0;
  deleteMisses = 0;
  errors = 0;

  snapshot(): CacheMetricsSnapshot {
    return {
      deleteHits: this.deleteHits,
      deleteMisses: this.deleteMisses,
      errors: this.errors,
      gets: this.gets,
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
    };
  }

  reset(): void {
    this.gets = 0;
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deleteHits = 0;
    this.deleteMisses = 0;
    this.errors = 0;
  }
}

export class MeasuredCacheStore<T = unknown> implements CacheStore<T> {
  constructor(
    readonly store: CacheStore<T>,
    readonly metrics: CacheMetrics = new CacheMetrics(),
  ) {}

  async get(key: string): Promise<CacheRecord<T> | undefined> {
    return this.#attempt(async () => {
      const record = await this.store.get(key);
      this.metrics.gets += 1;
      if (record === undefined) this.metrics.misses += 1;
      else this.metrics.hits += 1;
      return record;
    });
  }

  async set(key: string, record: CacheRecord<T>): Promise<void> {
    await this.#attempt(() => this.store.set(key, record));
    this.metrics.sets += 1;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.#attempt(() => this.store.delete(key));
    if (deleted) this.metrics.deleteHits += 1;
    else this.metrics.deleteMisses += 1;
    return deleted;
  }

  async #attempt<TResult>(
    operation: () => TResult | PromiseLike<TResult>,
  ): Promise<TResult> {
    try {
      return await operation();
    } catch (error) {
      this.metrics.errors += 1;
      throw error;
    }
  }
}
