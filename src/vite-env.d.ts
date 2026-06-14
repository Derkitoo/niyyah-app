/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du serveur Web Push (déploiement). */
  readonly VITE_PUSH_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
