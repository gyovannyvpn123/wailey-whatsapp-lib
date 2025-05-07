/**
 * Wailey-library Chat Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Get all chats
 */
export declare const getAllChats: () => Promise<{
    id: string;
    name: string;
    conversationTimestamp: number;
    unreadCount: number;
}[]>;
/**
 * Fetch message receipts
 */
export declare const fetchMessageReceipts: (jid: string, messageID: string) => Promise<{
    userJid: string;
    receiptTimestamp: number;
}[]>;
/**
 * Delete a chat
 */
export declare const deleteChat: (jid: string) => Promise<{
    status: number;
}>;
/**
 * Archive a chat
 */
export declare const archiveChat: (jid: string, archive: boolean) => Promise<{
    status: number;
    archive: boolean;
}>;
/**
 * Mark a chat as read/unread
 */
export declare const markChatRead: (jid: string, read: boolean) => Promise<{
    status: number;
    read: boolean;
}>;
