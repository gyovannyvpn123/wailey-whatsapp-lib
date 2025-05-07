/**
 * Example of connecting to WhatsApp using pairing code authentication
 * Improved version with better error handling and stability
 */

const { create } = require('../index');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create session directory if not exists
const sessionDir = path.join(process.cwd(), 'auth_info_pairing');
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log(`Created session directory: ${sessionDir}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create a new WhatsApp connection with improved options
const client = create({
    auth: {
        folder: sessionDir
    },
    logger: {
        level: 'debug'
    },
    printQRInTerminal: false // No QR codes for pairing code method
});

// Event listeners with enhanced logging
client.on('pairing-code', (code) => {
    console.log('\n');
    console.log('┌─────────────────────────────────┐');
    console.log(`│  PAIRING CODE: ${code.padEnd(16)} │`);
    console.log('│                                 │');
    console.log('│  1. Open WhatsApp on your phone │');
    console.log('│  2. Go to Settings > Linked     │');
    console.log('│     Devices > Link a Device     │');
    console.log('│  3. Enter the code above when   │');
    console.log('│     prompted                    │');
    console.log('└─────────────────────────────────┘');
    console.log('\nWaiting for you to enter the code in WhatsApp...\n');
});

client.on('pairing-code-error', (error) => {
    console.error('Error requesting pairing code:', error);
    console.log('Please try again with a different phone number format or check your internet connection.');
    rl.question('Do you want to try again with a different number? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            askForPhoneNumber();
        } else {
            rl.close();
            process.exit(1);
        }
    });
});

client.on('ready', () => {
    console.log('+--------------------------+');
    console.log('| CONNECTION SUCCESSFUL!   |');
    console.log('| Client is ready to use   |');
    console.log('+--------------------------+');
    
    rl.close();
    
    // Example of sending a test message after connection
    setTimeout(async () => {
        try {
            // Replace with actual phone number before sending
            const number = "1234567890"; // Example phone number, change this
            const message = "Hello from Wailey WhatsApp Lib! This message was sent using pairing code authentication.";
            
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
    rl.close();
    process.exit(0);
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
    rl.close();
    process.exit(0);
};

// Setup clean exit handlers
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// Function to validate phone number
function validatePhoneNumber(phoneNumber) {
    // Remove any non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Basic validation: must have between 10 and 15 digits (including country code)
    return /^\d{10,15}$/.test(cleanNumber) ? cleanNumber : null;
}

// Function to ask for phone number
function askForPhoneNumber() {
    rl.question('Enter your phone number with country code (e.g., 12125551234): ', (phoneNumber) => {
        const cleanNumber = validatePhoneNumber(phoneNumber);
        
        if (!cleanNumber) {
            console.log('Invalid phone number format. Please include the country code (e.g., 12125551234 for US)');
            return askForPhoneNumber();
        }
        
        // Connect to WhatsApp using pairing code
        console.log(`Requesting pairing code for ${cleanNumber}...`);
        console.log('Please wait, this might take a few moments...');
        
        client.connectWithPairingCode(cleanNumber)
            .then(() => {
                console.log('Connection process started');
                
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
                rl.question('Do you want to try again? (y/n): ', (answer) => {
                    if (answer.toLowerCase() === 'y') {
                        askForPhoneNumber();
                    } else {
                        rl.close();
                        process.exit(1);
                    }
                });
            });
    });
}

// Start the process
console.log('Starting WhatsApp connection with Pairing Code authentication...');
askForPhoneNumber();
