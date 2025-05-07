/**
 * Wailey-library Business API Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Get business profile information for a JID
 */
export declare const getBusinessProfile: (jid: string) => Promise<{
    businessProfile: {
        name: string;
        description: string;
        email: string;
        categories: {
            id: string;
            name: string;
        }[];
        website: string;
        address: string;
        latitude: number;
        longitude: number;
        businessHours: {
            timezone: string;
            config: {
                day: number;
                open: string;
                close: string;
            }[];
        };
        verified: boolean;
        coverPhoto: any;
    };
}>;
/**
 * Update business profile information
 */
export declare const updateBusinessProfile: (profile: any) => Promise<{
    status: number;
    updated: boolean;
    timestamp: number;
    profile: any;
}>;
/**
 * Create catalog product
 */
export declare const createCatalogProduct: (product: any) => Promise<{
    id: string;
    name: any;
    price: any;
    currency: any;
    description: any;
    images: any;
    url: any;
    retailerId: any;
    timestamp: number;
}>;
/**
 * Get business products
 */
export declare const getBusinessProducts: (jid: string, limit?: number) => Promise<{
    products: {
        id: string;
        name: string;
        price: number;
        currency: string;
        description: string;
        images: any[];
        timestamp: number;
    }[];
    businessJid: string;
    hasMoreProducts: boolean;
}>;
