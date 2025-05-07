/**
 * Wailey WhatsApp Library - Baileys Integration Module
 * Fixed TypeScript syntax errors in Baileys integration
 */

// Import necessary modules
const { EventEmitter } = require('events');
const logger = require('../../src/utils/logger');

/**
 * BaileysJS class is a wrapper around the Baileys WhatsApp library
 * providing compatible functionality with the Wailey framework
 */
class BaileysJS extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      printQRInTerminal: true,
      auth: {
        creds: {},
        keys: {}
      },
      ...config
    };
    this.baileys = null;
    this.sock = null;
    this.initialized = false;
    this.logger = logger;
  }

  /**
   * Initialize the Baileys library
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Dynamic import of baileys to avoid TypeScript errors
      const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = await import('@whiskeysockets/baileys');
      this.baileys = { makeWASocket, DisconnectReason, useMultiFileAuthState };
      this.initialized = true;
      this.logger.info('BaileysJS initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize BaileysJS:', error);
      throw error;
    }
  }

  /**
   * Connect to WhatsApp using Baileys
   * @returns {Promise<object>} Connection object
   */
  async connect() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get auth state
      const { state, saveCreds } = await this.baileys.useMultiFileAuthState('./auth_info_baileys');
      
      // Create connection to WhatsApp
      const sock = this.baileys.makeWASocket({
        printQRInTerminal: this.config.printQRInTerminal,
        auth: state,
        logger: this.logger
      });
      
      // Set up connection event handlers
      sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.emit('qr', qr);
        }
        
        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== this.baileys.DisconnectReason.loggedOut;
          this.logger.info('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
          
          if (shouldReconnect) {
            this.connect();
          } else {
            this.emit('logout');
          }
        } else if (connection === 'open') {
          this.logger.info('Connection opened');
          this.emit('open');
        }
      });
      
      // Handle credentials update
      sock.ev.on('creds.update', saveCreds);
      
      // Handle messages
      sock.ev.on('messages.upsert', (m) => {
        this.emit('message', m);
      });
      
      this.sock = sock;
      return sock;
    } catch (error) {
      this.logger.error('Failed to connect using BaileysJS:', error);
      throw error;
    }
  }

  /**
   * Send a message using Baileys
   * @param {string} jid - The JID (WhatsApp ID) to send the message to
   * @param {object} content - The message content
   * @param {object} options - Additional options
   * @returns {Promise<object>} Message info
   */
  async sendMessage(jid, content, options = {}) {
    if (!this.sock) {
      throw new Error('Not connected to WhatsApp');
    }
    
    try {
      return await this.sock.sendMessage(jid, content, options);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {object} Connection status
   */
  getConnectionStatus() {
    if (!this.sock) {
      return { connected: false };
    }
    
    return {
      connected: this.sock.user !== undefined,
      user: this.sock.user
    };
  }

  /**
   * Logout and end the session
   * @returns {Promise<boolean>} Success status
   */
  async logout() {
    if (!this.sock) {
      return false;
    }
    
    try {
      await this.sock.logout();
      this.sock = null;
      return true;
    } catch (error) {
      this.logger.error('Failed to logout:', error);
      return false;
    }
  }
}

// Export the BaileysJS class and a factory function
module.exports = {
  BaileysJS,
  createBaileysJS: (config) => new BaileysJS(config)
};
