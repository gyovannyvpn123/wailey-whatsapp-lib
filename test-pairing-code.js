/**
 * Test script for pairing code functionality
 */

const whatsapp = require('./index.js');

// Create a WhatsApp client instance
const client = whatsapp.create({
    printQRInTerminal: false,
    sessionPath: './whatsapp-session-test'
});

// Set up event listeners
client.on(whatsapp.Events.QR_CODE, (qr) => {
    console.log('QR code received (not displaying it to focus on pairing code)');
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
    console.log('\n=============PAIRING CODE RECEIVED=============');
    console.log(`Pairing code: ${code}`);
    console.log('=======================================\n');
});

client.on(whatsapp.Events.ERROR, (err) => {
    console.error('ERROR:', err.message || err);
});

// Initialize the client and test pairing code
async function run() {
    try {
        console.log('Initializing WhatsApp client...');
        await client.initialize();
        console.log('Initialization completed');
        
        // Test with a sample phone number
        const phoneNumber = '+4075646XXXX'; // Replace with a real number in production
        console.log(`Requesting pairing code for ${phoneNumber}...`);
        
        const pairingCode = await client.requestPairingCode(phoneNumber);
        console.log('Raw pairing code result:', pairingCode);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        // Close the client after 5 seconds
        setTimeout(async () => {
            console.log('Test completed, closing client...');
            await client.destroy();
            process.exit(0);
        }, 5000);
    }
}

// Run the test
run();