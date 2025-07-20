// Rate limiting middleware for API protection
import { LRUCache } from 'lru-cache';

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    standardHeaders = true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders = false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests = false, // Don't count successful requests
    skipFailedRequests = false, // Don't count failed requests
    keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  } = options;

  // Use LRU cache to store rate limit data
  const cache = new LRUCache({
    max: 500, // Maximum number of items in cache
    ttl: windowMs, // Items expire after windowMs
  });

  return (req, res, next) => {
    const key = keyGenerator(req);
    const current = cache.get(key) || { count: 0, resetTime: Date.now() + windowMs };

    // Reset counter if window has expired
    if (Date.now() > current.resetTime) {
      current.count = 0;
      current.resetTime = Date.now() + windowMs;
    }

    current.count++;
    cache.set(key, current);

    const remaining = Math.max(0, max - current.count);
    const resetTime = new Date(current.resetTime);

    // Set standard headers
    if (standardHeaders) {
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetTime.toISOString());
    }

    // Set legacy headers
    if (legacyHeaders) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
    }

    if (current.count > max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000),
      });
    }

    if (typeof next === 'function') {
      next();
    }
  };
};

// Predefined rate limiters for different endpoints
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per 15 minutes
});

export const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});

export const ninLookupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 NIN lookups per hour
  message: 'Too many NIN lookup requests, please try again later.',
});

export default rateLimit;
