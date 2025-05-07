/**
 * Wailey-library Authentication State Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Manages authentication state
 */
export declare const authState: {
    /**
     * Creates an empty authentication state
     */
    createEmptyAuthState: () => {
        creds: {
            noiseKey: Buffer<ArrayBufferLike>;
            signedIdentityKey: Buffer<ArrayBufferLike>;
            signedPreKey: {
                keyPair: Buffer<ArrayBufferLike>;
                signature: Buffer<ArrayBufferLike>;
                keyId: number;
            };
            registrationId: number;
            advSecretKey: Buffer<ArrayBufferLike>;
            processedHistoryMessages: any[];
            nextPreKeyId: number;
            firstUnuploadedPreKeyId: number;
            accountSyncCounter: number;
            accountSettings: {
                unarchiveChats: boolean;
            };
            deviceId: string;
            phoneId: string;
            identityId: string;
            backupToken: Buffer<ArrayBufferLike>;
            registered: boolean;
            platform: string;
        };
        keys: {};
    };
    /**
     * Save authentication state to storage
     */
    saveAuthState: (authState: any, storage: any) => Promise<void>;
    /**
     * Load authentication state from storage
     */
    loadAuthState: (storage: any) => Promise<any>;
};
