// Read at import time (not via ConfigService): upload limits are used in decorators,
// which run before Nest's DI container exists.
try {
  process.loadEnvFile();
} catch {
  // .env is optional; real environments set variables directly.
}

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer, got "${raw}"`);
  }
  return value;
}

function list(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  port: positiveInt('PORT', 3000),
  /** Front-end origins allowed by CORS. */
  corsOrigins: list('CORS_ORIGINS', ['http://localhost:5173']),
  maxFileSizeMb: positiveInt('MAX_FILE_SIZE_MB', 50),
  /** Requests per minute, per IP and per endpoint (each PDF tool has its own counter). */
  rateLimitPerMinute: positiveInt('RATE_LIMIT_PER_MINUTE', 30),
};
