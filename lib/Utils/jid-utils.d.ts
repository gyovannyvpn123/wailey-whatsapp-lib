/**
 * Wailey-library JID Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
export declare const S_WHATSAPP_NET = "@s.whatsapp.net";
export declare const OFFICIAL_BIZ_JID = "16505361212@c.us";
export declare const SERVER_JID = "server@c.us";
export declare const PSA_WID = "0@c.us";
export declare const STORIES_JID = "status@broadcast";
/**
 * Normalizes a JID
 * @param jid - the JID to normalize
 */
export declare const jidNormalizedUser: (jid: string) => string;
/**
 * Decodes a JID into its user and server parts
 * @param jid - the JID to decode
 */
export declare const jidDecode: (jid: string) => {
    user: string;
    server: string;
};
/**
 * Encodes user and server into a JID
 * @param user - the user ID
 * @param server - the server domain
 */
export declare const jidEncode: (user: string, server?: string) => string;
/**
 * Determines if a JID is for a group
 * @param jid - the JID to check
 */
export declare const isGroupJid: (jid: string) => boolean;
/**
 * Determines if a JID is for a status broadcast
 * @param jid - the JID to check
 */
export declare const isStatusBroadcastJid: (jid: string) => jid is "status@broadcast";
/**
 * Extracts the phone number from a JID
 * @param jid - the JID to extract from
 */
export declare const extractPhoneNumber: (jid: string) => string;
