/**
 * Demo for Wailey WhatsApp Library
 * Shows both QR code and phone number pairing code functionality
 */

const whatsapp = require('./index.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs');

// ASCII Art Banner
console.log(`
██████╗  ██████╗ ██████╗ ██╗   ██╗████████╗ ██████╗     ██╗   ██╗██████╗ ███╗   ██╗
██╔══██╗██╔═══██╗██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗    ██║   ██║██╔══██╗████╗  ██║
██████╔╝██║   ██║██████╔╝██║   ██║   ██║   ██║   ██║    ██║   ██║██████╔╝██╔██╗ ██║
██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   ██║   ██║    ╚██╗ ██╔╝██╔═══╝ ██║╚██╗██║
██████╔╝╚██████╔╝██║  ██║╚██████╔╝   ██║   ╚██████╔╝     ╚████╔╝ ██║     ██║ ╚████║
╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝       ╚═══╝  ╚═╝     ╚═╝  ╚═══╝
                                                                                    
██████╗  ██████╗ ████████╗
██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██║   ██║   ██║   
██╔══██╗██║   ██║   ██║   
██████╔╝╚██████╔╝   ██║   
╚═════╝  ╚═════╝    ╚═╝   

`);

console.log('\n=== WAILEY WHATSAPP LIBRARY DEMO ===\n');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a WhatsApp client instance
const client = whatsapp.create({
    printQRInTerminal: false,
    sessionPath: './whatsapp-session'
});

console.log('Starting WhatsApp client...\n');

// Register event handlers
client.on(whatsapp.Events.QR_CODE, (qr) => {
    console.log('=============QR CODE RECEIVED=============');
    qrcode.generate(qr, { small: true });
    console.log('\nMETHOD 1: Scan this QR code in WhatsApp to log in');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap on "Link a Device"');
    console.log('4. Scan the QR code above');
    console.log('\nOR enter your phone number below to get a pairing code instead');
    console.log('=======================================');
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
    console.log('\n=============PAIRING CODE RECEIVED=============\n');
    console.log(`METHOD 2: Use this code to pair your phone: ${code}\n`);
    console.log('Follow these steps:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap on "Link a Device"');
    console.log('4. When prompted for QR scan, tap "LINK WITH PHONE NUMBER INSTEAD"');
    console.log('5. Enter your phone number and then the 8-digit code above\n');
    console.log('=======================================\n');
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
    console.log('\n✅ AUTHENTICATED SUCCESSFULLY!');
});

client.on(whatsapp.Events.READY, () => {
    console.log('\n✅ CLIENT IS READY!');
});

client.on(whatsapp.Events.ERROR, (err) => {
    console.error('\n❌ ERROR:', err.message);
});

// Check if a phone number was provided as input
let phoneNumberInput = process.argv[2];

// If no argument is provided, check if there's piped input
if (!phoneNumberInput) {
    try {
        // Read from stdin if data is available
        const stdinBuffer = fs.readFileSync(0, 'utf-8');
        if (stdinBuffer && stdinBuffer.trim()) {
            phoneNumberInput = stdinBuffer.trim();
        }
    } catch (error) {
        // No stdin data available, will use interactive mode
    }
}

// Initialize the client
console.log('Initializing WhatsApp connection...');
client.initialize().then(async () => {
    console.log('✅ Initialization completed\n');
    
    // Non-interactive mode if phone number was provided
    if (phoneNumberInput) {
        console.log(`📱 Requesting pairing code for ${phoneNumberInput}...`);
        
        try {
            await client.requestPairingCode(phoneNumberInput);
            
            // Keep running for a short time to see the results
            console.log('\nDemo will run for 30 seconds...');
            setTimeout(() => {
                console.log('\nDemo completed, closing client...');
                client.destroy().then(() => {
                    rl.close();
                    process.exit(0);
                });
            }, 30000);
            
        } catch (err) {
            console.error(`❌ Failed to request pairing code: ${err.message}`);
            client.destroy().then(() => {
                rl.close();
                process.exit(1);
            });
        }
    } else {
        // Interactive mode
        rl.question('Enter your phone number with country code (e.g., +40756461234) or press Enter to skip: ', async (phoneNumber) => {
            
            if (phoneNumber && phoneNumber.trim() !== '') {
                console.log(`📱 Requesting pairing code for ${phoneNumber}...`);
                
                try {
                    await client.requestPairingCode(phoneNumber);
                } catch (err) {
                    console.error(`❌ Failed to request pairing code: ${err.message}`);
                }
            } else {
                console.log('⏭️ Skipping pairing code, please use QR code method instead.');
            }
            
            // Keep the demo running for a while
            console.log('\nDemo will run for 2 minutes to allow testing both methods...');
            setTimeout(() => {
                console.log('\nDemo completed, closing client...');
                client.destroy().then(() => {
                    rl.close();
                    process.exit(0);
                });
            }, 120000); // 2 minutes
        });
    }
}).catch(err => {
    console.error(`❌ Initialization failed: ${err.message}`);
    rl.close();
    process.exit(1);
});