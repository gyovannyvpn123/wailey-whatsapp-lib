/**
 * Wailey-library Decode Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Convert any Uint8Array/Buffer to a Buffer
 */
export declare const toBuffer: (data: Uint8Array | Buffer | ArrayBuffer) => Buffer;
/**
 * Encode a number as a big-endian buffer
 */
export declare const encodeBigEndian: (num: number, bytes: number) => Buffer;
/**
 * Decode a big-endian buffer to a number
 */
export declare const decodeBigEndian: (buffer: Buffer, offset?: number) => number;
/**
 * Converts a buffer to a UTF-8 string
 */
export declare const bufferToString: (buffer: Buffer | Uint8Array | null) => string;
/**
 * Converts a string to a buffer
 */
export declare const stringToBuffer: (str: string) => Buffer;
/**
 * Reads a specific number of bytes from a buffer at an offset
 */
export declare const readBytes: (buffer: Buffer, offset: number, length: number) => Buffer;
/**
 * Combines multiple buffers into one
 */
export declare const concatBuffers: (buffers: (Buffer | Uint8Array)[]) => Buffer;
