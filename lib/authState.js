/**
 * Authentication state management
 */

'use strict';

const { useMultiFileAuthState, initAuthCreds, proto } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

/**
 * Create auth state for the WhatsApp session
 * @param {string} sessionDir - Path to session directory
 * @returns {Promise<Object>} Auth state and saveCreds function
 */
async function createAuthState(sessionDir) {
  try {
    // Ensure the session directory exists
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      console.log(`Created session directory: ${sessionDir}`);
    }

    // Check if we need to initialize a new auth state
    const needsInit = !fs.existsSync(path.join(sessionDir, 'creds.json'));
    
    // Use multi-file auth state from Baileys
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // If this is a new session, ensure proper initialization of credentials
    if (needsInit) {
      console.log(`Initializing new auth credentials for session: ${path.basename(sessionDir)}`);
      // Ensure proper initialization of auth state for a new session
      state.creds = initAuthCreds();
    }
    
    // Create a wrapped saveCreds function that logs and handles errors
    const wrappedSaveCreds = async () => {
      try {
        await saveCreds();
        return true;
      } catch (error) {
        console.error('Error saving credentials:', error);
        return false;
      }
    };
    
    return { state, saveCreds: wrappedSaveCreds };
  } catch (error) {
    console.error('Error creating auth state:', error);
    throw new Error(`Failed to create auth state: ${error.message}`);
  }
}

/**
 * Save authentication state
 * @param {string} sessionDir - Path to session directory
 * @param {Object} state - Auth state to save
 */
async function saveState(sessionDir, state) {
  try {
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Save auth credentials
    const credsPath = path.join(sessionDir, 'creds.json');
    fs.writeFileSync(credsPath, JSON.stringify(state.creds, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error saving auth state:', error);
    return false;
  }
}

/**
 * Clear authentication state
 * @param {string} sessionDir - Path to session directory
 * @returns {Promise<boolean>} Whether clearing succeeded
 */
async function clearAuthState(sessionDir) {
  try {
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log(`Cleared session directory: ${sessionDir}`);
    }
    return true;
  } catch (error) {
    console.error('Error clearing auth state:', error);
    return false;
  }
}

module.exports = { createAuthState, saveState, clearAuthState };
