/**
 * Wailey-library Message Sending Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Send a text message
 */
export declare const sendTextMessage: (jid: string, text: string, options?: any) => Promise<{
    key: any;
    message: any;
    messageTimestamp: any;
    status: any;
    participant: any;
}>;
/**
 * Send a media message (image, video, audio, etc)
 */
export declare const sendMediaMessage: (jid: string, media: any, options?: any) => Promise<{
    key: any;
    message: any;
    messageTimestamp: any;
    status: any;
    participant: any;
}>;
