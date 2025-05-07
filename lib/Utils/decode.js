"use strict";
/**
 * Wailey-library Decode Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatBuffers = exports.readBytes = exports.stringToBuffer = exports.bufferToString = exports.decodeBigEndian = exports.encodeBigEndian = exports.toBuffer = void 0;
/**
 * Convert any Uint8Array/Buffer to a Buffer
 */
const toBuffer = (data) => {
    if (Buffer.isBuffer(data)) {
        return data;
    }
    if (data instanceof ArrayBuffer) {
        return Buffer.from(data);
    }
    if (data instanceof Uint8Array) {
        return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    throw new Error('Unsupported data type, expected Buffer/Uint8Array/ArrayBuffer');
};
exports.toBuffer = toBuffer;
/**
 * Encode a number as a big-endian buffer
 */
const encodeBigEndian = (num, bytes) => {
    // Create a buffer of the specified size
    const buf = Buffer.alloc(bytes);
    // Write the number in big-endian format
    for (let i = bytes - 1; i >= 0; i--) {
        const shift = i * 8;
        buf[bytes - 1 - i] = (num >> shift) & 0xff;
    }
    return buf;
};
exports.encodeBigEndian = encodeBigEndian;
/**
 * Decode a big-endian buffer to a number
 */
const decodeBigEndian = (buffer, offset = 0) => {
    let value = 0;
    for (let i = 0; i < buffer.length - offset; i++) {
        value = (value << 8) + buffer[i + offset];
    }
    return value;
};
exports.decodeBigEndian = decodeBigEndian;
/**
 * Converts a buffer to a UTF-8 string
 */
const bufferToString = (buffer) => {
    if (!buffer)
        return '';
    const buf = (0, exports.toBuffer)(buffer);
    return buf.toString('utf-8');
};
exports.bufferToString = bufferToString;
/**
 * Converts a string to a buffer
 */
const stringToBuffer = (str) => {
    return Buffer.from(str, 'utf-8');
};
exports.stringToBuffer = stringToBuffer;
/**
 * Reads a specific number of bytes from a buffer at an offset
 */
const readBytes = (buffer, offset, length) => {
    if (offset + length > buffer.length) {
        throw new Error('Read operation out of bounds');
    }
    return buffer.slice(offset, offset + length);
};
exports.readBytes = readBytes;
/**
 * Combines multiple buffers into one
 */
const concatBuffers = (buffers) => {
    // Convert all to buffers first
    const bufs = buffers.map(b => (0, exports.toBuffer)(b));
    return Buffer.concat(bufs);
};
exports.concatBuffers = concatBuffers;
