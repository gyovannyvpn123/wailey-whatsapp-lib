/**
 * Wailey-library Socket Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
import { SocketConfig } from '../Types';
/**
 * Creates a WhatsApp socket connection
 *
 * Implements WhatsApp Web API using WebSocket
 */
export declare const makeWASocket: (config?: Partial<SocketConfig>) => any;
