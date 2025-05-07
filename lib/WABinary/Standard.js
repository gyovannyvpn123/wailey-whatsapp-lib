"use strict";
/**
 * Wailey-library WABinary Standard Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBinaryNodeLegacy = exports.encodeBinaryNodeLegacy = exports.StandardDictionary = void 0;
const Defaults_1 = require("../Defaults");
/**
 * Token mapping for WhatsApp protocol
 */
var WATags;
(function (WATags) {
    WATags[WATags["LIST_EMPTY"] = 0] = "LIST_EMPTY";
    WATags[WATags["STREAM_END"] = 2] = "STREAM_END";
    WATags[WATags["DICTIONARY_0"] = 236] = "DICTIONARY_0";
    WATags[WATags["DICTIONARY_1"] = 237] = "DICTIONARY_1";
    WATags[WATags["DICTIONARY_2"] = 238] = "DICTIONARY_2";
    WATags[WATags["DICTIONARY_3"] = 239] = "DICTIONARY_3";
    WATags[WATags["LIST_8"] = 248] = "LIST_8";
    WATags[WATags["LIST_16"] = 249] = "LIST_16";
    WATags[WATags["JID_PAIR"] = 250] = "JID_PAIR";
    WATags[WATags["HEX_8"] = 251] = "HEX_8";
    WATags[WATags["BINARY_8"] = 252] = "BINARY_8";
    WATags[WATags["BINARY_20"] = 253] = "BINARY_20";
    WATags[WATags["BINARY_32"] = 254] = "BINARY_32";
    WATags[WATags["NIBBLE_8"] = 255] = "NIBBLE_8";
})(WATags || (WATags = {}));
/**
 * Standard tag dictionary for protocol v2
 */
exports.StandardDictionary = [
    '', // List empty token
    'message',
    'action',
    'response',
    'query',
    'iq',
    'notification',
    'presence',
    'status',
    'success',
    'failure',
    'media',
    'image',
    'video',
    'audio',
    'document',
    'sticker',
    'location',
    'contact',
    'stream',
    'session',
    'group',
    'user',
    'id',
    'type',
    'from',
    'to',
    'timestamp',
    'participant',
    'jid',
    'name',
    'phone',
    'content',
    'body',
    'caption',
    'url',
    'description',
    'preview',
    'size',
    'width',
    'height',
    'duration',
    'length',
    'latitude',
    'longitude',
    'title',
    'create',
    'update',
    'delete',
    'read',
    'add',
    'remove',
    'invite',
    'broadcast',
    'presence',
    'available',
    'unavailable',
    'busy',
    'away',
    'composing',
    'paused',
    'recording',
    'key',
    'value',
    'version',
    'device',
    'platform',
    'browser',
    'auth',
    'authenticate',
    'challenge',
    'signature',
    'ephemeral',
    'temporary',
    'permanent',
    'error',
    'code',
    'reason',
    'context',
    'data',
    'priority',
    'normal',
    'high',
    'urgent',
    'low',
    'options',
    'settings',
    'config',
    'encryption',
    'verified',
    'chat',
    'conversation',
    'history',
    'sync',
    'status',
    'online',
    'offline',
    'typing',
    'new',
    'old',
    'notify',
    'subscribe',
    'unsubscribe',
    'message',
    'receipt',
    'delivered',
    'seen',
    'played',
    'pending',
    'error',
    'retry',
    'result',
];
/**
 * Write string with dictionary compression
 */
const writeStringWithDictionary = (str, buffer, indexRef) => {
    const dictionaryIndex = exports.StandardDictionary.indexOf(str);
    if (dictionaryIndex >= 0) {
        if (dictionaryIndex < 245) {
            buffer[indexRef.index++] = dictionaryIndex;
        }
        else {
            buffer[indexRef.index++] = Defaults_1.DICT_VERSION;
            buffer[indexRef.index++] = dictionaryIndex - 245;
        }
    }
    else {
        const bytes = Buffer.from(str, 'utf-8');
        if (bytes.length <= 125) {
            // String tokens
            buffer[indexRef.index++] = bytes.length;
            bytes.copy(buffer, indexRef.index);
            indexRef.index += bytes.length;
        }
        else {
            throw new Error(`String too long: ${str}`);
        }
    }
};
/**
 * Read string with dictionary decompression
 */
const readStringWithDictionary = (buffer, indexRef) => {
    const firstByte = buffer[indexRef.index++];
    if (firstByte === WATags.DICTIONARY_0) {
        return exports.StandardDictionary[0];
    }
    else if (firstByte === WATags.DICTIONARY_1) {
        return exports.StandardDictionary[buffer[indexRef.index++] + 1];
    }
    else if (firstByte === WATags.DICTIONARY_2) {
        return exports.StandardDictionary[buffer[indexRef.index++] + 246];
    }
    else if (firstByte === WATags.DICTIONARY_3) {
        return exports.StandardDictionary[buffer[indexRef.index++] + 501];
    }
    else if (firstByte > 2 && firstByte < 236) {
        // String token (literal string)
        const stringLength = firstByte;
        const str = buffer.slice(indexRef.index, indexRef.index + stringLength).toString('utf-8');
        indexRef.index += stringLength;
        return str;
    }
    else if (firstByte < 243 && firstByte !== Defaults_1.DICT_VERSION) {
        return exports.StandardDictionary[firstByte];
    }
    else if (firstByte === Defaults_1.DICT_VERSION) {
        return exports.StandardDictionary[buffer[indexRef.index++] + 245];
    }
    else {
        throw new Error(`Invalid string token: ${firstByte}`);
    }
};
/**
 * Write attributes to buffer
 */
