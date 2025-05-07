/**
 * Connection tests for the Wailey WhatsApp Library
 * Enhanced version with better error handling and support for both connection methods
 */

'use strict';

const { WAConnection } = require('../src');
const fs = require('fs');
const path = require('path');

// Clean test sessions
function cleanSessions(sessionName) {
  const sessionDir = path.join(process.cwd(), 'sessions', sessionName);
  
  if (fs.existsSync(sessionDir)) {
    console.log(`Cleaning previous session: ${sessionName}`);
    try {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      fs.mkdirSync(sessionDir, { recursive: true });
      console.log(`Session directory cleaned and recreated: ${sessionName}`);
    } catch (error) {
      console.error(`Error cleaning session directory: ${error.message}`);
    }
  } else {
    console.log(`Created session directory: ${sessionName}`);
    fs.mkdirSync(sessionDir, { recursive: true }, { recursive: true });
  }
}

// Test QR code connection
async function testQRConnection() {
  console.log('Testing QR code connection...');
  
  // Create a clean session
  const sessionName = 'test-qr-session';
  cleanSessions(sessionName);
  
  // Create connection client
  const client = new WAConnection({
    authStateDir: path.join(process.cwd(), 'sessions', sessionName),
    printQR: true,
    debug: true
  });
  
  // Set up event listeners
  client.on('qr', (qr) => {
    console.log('QR CODE RECEIVED!');
    // QR will be displayed by printQR option
  });
  
  client.on('ready', () => {
    console.log('CONNECTION ESTABLISHED! Client is ready.');
  });
  
  client.on('connection-status', (status) => {
    console.log('Connection status:', status);
  });
  
  // Connect using QR code
  await client.init();
  await client.connectWithQR();
  console.log('QR connection result:', { success: true, message: 'Connected with QR code' });
  
  // Wait for 30 seconds to scan QR code
  console.log('Please scan the QR code within 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Check connection status
  const isConnected = client.isConnected();
  const status = {
    connected: isConnected,
    state: client.getConnectionStatus(),
    reconnectAttempts: client.reconnectAttempts,
    sessionName: sessionName
  };
  
  console.log('Connection status:', status);
  return isConnected;
}

// Test pairing code connection
async function testPairingCodeConnection(phoneNumber) {
  console.log('Testing pairing code connection...');
  
  if (!phoneNumber) {
    console.log('No phone number provided for pairing code test');
    return false;
  }
  
  // Format the phone number - remove any non-digit characters
  phoneNumber = phoneNumber.replace(/\D/g, '');
  console.log(`Using phone number: ${phoneNumber} (Formatted)`);
  
  // Create a clean session
  const sessionName = 'test-pairing-session';
  cleanSessions(sessionName);
  
  // Create connection client
  const client = new WAConnection({
    authStateDir: path.join(process.cwd(), 'sessions', sessionName),
    debug: true,
    printQR: false // We don't need QR for pairing code auth
  });
  
  // Set up event listeners with improved display
  client.on('pairing-code', (code) => {
    // Make the pairing code more visible with a nicer box
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
    console.error('Error getting pairing code:', error);
    // Display more detailed error information for debugging
    if (error.output && error.output.payload) {
      console.error('Error details:', {
        statusCode: error.output.statusCode,
        error: error.output.payload.error,
        message: error.output.payload.message
      });
    }
  });
  
  client.on('ready', () => {
    console.log('✅ CONNECTION ESTABLISHED! Client is ready.');
  });
  
  client.on('connection-status', (status) => {
    console.log('Connection status changed to:', status);
  });
  
  // Event for creds updates to know if the authentication state is being saved
  client.on('creds-updated', () => {
    console.log('Credentials have been updated and saved');
  });
  
  // Connect using pairing code
  await client.init();
  try {
    await client.connectWithPairingCode(phoneNumber);
    console.log('Started pairing code connection process');
    
    // Wait for 60 seconds to enter the pairing code
    console.log('Waiting 60 seconds for pairing code entry...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Check connection status
    const isConnected = client.isConnected();
    const status = {
      connected: isConnected,
      state: client.getConnectionStatus(),
      reconnectAttempts: client.reconnectAttempts || 0,
      sessionName: sessionName
    };
    
    console.log('Final connection status:', status);
    return isConnected;
  } catch (error) {
    console.error('Error in pairing code connection:', error);
    return false;
  }
}

// Run the tests
async function runTests() {
  try {
    const args = process.argv.slice(2);
    const testType = args[0] || 'qr';
    const phoneNumber = args[1];
    
    if (testType === 'qr') {
      await testQRConnection();
    } else if (testType === 'pairing') {
      if (!phoneNumber) {
        console.error('Phone number is required for pairing code test');
        console.log('Usage: node connection.test.js pairing 1234567890');
        process.exit(1);
      }
      await testPairingCodeConnection(phoneNumber);
    } else {
      console.error('Unknown test type:', testType);
      console.log('Usage: node connection.test.js [qr|pairing] [phoneNumber]');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testQRConnection, testPairingCodeConnection };
