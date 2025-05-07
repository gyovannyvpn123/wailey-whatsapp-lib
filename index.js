/**
 * Wailey WhatsApp Library
 * Modified to support phone number pairing codes alongside QR code authentication
 * 
 * @author Original: wailey-whatsapp-lib
 * @author Modified: gyovannyvpn123
 */

const Client = require('./lib/client');

module.exports = {
    /**
     * Create a new WhatsApp client instance
     * @param {Object} options - Configuration options
     * @returns {Client} A new client instance
     */
    create: (options = {}) => {
        return new Client(options);
    },
    
    // Export all client events as constants
    Events: {
        AUTHENTICATED: 'authenticated',
        AUTHENTICATION_FAILURE: 'auth_failure',
        READY: 'ready',
        MESSAGE: 'message',
        QR_CODE: 'qr',
        PAIRING_CODE: 'pairing_code',
        DISCONNECTED: 'disconnected',
        ERROR: 'error',
        CONNECTION_UPDATE: 'connection.update'
    }
};
