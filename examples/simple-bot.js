/**
 * Simple Wailey-library Bot Example
 */

const { makeWASocket, DisconnectReason } = require('../lib')
const { delay } = require('../lib/Utils')
const path = require('path')
const fs = require('fs')

// Save session data between restarts
const SESSION_FILE_PATH = './session.json'
let sessionData = {}

// Load existing session
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH))
}

// Function to save credentials when updated
const saveSessionData = () => {
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData, null, 2))
}

// Start WhatsApp connection
async function connectToWhatsApp() {
    console.log('Starting WhatsApp connection...')
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: sessionData,
        browser: ['Wailey Example', 'Chrome', '1.0.0'],
    })
    
    // Save session on credentials update
    sock.ev.on('creds.update', saveSessionData)
    
    // Handle connection events
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (connection === 'close') {
            // Reconnect if not logged out
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect)
            
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened!')
        }
    })
    
    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        
        const message = messages[0]
        if (!message.message) return
        
        const messageType = Object.keys(message.message)[0]
        const chatId = message.key.remoteJid
        
        console.log(`Received message of type: ${messageType} from ${chatId}`)
        
        // Process text messages
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const text = message.message.conversation || message.message.extendedTextMessage.text
            
            // Simple command handling
            if (text.toLowerCase() === 'ping') {
                await sock.sendMessage(chatId, { text: 'Pong!' })
            } else if (text.toLowerCase() === 'hello') {
                await sock.sendMessage(chatId, { text: 'Hello from Wailey-library bot!' })
            } else if (text.toLowerCase() === 'info') {
                await sock.sendMessage(chatId, { text: 'This is a simple WhatsApp bot using Wailey-library.' })
            } else if (text.toLowerCase() === 'time') {
                const time = new Date().toLocaleString()
                await sock.sendMessage(chatId, { text: `Current time: ${time}` })
            }
        }
    })
    
    // Handle presence updates
    sock.ev.on('presence.update', ({ id, presences }) => {
        console.log(`Presence update for ${id}:`, presences)
    })
    
    return sock
}

// Start the bot
connectToWhatsApp()