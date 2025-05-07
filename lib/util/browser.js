/**
 * Browser utilities for headless browser emulation
 */

const puppeteer = require('puppeteer');

/**
 * Browser session manager
 */
class Browser {
    /**
     * Create a new browser session
     * @param {Object} options - Puppeteer options
     */
    constructor(options = {}) {
        this.options = options;
        this.browser = null;
        this.page = null;
    }
    
    /**
     * Initialize the browser
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            // Enhanced browser options for better compatibility in various environments
            const defaultOptions = {
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--disable-features=site-per-process',
                    '--disable-web-security',
                    '--disable-extensions'
                ],
                ignoreHTTPSErrors: true,
                defaultViewport: {
                    width: 1280,
                    height: 800
                }
            };

            // Merge default options with user-provided options
            const mergedOptions = { ...defaultOptions, ...this.options };
            
            this.browser = await puppeteer.launch(mergedOptions);
            this.page = await this.browser.newPage();
            
            // Set user agent to simulate Chrome on Windows
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Enable necessary browser features
            await this.page.setBypassCSP(true);
            
            // Optimize for performance
            await this.page.setCacheEnabled(true);
            
            // Handle dialog events (alerts, confirms, etc.)
            this.page.on('dialog', async (dialog) => {
                await dialog.dismiss();
            });
            
            // Add error handlers
            this.page.on('error', (err) => {
                console.error('Page error:', err);
            });
            
            this.page.on('pageerror', (err) => {
                console.error('Page error in browser context:', err);
            });
            
        } catch (error) {
            console.error('Browser initialization error details:', error);
            throw new Error(`Failed to initialize browser: ${error.message}`);
        }
    }
    
    /**
     * Get the current page
     * @returns {Page} The current page
     */
    getPage() {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }
        return this.page;
    }
    
    /**
     * Execute JavaScript in the browser context
     * @param {string|Function} script - Script to execute
     * @param {...*} args - Arguments to pass to the script
     * @returns {Promise<*>} Result of the script execution
     */
    async evaluate(script, ...args) {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }
        return await this.page.evaluate(script, ...args);
    }
    
    /**
     * Navigate to a URL
     * @param {string} url - URL to navigate to
     * @param {Object} options - Navigation options
     * @returns {Promise<Response>} Navigation response
     */
    async goto(url, options = {}) {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }
        
        const defaultOptions = {
            waitUntil: 'networkidle2',
            timeout: 60000
        };
        
        return await this.page.goto(url, { ...defaultOptions, ...options });
    }
    
    /**
     * Wait for a selector to appear
     * @param {string} selector - CSS selector
     * @param {Object} options - Wait options
     * @returns {Promise<ElementHandle>} Element handle
     */
    async waitForSelector(selector, options = {}) {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }
        
        const defaultOptions = {
            visible: true,
            timeout: 30000
        };
        
        return await this.page.waitForSelector(selector, { ...defaultOptions, ...options });
    }
    
    /**
     * Close the browser
     * @returns {Promise<void>}
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

module.exports = Browser;
