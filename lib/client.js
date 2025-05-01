/**
 * WhatsApp client implementation
 * Fixed version with proper async/await syntax
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

/**
 * Validate a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
}

/**
 * Format a phone number for WhatsApp
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number with + prefix
 */
function formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
        return '+' + cleaned;
    }
    
    return cleaned;
}

/**
 * WhatsApp client class
 */
class Client extends EventEmitter {
    /**
     * Create a new WhatsApp client
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super();
        
        this.options = {
            auth: {
                folder: options.sessionPath || './auth'
            },
            printQRInTerminal: options.printQRInTerminal || false,
            browser: options.browser || ['Ubuntu', 'Chrome', '114.0.0'],
            logger: options.logger || pino({ level: 'warn' }),
        };
        
        this.socket = null;
        this.state = 'disconnected';
        this.qrCode = null;
    }
    
    /**
     * Initialize the WhatsApp client
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.emit('state_changed', { state: 'initializing' });
            
            // Fetch the latest version of baileys
            const { version } = await fetchLatestBaileysVersion();
            console.log(`Using WA v${version.join('.')}`);
            
            // Create auth state
            const { state, saveCreds } = await useMultiFileAuthState(this.options.auth.folder);
            
            // Create the socket
            this.socket = makeWASocket({
                version,
                logger: this.options.logger,
                printQRInTerminal: this.options.printQRInTerminal,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, this.options.logger)
                },
                browser: this.options.browser,
                getMessage: async () => { return { conversation: 'hello' }; }
            });
            
            // Set up event handlers
            this.socket.ev.on('creds.update', saveCreds);
            
            this.socket.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    this.qrCode = qr;
                    this.emit('qr', qr);
                }
                
                if (connection === 'open') {
                    this.state = 'connected';
                    this.emit('authenticated', this.socket.user);
                    this.emit('ready');
                }
                
                if (connection === 'close') {
                    this.state = 'disconnected';
                    
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect) {
                        this.emit('disconnected', { reason: 'connection_lost', reconnecting: true });
                        this.initialize();
                    } else {
                        this.emit('disconnected', { reason: 'logged_out', reconnecting: false });
                    }
                }
            });
            
            this.socket.ev.on('messages.upsert', (m) => {
                if (m.type === 'notify') {
                    for (const msg of m.messages) {
                        this.emit('message', msg);
                    }
                }
            });
            
            return this.socket;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Request a pairing code for phone number authentication
     * @param {string} phoneNumber - Phone number in international format (e.g., 4075646xxxx)
     * @returns {Promise<string>} - The pairing code
     */
    async requestPairingCode(phoneNumber) {
        if (!this.socket) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        
        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
            throw new Error('Invalid phone number format. Please use international format (10-15 digits).');
        }
        
        try {
            // Format the phone number for baileys with + prefix
            const formattedNumber = formatPhoneNumber(phoneNumber);
            
            if (!formattedNumber) {
                throw new Error('Failed to format phone number');
            }
            
            console.log(`Requesting pairing code for: ${formattedNumber}`);
            
            // Solicit direct codul de asociere de la socket
            const code = await this.socket.requestPairingCode(formattedNumber);
            
            console.log('Pairing code response:', typeof code, code);
            
            // Different versions of baileys might return different formats
            let pairingCode;
            if (typeof code === 'string') {
                pairingCode = code;
            } else if (code && code.code) {
                pairingCode = code.code;
            } else if (code && typeof code.toString === 'function') {
                pairingCode = code.toString();
            } else {
                throw new Error('Invalid response format from WhatsApp server');
            }
            
            if (pairingCode) {
                this.emit('pairing_code', pairingCode);
                return pairingCode;
            } else {
                throw new Error('Empty response from WhatsApp server');
            }
        } catch (error) {
            console.error('Pairing code error:', error);
            
            // Provide more helpful error message for common issues
            let errorMessage = 'Failed to request pairing code';
            
            if (error.message.includes('rate limit')) {
                errorMessage = 'Rate limit exceeded. Please wait a few minutes before trying again';
            } else if (error.message.includes('not authorized')) {
                errorMessage = 'Phone number is not authorized for this operation';
            } else if (error.message.includes('connection')) {
                errorMessage = 'Connection error. Please check your internet connection';
            } else {
                errorMessage = `${errorMessage}: ${error.message}`;
            }
            
            this.emit('error', new Error(errorMessage));
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Get the QR code for authentication
     * @returns {string|null} The QR code or null if not available
     */
    async getQrCode() {
        return this.qrCode;
    }
    
    /**
     * Logout from WhatsApp
     * @returns {Promise<void>}
     */
    async logout() {
        if (this.socket) {
            await this.socket.logout();
            this.state = 'disconnected';
            this.emit('disconnected', { reason: 'logout', reconnecting: false });
        }
    }
    
    /**
     * Disconnect from WhatsApp
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.socket) {
            try {
                await this.socket.end(undefined);
                this.state = 'disconnected';
                this.emit('disconnected', { reason: 'user_disconnect', reconnecting: false });
            } catch (error) {
                this.emit('error', error);
                throw error;
            }
        }
    }
    
    /**
     * Send a text message
     * @param {string} jid - The JID (phone number) to send to
     * @param {string} text - The text message to send
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Message info
     */
    async sendTextMessage(jid, text, options = {}) {
        if (!this.socket) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        
        try {
            // Format the jid
            const formattedJid = jid.includes('@') ? jid : `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
            
            const result = await this.socket.sendMessage(formattedJid, { text }, options);
            this.emit('message_create', result);
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Send a media message
     * @param {string} jid - The JID (phone number) to send to
     * @param {Object} content - Message content
     * @returns {Promise<Object>} Message info
     */
    async sendMessage(jid, content) {
        if (!this.socket) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        
        try {
            // Format the jid
            const formattedJid = jid.includes('@') ? jid : `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
            
            const result = await this.socket.sendMessage(formattedJid, content);
            this.emit('message_create', result);
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}

module.exports = Client;