"use strict";
/**
 * Wailey-library JID Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPhoneNumber = exports.isStatusBroadcastJid = exports.isGroupJid = exports.jidEncode = exports.jidDecode = exports.jidNormalizedUser = exports.STORIES_JID = exports.PSA_WID = exports.SERVER_JID = exports.OFFICIAL_BIZ_JID = exports.S_WHATSAPP_NET = void 0;
// WhatsApp JID Constants
exports.S_WHATSAPP_NET = '@s.whatsapp.net';
exports.OFFICIAL_BIZ_JID = '16505361212@c.us';
exports.SERVER_JID = 'server@c.us';
exports.PSA_WID = '0@c.us';
exports.STORIES_JID = 'status@broadcast';
/**
 * Normalizes a JID
 * @param jid - the JID to normalize
 */
const jidNormalizedUser = (jid) => {
    if (!jid)
        return '';
    // If the JID ends with @g.us or @broadcast, return as is
    if (jid.endsWith('@g.us') || jid.endsWith('@broadcast')) {
        return jid;
    }
    // Convert @c.us to @s.whatsapp.net
    let normalized = jid.replace(/@c\.us$/, exports.S_WHATSAPP_NET);
    // If no domain was found, add the default one
    if (!normalized.includes('@')) {
        normalized = `${normalized}${exports.S_WHATSAPP_NET}`;
    }
    return normalized;
};
exports.jidNormalizedUser = jidNormalizedUser;
/**
 * Decodes a JID into its user and server parts
 * @param jid - the JID to decode
 */
const jidDecode = (jid) => {
    if (!jid)
        return { user: '', server: '' };
    const parts = jid.split('@');
    if (parts.length !== 2) {
        return {
            user: jid,
            server: ''
        };
    }
    return {
        user: parts[0],
        server: parts[1]
    };
};
exports.jidDecode = jidDecode;
/**
 * Encodes user and server into a JID
 * @param user - the user ID
 * @param server - the server domain
 */
const jidEncode = (user, server = exports.S_WHATSAPP_NET) => {
    if (!user)
        return '';
    // Make sure the user part doesn't already have @ symbol
    const cleanUser = user.replace(/@.+$/, '');
    return `${cleanUser}@${server}`;
};
exports.jidEncode = jidEncode;
/**
 * Determines if a JID is for a group
 * @param jid - the JID to check
 */
const isGroupJid = (jid) => {
    return (jid === null || jid === void 0 ? void 0 : jid.endsWith('@g.us')) || false;
};
exports.isGroupJid = isGroupJid;
/**
 * Determines if a JID is for a status broadcast
 * @param jid - the JID to check
 */
const isStatusBroadcastJid = (jid) => {
    return jid === exports.STORIES_JID;
};
exports.isStatusBroadcastJid = isStatusBroadcastJid;
/**
 * Extracts the phone number from a JID
 * @param jid - the JID to extract from
 */
const extractPhoneNumber = (jid) => {
    if (!jid)
        return '';
    // Decode the JID to get the user part
    const { user } = (0, exports.jidDecode)(jid);
    // Strip any non-digit characters
    return user.replace(/[^\d]/g, '');
};
exports.extractPhoneNumber = extractPhoneNumber;
