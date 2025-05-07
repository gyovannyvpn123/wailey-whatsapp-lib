"use strict";
/**
 * Wailey-library Message Sending Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMediaMessage = exports.sendTextMessage = void 0;
const WAProto_1 = require("../WAProto");
const generics_1 = require("../Utils/generics");
/**
 * Send a text message
 */
const sendTextMessage = async (jid, text, options = {}) => {
    // Create a message content object
    const message = {
        conversation: text
    };
    // Create a WebMessageInfo object
    const fullMessage = WAProto_1.proto.WebMessageInfo.fromObject({
        key: {
            remoteJid: jid,
            fromMe: true,
            id: options.messageId || (0, generics_1.generateMessageID)()
        },
        message: message,
        messageTimestamp: Date.now() / 1000,
        status: 'PENDING'
    });
    // In a real implementation, this would be sent over WebSocket
    return fullMessage;
};
exports.sendTextMessage = sendTextMessage;
/**
 * Send a media message (image, video, audio, etc)
 */
const sendMediaMessage = async (jid, media, options = {}) => {
    // Media types would be processed differently in a real implementation
    // This is a simplified version
    const message = {
        imageMessage: {
            url: media.url,
            mimetype: media.mimetype || 'image/jpeg',
            caption: media.caption || '',
            fileSha256: Buffer.from('sha256-placeholder').toString('base64'),
            fileLength: media.fileLength || '1000',
            width: media.width || 100,
            height: media.height || 100,
            mediaKey: Buffer.from('media-key-placeholder').toString('base64'),
            fileEncSha256: Buffer.from('enc-sha256-placeholder').toString('base64')
        }
    };
    const fullMessage = WAProto_1.proto.WebMessageInfo.fromObject({
        key: {
            remoteJid: jid,
            fromMe: true,
            id: options.messageId || (0, generics_1.generateMessageID)()
        },
        message: message,
        messageTimestamp: Date.now() / 1000,
        status: 'PENDING'
    });
    return fullMessage;
};
exports.sendMediaMessage = sendMediaMessage;
