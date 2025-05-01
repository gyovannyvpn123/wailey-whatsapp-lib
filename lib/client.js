/**
 * Client implementation for WhatsApp Web
 * Modified to support phone number pairing codes using baileys.js
 */

const EventEmitter = require('events');
const { formatPhoneNumber, validatePhoneNumber } = require('./util/validator');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeInMemoryStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

/**
 * Client for interacting with the WhatsApp Web API using baileys.js
 * @extends EventEmitter
 */
class Client extends EventEmitter {
    /**
     * Create a new WhatsApp client instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super();
        
        this.options = {
            authTimeout: 60000,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: {
                folder: options.sessionPath || './session',
            },
            ...options
        };
        
        // Create session directory if it doesn't exist
        if (!fs.existsSync(this.options.auth.folder)) {
            fs.mkdirSync(this.options.auth.folder, { recursive: true });
        }
        
        this.authState = {
            isAuthenticated: false,
            qrCode: null
        };
        
        this.socket = null;
        this.store = null;
    }
    
    /**
     * Initialize the WhatsApp connection using baileys
     */
    async initialize() {
        try {
            // Initialize store for session data
            this.store = makeInMemoryStore({ logger: this.options.logger });
            
            // Fetch latest version for compatibility
            const { version } = await fetchLatestBaileysVersion();
            
            // Get auth state from files
            const { state, saveCreds } = await useMultiFileAuthState(this.options.auth.folder);
            
            // Create a new socket connection
            this.socket = makeWASocket({
                version,
                logger: this.options.logger,
                printQRInTerminal: this.options.printQRInTerminal,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, this.options.logger)
                },
                browser: ['Ubuntu', 'Chrome', '114.0.0'], // Folosim browser Chrome pe Ubuntu pentru compatibilitate
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                // This is important for pairing code to work properly
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(
                        message.buttonsMessage ||
                        message.listMessage ||
                        message.templateMessage
                    );
                    if (requiresPatch) {
                        message = {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadataVersion: 2,
                                        deviceListMetadata: {},
                                    },
                                    ...message,
                                },
                            },
                        };
                    }
                    return message;
                },
                getMessage: async (key) => {
                    return this.store?.loadMessage(key.remoteJid, key.id) || undefined;
                }
            });
            
            // Bind the store to the connection
            this.store?.bind(this.socket.ev);
            
            // Register to save credentials on update
            this.socket.ev.on('creds.update', saveCreds);
            
            // Handle connection updates
            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    this.authState.qrCode = qr;
                    this.emit('qr', qr);
                }
                
                if (connection === 'open') {
                    this.authState.isAuthenticated = true;
                    this.emit('authenticated', {
                        id: this.socket.user.id,
                        name: this.socket.user.name,
                        phone: this.socket.user.id.split(':')[0]
                    });
                    this.emit('ready');
                }
                
                if (connection === 'close') {
                    this.authState.isAuthenticated = false;
                    const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
                    
                    if (shouldReconnect) {
                        this.emit('disconnected', 'Connection closed, attempting to reconnect');
                    } else {
                        this.emit('auth_failure', 'Logged out');
                    }
                }
                
                // Forward connection update event for advanced usage
                this.emit('connection.update', update);
            });
            
            // Forward messages events
            this.socket.ev.on('messages.upsert', (m) => {
                if (m.type === 'notify') {
                    for (const msg of m.messages) {
                        this.emit('message', msg);
                    }
                }
            });
            
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
        // Nu este nevoie de a verifica dacă s-a scanat codul QR mai întâi
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
}
    
    /**
     * Get QR code for authentication
     * @returns {Promise<string>} - The QR code string
     */
    async getQrCode() {
        if (!this.authState.qrCode) {
            throw new Error('QR code not available yet. Wait for the "qr" event.');
        }
        
        return this.authState.qrCode;
    }
    
    /**
     * Check if client is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.authState.isAuthenticated;
    }
    
    /**
     * Logout from WhatsApp Web
     * @returns {Promise<boolean>}
     */
    async logout() {
        if (!this.socket) {
            throw new Error('Client not initialized');
        }
        
        try {
            await this.socket.logout();
            this.authState.isAuthenticated = false;
            return true;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Gracefully close the connection
     */
    async destroy() {
        if (this.socket) {
            try {
                await this.socket.end(undefined);
                this.socket = null;
            } catch (error) {
                console.error('Error during socket destroy:', error);
            }
        }
    }
    
    /**
     * Send a text message
     * @param {string} jid - The JID of the recipient (phone number with @s.whatsapp.net)
     * @param {string} text - The message text
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Message info
     */
    async sendText(jid, text, options = {}) {
        if (!this.socket) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        
        if (!this.authState.isAuthenticated) {
            throw new Error('Not authenticated. Authenticate first before sending messages.');
        }
        
        // Format JID if it's a phone number
        if (!jid.includes('@')) {
            jid = `${jid.replace(/[^\d]/g, '')}@s.whatsapp.net`;
        }
        
        try {
            const result = await this.socket.sendMessage(jid, { text }, options);
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Send a media message
     * @param {string} jid - The JID of the recipient
     * @param {string|Buffer} media - The media content
     * @param {string} type - Media type (image, video, document, audio)
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Message info
     */
    async sendMedia(jid, media, type = 'image', options = {}) {
        if (!this.socket) {
            throw new Error('Client not initialized');
        }
        
        if (!this.authState.isAuthenticated) {
            throw new Error('Not authenticated');
        }
        
        // Format JID if it's a phone number
        if (!jid.includes('@')) {
            jid = `${jid.replace(/[^\d]/g, '')}@s.whatsapp.net`;
        }
        
        // Prepare message content based on media type
        let content = {};
        
        switch (type) {
            case 'image':
                content = { image: media, ...options };
                break;
            case 'video':
                content = { video: media, ...options };
                break;
            case 'audio':
                content = { audio: media, ...options };
                break;
            case 'document':
                content = { document: media, ...options };
                break;
            default:
                throw new Error(`Unsupported media type: ${type}`);
        }
        
        try {
            const result = await this.socket.sendMessage(jid, content);
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
}

module.exports = Client;
