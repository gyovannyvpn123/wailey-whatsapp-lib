"use strict";
/**
 * Wailey-library Business Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductData = exports.getBusinessProfileForMessage = exports.extractBusinessProfile = void 0;
/**
 * Extract business profile data from WhatsApp message
 * @param data - Raw business profile data from WhatsApp
 */
const extractBusinessProfile = (data) => {
    // In a real implementation, this would extract business profile data from WhatsApp API response
    // This is a simplified placeholder implementation
    // Return null if no data
    if (!data) {
        return null;
    }
    // Extract and normalize profile data
    const profile = {
        businessProfile: {
            name: data.name || data.businessName || '',
            description: data.description || '',
            website: Array.isArray(data.website) ? data.website[0] : (data.website || ''),
            email: Array.isArray(data.email) ? data.email[0] : (data.email || ''),
            categories: data.categories || [],
            address: data.address || '',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            businessHours: data.businessHours || {
                timezone: '',
                config: []
            },
            verified: Boolean(data.verified),
            coverPhoto: data.coverPhoto || null
        }
    };
    return profile;
};
exports.extractBusinessProfile = extractBusinessProfile;
/**
 * Get business profile from message
 * @param message - WhatsApp message that may contain business profile
 */
const getBusinessProfileForMessage = (message) => {
    // In a real implementation, this would extract business info from a message
    // This is a simplified placeholder implementation
    var _a;
    if (!message || !message.key || !message.key.remoteJid) {
        return null;
    }
    // Check if this is likely a business account
    const isBusinessAccount = message.key.remoteJid.endsWith('@s.whatsapp.net') &&
        (message.businessProfile || message.verifiedBusiness ||
            (message.message && message.message.businessProfile));
    if (!isBusinessAccount) {
        return null;
    }
    // Extract business profile data
    const businessData = message.businessProfile ||
        ((_a = message.message) === null || _a === void 0 ? void 0 : _a.businessProfile) ||
        { name: message.verifiedName || message.pushName };
    return (0, exports.extractBusinessProfile)(businessData);
};
exports.getBusinessProfileForMessage = getBusinessProfileForMessage;
/**
 * Validate business catalog product data
 * @param product - Product data to validate
 */
const validateProductData = (product) => {
    // Basic validations
    if (!product) {
        throw new Error('Product data is required');
    }
    if (!product.name) {
        throw new Error('Product name is required');
    }
    if (!product.price || isNaN(parseFloat(product.price))) {
        throw new Error('Valid product price is required');
    }
    // Currency validation
    if (!product.currency) {
        product.currency = 'USD'; // Default currency
    }
    // Validate currency code (basic check)
    if (product.currency.length !== 3) {
        throw new Error('Currency code must be 3 letters (e.g. USD, EUR, GBP)');
    }
    // Validate images are properly formatted
    if (product.images && Array.isArray(product.images)) {
        product.images.forEach((image, index) => {
            if (!image.url) {
                throw new Error(`Image at index ${index} is missing a URL`);
            }
        });
    }
    return true;
};
exports.validateProductData = validateProductData;
