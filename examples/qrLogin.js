/**
 * Example of connecting to WhatsApp using QR code authentication
 * Improved version with better error handling and stability
 */

const { create } = require('../index');
const fs = require('fs');
const path = require('path');

// Create session directory if not exists
const sessionDir = path.join(process.cwd(), 'auth_info');
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log(`Created session directory: ${sessionDir}`);
}

// Create a new WhatsApp connection with improved options
const client = create({
    auth: {
        folder: sessionDir
    },
    printQRInTerminal: true,
    logger: {
        level: 'debug'
    }
});

// Event listeners with enhanced logging
client.on('qr', (qr) => {
    console.log('+--------------------------+');
    console.log('| QR CODE READY TO SCAN    |');
    console.log('| Scan with WhatsApp mobile|');
    console.log('+--------------------------+');
    // QR code will be printed in the terminal by the library
});

client.on('ready', () => {
    console.log('+--------------------------+');
    console.log('| CONNECTION SUCCESSFUL!   |');
    console.log('| Client is ready to use   |');
    console.log('+--------------------------+');
    
    // Example of sending a test message after connection
    setTimeout(async () => {
        try {
            // Replace with actual phone number before sending
            const number = "1234567890"; // Example phone number, change this
            const message = "Hello from Wailey WhatsApp Lib! This is a test message.";
            
            console.log(`Would send message to ${number} if uncommented`);
            // Uncomment the following lines to send an actual message
            // const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
            // await client.socket.sendMessage(jid, { text: message });
            // console.log(`Message sent to ${number}`);
        } catch (error) {
            console.error('Error in test message function:', error);
        }
    }, 5000);
});

client.on('connection-status', (status) => {
    console.log(`Connection status changed to: ${status}`);
});

client.on('disconnected', () => {
    console.log('Client disconnected from WhatsApp');
    process.exit(0); // Exit cleanly on disconnect
});

client.on('creds-updated', () => {
    console.log('Credentials have been updated and saved');
});

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit here, let the reconnection mechanism work
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Don't exit here, let the reconnection mechanism work
});

// Function to gracefully close connection on exit
const handleExit = async () => {
    console.log('Received exit signal. Disconnecting...');
    try {
        if (client.socket) {
            await client.disconnect();
        }
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
    }
    process.exit(0);
};

// Setup clean exit handlers
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// Connect to WhatsApp using QR code
console.log('Starting WhatsApp connection with QR authentication...');
client.connectWithQR()
    .then(() => {
        console.log('Connection process initiated successfully');
        
        // Advanced message listener
        client.socket.ev.on('messages.upsert', async (m) => {
            console.log('New message event received:', m.type);
            
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    if (!msg.key.fromMe && msg.message) {
                        // Skip status messages
                        if (msg.key.remoteJid === 'status@broadcast') continue;
                        
                        // Extract message content
                        let messageContent = '';
                        if (msg.message.conversation) {
                            messageContent = msg.message.conversation;
                        } else if (msg.message.extendedTextMessage) {
                            messageContent = msg.message.extendedTextMessage.text;
                        } else {
                            messageContent = 'Media or non-text message';
                        }
                        
                        console.log(`New message from ${msg.key.remoteJid}:`);
                        console.log(`Content: ${messageContent}`);
                        
                        // Uncomment to auto-reply to messages
                        // const jid = msg.key.remoteJid;
                        // await client.socket.sendMessage(jid, { 
                        //     text: 'I received your message! This is an auto-reply.' 
                        // });
                    }
                }
            }
        });
    })
    .catch((error) => {
        console.error('Error connecting to WhatsApp:', error);
        // Retry connection after delay
        console.log('Will retry connection in 10 seconds...');
        setTimeout(() => {
            console.log('Retrying connection...');
            client.connectWithQR().catch(err => {
                console.error('Retry failed:', err);
                process.exit(1);
            });
        }, 10000);
    });
