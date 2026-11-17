/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional API base URL; defaults to "/api" (proxied to NestJS in development). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
