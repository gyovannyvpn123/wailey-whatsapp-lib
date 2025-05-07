/**
 * Wailey-library Signal Protocol Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Signal protocol encryption
 * @param buffer - data to encrypt
 * @param key - encryption key
 */
export declare const signalEncrypt: (buffer: Buffer, key: Buffer) => Buffer<ArrayBuffer>;
/**
 * Signal protocol decryption
 * @param buffer - data to decrypt
 * @param key - decryption key
 */
export declare const signalDecrypt: (buffer: Buffer, key: Buffer) => Buffer<ArrayBuffer>;
/**
 * Generates a pair of Signal Protocol keys
 */
export declare const generateSignalKeys: () => {
    identityKey: Buffer<ArrayBufferLike>;
    signedPreKey: {
        keyPair: Buffer<ArrayBufferLike>;
        signature: Buffer<ArrayBufferLike>;
        keyId: number;
    };
    registrationId: number;
};
