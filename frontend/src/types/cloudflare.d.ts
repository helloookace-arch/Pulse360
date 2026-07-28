// Type definitions for Cloudflare Edge bindings used by the app.

export interface D1BoundStatementLike {
  run: () => Promise<{ success: boolean }>;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  first: <T = unknown>() => Promise<T | null>;
}

export interface D1PreparedStatementLike extends D1BoundStatementLike {
  bind: (...args: unknown[]) => D1BoundStatementLike;
}

export interface D1DatabaseLike {
  prepare: (query: string) => D1PreparedStatementLike;
}

export interface CloudflareEnv {
  DB?: D1DatabaseLike;
  PULSE360_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB?: D1DatabaseLike;
      PULSE360_KV?: CloudflareEnv['PULSE360_KV'];
    }
  }

  interface Window {
    DB?: D1DatabaseLike;
    PULSE360_KV?: CloudflareEnv['PULSE360_KV'];
    __env__?: CloudflareEnv;
    env?: CloudflareEnv;
    __cloudflare_env__?: CloudflareEnv;
  }

  // eslint-disable-next-line no-var
  var DB: D1DatabaseLike | undefined;
  // eslint-disable-next-line no-var
  var PULSE360_KV: CloudflareEnv['PULSE360_KV'] | undefined;
  // eslint-disable-next-line no-var
  var __env__: CloudflareEnv | undefined;
  // eslint-disable-next-line no-var
  var env: CloudflareEnv | undefined;
  // eslint-disable-next-line no-var
  var __cloudflare_env__: CloudflareEnv | undefined;
}
