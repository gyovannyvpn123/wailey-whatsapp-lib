/**
<<<<<<< HEAD
 * Tests for WAConnection class
 */

// This is a simple test file for the WAConnection class
// In a real environment, you would use Jest or Mocha for testing

const { WAConnection } = require('../src/index');
=======
 * Tests for Client module
 */

// This is a simple test file for the Client class
// In a real environment, you would use Jest or Mocha for testing

const { create } = require('../index');
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)
const assert = require('assert');

// Mock functions to avoid actual WhatsApp connections during testing
jest.mock('@whiskeysockets/baileys', () => {
    return {
        default: jest.fn(() => ({
            ev: {
                on: jest.fn()
            },
            requestPairingCode: jest.fn(() => Promise.resolve('123-456')),
            sendMessage: jest.fn(() => Promise.resolve({ key: { id: 'test-id' } })),
            logout: jest.fn(() => Promise.resolve())
        })),
        DisconnectReason: {
            loggedOut: 401,
            connectionReplaced: 440
        },
        fetchLatestBaileysVersion: jest.fn(() => Promise.resolve({
            version: [2, 2322, 8],
            isLatest: true
<<<<<<< HEAD
=======
        })),
        makeInMemoryStore: jest.fn(() => ({
            bind: jest.fn()
        })),
        makeCacheableSignalKeyStore: jest.fn(keys => keys),
        useMultiFileAuthState: jest.fn(() => Promise.resolve({
            state: { creds: {}, keys: {} },
            saveCreds: jest.fn()
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)
        }))
    };
});

jest.mock('fs', () => {
    return {
        existsSync: jest.fn(() => true),
        mkdirSync: jest.fn(),
        rmdirSync: jest.fn(),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => JSON.stringify({
            creds: {},
            keys: {}
        }))
    };
});

jest.mock('qrcode-terminal', () => ({
    generate: jest.fn()
}));

// Test cases
<<<<<<< HEAD
describe('WAConnection', () => {
    let client;

    beforeEach(() => {
        client = new WAConnection({
            authStateDir: './test_auth',
            debug: false,
            printQR: false
=======
describe('Client', () => {
    let client;

    beforeEach(() => {
        client = create({
            auth: {
                folder: './test_auth'
            },
            logger: {
                level: 'silent'
            },
            printQRInTerminal: false
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)
        });
        
        // Mock event emitter
        client.emit = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize correctly', async () => {
        const initResult = await client.init();
        expect(initResult).toBe(true);
        expect(client.authState).not.toBeNull();
    });

    test('should connect with QR code', async () => {
        const socket = await client.connectWithQR();
        expect(socket).not.toBeNull();
        expect(socket.ev.on).toHaveBeenCalledWith('connection.update', expect.any(Function));
        expect(socket.ev.on).toHaveBeenCalledWith('creds.update', expect.any(Function));
    });

    test('should connect with pairing code', async () => {
        const socket = await client.connectWithPairingCode('1234567890');
        expect(socket).not.toBeNull();
        expect(socket.ev.on).toHaveBeenCalledWith('connection.update', expect.any(Function));
        
        // Simulate connection status being 'connecting'
        client.connectionStatus = 'connecting';
        
        // Wait for setTimeout to execute
        await new Promise(resolve => setTimeout(resolve, 3100));
        
        // Should have requested pairing code
        expect(socket.requestPairingCode).toHaveBeenCalledWith('1234567890');
        expect(client.emit).toHaveBeenCalledWith('pairing-code', '123-456');
    });

    test('should disconnect', async () => {
        // Setup a mock socket
        client.socket = {
            logout: jest.fn(() => Promise.resolve())
        };
        client.connectionStatus = 'open';
        
        const result = await client.disconnect();
        expect(result).toBe(true);
        expect(client.socket.logout).toHaveBeenCalled();
        expect(client.connectionStatus).toBe('disconnected');
        expect(client.emit).toHaveBeenCalledWith('disconnected');
    });

    test('should handle event listeners', () => {
        const mockListener = jest.fn();
        client.on('test-event', mockListener);
        
        // Test event emission
        client.emit = jest.fn(); // Reset the mock
        client.emit('test-event', 'arg1', 'arg2');
        
        expect(client.events['test-event']).toContain(mockListener);
        expect(mockListener).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should report correct connection status', () => {
        client.connectionStatus = 'open';
        expect(client.getConnectionStatus()).toBe('open');
        expect(client.isConnected()).toBe(true);
        
        client.connectionStatus = 'connecting';
        expect(client.getConnectionStatus()).toBe('connecting');
        expect(client.isConnected()).toBe(false);
    });
});
