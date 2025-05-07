/**
 * Wailey-library Link Preview Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Gets a preview for a link
 * @param url - the URL to get preview for
 */
export declare const getLinkPreview: (url: string) => Promise<{
    title: string;
    description: string;
    canonicalUrl: string;
    siteName: string;
    mediaType: string;
    images: {
        url: string;
    }[];
}>;
/**
 * Generates link previews for any URLs in the text
 * @param text - the text message content
 */
export declare const generateLinkPreviewIfRequired: (text: string) => Promise<{
    title: string;
    description: string;
    canonicalUrl: string;
    siteName: string;
    mediaType: string;
    images: {
        url: string;
    }[];
}>;
