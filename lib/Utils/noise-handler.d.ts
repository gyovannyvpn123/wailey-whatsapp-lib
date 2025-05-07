/**
 * Wailey-library Noise Protocol Handler
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Implementation of the Noise Protocol (XX pattern) for secure communication
 * This is used by WhatsApp for establishing secure connections
 */
export declare const makeNoiseHandler: () => {
    performHandshake: (peerPubKey: Buffer) => {
        ephemeralPubKey: Buffer<ArrayBufferLike>;
        encKey: Buffer<ArrayBufferLike>;
        decKey: Buffer<ArrayBufferLike>;
        handshakeHash: Buffer<ArrayBufferLike>;
    };
    encrypt: (data: Buffer) => Buffer;
    decrypt: (data: Buffer) => Buffer;
    localEphemeralKeyPair: {
        privateKey: Buffer<ArrayBufferLike>;
        publicKey: Buffer<ArrayBufferLike>;
    };
    handshakeHash: () => Buffer<ArrayBufferLike>;
};
