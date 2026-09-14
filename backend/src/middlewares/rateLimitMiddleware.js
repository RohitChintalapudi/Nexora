/**
 * NEXORA Lightweight Rate Limiter Middleware
 * Provides memory/cache-backed protection for expensive endpoints.
 */

class MemoryStore {
  constructor() {
    this.hits = new Map();
    // Periodically prune expired entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (record.resetAt <= now) {
          this.hits.delete(key);
        }
      }
    }, 60000).unref();
  }

  increment(key, windowMs) {
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || record.resetAt <= now) {
      const newRecord = { count: 1, resetAt: now + windowMs };
      this.hits.set(key, newRecord);
      return { count: 1, resetAt: newRecord.resetAt };
    }

    record.count++;
    return { count: record.count, resetAt: record.resetAt };
  }
}

const defaultStore = new MemoryStore();

/**
 * Factory to create rate-limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests allowed in window
 * @param {string} options.message - User friendly message when rate limited
 * @param {Function} [options.keyGenerator] - Custom key generator function
 */
export function createRateLimiter({
  windowMs = 60000,
  max = 60,
  message = 'Too many requests, please try again later.',
  keyGenerator = (req) => req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`
} = {}) {
  return (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const { count, resetAt } = defaultStore.increment(key, windowMs);
      const remaining = Math.max(0, max - count);
      const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000));

      if (count > max) {
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: retryAfterSeconds
        });
      }

      next();
    } catch {
      // Fail open so rate limiter errors don't bring down API
      next();
    }
  };
}

// Pre-configured rate limiters for key routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

export const githubLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: 'Too many GitHub API requests. Please wait a moment.'
});

export const analysisLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15,
  message: 'Analysis request rate limit reached. Please wait a few minutes.'
});
