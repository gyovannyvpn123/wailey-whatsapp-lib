/**
 * Wailey-library Message Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
import { MediaType } from '../Types';
/**
 * Downloads and processes message content
 */
export declare const downloadContentFromMessage: (message: any, type: MediaType) => Promise<{
    read(): Promise<Buffer<ArrayBuffer>>;
}>;
/**
 * Gets the content type of a message
 */
export declare const getContentType: (message: any) => "conversation" | "imageMessage" | "videoMessage" | "audioMessage" | "stickerMessage" | "documentMessage" | "extendedTextMessage" | "contactMessage" | "locationMessage" | "reactionMessage";
