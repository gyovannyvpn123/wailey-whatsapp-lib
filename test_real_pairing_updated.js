/**
 * Test pentru codul de asociere direct pentru wailey-whatsapp-lib cu implementarea reparată
 * Acest script testează generarea codurilor de asociere fără necesitatea scanării codului QR
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');

// Funcții de validare și formatare
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
}

function formatPhoneNumber(phoneNumber) {
    // Eliminăm orice caracter non-numeric
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Adăugăm prefixul + dacă nu există
    if (!cleaned.startsWith('+')) {
        return '+' + cleaned;
    }
    
    return cleaned;
}

// Funcția principală
async function main() {
    // Creăm interfața readline
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // Funcție pentru a citi input de la utilizator
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    try {
        // Solicităm numărul de telefon
        const phoneNumber = await question('Introdu numărul tău de telefon (ex: 40712345678): ');
        
        if (!validatePhoneNumber(phoneNumber)) {
            console.error('Număr de telefon invalid. Te rog să folosești formatul internațional fără +.');
            rl.close();
            return;
        }
        
        console.log(`\nUtilizare număr: ${phoneNumber}`);
        console.log('Inițializare client WhatsApp...\n');
        
        // Creăm directorul de sesiune dacă nu există
        const sessionFolder = `./test_session_real_updated`;
        if (!fs.existsSync(sessionFolder)) {
            fs.mkdirSync(sessionFolder, { recursive: true });
        }
        
        // Obținem starea de autentificare
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        
        // Creăm socket-ul WhatsApp cu configurația CRUCIALĂ pentru codurile de asociere
        const sock = makeWASocket({
            browser: ['Ubuntu', 'Chrome', '114.0.0'], // Această configurație este ESENȚIALĂ
            printQRInTerminal: false, // Nu este nevoie să afișăm QR code
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            logger: pino({ level: 'warn' }) // Reducem nivelul de logging
        });
        
        // Ascultăm pentru actualizări de credențiale
        sock.ev.on('creds.update', saveCreds);
        
        // Funcție implementată manual pentru a obține cod de asociere
        // Aceasta este implementarea pe care o recomandăm pentru wailey-whatsapp-lib
        async function obtainPairingCode(phoneNumber) {
            try {
                const formattedNumber = formatPhoneNumber(phoneNumber);
                console.log(`Requesting pairing code for: ${formattedNumber}`);
                
                // Solicităm codul de asociere direct
                const pairingCode = await sock.requestPairingCode(formattedNumber);
                
                console.log('Pairing code response:', typeof pairingCode, pairingCode);
                
                // Verificăm răspunsul și încercăm să extragem codul corect
                let code;
                if (typeof pairingCode === 'string') {
                    code = pairingCode;
                } else if (pairingCode && pairingCode.code) {
                    code = pairingCode.code;
                } else if (pairingCode && typeof pairingCode.toString === 'function') {
                    code = pairingCode.toString();
                } else {
                    throw new Error('Invalid response format from WhatsApp server');
                }
                
                // Verificăm dacă este un cod demo sau nu
                if (code === '12345678') {
                    console.warn('⚠️ ATENȚIE: S-a primit codul demo, ceea ce indică o problemă!');
                }
                
                return code;
            } catch (error) {
                console.error('Error obtaining pairing code:', error);
                
                // Dacă primim o eroare specifică despre scanarea QR code, încercăm o abordare alternativă
                if (error.message.includes('scan the QR code first') || error.message.includes('Precondition Required')) {
                    console.log('Se încearcă metoda alternativă - crearea unui nou socket...');
                    
                    // Creăm un socket nou special pentru codul de asociere
                    const { state: altState } = await useMultiFileAuthState(sessionFolder + '_alt');
                    
                    const altSock = makeWASocket({
                        browser: ['Ubuntu', 'Chrome', '114.0.0'],
                        printQRInTerminal: false,
                        auth: {
                            creds: altState.creds,
                            keys: makeCacheableSignalKeyStore(altState.keys, pino({ level: 'silent' }))
                        },
                        logger: pino({ level: 'silent' })
                    });
                    
                    try {
                        // Încercăm să obținem codul de asociere de la noul socket
                        const altCode = await altSock.requestPairingCode(formattedNumber);
                        
                        console.log('Cod alternativ primit:', altCode);
                        
                        // Închidem socket-ul alternativ
                        setTimeout(() => {
                            try {
                                altSock.end();
                            } catch (e) {}
                        }, 1000);
                        
                        return typeof altCode === 'string' ? altCode : altCode.toString();
                    } catch (altError) {
                        console.error('Eroare și la metoda alternativă:', altError);
                        throw altError;
                    }
                }
                
                throw error;
            }
        }
        
        // Solicităm codul de asociere folosind implementarea noastră robustă
        console.log('Solicit cod de asociere...');
        const pairingCode = await obtainPairingCode(phoneNumber);
        
        console.log(`\nCod de asociere primit: ${pairingCode}`);
        console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
        console.log('Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
        
        // Așteptăm pentru evenimente de conexiune
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                console.log('✅ Conectat cu succes la WhatsApp!');
                console.log('Informații cont:', sock.user);
                setTimeout(() => {
                    rl.close();
                    process.exit(0);
                }, 3000);
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('Conexiune închisă, se încearcă reconectarea...');
                } else {
                    console.log('Deconectat (logged out).');
                    rl.close();
                    process.exit(0);
                }
            }
        });
        
    } catch (error) {
        console.error('Eroare generală:', error);
        rl.close();
    }
}

// Rulăm funcția principală
main().catch(console.error);
