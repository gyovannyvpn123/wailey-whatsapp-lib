/**
 * Main entry point for the Wailey-library
 * Renamed from Baileys while maintaining identical functionality
 */
import { makeWASocket } from './Socket/socket';
import { DisconnectReason } from './Types';
export type WAMessageContent = any;
export { makeWASocket, DisconnectReason };
export * from './Utils';
export * from './WABinary';
export * from './WAProto';
export * from './Types';
declare const _default: {
    makeWASocket: (config?: Partial<import("./Types").SocketConfig>) => any;
    DisconnectReason: typeof DisconnectReason;
};
export default _default;
