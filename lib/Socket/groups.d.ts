/**
 * Wailey-library Group Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Get metadata for a group
 */
export declare const groupMetadata: (jid: string) => Promise<{
    id: string;
    subject: string;
    creation: number;
    owner: string;
    desc: string;
    participants: {
        id: string;
        isAdmin: boolean;
        isSuperAdmin: boolean;
    }[];
    ephemeralDuration: number;
}>;
/**
 * Create a group
 */
export declare const groupCreate: (subject: string, participants: string[]) => Promise<{
    id: string;
    subject: string;
    creation: number;
    owner: string;
    participants: {
        id: string;
        isAdmin: boolean;
        isSuperAdmin: boolean;
    }[];
}>;
/**
 * Leave a group
 */
export declare const groupLeave: (jid: string) => Promise<{
    status: number;
}>;
