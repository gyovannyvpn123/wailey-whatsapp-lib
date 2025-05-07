/**
 * Wailey-library History Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Process a history message
 * @param message - message to process
 */
export declare const processHistoryMessage: (message: any) => Promise<{
    messages: any[];
    chats: any[];
    contacts: any[];
    isLatest: boolean;
}>;
/**
 * Extract history from a history sync
 * @param historySync - the history sync data
 */
export declare const extractHistoryMessages: (historySync: any) => {
    chats: any[];
    contacts: any[];
    messages: any[];
    isLatest: boolean;
};
