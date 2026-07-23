// Type definitions for Cloudflare Edge bindings

export interface CloudflareEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...args: unknown[]) => {
        run: () => Promise<{ success: boolean }>;
        all: <T = unknown>() => Promise<{ results: T[] }>;
        first: <T = unknown>() => Promise<T | null>;
      };
    };
  };
  PULSE360_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends CloudflareEnv {}
  }
}
