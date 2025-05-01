/**
 * Tests for Client module
 */

// This is a simple test file for the Client class
// In a real environment, you would use Jest or Mocha for testing

const { create } = require('../index');
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
        })),
        makeInMemoryStore: jest.fn(() => ({
            bind: jest.fn()
        })),
        makeCacheableSignalKeyStore: jest.fn(keys => keys),
        useMultiFileAuthState: jest.fn(() => Promise.resolve({
            state: { creds: {}, keys: {} },
            saveCreds: jest.fn()
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
        });
        
        // Mock event emitter
        client.emit = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize correctly', async () => {
        const initResult = await client.initialize();
        expect(initResult).not.toBeNull();
        expect(client.socket).not.toBeNull();
    });

    test('should connect and request pairing code', async () => {
        await client.initialize();
        const code = await client.requestPairingCode('1234567890');
        expect(code).toBe('123-456');
        expect(client.socket.requestPairingCode).toHaveBeenCalledWith('+1234567890');
        expect(client.emit).toHaveBeenCalledWith('pairing_code', '123-456');
    });

    test('should disconnect', async () => {
        // Setup a mock socket
        await client.initialize();
        client.state = 'connected';
        
        await client.disconnect();
        expect(client.socket.end).toHaveBeenCalled();
        expect(client.state).toBe('disconnected');
        expect(client.emit).toHaveBeenCalledWith('disconnected', { 
            reason: 'user_disconnect', 
            reconnecting: false 
        });
    });

    test('should handle event listeners', () => {
        const mockListener = jest.fn();
        client.on('test-event', mockListener);
        
        // Test event emission
        client.emit('test-event', 'arg1', 'arg2');
        
        expect(mockListener).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should send text messages', async () => {
        await client.initialize();
        const result = await client.sendTextMessage('1234567890', 'Hello world');
        expect(client.socket.sendMessage).toHaveBeenCalledWith(
            '1234567890@s.whatsapp.net', 
            { text: 'Hello world' },
            {}
        );
        expect(client.emit).toHaveBeenCalledWith('message_create', result);
    });

    test('should get QR code', async () => {
        client.qrCode = 'test-qr-code';
        const qr = await client.getQrCode();
        expect(qr).toBe('test-qr-code');
    });
});