/**
 * Wailey-library Authentication Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Request pairing code for phone number login
 */
export declare const requestPairingCode: (phoneNumber: string) => Promise<{
    phoneNumber: string;
    pairingCode: string;
}>;
/**
 * Register new device (multi-device support)
 */
export declare const registerNewDevice: (phoneNumber: string) => Promise<{
    status: number;
    phoneNumber: string;
    deviceId: string;
    keyPair: {
        publicKey: string;
        privateKeyRedacted: string;
    };
}>;
/**
 * Login using credentials (username/password-based login for business accounts)
 */
export declare const loginViaCredentials: (username: string, password: string) => Promise<{
    businessJid: string;
    username: string;
    businessName: string;
    connected: boolean;
}>;
