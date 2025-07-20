// Professional logging service for production
class Logger {
  constructor() {
    this.isDev = __DEV__ || process.env.NODE_ENV === 'development';
    this.debugEnabled = process.env.EXPO_PUBLIC_DEBUG_NETWORK === 'true';
  }

  // Only log in development or when debug is explicitly enabled
  log(...args) {
    if (this.isDev) {
      console.log('[LOG]', ...args);
    }
  }

  debug(...args) {
    if (this.isDev && this.debugEnabled) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args) {
    if (this.isDev) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
    // In production, you might want to send errors to a service like Sentry
    if (!this.isDev) {
      // TODO: Implement error reporting service
      // Sentry.captureException(new Error(args.join(' ')));
    }
  }

  // Secure logging that filters sensitive data
  secureLog(level, message, data = {}) {
    const sanitizedData = this.sanitizeData(data);
    this[level](message, sanitizedData);
  }

  // Remove sensitive information from logs
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sensitive = ['password', 'token', 'key', 'secret', 'authorization', 'nin', 'bvn'];
    const sanitized = { ...data };
    
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }

  // Network request logging
  logApiRequest(method, url, headers = {}) {
    if (this.debugEnabled) {
      const sanitizedHeaders = this.sanitizeData(headers);
      this.debug(`API ${method.toUpperCase()} ${url}`, { headers: sanitizedHeaders });
    }
  }

  logApiResponse(method, url, status, data = {}) {
    if (this.debugEnabled) {
      const sanitizedData = this.sanitizeData(data);
      this.debug(`API ${method.toUpperCase()} ${url} - ${status}`, sanitizedData);
    }
  }

  // Network debugging (legacy compatibility)
  network(...args) {
    if (this.isDev && this.debugEnabled) {
      this.debug('🌐', ...args);
    }
  }
}

export const logger = new Logger();
export { Logger };
export default logger;
