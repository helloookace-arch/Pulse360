import type { CloudflareEnv, D1DatabaseLike } from "../types/cloudflare";

/**
 * Safely retrieve the Cloudflare D1 binding across Edge Runtime / Pages contexts.
 */
export function getD1(): D1DatabaseLike | null {
  if (typeof process !== "undefined" && process.env?.DB) {
    return process.env.DB;
  }

  const g = globalThis as typeof globalThis & CloudflareEnv;
  if (g.DB) return g.DB;
  if (g.__env__?.DB) return g.__env__.DB;
  if (g.env?.DB) return g.env.DB;
  if (g.__cloudflare_env__?.DB) return g.__cloudflare_env__.DB;
  return null;
}
