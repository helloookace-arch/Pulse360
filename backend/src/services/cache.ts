class RedisCacheMock {
  private cache: Map<string, { value: string; expiry: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    const expiry = expirySeconds ? Date.now() + expirySeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flushAll(): Promise<void> {
    this.cache.clear();
  }
}

export const redisCache = new RedisCacheMock();
