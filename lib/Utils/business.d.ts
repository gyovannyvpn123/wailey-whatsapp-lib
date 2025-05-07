/**
 * Wailey-library Business Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Extract business profile data from WhatsApp message
 * @param data - Raw business profile data from WhatsApp
 */
export declare const extractBusinessProfile: (data: any) => {
    businessProfile: {
        name: any;
        description: any;
        website: any;
        email: any;
        categories: any;
        address: any;
        latitude: any;
        longitude: any;
        businessHours: any;
        verified: boolean;
        coverPhoto: any;
    };
};
/**
 * Get business profile from message
 * @param message - WhatsApp message that may contain business profile
 */
export declare const getBusinessProfileForMessage: (message: any) => {
    businessProfile: {
        name: any;
        description: any;
        website: any;
        email: any;
        categories: any;
        address: any;
        latitude: any;
        longitude: any;
        businessHours: any;
        verified: boolean;
        coverPhoto: any;
    };
};
/**
 * Validate business catalog product data
 * @param product - Product data to validate
 */
export declare const validateProductData: (product: any) => boolean;
