/**  
 * Wailey-library Generic Utilities  
 * (Renamed from Baileys while maintaining identical functionality)  
 */  
import type { Logger } from 'pino';  
import { WABrowserDescription } from '../Types';  

/**  
 * Browser configuration for WhatsApp connect  
 */  
export declare const Browsers: {  
    googleChrome: () => WABrowserDescription;  
    mozillaFirefox: () => WABrowserDescription;  
    safari: () => WABrowserDescription;  
};  

export declare const generateMessageID: () => string;  
export declare const formatPhoneNumber: (phoneNumber: string) => string;  
export declare const normalizeJid: (jid: string) => string;  
export declare const toTimestamp: (date: Date) => number;  
export declare const fromTimestamp: (timestamp: number) => Date;
