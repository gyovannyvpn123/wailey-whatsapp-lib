/**
 * Wailey WhatsApp Library
 * Fixed version with proper requestPairingCode support
 */

const Client = require('./lib/client');
const { Events, ClientStates } = require('./lib/constants');

/**
 * Create a new WhatsApp client instance
 * @param {Object} options - Configuration options
 * @returns {Client} A new client instance
 */
function create(options = {}) {
    return new Client(options);
}

// Ensure requestPairingCode is properly exposed
const clientProto = Client.prototype;
if (typeof clientProto.requestPairingCode !== 'function') {
    console.warn('requestPairingCode is not properly defined in Client prototype. Adding it from baileys.');
    
    /**
     * Request a pairing code for phone number authentication
     * @param {string} phoneNumber - Phone number in international format
     * @returns {Promise<string>} - The pairing code
     */
    clientProto.requestPairingCode = async function(phoneNumber) {
        if (!this.socket) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        
        // Validate and format the phone number
        const formattedNumber = phoneNumber.startsWith('+') ? 
            phoneNumber : 
            `+${phoneNumber.replace(/\D/g, '')}`;
        
        try {
            console.log(`Requesting pairing code for: ${formattedNumber}`);
            const result = await this.socket.requestPairingCode(formattedNumber);
            this.emit(Events.PAIRING_CODE, result);
            return result;
        } catch (error) {
            console.error('Error requesting pairing code:', error);
            this.emit(Events.ERROR, error);
            throw error;
        }
    };
}

module.exports = {
    create,
    Events,
    ClientStates
};
