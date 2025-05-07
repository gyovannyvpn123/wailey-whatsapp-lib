/**
 * Wailey-library Legacy Message Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Downloads and processes history sync notification
 * @param message - the history sync notification message
 */
export declare const downloadAndProcessHistorySyncNotification: (message: any) => Promise<{
    chats: any[];
    contacts: any[];
    messages: any[];
    isLatest: boolean;
}>;
/**
 * Converts a legacy message to the new format
 * @param message - the legacy format message to convert
 */
export declare const convertLegacyMessage: (message: any) => any;
