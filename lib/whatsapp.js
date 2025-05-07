/**
 * WhatsApp Web API implementation
 * Modified to support phone number pairing codes
 */

const EventEmitter = require('events');
const Browser = require('./util/browser');
const { formatPhoneNumber } = require('./util/validator');

/**
 * WhatsApp Web client implementation
 * @extends EventEmitter
 */
class WhatsApp extends EventEmitter {
    /**
     * Create a new WhatsApp Web client
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super();
        
        this.options = options;
        this.browser = new Browser(options.puppeteer);
        this.authState = {
            isAuthenticated: false,
            qrCode: null
        };
    }
    
    /**
     * Initialize the WhatsApp Web connection
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            await this.browser.initialize();
            await this.browser.goto('https://web.whatsapp.com');
            
            // Start monitoring for QR code updates
            this._startQrCodeMonitor();
            
            // Monitor for authentication state changes
            this._monitorAuthState();
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Start monitoring for QR code updates
     * @private
     */
    async _startQrCodeMonitor() {
        try {
            // Monitor for QR code element
            await this.browser.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 20000 });
            
            // Set up a timer to periodically check for QR code updates
            this._qrCodeInterval = setInterval(async () => {
                try {
                    const qrCode = await this.getQrCode();
                    if (qrCode && qrCode !== this.authState.qrCode) {
                        this.authState.qrCode = qrCode;
                        this.emit('qr', qrCode);
                    }
                } catch (error) {
                    // QR code might no longer be available, which could indicate authentication
                    clearInterval(this._qrCodeInterval);
                }
            }, 2000);
            
        } catch (error) {
            // QR code element not found, might already be authenticated
            await this._checkAuthentication();
        }
    }
    
    /**
     * Monitor for authentication state changes
     * @private
     */
    async _monitorAuthState() {
        // Check initial authentication state
        await this._checkAuthentication();
        
        // Set up a timer to periodically check authentication state
        this._authCheckInterval = setInterval(async () => {
            await this._checkAuthentication();
        }, 5000);
    }
    
    /**
     * Check if the client is authenticated
     * @private
     */
    async _checkAuthentication() {
        try {
            const isAuthenticated = await this.browser.evaluate(() => {
                return typeof window.Store !== 'undefined' && 
                       window.Store.Stream && 
                       window.Store.Stream.isConnected;
            });
            
            if (isAuthenticated && !this.authState.isAuthenticated) {
                this.authState.isAuthenticated = true;
                
                // Clear any QR code monitoring
                if (this._qrCodeInterval) {
                    clearInterval(this._qrCodeInterval);
                }
                
                // Get session data to emit with authenticated event
                const sessionData = await this._getSessionData();
                
                this.emit('authenticated', sessionData);
                
                // Check if ready
                await this._waitForReady();
            } else if (!isAuthenticated && this.authState.isAuthenticated) {
                this.authState.isAuthenticated = false;
                this.emit('disconnected', 'Session logged out');
            }
        } catch (error) {
            // Ignore evaluation errors as the page might be loading
        }
    }
    
    /**
     * Wait for the WhatsApp Web interface to be fully loaded and ready
     * @private
     */
    async _waitForReady() {
        try {
            await this.browser.waitForSelector('[data-icon="chat"]', { timeout: 30000 });
            this.emit('ready');
        } catch (error) {
            this.emit('error', new Error('Failed to detect WhatsApp interface readiness'));
        }
    }
    
    /**
     * Get session data
     * @private
     * @returns {Promise<Object>} Session data
     */
    async _getSessionData() {
        try {
            return await this.browser.evaluate(() => {
                if (window.Store && window.Store.Contact) {
                    const myUser = window.Store.Contact.getMeContact();
                    if (myUser) {
                        return {
                            id: myUser.id._serialized,
                            name: myUser.name,
                            phone: myUser.id.user
                        };
                    }
                }
                return {};
            });
        } catch (error) {
            return {};
        }
    }
    
    /**
     * Get the current QR code as a data URL
     * @returns {Promise<string>} QR code data URL
     */
    async getQrCode() {
        try {
            return await this.browser.evaluate(() => {
                const canvas = document.querySelector('canvas[aria-label="Scan me!"]');
                return canvas ? canvas.toDataURL() : null;
            });
        } catch (error) {
            throw new Error('Failed to get QR code: ' + error.message);
        }
    }
    
    /**
     * Request a pairing code for the specified phone number
     * @param {string} phoneNumber - Phone number to pair with
     * @returns {Promise<string>} The pairing code
     */
    async requestPairingCode(phoneNumber) {
        try {
            // Format the phone number
            const formattedNumber = formatPhoneNumber(phoneNumber);
            
            // First, check if the QR code is visible
            const qrVisible = await this.browser.evaluate(() => {
                return !!document.querySelector('canvas[aria-label="Scan me!"]');
            });
            
            if (!qrVisible) {
                throw new Error('QR code not visible. Cannot request pairing code at this time.');
            }
            
            // Inject the necessary code to access WhatsApp Web's internal API
            const pairingCode = await this.browser.evaluate(async (phone) => {
                // Wait for WhatsApp Web to fully initialize
                if (!window.WWebJS) {
                    // Create a helper object to interact with WhatsApp Web's internal modules
                    window.WWebJS = {};
                    
                    // Wait for Store to be defined
                    const waitForStore = () => {
                        if (window.Store) return Promise.resolve();
                        
                        let timeout = 30;
                        return new Promise((resolve, reject) => {
                            const interval = setInterval(() => {
                                if (window.Store) {
                                    clearInterval(interval);
                                    resolve();
                                } else if (timeout <= 0) {
                                    clearInterval(interval);
                                    reject(new Error('Store not initialized'));
                                }
                                timeout--;
                            }, 100);
                        });
                    };
                    
                    await waitForStore();
                }
                
                // Call the internal API to request a pairing code
                try {
                    // Access the Store modules required for pairing
                    const result = await window.Store.PairingCode.requestPairingCode(phone);
                    
                    if (result && result.code) {
                        return result.code;
                    } else {
                        throw new Error('Failed to generate pairing code');
                    }
                } catch (err) {
                    return Promise.reject(new Error(`Failed to request pairing code: ${err.message}`));
                }
            }, formattedNumber);
            
            // Emit the pairing code event
            this.emit('pairing_code', pairingCode);
            
            return pairingCode;
            
        } catch (error) {
            throw new Error(`Failed to request pairing code: ${error.message}`);
        }
    }
    
    /**
     * Logout from WhatsApp Web
     * @returns {Promise<boolean>}
     */
    async logout() {
        try {
            await this.browser.evaluate(() => {
                if (window.Store && window.Store.AppState) {
                    window.Store.AppState.logout();
                    return true;
                }
                return false;
            });
            
            this.authState.isAuthenticated = false;
            return true;
        } catch (error) {
            throw new Error('Logout failed: ' + error.message);
        }
    }
    
    /**
     * Destroy the client and close the browser
     */
    async destroy() {
        if (this._qrCodeInterval) {
            clearInterval(this._qrCodeInterval);
        }
        
        if (this._authCheckInterval) {
            clearInterval(this._authCheckInterval);
        }
        
        await this.browser.close();
    }
}

module.exports = WhatsApp;
