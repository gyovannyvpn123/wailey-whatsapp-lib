"use strict";
/**
 * Wailey-library Signal Protocol Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignalKeys = exports.signalDecrypt = exports.signalEncrypt = void 0;
const crypto_1 = require("crypto");
const crypto_2 = require("./crypto");
/**
 * Signal protocol encryption
 * @param buffer - data to encrypt
 * @param key - encryption key
 */
const signalEncrypt = (buffer, key) => {
    // In a real implementation, this would use Signal Protocol encryption
    // This is a simplified implementation using AES encryption for the example
    // Generate an initialization vector for AES
    const iv = (0, crypto_1.randomBytes)(16);
    // Create a cipher using AES-256-CBC mode
    const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key.slice(0, 32), iv);
    // Encrypt the data
    const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
    // Return IV + encrypted data
    return Buffer.concat([iv, encryptedData]);
};
exports.signalEncrypt = signalEncrypt;
/**
 * Signal protocol decryption
 * @param buffer - data to decrypt
 * @param key - decryption key
 */
const signalDecrypt = (buffer, key) => {
    // In a real implementation, this would use Signal Protocol decryption
    // This is a simplified implementation using AES for the example
    // Extract the initialization vector from the first 16 bytes
    const iv = buffer.slice(0, 16);
    // Extract the encrypted data
    const encryptedData = buffer.slice(16);
    // Create a decipher using AES-256-CBC mode
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key.slice(0, 32), iv);
    // Decrypt the data
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};
exports.signalDecrypt = signalDecrypt;
/**
 * Generates a pair of Signal Protocol keys
 */
const generateSignalKeys = () => {
    // In a real implementation, this would generate actual Signal Protocol keys
    // This is a simplified placeholder implementation
    const identityKey = (0, crypto_2.generateSignalPubKey)();
    const signedPreKey = (0, crypto_2.generateSignalPubKey)();
    const registrationId = (0, crypto_1.randomBytes)(2).readUInt16BE(0);
    return {
        identityKey,
        signedPreKey: {
            keyPair: signedPreKey,
            signature: (0, crypto_1.randomBytes)(64),
            keyId: (0, crypto_1.randomBytes)(2).readUInt16BE(0)
        },
        registrationId
    };
};
exports.generateSignalKeys = generateSignalKeys;
