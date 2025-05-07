/**
 * Test script for pairing code functionality with a real phone number
 */

const whatsapp = require('./index.js');
const qrcode = require('qrcode-terminal');

// Create a WhatsApp client instance
const client = whatsapp.create({
    printQRInTerminal: false,
    sessionPath: './whatsapp-session-real'
});

// Set up event listeners
client.on(whatsapp.Events.QR_CODE, (qr) => {
    console.log('\n=============QR CODE RECEIVED=============');
    // Display QR code in terminal for easy scanning
    qrcode.generate(qr, { small: true });
    console.log('Scan this QR code in WhatsApp to log in (optional)');
    console.log('=======================================\n');
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
    console.log('\n=============PAIRING CODE RECEIVED=============');
    console.log(`\nUse this code to pair your phone: ${code}`);
    console.log('\nFollow these steps:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap on "Link a Device"');
    console.log('4. When prompted for QR scan, tap "LINK WITH PHONE NUMBER INSTEAD"');
    console.log('5. Enter your phone number and then the 8-digit code above');
    console.log('\n=======================================');
});

client.on(whatsapp.Events.AUTHENTICATED, (session) => {
    console.log('\n✅ AUTHENTICATED SUCCESSFULLY!');
    if (session && session.id) {
        console.log(`Connected as: ${session.name || session.id}`);
    }
});

client.on(whatsapp.Events.READY, () => {
    console.log('\n✅ CLIENT IS READY!');
});

client.on(whatsapp.Events.ERROR, (err) => {
    console.error('\n❌ ERROR:', err);
});

// Initialize the client and test pairing code
async function run() {
    try {
        console.log('Initializing WhatsApp client...');
        await client.initialize();
        console.log('Initialization completed');
        
        // Test with the real phone number
        const phoneNumber = '+40748427351';
        console.log(`\nRequesting pairing code for ${phoneNumber}...`);
        
        const pairingCode = await client.requestPairingCode(phoneNumber);
        console.log('Raw pairing code result:', pairingCode);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        // Keep the connection open for 2 minutes to allow testing
        console.log('\nKeeping connection open for 2 minutes to allow testing...');
        setTimeout(async () => {
            console.log('Test completed, closing client...');
            await client.destroy();
            process.exit(0);
        }, 120000); // 2 minutes
    }
}

// Run the test
run();