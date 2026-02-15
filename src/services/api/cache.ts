export interface TimedCacheOptions {
  ttlMs: number;
  cleanupIntervalMs?: number;
  maxSize?: number;
}

export interface CacheLoadOptions {
  forceRefresh?: boolean;
  ttlMs?: number;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export class TimedCache<K, V> {
  private readonly entries = new Map<K, CacheEntry<V>>();
  private readonly pendingLoads = new Map<K, Promise<V>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(options: TimedCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxSize = options.maxSize ?? Number.POSITIVE_INFINITY;

    if (options.cleanupIntervalMs && options.cleanupIntervalMs > 0) {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), options.cleanupIntervalMs);
    }
  }

  has(key: K): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  get(key: K): V | undefined {
    if (!this.has(key)) {
      return undefined;
    }

    return this.entries.get(key)?.value;
  }

  set(key: K, value: V, ttlMs = this.ttlMs): V {
    const expiresAt = Date.now() + Math.max(0, ttlMs);

    if (this.entries.has(key)) {
      this.entries.delete(key);
    }

    this.entries.set(key, {
      value,
      expiresAt,
    });

    this.pruneIfNeeded();
    return value;
  }

  delete(key: K): void {
    this.entries.delete(key);
    this.pendingLoads.delete(key);
  }

  clear(): void {
    this.entries.clear();
    this.pendingLoads.clear();
  }

  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries.entries()) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  async getOrLoad(key: K, loader: () => Promise<V>, options: CacheLoadOptions = {}): Promise<V> {
    if (!options.forceRefresh) {
      const cachedValue = this.get(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const pending = this.pendingLoads.get(key);
      if (pending) {
        return pending;
      }
    }

    const request = loader().then((value) => {
      this.set(key, value, options.ttlMs ?? this.ttlMs);
      return value;
    });

    this.pendingLoads.set(key, request);

    request.finally(() => {
      if (this.pendingLoads.get(key) === request) {
        this.pendingLoads.delete(key);
      }
    });

    return request;
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }

  private pruneIfNeeded(): void {
    if (this.entries.size <= this.maxSize) {
      return;
    }

    while (this.entries.size > this.maxSize) {
      const oldestKey = this.entries.keys().next().value as K | undefined;
      if (oldestKey === undefined) {
        break;
      }
      this.entries.delete(oldestKey);
    }
  }
}
