/**
 * Wailey-library Send Message Example
 * 
 * This example demonstrates how to use the sendMessage functionality
 * in Wailey-library. It includes:
 * - Connecting to WhatsApp
 * - Sending different types of messages (text, media)
 * - Handling message sending errors
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('../lib');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

async function startMessageSender() {
    // Set up connection
    console.log('Starting Wailey message sender example...');
    
    // Load authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    // Set up socket connection
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Wailey Message Example', 'Chrome', '103.0.5060.114'],
        logger: {
            info: console.log,
            error: console.error,
            warn: console.warn,
            debug: () => {} // Disable debug logs
        }
    });
    
    // Register credential update handler
    sock.ev.on('creds.update', saveCreds);
    
    // Connection status handler
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('QR Code received, scan with your phone to connect');
        }
        
        if (connection === 'open') {
            console.log('Connected to WhatsApp! Ready to send messages.');
            console.log('My JID:', sock.user?.id);
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect.error, 'Reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                startMessageSender();
            }
        }
    });
    
    // Message event handler
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type === 'notify') {
            for (const message of messages) {
                const sender = message.key.remoteJid;
                const messageContent = message.message?.conversation || 
                                     message.message?.extendedTextMessage?.text || 
                                     'Media or other message';
                
                console.log(`New message from ${sender}: ${messageContent}`);
                
                // If it's not from me, reply
                if (!message.key.fromMe) {
                    // Automatically reply to any message with a help message
                    sendHelpMessage(sock, sender).catch(err => {
                        console.error('Failed to send auto-reply:', err);
                    });
                }
            }
        }
    });
    
    /**
     * Send a text message to a specific JID
     * @param {string} to - Recipient's JID or phone number
     * @param {string} text - Message content
     * @returns {Promise<object>} Message info
     */
    async function sendTextMessage(to, text) {
        // Normalize JID (add @s.whatsapp.net if needed)
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        console.log(`Sending text message to ${jid}: "${text}"`);
        
        try {
            // Basic message
            const result = await sock.sendMessage(jid, { text });
            console.log('Message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    
    /**
     * Send an image message to a specific JID
     * @param {string} to - Recipient's JID or phone number
     * @param {string} imagePath - Path to the image file
     * @param {string} caption - Optional caption for the image
     * @returns {Promise<object>} Message info
     */
    async function sendImageMessage(to, imagePath, caption = '') {
        // Normalize JID
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        console.log(`Sending image message to ${jid} from ${imagePath}`);
        
        try {
            // Read image file
            const imageBuffer = await readFile(imagePath);
            
            // Get file extension
            const ext = path.extname(imagePath).toLowerCase();
            let mimetype = 'image/jpeg'; // Default
            
            if (ext === '.png') mimetype = 'image/png';
            else if (ext === '.gif') mimetype = 'image/gif';
            else if (ext === '.webp') mimetype = 'image/webp';
            
            // Send image message
            const result = await sock.sendMessage(jid, {
                image: imageBuffer,
                caption,
                mimetype
            });
            
            console.log('Image message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Error sending image message:', error);
            throw error;
        }
    }
    
    /**
     * Send a document/file message to a specific JID
     * @param {string} to - Recipient's JID or phone number
     * @param {string} filePath - Path to the file
     * @param {string} fileName - Name to display for the file
     * @returns {Promise<object>} Message info
     */
    async function sendDocumentMessage(to, filePath, fileName = '') {
        // Normalize JID
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        // If fileName not specified, use the original file name
        if (!fileName) {
            fileName = path.basename(filePath);
        }
        
        console.log(`Sending document message to ${jid}: ${fileName}`);
        
        try {
            // Read file
            const fileBuffer = await readFile(filePath);
            
            // Get mimetype based on file extension
            const ext = path.extname(filePath).toLowerCase();
            let mimetype = 'application/octet-stream'; // Default
            
            if (ext === '.pdf') mimetype = 'application/pdf';
            else if (ext === '.doc' || ext === '.docx') mimetype = 'application/msword';
            else if (ext === '.xls' || ext === '.xlsx') mimetype = 'application/excel';
            else if (ext === '.zip') mimetype = 'application/zip';
            else if (ext === '.mp3') mimetype = 'audio/mpeg';
            else if (ext === '.mp4') mimetype = 'video/mp4';
            
            // Send document message
            const result = await sock.sendMessage(jid, {
                document: fileBuffer,
                mimetype,
                fileName
            });
            
            console.log('Document message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Error sending document message:', error);
            throw error;
        }
    }
    
    /**
     * Send a button message to a specific JID
     * @param {string} to - Recipient's JID or phone number
     * @param {string} text - Message content
     * @param {string} footer - Footer text
     * @param {Array} buttons - Array of button objects
     * @returns {Promise<object>} Message info
     */
    async function sendButtonMessage(to, text, footer, buttons) {
        // Normalize JID
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        console.log(`Sending button message to ${jid}`);
        
        try {
            // Format buttons
            const formattedButtons = buttons.map((button, index) => ({
                buttonId: `btn_${index}`,
                buttonText: { displayText: button.text },
                type: 1
            }));
            
            // Send button message
            const result = await sock.sendMessage(jid, {
                text,
                footer,
                buttons: formattedButtons,
                headerType: 1
            });
            
            console.log('Button message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Error sending button message:', error);
            throw error;
        }
    }
    
    /**
     * Send a help message showing available commands
     * @param {object} sock - WhatsApp socket connection
     * @param {string} to - Recipient's JID
     * @returns {Promise<object>} Message info
     */
    async function sendHelpMessage(sock, to) {
        const helpText = `🤖 *Wailey Message Sender Example* 🤖

Available commands:
• *!help* - Show this message
• *!text* <message> - Send a text message
• *!image* - Send an example image
• *!document* - Send an example document
• *!buttons* - Send a message with buttons

This is a demonstration of the Wailey library's capabilities.`;

        return await sock.sendMessage(to, { text: helpText });
    }
    
    // Export the messaging functions for use in the CLI interface
    return {
        sendTextMessage,
        sendImageMessage,
        sendDocumentMessage,
        sendButtonMessage,
        sendHelpMessage,
        sock
    };
}

// If this script is run directly (not imported)
if (require.main === module) {
    // Start the message sender
    startMessageSender().then(api => {
        console.log('Message sender initialized. Waiting for connection...');
        
        // After connection is established, you can call the functions, for example:
        // setTimeout(() => {
        //     const recipientNumber = '123456789'; // Replace with a real number
        //     api.sendTextMessage(recipientNumber, 'Hello from Wailey!');
        // }, 10000);
    }).catch(err => {
        console.error('Failed to initialize message sender:', err);
    });
}

module.exports = startMessageSender;