/**
 * Wailey-library Multi-Device Authentication Example
 * 
 * This example demonstrates how to use multi-device authentication
 * with WhatsApp Web. It includes:
 * - Connecting with multi-device support
 * - Pairing with a phone number
 * - Managing authentication state
 * - Reconnecting with saved credentials
 */

const { makeWASocket, DisconnectReason } = require('../lib')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { useMultiFileAuthState } = require('../lib/Utils/use-multi-file-auth-state')

// Path to store authentication state
const AUTH_FOLDER = path.join(__dirname, 'multi_device_auth')

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Prompt for user input
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve))

// Function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Main function to establish connection
async function connectWithMultiDevice() {
  ensureDirectoryExists(AUTH_FOLDER)
  
  // Load or initialize authentication state
  const { state, saveState } = await useMultiFileAuthState(AUTH_FOLDER)
  
  // Create socket connection with options
  const socket = makeWASocket({
    logger: console,
    printQRInTerminal: false, // We'll handle QR code ourselves
    auth: state,
    browser: ['Wailey MultiDevice', 'Chrome', '1.0.0'],
    defaultQueryTimeoutMs: 60000, // Longer timeout for pairing
  })
  
  // Handle connection updates
  socket.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    
    // Handle QR code
    if (qr) {
      console.log('QR Code received. Scan with your phone:')
      qrcode.generate(qr, { small: true })
      
      // Ask if user wants to pair with phone number instead
      const usePairingCode = await prompt('Would you like to pair with a phone number instead? (y/n): ')
      if (usePairingCode.toLowerCase() === 'y') {
        const phoneNumber = await prompt('Enter your phone number with country code (e.g., +1234567890): ')
        try {
          const pairingCode = await socket.requestPairingCode(phoneNumber)
          console.log(`Pairing code: ${pairingCode}. Enter this on your WhatsApp app.`)
        } catch (error) {
          console.error('Failed to request pairing code:', error)
        }
      }
    }
    
    // Handle connection status changes
    if (connection === 'open') {
      console.log('Connected to WhatsApp!')
      const phoneNumber = socket.user?.id?.split(':')[0] || 'Unknown'
      console.log(`Logged in as: +${phoneNumber}`)
      
      // Close readline interface once connected
      rl.close()
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      
      console.log('Connection closed due to ', lastDisconnect?.error)
      
      if (shouldReconnect) {
        console.log('Reconnecting...')
        setTimeout(connectWithMultiDevice, 5000)
      } else {
        console.log('Not reconnecting. Session logged out.')
        rl.close()
      }
    }
  })
  
  // Save authentication state on change
  socket.on('auth.update', () => {
    saveState()
    console.log('Authentication state updated')
  })
  
  // Handle incoming messages
  socket.on('messages.upsert', async ({ messages }) => {
    // Process only new messages
    for (const message of messages) {
      // Skip status messages and outgoing messages
      if (message.key.remoteJid === 'status@broadcast' || message.key.fromMe) {
        continue
      }
      
      const sender = message.key.remoteJid
      const senderName = message.pushName || 'Unknown'
      
      // Extract the message content
      const messageContent = message.message?.conversation ||
                            message.message?.extendedTextMessage?.text ||
                            message.message?.imageMessage?.caption ||
                            message.message?.videoMessage?.caption ||
                            ''
      
      console.log(`New message from ${senderName} (${sender}): ${messageContent}`)
    }
  })
  
  return socket
}

// Start the connection
console.log('Starting WhatsApp connection with multi-device support...')
connectWithMultiDevice()
  .catch(err => {
    console.error('Error in WhatsApp connection:', err)
    rl.close()
  })