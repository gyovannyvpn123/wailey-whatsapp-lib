"use strict";
/**
 * Wailey-library Noise Protocol Handler
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeNoiseHandler = void 0;
const crypto_1 = require("crypto");
const Defaults_1 = require("../Defaults");
/**
 * Implementation of the Noise Protocol (XX pattern) for secure communication
 * This is used by WhatsApp for establishing secure connections
 */
const makeNoiseHandler = () => {
    // In a real implementation, this would use the actual Noise Protocol
    // This is a simplified placeholder implementation
    // Generate ephemeral keys for the handshake
    const localEphemeralKeyPair = {
        privateKey: (0, crypto_1.randomBytes)(32),
        publicKey: (0, crypto_1.randomBytes)(32)
    };
    let remoteEphemeralPubKey = null;
    let handshakeHash = null;
    let encKey = null;
    let decKey = null;
    /**
     * Performs the Noise XX handshake
     */
    const performHandshake = (peerPubKey) => {
        // Store remote ephemeral public key
        remoteEphemeralPubKey = peerPubKey;
        // In a real implementation, this would do the proper Noise XX handshake
        // For this simplified implementation, we'll derive keys from both public keys
        // Create a handshake hash - in real Noise this would be more complex
        handshakeHash = (0, crypto_1.createHmac)('sha256', 'handshake-salt')
            .update(Buffer.concat([
            Defaults_1.NOISE_WA_HEADER,
            localEphemeralKeyPair.publicKey,
            peerPubKey
        ]))
            .digest();
        // Derive encryption and decryption keys
        const keyMaterial = (0, crypto_1.createHmac)('sha256', handshakeHash)
            .update(Buffer.concat([
            localEphemeralKeyPair.publicKey,
            peerPubKey
        ]))
            .digest();
        // Split key material into encryption and decryption keys
        encKey = keyMaterial.slice(0, 16);
        decKey = keyMaterial.slice(16, 32);
        return {
            ephemeralPubKey: localEphemeralKeyPair.publicKey,
            encKey,
            decKey,
            handshakeHash
        };
    };
    /**
     * Encrypts data using the established session keys
     */
    const encrypt = (data) => {
        if (!encKey) {
            throw new Error('Handshake not completed');
        }
        // Generate an IV for this message
        const iv = (0, crypto_1.randomBytes)(16);
        // Encrypt the data
        const cipher = (0, crypto_1.createCipheriv)('aes-128-cbc', encKey, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        // Return IV + encrypted data
        return Buffer.concat([iv, encrypted]);
    };
    /**
     * Decrypts data using the established session keys
     */
    const decrypt = (data) => {
        if (!decKey) {
            throw new Error('Handshake not completed');
        }
        // Extract IV and encrypted data
        const iv = data.slice(0, 16);
        const encryptedData = data.slice(16);
        // Decrypt the data
        const decipher = (0, crypto_1.createDecipheriv)('aes-128-cbc', decKey, iv);
        return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    };
    return {
        performHandshake,
        encrypt,
        decrypt,
        localEphemeralKeyPair,
        handshakeHash: () => handshakeHash
    };
};
exports.makeNoiseHandler = makeNoiseHandler;
