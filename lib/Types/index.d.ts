/**
 * Wailey-library Types and Interfaces
 * (Renamed from Baileys while maintaining identical functionality)
 */
import { Agent } from 'http';
import { Logger } from 'pino';
import { URL } from 'url';
export type WABrowserDescription = [string, string, string];
export type CommonSocketConfig = {
    /** the WS url to connect to WA */
    waWebSocketUrl: string | URL;
    /** Fails the connection if the socket times out in this interval */
    connectTimeoutMs: number;
    /** Default timeout for queries, undefined for no timeout */
    defaultQueryTimeoutMs: number | undefined;
    /** ping-pong interval for WS connection */
    keepAliveIntervalMs: number;
    /** proxy agent */
    agent?: Agent;
    /** pino logger */
    logger: Logger;
    /** version to connect with */
    version: [number, number, number];
    /** override browser config */
    browser: WABrowserDescription;
    /** agent used for fetch requests -- uploading/downloading media */
    fetchAgent?: Agent;
    /** should the QR be printed in the terminal */
    printQRInTerminal: boolean;
    /** should events be emitted for actions done by this socket connection */
    emitOwnEvents: boolean;
    /** provide a cache to store a user's device list */
    userDevicesCache?: Map<string, string[]>;
    /** provide a cache to store a chat's last message timestamp */
    lastMessageTimestampCache?: Map<string, number>;
    /** Delay between requests during a retry */
    retryRequestDelayMs: number;
    /** hosts to upload media to */
    customUploadHosts: string[];
};
export type SocketConfig = CommonSocketConfig & {};
export declare enum DisconnectReason {
    connectionClosed = 428,
    connectionLost = 408,
    connectionReplaced = 440,
    timedOut = 408,
    loggedOut = 401,
    badSession = 500,
    restartRequired = 515,
    multideviceMismatch = 411
}
export type WAConnectionState = 'open' | 'connecting' | 'close';
export type MediaType = 'image' | 'video' | 'sticker' | 'audio' | 'document' | 'history' | 'md-app-state';
export type MessageRetryMap = {
    [msgId: string]: number;
};
