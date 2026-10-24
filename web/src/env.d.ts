interface ImportMetaEnv {
  /** API base URL, e.g. http://localhost:3000/api/v1 */
  readonly VITE_API_URL?: string
  /** Upload limit per file in MB; keep in sync with the API (default 50) */
  readonly VITE_MAX_FILE_SIZE_MB?: string
}
