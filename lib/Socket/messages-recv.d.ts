/**
 * Wailey-library Message Receiving Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Load messages before a certain ID for a chat
 */
export declare const loadMessagesBefore: (jid: string, before: string, count: number) => Promise<{
    messages: {
        key: any;
        message: any;
        messageTimestamp: any;
        status: any;
        participant: any;
    }[];
    chats: any[];
    contacts: any[];
}>;
/**
 * Load messages from a certain ID for a chat
 */
export declare const loadMessagesAfter: (jid: string, after: string, count: number) => Promise<{
    messages: {
        key: any;
        message: any;
        messageTimestamp: any;
        status: any;
        participant: any;
    }[];
    chats: any[];
    contacts: any[];
}>;