const writeAttributes = (attrs, buffer, indexRef) => {
    if (!attrs || Object.keys(attrs).length === 0) {
        buffer[indexRef.index++] = 0; // Empty attributes
        return;
    }
    for (const key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            writeStringWithDictionary(key, buffer, indexRef);
            writeStringWithDictionary(attrs[key], buffer, indexRef);
        }
    }
    buffer[indexRef.index++] = 0; // End of attributes
};
/**
 * Read attributes from buffer
 */
const readAttributes = (buffer, indexRef) => {
    const attrs = {};
    // Keep reading attributes until we hit a 0 (end of attributes)
    while (buffer[indexRef.index] !== 0) {
        const key = readStringWithDictionary(buffer, indexRef);
        const value = readStringWithDictionary(buffer, indexRef);
        attrs[key] = value;
    }
    indexRef.index++; // Skip the 0 byte (end of attributes)
    return attrs;
};
/**
 * Write content to buffer
 */
const writeContent = (content, buffer, indexRef) => {
    if (!content) {
        buffer[indexRef.index++] = WATags.LIST_EMPTY;
        return;
    }
    if (Buffer.isBuffer(content)) {
        // Binary content
        const length = content.length;
        if (length < 256) {
            // Binary token (8-bit length)
            buffer[indexRef.index++] = WATags.BINARY_8;
            buffer[indexRef.index++] = length;
        }
        else if (length < 1024 * 1024) {
            // Binary token (32-bit length)
            buffer[indexRef.index++] = WATags.BINARY_32;
            buffer.writeUInt32BE(length, indexRef.index);
            indexRef.index += 4;
        }
        else {
            throw new Error(`Binary too long: ${length} bytes`);
        }
        content.copy(buffer, indexRef.index);
        indexRef.index += length;
    }
    else if (Array.isArray(content)) {
        // List of elements
        const length = content.length;
        if (length === 0) {
            buffer[indexRef.index++] = WATags.LIST_EMPTY;
        }
        else if (length < 256) {
            // List token (8-bit length)
            buffer[indexRef.index++] = WATags.LIST_8;
            buffer[indexRef.index++] = length;
            // Write each element
            for (const element of content) {
                writeNode(element, buffer, indexRef);
            }
        }
        else {
            throw new Error(`List too long: ${length} elements`);
        }
    }
    else {
        throw new Error(`Unsupported content type: ${typeof content}`);
    }
};
/**
 * Read content from buffer
 */
const readContent = (buffer, indexRef) => {
    const firstByte = buffer[indexRef.index];
    if (firstByte === WATags.LIST_EMPTY) {
        indexRef.index++;
        return undefined;
    }
    else if (firstByte === WATags.BINARY_8) {
        indexRef.index++;
        const length = buffer[indexRef.index++];
        const data = Buffer.alloc(length);
        buffer.copy(data, 0, indexRef.index, indexRef.index + length);
        indexRef.index += length;
        return data;
    }
    else if (firstByte === WATags.BINARY_20) {
        indexRef.index++;
        const length = buffer.readUInt16BE(indexRef.index);
        indexRef.index += 2;
        const data = Buffer.alloc(length);
        buffer.copy(data, 0, indexRef.index, indexRef.index + length);
        indexRef.index += length;
        return data;
    }
    else if (firstByte === WATags.BINARY_32) {
        indexRef.index++;
        const length = buffer.readUInt32BE(indexRef.index);
        indexRef.index += 4;
        const data = Buffer.alloc(length);
        buffer.copy(data, 0, indexRef.index, indexRef.index + length);
        indexRef.index += length;
        return data;
    }
    else if (firstByte === WATags.LIST_8) {
        indexRef.index++;
        const length = buffer[indexRef.index++];
        const content = [];
        for (let i = 0; i < length; i++) {
            content.push(readNode(buffer, indexRef));
        }
        return content;
    }
    else if (firstByte === WATags.LIST_16) {
        indexRef.index++;
        const length = buffer.readUInt16BE(indexRef.index);
        indexRef.index += 2;
        const content = [];
        for (let i = 0; i < length; i++) {
            content.push(readNode(buffer, indexRef));
        }
        return content;
    }
    else {
        throw new Error(`Unsupported content token: ${firstByte}`);
    }
};
/**
 * Write node to buffer
 */
const writeNode = (node, buffer, indexRef) => {
    // Write the element description (tag)
    writeStringWithDictionary(node.tag, buffer, indexRef);
    // Write attributes
    writeAttributes(node.attrs, buffer, indexRef);
    // Write content
    writeContent(node.content, buffer, indexRef);
};
/**
 * Read node from buffer
 */
const readNode = (buffer, indexRef) => {
    // Read the element description (tag)
    const tag = readStringWithDictionary(buffer, indexRef);
    // Read attributes
    const attrs = readAttributes(buffer, indexRef);
    // Read content
    const content = readContent(buffer, indexRef);
    return { tag, attrs, content };
};
/**
 * Legacy encoder implementation for WhatsApp binary protocol
 */
const encodeBinaryNodeLegacy = (node) => {
    // Allocate a large buffer (we don't know the exact size in advance)
    const buffer = Buffer.alloc(1024 * 1024); // 1MB should be enough
    const indexRef = { index: 0 };
    writeNode(node, buffer, indexRef);
    // Return only the part of the buffer that was used
    return buffer.slice(0, indexRef.index);
};
exports.encodeBinaryNodeLegacy = encodeBinaryNodeLegacy;
/**
 * Legacy decoder implementation for WhatsApp binary protocol
 */
const decodeBinaryNodeLegacy = (buffer) => {
    const indexRef = { index: 0 };
    return readNode(buffer, indexRef);
};
exports.decodeBinaryNodeLegacy = decodeBinaryNodeLegacy;
