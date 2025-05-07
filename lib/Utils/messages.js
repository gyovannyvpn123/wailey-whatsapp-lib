"use strict";
/**
 * Wailey-library Message Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentType = exports.downloadContentFromMessage = void 0;
/**
 * Downloads and processes message content
 */
const downloadContentFromMessage = async (message, type) => {
    // In a real implementation, this would download and process message content
    // based on its type (image, video, audio, etc.)
    // This is a simplified placeholder implementation
    var _a, _b, _c, _d, _e;
    // Extract the URL from the message based on type
    let url = '';
    switch (type) {
        case 'image':
            url = ((_a = message.imageMessage) === null || _a === void 0 ? void 0 : _a.url) || '';
            break;
        case 'video':
            url = ((_b = message.videoMessage) === null || _b === void 0 ? void 0 : _b.url) || '';
            break;
        case 'audio':
            url = ((_c = message.audioMessage) === null || _c === void 0 ? void 0 : _c.url) || '';
            break;
        case 'document':
            url = ((_d = message.documentMessage) === null || _d === void 0 ? void 0 : _d.url) || '';
            break;
        case 'sticker':
            url = ((_e = message.stickerMessage) === null || _e === void 0 ? void 0 : _e.url) || '';
            break;
        default:
            throw new Error(`Unsupported media type: ${type}`);
    }
    // In a real implementation, we would fetch the data from this URL
    // For now, we'll just return a mock stream
    const stream = {
        async read() {
            // Mock implementation
            return Buffer.from(`Mock ${type} content`);
        }
    };
    return stream;
};
exports.downloadContentFromMessage = downloadContentFromMessage;
/**
 * Gets the content type of a message
 */
const getContentType = (message) => {
    if (!message) {
        return undefined;
    }
    if (message.imageMessage)
        return 'imageMessage';
    if (message.videoMessage)
        return 'videoMessage';
    if (message.audioMessage)
        return 'audioMessage';
    if (message.stickerMessage)
        return 'stickerMessage';
    if (message.documentMessage)
        return 'documentMessage';
    if (message.conversation)
        return 'conversation';
    if (message.extendedTextMessage)
        return 'extendedTextMessage';
    if (message.contactMessage)
        return 'contactMessage';
    if (message.locationMessage)
        return 'locationMessage';
    if (message.reactionMessage)
        return 'reactionMessage';
    return undefined;
};
exports.getContentType = getContentType;
