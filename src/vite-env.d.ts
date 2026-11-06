/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_ENDPOINT?: string;
  readonly VITE_PUBLIC_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
