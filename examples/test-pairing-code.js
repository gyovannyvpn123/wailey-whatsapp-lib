/**
 * Wailey-library Pairing Code Test
 * 
 * Acest exemplu arată cum să te conectezi la WhatsApp
 * folosind un cod de asociere (pairing code) în loc de QR Code
 */

const { makeWASocket, useMultiFileAuthState } = require('../lib');

async function testPairingCode() {
    console.log(`
╔══════════════════════════════════════════════════════╗
║              WAILEY PAIRING CODE TEST                ║
║                                                      ║
║   Acest script va cere un cod de asociere pentru     ║
║   a conecta dispozitivul tău la WhatsApp             ║
╚══════════════════════════════════════════════════════╝
    `);

    // Încarcă starea de autentificare (dacă există)
    console.log('Inițializez starea de autentificare...');
    const { state, saveCreds } = await useMultiFileAuthState('./test_pairing/auth_info');
    
    // Creează conexiunea WhatsApp
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Nu afișa codul QR (vom folosi pairing code)
        browser: ['Wailey Test', 'Firefox', '120.0.4'],
        logger: {
            info: console.log,
            error: console.error,
            warn: console.warn,
            debug: () => {} // Dezactivează log-urile de debug
        }
    });
    
    // Înregistrează un eveniment pentru actualizarea stării conexiunii
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            console.log('Conexiunea s-a închis. Motivul:', lastDisconnect?.error?.message);
            if (lastDisconnect?.error?.output?.statusCode !== 401) {
                console.log('Eroare temporară, reconectare...');
                setTimeout(testPairingCode, 2000);
            } else {
                console.log('Deconectat permanent (LoggedOut)');
            }
        } else if (connection === 'open') {
            console.log('Conexiune stabilită cu succes!');
            console.log('Detalii cont:', sock.user);
        }
    });
    
    // Înregistrează funcția de salvare a credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Înregistrează un eveniment pentru codul de asociere
    sock.ev.on('auth.code', (code) => {
        console.log(`
╔══════════════════════════════════════════════════════╗
║                  COD DE ASOCIERE                     ║
║                                                      ║
║  Pentru numărul ${code.phoneNumber}                    
║  Cod: ${code.code}                                   
║                                                      ║
║  Introdu acest cod în aplicația WhatsApp             ║
║  pe telefonul tău când ți se solicită.              ║
╚══════════════════════════════════════════════════════╝
        `);
    });
    
    // Solicită un cod de asociere pentru un număr de telefon
    const phoneNumber = process.argv[2]; // Citește numărul de telefon din argumentele de linie de comandă
    
    if (!phoneNumber) {
        console.log(`
╔══════════════════════════════════════════════════════╗
║                       EROARE                         ║
║                                                      ║
║  Te rugăm să specifici un număr de telefon:          ║
║  node test-pairing-code.js +40123456789              ║
║                                                      ║
║  Trebuie să incluzi prefixul țării (+xx)             ║
╚══════════════════════════════════════════════════════╝
        `);
        process.exit(1);
    }
    
    // Solicită codul de asociere
    try {
        console.log(`Solicit cod de asociere pentru numărul: ${phoneNumber}`);
        const code = await sock.requestPairingCode(phoneNumber);
        console.log('Cod de asociere solicitat cu succes!');
        
        if (code && code.pairingCode) {
            console.log(`
╔══════════════════════════════════════════════════════╗
║                  COD DE ASOCIERE                     ║
║                                                      ║
║  Pentru numărul ${phoneNumber}                       
║  Cod: ${code.pairingCode}                            
║                                                      ║
║  Introdu acest cod în aplicația WhatsApp             ║
║  pe telefonul tău când ți se solicită.              ║
╚══════════════════════════════════════════════════════╝
            `);
        }
    } catch (error) {
        console.error('Eroare la solicitarea codului de asociere:', error);
    }
    
    // Înregistrează handler pentru mesaje
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type === 'notify') {
            for (const message of messages) {
                console.log(`
╔══════════════════════════════════════════════════════╗
║                   MESAJ NOU                          ║
║                                                      ║
║  De la: ${message.key.remoteJid}                     
║  Conținut: ${message.message?.conversation || 'Media sau alt tip'}
╚══════════════════════════════════════════════════════╝
                `);
            }
        }
    });
    
    // Așteaptă conexiunea
    console.log('Aștept conectarea la WhatsApp...');
}

// Pornește testul
testPairingCode();