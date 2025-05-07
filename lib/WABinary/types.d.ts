/**
 * Wailey-library Binary Types
 * (Renamed from Baileys while maintaining identical functionality)
 */
export type BinaryNode = {
    tag: string;
    attrs: Record<string, string>;
    content?: any[];
};
