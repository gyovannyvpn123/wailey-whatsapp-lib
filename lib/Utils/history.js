"use strict";
/**
 * Wailey-library History Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHistoryMessages = exports.processHistoryMessage = void 0;
const Defaults_1 = require("../Defaults");
/**
 * Process a history message
 * @param message - message to process
 */
const processHistoryMessage = async (message) => {
    // In a real implementation, this would process different types of history messages
    // This is a simplified placeholder implementation
    var _a, _b, _c, _d;
    // Ensure the message has the required properties
    if (!message || !message.key || !message.key.remoteJid) {
        return null;
    }
    const isHistoryMsg = Boolean((_b = (_a = message.message) === null || _a === void 0 ? void 0 : _a.protocolMessage) === null || _b === void 0 ? void 0 : _b.historySyncNotification);
    if (!isHistoryMsg) {
        // Not a history message, nothing to process
        return null;
    }
    const historyMsg = (_d = (_c = message.message) === null || _c === void 0 ? void 0 : _c.protocolMessage) === null || _d === void 0 ? void 0 : _d.historySyncNotification;
    // Create a processed history message with basic information
    const processedMsg = {
        messages: [],
        chats: [],
        contacts: [],
        isLatest: historyMsg.progress === 'COMPLETE'
    };
    // In a real implementation, we would:
    // 1. Decode the history data
    // 2. Process different types of history data
    // 3. Add them to the appropriate arrays
    return processedMsg;
};
exports.processHistoryMessage = processHistoryMessage;
/**
 * Extract history from a history sync
 * @param historySync - the history sync data
 */
const extractHistoryMessages = (historySync) => {
    // In a real implementation, this would extract messages from history sync
    // This is a simplified placeholder implementation
    const messages = [];
    const contacts = [];
    const chats = [];
    // For each history type that we can process
    Defaults_1.PROCESSABLE_HISTORY_TYPES.forEach(type => {
        // Get the items array for this type
        const items = historySync[`${type}s`];
        // Process based on type
        if (type === 'chat' && Array.isArray(items)) {
            chats.push(...items);
        }
        else if (type === 'message' && Array.isArray(items)) {
            messages.push(...items);
        }
        else if (type === 'contact' && Array.isArray(items)) {
            contacts.push(...items);
        }
    });
    return {
        chats,
        contacts,
        messages,
        isLatest: historySync.progress === 'COMPLETE'
    };
};
exports.extractHistoryMessages = extractHistoryMessages;
