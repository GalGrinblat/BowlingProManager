/**
 * Structured logger with environment-based filtering.
 *
 * - `logger.error` — always emitted (visible in DevTools and any attached
 *   error reporting service); suitable for unexpected failures.
 * - `logger.warn`  — emitted in development only; used for deprecation
 *   notices and non-critical advisories that are noise in production.
 * - `logger.log`   — emitted in development only; for general debug output.
 *
 * To integrate an error reporting service (e.g. Sentry) in the future,
 * add the SDK call inside `logger.error` here — no other file needs to change.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    // Always log errors so they appear in production DevTools and can be
    // forwarded to an error reporting service.
    console.error(message, ...args);
  },

  warn: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },

  log: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.log(message, ...args);
    }
  },
};
