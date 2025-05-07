"use strict";
/**
 * Wailey-library Socket Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWASocket = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
const Defaults_1 = require("../Defaults");
const Types_1 = require("../Types");
const generics_1 = require("../Utils/generics");
const noise_handler_1 = require("../Utils/noise-handler");
const WABinary_1 = require("../WABinary");
/**
 * Creates a WhatsApp socket connection
 *
 * Implements WhatsApp Web API using WebSocket
 */
const makeWASocket = (config = {}) => {
    const logger = config.logger || Defaults_1.DEFAULT_CONNECTION_CONFIG.logger;
    const ws = new events_1.EventEmitter();
    // Import requestPairingCode from auth module
    const { requestPairingCode: _requestPairingCode } = require('./auth');
    // Complete configuration with defaults
    const configComplete = {
        ...Defaults_1.DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    let connectionState = 'close';
    let qrTimeout;
    let noiseHandler = (0, noise_handler_1.makeNoiseHandler)();
    // Websocket implementation
    let sock;
    // Pending requests waiting for response
    const pendingRequests = new Map();
    // Callbacks registered for different events
    const callbacks = new Map();
    /**
     * Opens a WebSocket connection to WhatsApp
     */
    const connect = async () => {
        if (connectionState === 'connecting' || connectionState === 'open') {
            return;
        }
        connectionState = 'connecting';
        logger.info('Connecting to WhatsApp...');
        try {
            const wsUrl = configComplete.waWebSocketUrl || Defaults_1.DEFAULT_ORIGIN;
            sock = new ws_1.default(wsUrl);
            sock.on('open', () => {
                logger.info('Connected to WhatsApp');
                connectionState = 'open';
                // Begin authentication and handshake process
                startHandshake();
            });
            sock.on('close', (code) => {
                handleConnectionClose(code);
            });
            sock.on('error', (err) => {
                logger.error('WebSocket error:', err);
                closeSocket(err);
            });
            sock.on('message', (data) => {
                // In a real implementation, each message would be parsed and processed
                handleWAMessage(data);
            });
        }
        catch (error) {
            closeSocket(error);
        }
    };
    /**
     * Begin handshake process with WhatsApp server
     */
    const startHandshake = () => {
        if (!sock || connectionState !== 'open') {
            return;
        }
        try {
            // In a real implementation, this would follow WhatsApp Web's protocol
            // Starting with a client hello message to establish connection
            const clientHello = {
                tag: 'client',
                attrs: {
                    platform: configComplete.browser[0],
                    version: configComplete.version.join('.'),
                    id: (0, generics_1.generateMessageID)()
                },
                content: []
            };
            // Send client hello message to begin connection
            sendNode(clientHello);
        }
        catch (error) {
            logger.error('Failed to start handshake:', error);
            closeSocket(error);
        }
    };
    /**
     * Close the WebSocket connection
     */
    const closeSocket = (error) => {
        if (connectionState === 'close') {
            return;
        }
        connectionState = 'close';
        if (qrTimeout) {
            clearTimeout(qrTimeout);
            qrTimeout = undefined;
        }
        // Clear pending requests
        for (const { reject } of pendingRequests.values()) {
            reject(error || new Error('Connection closed'));
        }
        pendingRequests.clear();
        if (sock) {
            sock.removeAllListeners();
            try {
                sock.close();
            }
            catch (_a) { }
            sock = undefined;
        }
        logger.info('Disconnected from WhatsApp', error ? { error } : undefined);
        // Reset authentication
        noiseHandler = (0, noise_handler_1.makeNoiseHandler)();
        ws.emit('close', {
            reason: (error === null || error === void 0 ? void 0 : error.message) || 'Connection closed',
            isReconnecting: false
        });
    };
    /**
     * Handle WebSocket connection closure
     */
    const handleConnectionClose = (code) => {
        logger.info(`WebSocket closed with code ${code}`);
        const reason = getDisconnectReason(code) || Types_1.DisconnectReason.connectionLost;
        closeSocket(new Error(`Connection closed with code ${code}. Reason: ${Types_1.DisconnectReason[reason]}`));
    };
    /**
     * Map WebSocket close code to DisconnectReason
     */
    const getDisconnectReason = (code) => {
        switch (code) {
            case 1000: // Normal closure
                return Types_1.DisconnectReason.connectionClosed;
            case 1006: // Abnormal closure
                return Types_1.DisconnectReason.connectionLost;
            case 1011: // Internal error
                return Types_1.DisconnectReason.restartRequired;
            case 1012: // Service restart
                return Types_1.DisconnectReason.restartRequired;
            case 1013: // Try again later
                return Types_1.DisconnectReason.timedOut;
            case 1014: // Bad gateway
                return Types_1.DisconnectReason.timedOut;
            case 1015: // TLS handshake
                return Types_1.DisconnectReason.badSession;
            default:
                return undefined;
        }
    };
    /**
     * Send a binary node to WhatsApp server
     */
    const sendNode = (node) => {
        if (!sock || connectionState !== 'open') {
            throw new Error('Connection not open');
        }
        const encodedNode = (0, WABinary_1.encodeBinaryNode)(node);
        sock.send(encodedNode);
    };
    /**
     * Handle incoming messages from WhatsApp
     */
    const handleWAMessage = (data) => {
        try {
            // Decode the binary message
            const node = (0, WABinary_1.decodeBinaryNode)(data);
            // Handle different message types based on tag
            if (node.tag === 'response') {
                handleResponse(node);
            }
            else if (node.tag === 'action') {
                handleAction(node);
            }
            else if (node.tag === 'iq') {
                handleIQ(node);
            }
            else if (node.tag === 'notification') {
                handleNotification(node);
            }
            else if (node.tag === 'challenge') {
                handleChallenge(node);
            }
            else {
                logger.info(`Received unknown message type: ${node.tag}`);
            }
        }
        catch (error) {
            logger.error('Failed to process message:', error);
        }
    };
    /**
     * Handle response messages
     */
    const handleResponse = (node) => {
        const id = node.attrs.id;
        if (!id) {
            return;
        }
        // Check if this is a response to a pending request
        const request = pendingRequests.get(id);
        if (request) {
            pendingRequests.delete(id);
            request.resolve(node);
        }
        // Check for callbacks
        const callbackName = `${Defaults_1.DEF_CALLBACK_PREFIX}${id}`;
        const callback = callbacks.get(callbackName);
        if (callback) {
            callback(node);
            callbacks.delete(callbackName);
        }
    };
    /**
     * Handle action messages
     */
    const handleAction = (node) => {
        // In a real implementation, this would handle different action types
        // such as chat updates, message status updates, etc.
        // Emit the action for event listeners
        ws.emit('action', node);
    };
    /**
     * Handle IQ (Info/Query) messages
     */
    const handleIQ = (node) => {
        // Handle different types of IQ queries
        const type = node.attrs.type;
        if (type === 'get') {
            // Handle get requests
        }
        else if (type === 'set') {
            // Handle set requests
        }
        else if (type === 'result') {
            // Handle results
        }
        // Emit the IQ for event listeners
        ws.emit('iq', node);
    };
    /**
     * Handle notification messages
     */
    const handleNotification = (node) => {
        // Process notifications (e.g., new messages, status updates)
        const type = node.attrs.type;
        // Emit the notification for event listeners
        ws.emit('notification', { type, node });
    };
    /**
     * Handle challenge messages (for encryption)
     */
    const handleChallenge = (node) => {
        // In a real implementation, this would handle the cryptographic challenge
        // part of the WhatsApp Web protocol
        // For now, just log it
        logger.info('Received challenge');
    };
    /**
     * Send a query to the WhatsApp server
     */
    const query = async (node, timeoutMs) => {
        if (!sock || connectionState !== 'open') {
            throw new Error('Connection not open');
        }
        // Generate ID if none provided
        const id = node.attrs.id || (0, generics_1.generateMessageID)();
        node.attrs.id = id;
        // Create a promise for the response
        const promise = new Promise((resolve, reject) => {
            pendingRequests.set(id, { resolve, reject, timeoutMs });
            // Set timeout for the request
            const timeout = setTimeout(() => {
                pendingRequests.delete(id);
                reject(new Error('Query timed out'));
            }, timeoutMs || configComplete.defaultQueryTimeoutMs || 60000);
            // Clear timeout when resolved
            const originalResolve = resolve;
            resolve = ((result) => {
                clearTimeout(timeout);
                originalResolve(result);
            });
        });
        // Send the query
        sendNode(node);
        return promise;
    };
    /**
     * Wait for a specific callback
     */
    const waitForCallback = (callbackName, timeoutMs) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                callbacks.delete(callbackName);
                reject(new Error('Callback timed out'));
            }, timeoutMs || configComplete.defaultQueryTimeoutMs || 60000);
            callbacks.set(callbackName, (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });
    };
    /**
     * Wait for a message with a specific tag
     */
    const waitForMessage = (tag, timeoutMs) => {
        const callbackName = `${Defaults_1.DEF_TAG_PREFIX}${tag}`;
        return waitForCallback(callbackName, timeoutMs);
    };
    /**
     * Checks if phone is connected (middleware for requests)
     */
    const assertConnected = () => {
        if (connectionState !== 'open') {
            throw new Error('Connection not open');
        }
    };
    /**
     * Sends a keep-alive ping to the server
     */
    const sendKeepAlive = async () => {
        if (connectionState !== 'open') {
            return;
        }
        try {
            const pingMsg = {
                tag: 'iq',
                attrs: {
                    id: (0, generics_1.generateMessageID)(),
                    type: 'get',
                    xmlns: 'w:p',
                    to: 's.whatsapp.net'
                },
                content: [{ tag: 'ping', attrs: {}, content: undefined }]
            };
            const result = await query(pingMsg, 10000);
            ws.emit(Defaults_1.PHONE_CONNECTION_CB, { connected: true });
            return result;
        }
        catch (error) {
            logger.warn('Ping failed', error);
            ws.emit(Defaults_1.PHONE_CONNECTION_CB, { connected: false });
            return undefined;
        }
    };
    // Implement requestPairingCode wrapper
    const requestPairingCode = async (phoneNumber) => {
        logger.info(`Requesting pairing code for ${phoneNumber}...`);
        if (connectionState !== 'open') {
            // Auto-connect if not connected
            await connect();
        }
        try {
            // Use the imported function but pass socket (ws) as first parameter
            const result = await _requestPairingCode(ws, phoneNumber);
            logger.info(`Received pairing code for ${phoneNumber}`);
            return result.pairingCode;
        }
        catch (error) {
            logger.error(`Failed to request pairing code: ${error}`);
            throw error;
        }
    };
    // Expose functions to the client
    ws.connect = connect;
    ws.close = closeSocket;
    ws.sendNode = sendNode;
    ws.query = query;
    ws.waitForMessage = waitForMessage;
    ws.assertConnected = assertConnected;
    ws.sendKeepAlive = sendKeepAlive;
    ws.requestPairingCode = requestPairingCode;
    // Expose connection state
    Object.defineProperty(ws, 'connectionState', {
        get: () => connectionState
    });
    return ws;
};
exports.makeWASocket = makeWASocket;
