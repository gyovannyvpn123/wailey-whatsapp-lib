"use strict";
/**
 * Wailey-library Legacy Message Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLegacyMessage = exports.downloadAndProcessHistorySyncNotification = void 0;
const history_1 = require("./history");
/**
 * Downloads and processes history sync notification
 * @param message - the history sync notification message
 */
const downloadAndProcessHistorySyncNotification = async (message) => {
    // In a real implementation, this would download and process history sync data
    // This is a simplified placeholder implementation
    // Check if the message has a historySyncNotification
    if (!message ||
        !message.message ||
        !message.message.protocolMessage ||
        !message.message.protocolMessage.historySyncNotification) {
        return null;
    }
    const historySync = message.message.protocolMessage.historySyncNotification;
    // Process messages (in a real implementation, we would download and decrypt)
    return (0, history_1.extractHistoryMessages)({
        chats: [],
        messages: [],
        contacts: [],
        progress: historySync.progress || 'COMPLETE'
    });
};
exports.downloadAndProcessHistorySyncNotification = downloadAndProcessHistorySyncNotification;
/**
 * Converts a legacy message to the new format
 * @param message - the legacy format message to convert
 */
const convertLegacyMessage = (message) => {
    // In a real implementation, this would convert between message formats
    // This is a simplified placeholder implementation
    if (!message) {
        return null;
    }
    // Check if the message already has the new format
    if (message.message && message.key && message.participant) {
        // Already in the new format, return as is
        return message;
    }
    // Simple conversion for text messages
    if (typeof message.text === 'string') {
        return {
            key: {
                remoteJid: message.from || message.chatId || '',
                fromMe: message.fromMe || false,
                id: message.id || `legacy_${Date.now()}`
            },
            message: {
                conversation: message.text
            },
            messageTimestamp: message.timestamp || Math.floor(Date.now() / 1000),
            participant: message.participant
        };
    }
    // For other types, we'd need more complex conversion logic
    return null;
};
exports.convertLegacyMessage = convertLegacyMessage;
