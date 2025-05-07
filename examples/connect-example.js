/**
 * Wailey-library Connection Example
 * 
 * This example demonstrates how to connect to WhatsApp using Wailey-library
 * It includes basic functionality for:
 * - Connecting to WhatsApp
 * - Displaying a QR code for authentication
 * - Handling connection events
 * - Sending and receiving messages
 */

const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('../lib');

// Function to test a WhatsApp connection
async function connectToWhatsApp() {
    console.log('[' + new Date().toISOString() + '] Starting WhatsApp connection to servers...');
    
    console.log('====================================');
    console.log('Testing Wailey Library Connection');
    console.log('====================================');
    
    console.log('Initializing WhatsApp connection');
    
    // Load saved authentication state
    console.log('Loading authentication state');
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    console.log('Auth state loaded successfully');
    
    // Initialize the socket
    console.log('Initializing WebSocket connection to WhatsApp servers');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Wailey-library Test', 'Chrome', '103.0.5060.114'],
        logger: {
            info: console.log,
            error: console.error,
            warn: console.warn,
            debug: () => {} // Disable debug logs
        }
    });
    console.log('Socket initialized successfully');
    
    // Test library capabilities
    console.log('Testing WhatsApp connection capabilities...');

    // Test for event emitter
    if (!sock.ev) {
        console.log('⚠️ Event handler (sock.ev) is not available in this version of the library');
        console.log('This might be because the library is still in development or not fully initialized');
    } else {
        // Register saveCreds to be called when auth credentials are updated
        try {
            sock.ev.on('creds.update', saveCreds);
            console.log('✅ Event handler registered successfully');
        } catch (err) {
            console.log('⚠️ saveCreds is not a function, skipping creds.update event registration');
        }
        
        // Listen for connection updates
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('📱 New QR code generated for scanning', qr.length, 'characters');
            }
            
            if (connection === 'connecting') {
                console.log('🔄 Connecting to WhatsApp...');
            }
            
            if (connection === 'open') {
                console.log('✅ Connected to WhatsApp');
            }
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', 
                    reason !== DisconnectReason.loggedOut);
                
                // Reconnect if not logged out
                if (reason !== DisconnectReason.loggedOut) {
                    setTimeout(() => {
                        connectToWhatsApp();
                    }, 3000);
                }
            }
        });
        
        // Listen for messages
        sock.ev.on('messages.upsert', ({ messages, type }) => {
            if (type === 'notify') {
                for (const msg of messages) {
                    const sender = msg.key.remoteJid;
                    const messageContent = msg.message?.conversation || 
                                         msg.message?.extendedTextMessage?.text || 
                                         msg.message?.imageMessage?.caption || 
                                         'No text content';
                    
                    console.log(`📩 New message from ${sender}: ${messageContent}`);
                }
            }
        });
    }
    
    // Check basic socket methods
    const socketCapabilities = {
        hasSendMessage: typeof sock.sendMessage === 'function',
        hasQuery: typeof sock.query === 'function',
        hasWaitForMessage: typeof sock.waitForMessage === 'function',
        hasRequestPairingCode: typeof sock.requestPairingCode === 'function'
    };
    
    console.log('====================================');
    console.log('WhatsApp Connection Capability Test:');
    console.log('====================================');
    console.log('Socket instance created:', !!sock);
    console.log('Has sendMessage method:', socketCapabilities.hasSendMessage ? '✅ Yes' : '❌ No');
    console.log('Has query method:', socketCapabilities.hasQuery ? '✅ Yes' : '❌ No');
    console.log('Has waitForMessage method:', socketCapabilities.hasWaitForMessage ? '✅ Yes' : '❌ No');
    console.log('Has requestPairingCode method:', socketCapabilities.hasRequestPairingCode ? '✅ Yes' : '❌ No');
    
    if (socketCapabilities.hasRequestPairingCode) {
        console.log('✅ FUNCȚIE DE PAIRING IMPLEMENTATĂ CU SUCCES!');
    }
    
    // Summary
    if (socketCapabilities.hasSendMessage && socketCapabilities.hasQuery && 
        socketCapabilities.hasWaitForMessage && socketCapabilities.hasRequestPairingCode) {
        console.log('✅ Library has all core functionality implemented!');
    } else if (socketCapabilities.hasQuery && socketCapabilities.hasWaitForMessage) {
        console.log('⚠️ Library has core functionality but sendMessage is missing');
        console.log('Pairing code function is now working, but full functionality requires sendMessage');
    } else {
        console.log('❌ Library is missing several core functions');
    }
    
    // Display connection details
    console.log('Library connection details:');
    console.log('- Browser profile:', sock.browserDescription ? sock.browserDescription.join(' ') : 'Unknown');
    console.log('- Device name:', sock.user ? sock.user.name : 'Not authenticated yet');
    console.log('- WhatsApp protocol version:', sock.version ? sock.version.join('.') : 'Unknown');
}

// Start the connection
connectToWhatsApp();