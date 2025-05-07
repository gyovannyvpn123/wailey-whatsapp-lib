/**
 * Utility functions for Wailey WhatsApp Library
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Create a delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensure that the session directory exists
 * @param {string} sessionDir - Path to session directory
 */
function ensureSessionDir(sessionDir) {
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log(`Created session directory: ${sessionDir}`);
  }
}

/**
 * Check if a session exists
 * @param {string} sessionDir - Path to session directory
 * @returns {boolean} Whether session exists
 */
function isSessionExists(sessionDir) {
  if (!fs.existsSync(sessionDir)) {
    return false;
  }
  
  // Check if auth_info_baileys.json exists
  const authFile = path.join(sessionDir, 'creds.json');
  return fs.existsSync(authFile);
}

/**
 * Format phone number to WhatsApp ID format
 * @param {string} phoneNumber - Phone number
 * @returns {string} WhatsApp ID
 */
function formatWhatsAppJid(phoneNumber) {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  return `${digits}@s.whatsapp.net`;
}

/**
 * Check if an error is a Baileys connection error
 * @param {Error} error - The error to check
 * @returns {boolean} Whether it's a connection error
 */
function isBaileysConnectionError(error) {
  return [
    'connection closed',
    'lost connection',
    'stream:error',
    'timed out'
  ].some(message => 
    (typeof error === 'string' && error.includes(message)) || 
    (error?.message && error.message.includes(message))
  );
}

module.exports = {
  delay,
  ensureSessionDir,
  isSessionExists,
  formatWhatsAppJid,
  isBaileysConnectionError
};
