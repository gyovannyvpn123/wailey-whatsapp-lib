"use strict";
/**
 * Wailey-library Link Preview Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLinkPreviewIfRequired = exports.getLinkPreview = void 0;
const crypto_1 = require("crypto");
/**
 * Extracts URLs from text content
 * @param text - the text to search for URLs
 */
const extractUrls = (text) => {
    // Simple URL extraction using a regular expression
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    return urls;
};
/**
 * Gets a preview for a link
 * @param url - the URL to get preview for
 */
const getLinkPreview = async (url) => {
    // In a real implementation, this would fetch metadata for the URL
    // This is a simplified placeholder implementation
    // Create a consistent hash of the URL for reproducible mock data
    const urlHash = (0, crypto_1.createHash)('md5').update(url).digest('hex').substring(0, 8);
    // Generate a domain name from the URL for the mock title
    let domain = '';
    try {
        domain = new URL(url).hostname.replace('www.', '');
    }
    catch (_a) {
        domain = 'example.com';
    }
    // Create a mock preview
    return {
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} - Website Title`,
        description: `This is a preview description for ${url}. Generated with hash ${urlHash}.`,
        canonicalUrl: url,
        siteName: domain.split('.')[0].toUpperCase(),
        mediaType: 'website',
        images: [{
                url: `https://placeholder.com/300x200?text=${urlHash}`
            }]
    };
};
exports.getLinkPreview = getLinkPreview;
/**
 * Generates link previews for any URLs in the text
 * @param text - the text message content
 */
const generateLinkPreviewIfRequired = async (text) => {
    // Skip processing if text is empty or not a string
    if (!text || typeof text !== 'string') {
        return null;
    }
    // Extract URLs from the text
    const urls = extractUrls(text);
    if (urls.length === 0) {
        return null;
    }
    // Generate a preview for the first URL found
    try {
        const preview = await (0, exports.getLinkPreview)(urls[0]);
        return preview;
    }
    catch (error) {
        console.error('Error generating link preview:', error);
        return null;
    }
};
exports.generateLinkPreviewIfRequired = generateLinkPreviewIfRequired;
