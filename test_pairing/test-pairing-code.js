/**
 * Wailey-library Pairing Code Test
 * 
 * This example tests the pairing code functionality of Wailey-library
 * It includes:
 * - Connecting to WhatsApp
 * - Requesting a pairing code for a phone number
 * - Handling connection events
 */

const { makeWASocket, DisconnectReason } = require('../lib');
const { useMultiFileAuthState } = require('../lib/Utils/use-multi-file-auth-state');
const Pino = require('pino');
const fs = require('fs');
const readline = require('readline');

// Create a readline interface for terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question in terminal
const askQuestion = (query) =>
  new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer.trim()));
  });

// Helper for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testPairingCode() {
  console.log("========================================");
  console.log("Wailey-library Pairing Code Test");
  console.log("========================================");
  
  // Create auth folder if it doesn't exist
  const AUTH_FOLDER = './auth_wailey_test';
  if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
  }
  
  // Load authentication state
  console.log("Loading authentication state...");
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  
  // Create WhatsApp socket
  console.log("Initializing connection...");
  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true
  });
  
  // Test if pairing code functionality exists
  if (typeof sock.requestPairingCode === 'function') {
    console.log("✅ Pairing code functionality is available");
    
    // If not registered, get a pairing code
    if (!state.creds?.registered) {
      try {
        const phoneNumber = await askQuestion("Enter phone number with country code (e.g., 40711111111): ");
        
        console.log("Requesting pairing code...");
        // Add delay to ensure connection is established
        await delay(3000);
        
        // Request pairing code
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("\n====================================");
        console.log(`🔑 Your pairing code: ${code}`);
        console.log("====================================\n");
        console.log("Enter this code in WhatsApp > Settings > Linked Devices > Link Device");
        
        // Wait for authentication
        console.log("Waiting for authentication... This may take a moment.");
      } catch (error) {
        console.error("❌ Error requesting pairing code:", error);
        console.log("\nPossible solutions:");
        console.log("1. Make sure you have a stable internet connection");
        console.log("2. Check if your phone number is in the correct format (with country code)");
        console.log("3. Try again in a few minutes");
        process.exit(1);
      }
    } else {
      console.log("Device already registered!");
    }
  } else {
    console.log("❌ Pairing code functionality is NOT available in this version");
    process.exit(1);
  }
  
  // Handle connection updates
  if (sock.ev && typeof sock.ev.on === 'function') {
    sock.ev.on('connection.update', async (update) => {
      if (!update) return;
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Connection closed due to", lastDisconnect?.error?.message || "unknown reason");
        
        if (shouldReconnect) {
          console.log("Reconnecting...");
          await delay(3000);
          testPairingCode();
        } else {
          console.log("Connection closed permanently");
          process.exit(0);
        }
      } else if (connection === 'open') {
        console.log("\n✅ Successfully connected to WhatsApp!");
        console.log("You can now use the library for sending and receiving messages.");
      }
    });
    
    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);
  } else {
    console.log("⚠️ Event handling is not available in this version");
  }
  
  return sock;
}

// Start the test
testPairingCode();