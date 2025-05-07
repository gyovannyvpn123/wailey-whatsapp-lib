const { randomBytes } = require('crypto');

/**
 * Generate a random message ID.
 * @returns {string} Random message ID.
 */
function generateMessageID() {
  return randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Generate a random ID with an optional prefix.
 * @param {string} [prefix=""] Optional prefix.
 * @returns {string} Random ID.
 */
function generateRandomID(prefix = '') {
  return `${prefix}${randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * Format a phone number by stripping non-numeric characters.
 * @param {string} phoneNumber 
 * @returns {string} Cleaned phone number.
 */
function formatPhoneNumber(phoneNumber) {
  return phoneNumber.replace(/[^\d]/g, '');
}

/**
 * Normalize a JID for WhatsApp.
 * @param {string} jid 
 * @returns {string} Normalized JID.
 */
function normalizeJid(jid) {
  if (!jid) return '';
  if (jid.includes('@')) return jid;
  return `${formatPhoneNumber(jid)}@s.whatsapp.net`;
}

/**
 * Convert a JavaScript Date to a WhatsApp timestamp.
 * @param {Date} date 
 * @returns {number} Timestamp (in seconds).
 */
function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert a WhatsApp timestamp to a JavaScript Date.
 * @param {number} timestamp 
 * @returns {Date}
 */
function fromTimestamp(timestamp) {
  return new Date(timestamp * 1000);
}

/**
 * Check if a value is a plain object.
 * @param {any} value 
 * @returns {boolean}
 */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep merge two objects.
 * @param {Object} target 
 * @param {Object} source 
 * @returns {Object} Merged object.
 */
function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) return source;
  const output = { ...target };
  for (const key in source) {
    if (isObject(source[key])) {
      output[key] = key in target ? deepMerge(target[key], source[key]) : source[key];
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Safely parse a JSON string.
 * @param {string} json 
 * @param {any} fallback 
 * @returns {any}
 */
function safeJsonParse(json, fallback = {}) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return fallback;
  }
}

/**
 * Sleep for a specified number of milliseconds.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a deferred promise.
 * @returns {Object} Contains { promise, resolve, reject }.
 */
function deferredPromise() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Create a timeout promise that rejects after a given time.
 * @param {number} ms 
 * @param {any} rejectValue 
 * @returns {Promise}
 */
function promiseTimeout(ms, rejectValue) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(rejectValue), ms);
  });
}

/**
 * Race a promise against a timeout.
 * @param {Promise} promise 
 * @param {number} ms 
 * @param {any} rejectValue 
 * @returns {Promise}
 */
async function withTimeout(promise, ms, rejectValue) {
  return Promise.race([
    promise,
    promiseTimeout(ms, rejectValue)
  ]);
}

/**
 * Retry a function with exponential backoff.
 * @param {Function} fn 
 * @param {Object} options 
 * @returns {Promise}
 */
async function exponentialRetry(fn, options = {}) {
  const {
    maxRetries = 5,
    initialDelay = 1000,
    maxDelay = 60000,
    factor = 2,
    jitter = 0.1
  } = options;
  let retries = 0;
  let delay = initialDelay;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (++retries >= maxRetries) {
        throw error;
      }
      const jitterAmount = delay * jitter * (Math.random() * 2 - 1);
      delay = Math.min(delay * factor + jitterAmount, maxDelay);
      await sleep(delay);
    }
  }
}

/**
 * Group an array of objects by a key or a function.
 * @param {Array} array 
 * @param {string|Function} key 
 * @returns {Object}
 */
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Generate a UUID v4.
 * @returns {string} UUID v4.
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Browsers definitions for WhatsApp connection.
 */
const Browsers = {
  googleChrome: () => ({
    name: "Google Chrome",
    version: "latest",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/112.0.0.0 Safari/537.36"
  }),
  mozillaFirefox: () => ({
    name: "Mozilla Firefox",
    version: "latest",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:111.0) " +
      "Gecko/20100101 Firefox/111.0"
  }),
  safari: () => ({
    name: "Safari",
    version: "latest",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
      "Version/15.1 Safari/605.1.15"
  })
};

module.exports = {
  generateMessageID,
  generateRandomID,
  formatPhoneNumber,
  normalizeJid,
  toTimestamp,
  fromTimestamp,
  isObject,
  deepMerge,
  safeJsonParse,
  sleep,
  deferredPromise,
  promiseTimeout,
  withTimeout,
  exponentialRetry,
  groupBy,
  uuidv4,
  Browsers
};
