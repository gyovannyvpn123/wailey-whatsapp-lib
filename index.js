/**
 * wailey-whatsapp-lib - O bibliotecă modernă pentru WhatsApp
 * Bazată pe @whiskeysockets/baileys
 */

const Client = require('./lib/client');
const Constants = require('./lib/constants');

/**
 * Create a new WhatsApp client
 * @param {Object} options Client options
 * @returns {Client} A new client instance
 */
function create(options = {}) {
    return new Client(options);
}

module.exports = {
    create,
    Client,
    Events: Constants.Events,
    ConnectionState: Constants.ConnectionState,
    MessageType: Constants.MessageType,
    Browsers: Constants.Browsers
};