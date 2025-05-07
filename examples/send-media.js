/**
 * Wailey-library Media Sending Example
 */

const { makeWASocket, DisconnectReason } = require('../lib')
const { delay } = require('../lib/Utils')
const fs = require('fs')
const path = require('path')

// Load session data if exists
const SESSION_FILE_PATH = './session.json'
let sessionData = {}

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH))
}

const saveSessionData = () => {
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData, null, 2))
}

async function startMediaSender() {
    console.log('Starting Wailey media sender...')
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: sessionData,
        browser: ['Wailey Media Example', 'Chrome', '1.0.0'],
    })
    
    // Save session on credentials update
    sock.ev.on('creds.update', saveSessionData)
    
    // Handle connection events
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect)
            
            if (shouldReconnect) {
                startMediaSender()
            }
        } else if (connection === 'open') {
            console.log('Connection opened!')
        }
    })
    
    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0]
        if (!message.message || message.key.fromMe) return
        
        const chatId = message.key.remoteJid
        
        if (message.message?.conversation) {
            const text = message.message.conversation.toLowerCase()
            
            // Command to send each media type
            if (text === 'image') {
                await sendImage(sock, chatId)
            } else if (text === 'video') {
                await sendVideo(sock, chatId)
            } else if (text === 'audio') {
                await sendAudio(sock, chatId)
            } else if (text === 'document') {
                await sendDocument(sock, chatId)
            } else if (text === 'sticker') {
                await sendSticker(sock, chatId)
            } else if (text === 'help') {
                await sendHelpMessage(sock, chatId)
            }
        }
    })
}

// Media sending functions
async function sendImage(sock, chatId) {
    // In a real scenario, you would access an actual image file
    const imageData = {
        image: { url: 'https://example.com/image.jpg' },
        caption: 'This is an image sent from Wailey-library!'
    }
    
    try {
        await sock.sendMessage(chatId, imageData)
        console.log('Image sent successfully')
    } catch (error) {
        console.error('Error sending image:', error)
    }
}

async function sendVideo(sock, chatId) {
    // In a real scenario, you would access an actual video file
    const videoData = {
        video: { url: 'https://example.com/video.mp4' },
        caption: 'This is a video sent from Wailey-library!',
        gifPlayback: false
    }
    
    try {
        await sock.sendMessage(chatId, videoData)
        console.log('Video sent successfully')
    } catch (error) {
        console.error('Error sending video:', error)
    }
}

async function sendAudio(sock, chatId) {
    // In a real scenario, you would access an actual audio file
    const audioData = {
        audio: { url: 'https://example.com/audio.mp3' },
        mimetype: 'audio/mp3',
        ptt: false // set to true for voice note
    }
    
    try {
        await sock.sendMessage(chatId, audioData)
        console.log('Audio sent successfully')
    } catch (error) {
        console.error('Error sending audio:', error)
    }
}

async function sendDocument(sock, chatId) {
    // In a real scenario, you would access an actual document file
    const documentData = {
        document: { url: 'https://example.com/document.pdf' },
        mimetype: 'application/pdf',
        fileName: 'Wailey-document.pdf'
    }
    
    try {
        await sock.sendMessage(chatId, documentData)
        console.log('Document sent successfully')
    } catch (error) {
        console.error('Error sending document:', error)
    }
}

async function sendSticker(sock, chatId) {
    // In a real scenario, you would access an actual sticker file
    const stickerData = {
        sticker: { url: 'https://example.com/sticker.webp' }
    }
    
    try {
        await sock.sendMessage(chatId, stickerData)
        console.log('Sticker sent successfully')
    } catch (error) {
        console.error('Error sending sticker:', error)
    }
}

async function sendHelpMessage(sock, chatId) {
    const helpText = `*Wailey Media Sender*
    
Available commands:
- *image* - sends a sample image
- *video* - sends a sample video
- *audio* - sends a sample audio
- *document* - sends a sample document
- *sticker* - sends a sample sticker
- *help* - shows this help message`

    await sock.sendMessage(chatId, { text: helpText })
}

// Start the bot
startMediaSender()