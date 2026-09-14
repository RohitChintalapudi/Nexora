/**
 * NEXORA Safe Logger
 * Strips secrets, tokens, passwords, and sensitive keys from backend logs.
 */

const SENSITIVE_KEY_REGEX = /("?(?:access_token|refresh_token|token|password|client_secret|apiKey|secret|authorization)"?\s*[:=]\s*)"?([^",\s}]+)"?/gi;

function redactSensitiveData(message) {
  if (typeof message === 'string') {
    return message.replace(SENSITIVE_KEY_REGEX, '$1"[REDACTED]"');
  }
  if (message && typeof message === 'object') {
    try {
      const cloned = JSON.parse(JSON.stringify(message));
      const redactObject = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
          const lower = key.toLowerCase();
          if (
            lower.includes('token') ||
            lower.includes('secret') ||
            lower.includes('password') ||
            lower.includes('key') ||
            lower.includes('auth')
          ) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            redactObject(obj[key]);
          }
        }
      };
      redactObject(cloned);
      return cloned;
    } catch {
      return '[Unserializable Object]';
    }
  }
  return message;
}

export const logger = {
  info(...args) {
    const sanitized = args.map(redactSensitiveData);
    console.log(...sanitized);
  },
  warn(...args) {
    const sanitized = args.map(redactSensitiveData);
    console.warn(...sanitized);
  },
  error(...args) {
    const sanitized = args.map(redactSensitiveData);
    console.error(...sanitized);
  }
};

export default logger;
