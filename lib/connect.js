/**
 * WhatsApp connection functionality
 */

'use strict';

const { default: makeWASocket, fetchLatestBaileysVersion, generatePairingCode } = require('@whiskeysockets/baileys');
const { delay } = require('./utils');

/**
 * Connect to WhatsApp
 * @param {Object} options - Connection options
 * @returns {Promise<Object>} Connection result
 */
async function connectToWhatsApp(options) {
  const {
    logger,
    printQRInTerminal = true,
    auth,
    browser = ['Wailey WhatsApp Library', 'Chrome', '112.0.5615.49'],
    version,
    qrTimeout = 30000,
    qrCallback,
    pairingCode = false,
    phoneNumber = ''
  } = options;

  try {
    // Fetch the latest version of WhatsApp Web
    const { version: baileyVersion } = await fetchLatestBaileysVersion();
    const socketVersion = version || baileyVersion;

    // Create socket connection
    const sock = makeWASocket({
      version: socketVersion,
      logger,
      printQRInTerminal,
      auth,
      browser,
      // Important: Don't set getMessage for normal connection
      ...(pairingCode ? {
        getMessage: async () => {
          return { conversation: 'hello' };
        }
      } : {}),
      qrTimeout
    });

    // Set up QR code callback if provided
    if (qrCallback && typeof qrCallback === 'function') {
      // Wait for connection update that includes QR code
      const qrPromise = new Promise((resolve) => {
        const connectionUpdateHandler = ({ qr }) => {
          if (qr) {
            qrCallback(qr);
            sock.ev.off('connection.update', connectionUpdateHandler);
            resolve();
          }
        };
        sock.ev.on('connection.update', connectionUpdateHandler);
        
        // Set a timeout to avoid hanging forever
        setTimeout(() => {
          sock.ev.off('connection.update', connectionUpdateHandler);
          resolve();
        }, qrTimeout);
      });
      
      // Wait briefly for initial connection update events
      await qrPromise;
    }

    // Handle pairing code generation if requested
    let generatedPairingCode = null;
    if (pairingCode && phoneNumber) {
      try {
        // Wait for socket to be ready before generating pairing code
        await delay(3000);
        generatedPairingCode = await generatePairingCode(sock, phoneNumber);
        console.log(`Pairing code generated: ${generatedPairingCode}`);
      } catch (error) {
        console.error('Failed to generate pairing code:', error);
        throw new Error(`Pairing code generation failed: ${error.message}`);
      }
    }

    return {
      sock,
      code: generatedPairingCode
    };
  } catch (error) {
    console.error('WhatsApp connection error:', error);
    throw error;
  }
}

module.exports = { connectToWhatsApp };
