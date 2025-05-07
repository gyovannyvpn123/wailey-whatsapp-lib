"use strict";
/**
 * Wailey-library Validation Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMessageContent = exports.validatePhoneNumber = exports.validateUsername = exports.validateJID = void 0;
/**
 * Validates a JID (Jabber ID) format
 * @param jid - the JID to validate
 */
const validateJID = (jid) => {
    // Basic JID validation
    if (!jid || !jid.includes('@')) {
        throw new Error(`Invalid JID: ${jid}`);
    }
    // Check for specific WhatsApp JID formats
    if (!jid.endsWith('@s.whatsapp.net') &&
        !jid.endsWith('@g.us') &&
        !jid.endsWith('@c.us') &&
        !jid.endsWith('@broadcast')) {
        throw new Error(`Invalid JID: ${jid}`);
    }
    return true;
};
exports.validateJID = validateJID;
/**
 * Validates a WhatsApp username
 * @param username - the username to validate
 */
const validateUsername = (username) => {
    // Basic validation checks for username
    if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
    }
    // Check for allowed characters
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }
    return true;
};
exports.validateUsername = validateUsername;
/**
 * Validates a phone number for WhatsApp
 * @param phoneNumber - the phone number to validate
 */
const validatePhoneNumber = (phoneNumber) => {
    // Strip any non-digit characters except leading +
    const cleaned = phoneNumber.startsWith('+')
        ? '+' + phoneNumber.substring(1).replace(/\D/g, '')
        : phoneNumber.replace(/\D/g, '');
    // Basic validation check - should have enough digits
    if (cleaned.length < 10) {
        throw new Error('Phone number must have at least 10 digits');
    }
    // Make sure it doesn't have too many digits
    if (cleaned.length > 15) {
        throw new Error('Phone number cannot have more than 15 digits');
    }
    return cleaned;
};
exports.validatePhoneNumber = validatePhoneNumber;
/**
 * Validates message content
 * @param content - the message content to validate
 */
const validateMessageContent = (content) => {
    if (!content) {
        throw new Error('Message content is required');
    }
    // For text messages
    if (typeof content === 'string') {
        if (content.length === 0) {
            throw new Error('Message text cannot be empty');
        }
        if (content.length > 4096) {
            throw new Error('Message text is too long (max 4096 characters)');
        }
    }
    // For media messages
    if (typeof content === 'object') {
        // At least one of these media types should be present
        const hasMedia = content.image ||
            content.video ||
            content.audio ||
            content.sticker ||
            content.document;
        if (!hasMedia) {
            throw new Error('Media message must contain one of: image, video, audio, sticker, or document');
        }
    }
    return true;
};
exports.validateMessageContent = validateMessageContent;
