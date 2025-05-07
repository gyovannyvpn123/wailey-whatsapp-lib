/**
 * Wailey-library Validation Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Validates a JID (Jabber ID) format
 * @param jid - the JID to validate
 */
export declare const validateJID: (jid: string) => boolean;
/**
 * Validates a WhatsApp username
 * @param username - the username to validate
 */
export declare const validateUsername: (username: string) => boolean;
/**
 * Validates a phone number for WhatsApp
 * @param phoneNumber - the phone number to validate
 */
export declare const validatePhoneNumber: (phoneNumber: string) => string;
/**
 * Validates message content
 * @param content - the message content to validate
 */
export declare const validateMessageContent: (content: any) => boolean;
