"use strict";
/**
 * Wailey-library Authentication State Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authState = void 0;
const crypto_1 = require("crypto");
const crypto_2 = require("./crypto");
/**
 * Manages authentication state
 */
exports.authState = {
    /**
     * Creates an empty authentication state
     */
    createEmptyAuthState: () => {
        const creds = {
            noiseKey: (0, crypto_2.generateSignalPubKey)(),
            signedIdentityKey: (0, crypto_2.generateSignalPubKey)(),
            signedPreKey: {
                keyPair: (0, crypto_2.generateSignalPubKey)(),
                signature: (0, crypto_1.randomBytes)(64),
                keyId: (0, crypto_1.randomBytes)(2).readUInt16BE(0)
            },
            registrationId: (0, crypto_1.randomBytes)(2).readUInt16BE(0),
            advSecretKey: (0, crypto_1.randomBytes)(32),
            processedHistoryMessages: [],
            nextPreKeyId: 1,
            firstUnuploadedPreKeyId: 1,
            accountSyncCounter: 0,
            accountSettings: {
                unarchiveChats: false
            },
            deviceId: (0, crypto_1.randomBytes)(16).toString('hex'),
            phoneId: (0, crypto_1.randomBytes)(16).toString('hex'),
            identityId: (0, crypto_1.randomBytes)(16).toString('hex'),
            backupToken: (0, crypto_1.randomBytes)(16),
            registered: false,
            platform: 'android'
        };
        const keys = {};
        return {
            creds,
            keys
        };
    },
    /**
     * Save authentication state to storage
     */
    saveAuthState: async (authState, storage) => {
        if (typeof storage === 'string') {
            // Assuming storage is a path to a file
            const fs = require('fs');
            const path = require('path');
            // Ensure directory exists
            const dir = path.dirname(storage);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Save auth state to file
            fs.writeFileSync(storage, JSON.stringify(authState, (_, value) => {
                if (value instanceof Uint8Array || value instanceof Buffer) {
                    return {
                        type: 'Buffer',
                        data: Array.from(value)
                    };
                }
                return value;
            }, 2));
        }
        else if (typeof storage === 'object' && storage !== null) {
            // Assuming storage is an object with set method
            await storage.set('auth_state', JSON.stringify(authState));
        }
    },
    /**
     * Load authentication state from storage
     */
    loadAuthState: async (storage) => {
        let authState;
        if (typeof storage === 'string') {
            // Assuming storage is a path to a file
            const fs = require('fs');
            // Check if file exists
            if (fs.existsSync(storage)) {
                // Load auth state from file
                const data = fs.readFileSync(storage, { encoding: 'utf8' });
                authState = JSON.parse(data, (_, value) => {
                    if (value && typeof value === 'object' && value.type === 'Buffer') {
                        return Buffer.from(value.data);
                    }
                    return value;
                });
            }
        }
        else if (typeof storage === 'object' && storage !== null) {
            // Assuming storage is an object with get method
            const data = await storage.get('auth_state');
            if (data) {
                authState = JSON.parse(data, (_, value) => {
                    if (value && typeof value === 'object' && value.type === 'Buffer') {
                        return Buffer.from(value.data);
                    }
                    return value;
                });
            }
        }
        if (!authState) {
            // Return empty auth state if none found
            return authState.createEmptyAuthState();
        }
        return authState;
    }
};
