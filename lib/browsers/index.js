// Wailey WhatsApp Library - Browser Support Module
// This file provides browser-specific functionality and compatibility

/**
 * @typedef {Object} BrowserConfig
 * @property {string} [name] - Browser name to emulate
 * @property {string} [version] - Browser version to emulate
 * @property {string} [userAgent] - Custom user agent string
 */

/**
 * Default browser configurations for different browsers
 */
const BROWSER_CONFIG = {
  chrome: {
    name: 'Chrome',
    version: '93.0.4577.82',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
  },
  firefox: {
    name: 'Firefox',
    version: '92.0',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0'
  },
  safari: {
    name: 'Safari',
    version: '15.0',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15'
  }
};

/**
 * Browser utilities and compatibility layer
 */
class Browsers {
  /**
   * Create a new browser config instance
   * @param {string} [browser='chrome'] - Browser type to use
   * @param {BrowserConfig} [config={}] - Custom browser configuration
   */
  constructor(browser = 'chrome', config = {}) {
    this.browser = browser.toLowerCase();
    this.config = {
      ...BROWSER_CONFIG[this.browser] || BROWSER_CONFIG.chrome,
      ...config
    };
  }
  
  /**
   * Get browser configuration
   * @returns {BrowserConfig} The current browser configuration
   */
  getBrowserConfig() {
    return this.config;
  }
  
  /**
   * Get user agent string
   * @returns {string} User agent string for the configured browser
   */
  getUserAgent() {
    return this.config.userAgent;
  }
  
  /**
   * Set browser type
   * @param {string} browser - Browser type to use
   * @returns {Browsers} This instance for chaining
   */
  setBrowser(browser) {
    this.browser = browser.toLowerCase();
    this.config = {
      ...BROWSER_CONFIG[this.browser] || BROWSER_CONFIG.chrome,
      ...this.config
    };
    return this;
  }
  
  /**
   * Check if the browser supports a specific feature
   * @param {string} feature - Feature to check support for
   * @returns {boolean} Whether the feature is supported
   */
  supportsFeature(feature) {
    const supportMatrix = {
      webp: ['chrome', 'firefox', 'edge'],
      webm: ['chrome', 'firefox', 'edge'],
      mediaRecorder: ['chrome', 'firefox', 'edge'],
      webSocket: ['chrome', 'firefox', 'safari', 'edge'],
      webRTC: ['chrome', 'firefox', 'safari', 'edge'],
      serviceWorker: ['chrome', 'firefox', 'safari', 'edge']
    };
    
    return supportMatrix[feature]?.includes(this.browser) || false;
  }
  
  /**
   * Implementation of the wailey() method required for browser compatibility
   * @returns {Object} Wailey browser API interface 
   */
  wailey() {
    return {
      browser: this.browser,
      version: this.config.version,
      userAgent: this.config.userAgent,
      supports: (feature) => this.supportsFeature(feature),
      isDesktop: () => true,
      isMobile: () => false,
      isBot: () => false
    };
  }
  
  /**
   * Create a configuration object for WhatsApp Web
   * @returns {Object} Configuration for WhatsApp Web connection
   */
  createWAWebConfig() {
    return {
      browser: this.browser,
      browserVersion: this.config.version,
      userAgent: this.config.userAgent,
      webVersionCache: {
        ETag: '',
        timestamp: Date.now()
      }
    };
  }
}

/**
 * Create browser configuration for Chrome
 * @param {BrowserConfig} [config={}] - Custom browser configuration
 * @returns {Browsers} Chrome browser configuration
 */
function chrome(config = {}) {
  return new Browsers('chrome', config);
}

/**
 * Create browser configuration for Firefox
 * @param {BrowserConfig} [config={}] - Custom browser configuration
 * @returns {Browsers} Firefox browser configuration
 */
function firefox(config = {}) {
  return new Browsers('firefox', config);
}

/**
 * Create browser configuration for Safari
 * @param {BrowserConfig} [config={}] - Custom browser configuration
 * @returns {Browsers} Safari browser configuration
 */
function safari(config = {}) {
  return new Browsers('safari', config);
}

/**
 * Default browsers utility export with pre-configured Chrome
 */
const defaultBrowser = new Browsers('chrome');

module.exports = {
  Browsers,
  chrome,
  firefox,
  safari,
  default: defaultBrowser
};
