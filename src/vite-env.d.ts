/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMBED_PARENTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
