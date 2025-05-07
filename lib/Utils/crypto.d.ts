/**
 * Wailey-library Crypto Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Generates a SignalProtocol-compatible public key
 */
export declare const generateSignalPubKey: () => Buffer<ArrayBufferLike>;
/**
 * HMAC sign a message with a key
 * @param data - the data to sign
 * @param key - the key to sign with
 */
export declare const hmacSign: (data: Buffer, key: Buffer) => Buffer<ArrayBufferLike>;
/**
 * Encrypt using AES-256-CBC
 * @param data - the data to encrypt
 * @param key - the key to encrypt with (must be 32 bytes)
 * @param iv - the initialization vector (must be 16 bytes)
 */
export declare const aesEncrypt: (data: Buffer, key: Buffer, iv: Buffer) => Buffer<ArrayBuffer>;
/**
 * Decrypt using AES-256-CBC
 * @param data - the data to decrypt
 * @param key - the key to decrypt with (must be 32 bytes)
 * @param iv - the initialization vector (must be 16 bytes)
 */
export declare const aesDecrypt: (data: Buffer, key: Buffer, iv: Buffer) => Buffer<ArrayBuffer>;
/**
 * HKDF derivation for media keys
 * @param mediaKey - the media key
 * @param type - the type of media
 */
export declare const hkdfMediaKey: (mediaKey: Buffer, type: string) => {
    iv: Buffer<ArrayBuffer>;
    encKey: Buffer<ArrayBuffer>;
    macKey: Buffer<ArrayBuffer>;
};
/**
 * Generate a random IV for encryption
 */
export declare const randomIV: () => Buffer<ArrayBufferLike>;
/**
 * Computes HMAC-SHA256 of a message using a key
 * @param message - the message to sign
 * @param key - the key to sign with
 */
export declare const hmac256: (message: Buffer, key: Buffer) => Buffer<ArrayBufferLike>;
/**
 * Derives keys using HKDF
 * @param key - the master key
 * @param length - the length of the derived key
 * @param info - optional context info
 */
export declare const deriveKeys: (key: Buffer, length: number, info?: Buffer) => Buffer<ArrayBufferLike>;
/**
 * Creates a challenge for authentication
 */
export declare const createChallenge: () => Buffer<ArrayBufferLike>;
/**
 * Verifies a challenge response
 * @param challenge - the original challenge
 * @param response - the response to verify
 * @param key - the key used for verification
 */
export declare const verifyChallenge: (challenge: Buffer, response: Buffer, key: Buffer) => boolean;
