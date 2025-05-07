/**
 * Wailey-library Event Handler Example
 * 
 * This example demonstrates how to use the event handler (sock.ev) functionality
 * in Wailey-library. It includes:
 * - Connecting to WhatsApp with events
 * - Subscribing to various events (messages, connection state, etc.)
 * - Sending messages and handling responses
 */

const { makeWASocket, useMultiFileAuthState } = require('../lib');
const process = require('process');
const path = require('path');
const fs = require('fs');

async function startUsingEvents() {
    // Path for storing auth state
    const AUTH_DIR = './auth_info';
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
    
    console.log('Initializing WhatsApp connection with events...');
    
    // Load authentication state
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    
    // Initialize the WhatsApp socket
    const sock = makeWASocket({
        printQRInTerminal: true,
        browser: ['Wailey Library', 'Chrome', '103.0.5060.114'],
        auth: state
    });
    
    // Event for connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 403;
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                startUsingEvents();
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    });
    
    // Event for saving credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Event for new messages
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            console.log('New message received:', message);
            
            // Print message content and sender
            const senderJid = message.key.remoteJid;
            const sender = senderJid.split('@')[0];
            const msgContent = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || 
                               'Media message';
            
            console.log(`From: ${sender} - Message: ${msgContent}`);
            
            // Auto-reply to messages
            await sock.sendMessage(senderJid, { text: 'Thank you for your message!' });
        }
    });
    
    // Event for message status updates (read, delivered, etc.)
    sock.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            console.log('Message status update:', update);
        }
    });
    
    // Event for chat updates (new chats, chat changes)
    sock.ev.on('chats.upsert', (newChats) => {
        console.log('New chats:', newChats);
    });
    
    // Event for chat updates (name changes, etc.)
    sock.ev.on('chats.update', (changedChats) => {
        console.log('Updated chats:', changedChats);
    });
    
    // Event for presence updates (typing, online status)
    sock.ev.on('presence.update', (presenceUpdate) => {
        console.log('Presence update:', presenceUpdate);
    });
    
    // Utility function to send a test message
    async function sendTestMessage(jid) {
        try {
            console.log(`Sending test message to ${jid}...`);
            const result = await sock.sendMessage(jid, { text: 'This is a test message from Wailey-library event example!' });
            console.log('Message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Failed to send message:', error);
            return null;
        }
    }
    
    // Expose function to send test messages
    sock.sendTestMessage = sendTestMessage;
    
    return sock;
}

// Main function
if (require.main === module) {
    console.log('Starting Wailey-library Event Example...');
    startUsingEvents()
        .then(sock => {
            console.log('Example started successfully. The socket is available for interaction.');
            // Keep the process running
            process.stdin.resume();
            
            // Prompt for phone number
            console.log('\nTo test the pairing code functionality:');
            console.log('1. First connect with QR code or wait for existing session');
            console.log('2. When connected, you will see a welcome message\n');
        })
        .catch(err => {
            console.error('Failed to start:', err);
        });
}

module.exports = {
    startUsingEvents
};