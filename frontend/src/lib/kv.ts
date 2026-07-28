import { CloudflareEnv } from "../types/cloudflare";

// Helper to access Cloudflare KV binding dynamically across Pages Functions
export function getKV(): CloudflareEnv['PULSE360_KV'] | null {
  if (typeof process !== 'undefined' && process.env && process.env.PULSE360_KV) {
    return process.env.PULSE360_KV as CloudflareEnv['PULSE360_KV'];
  }
  if (typeof globalThis !== "undefined") {
    const g = globalThis as typeof globalThis & CloudflareEnv;
    if (g.PULSE360_KV) {
      return g.PULSE360_KV;
    }
  }
  return null;
}

export async function setKVCache(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  const kv = getKV();
  if (kv) {
    await kv.put(key, value, { expirationTtl: ttlSeconds }).catch(err => console.error('KV set failed', err));
  }
}

export async function getKVCache(key: string): Promise<string | null> {
  const kv = getKV();
  if (kv) {
    return await kv.get(key).catch(() => null);
  }
  return null;
}
