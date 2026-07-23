/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Safely retrieve Cloudflare D1 database binding across Edge Runtime / Pages environment contexts
 */
export function getD1(): any {
  if (typeof process !== 'undefined' && (process.env as any)?.DB) {
    return (process.env as any).DB;
  }
  const g = globalThis as any;
  if (g.DB) return g.DB;
  if (g.__env__?.DB) return g.__env__.DB;
  if (g.env?.DB) return g.env.DB;
  if (g.__cloudflare_env__?.DB) return g.__cloudflare_env__.DB;
  return null;
}
