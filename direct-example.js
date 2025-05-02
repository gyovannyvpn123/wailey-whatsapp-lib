/**
 * Exemplu direct pentru biblioteca wailey-whatsapp-lib
 * Acest script arată cum să folosești biblioteca fără a o instala global
 * 
 * Utilizare:
 * 1. Descarcă acest fișier în directorul tău
 * 2. Rulează: node direct-example.js
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// Configurăm interfața readline pentru input de la utilizator
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Validăm numărul de telefon
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
}

// Formatăm numărul de telefon pentru WhatsApp
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return !cleaned.startsWith('+') ? '+' + cleaned : cleaned;
}

// Funcția principală
async function startWhatsApp() {
    try {
        // Obține versiunea cea mai recentă de WhatsApp
        const { version } = await fetchLatestBaileysVersion();
        console.log(`Folosim WhatsApp v${version.join('.')}`);
        
        // Crează starea de autentificare
        const { state, saveCreds } = await useMultiFileAuthState('./auth_direct');
        
        // Opțiuni pentru browserul emulat (important pentru funcționarea codului de asociere)
        const browser = ['Ubuntu', 'Chrome', '114.0.0'];
        
        // Crează socket-ul WhatsApp
        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino())
            },
            browser: browser,
            getMessage: async () => { return { conversation: 'hello' }; }
        });
        
        // Gestionăm actualizările de credențiale
        sock.ev.on('creds.update', saveCreds);
        
        // Gestionăm actualizările de conexiune
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('Cod QR generat. Îl poți scana cu WhatsApp sau poți folosi un cod de asociere.');
            }
            
            if (connection === 'open') {
                console.log('Conectat la WhatsApp!');
                
                // Exemplu: Trimitere mesaj
                rl.question('Vrei să trimiți un mesaj? (da/nu): ', async (answer) => {
                    if (answer.toLowerCase() === 'da') {
                        rl.question('Introdu numărul destinatarului (ex: 40712345678): ', async (number) => {
                            rl.question('Introdu mesajul: ', async (msg) => {
                                try {
                                    const formattedJid = `${number.replace(/\D/g, '')}@s.whatsapp.net`;
                                    await sock.sendMessage(formattedJid, { text: msg });
                                    console.log('Mesaj trimis cu succes!');
                                    
                                    // Ieșire din program după trimiterea mesajului
                                    setTimeout(() => {
                                        console.log('Deconectare...');
                                        process.exit(0);
                                    }, 3000);
                                } catch (error) {
                                    console.error('Eroare la trimiterea mesajului:', error);
                                    process.exit(1);
                                }
                            });
                        });
                    } else {
                        console.log('Deconectare...');
                        process.exit(0);
                    }
                });
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('Conexiune închisă. Reconnectare...');
                    startWhatsApp();
                } else {
                    console.log('Conexiune închisă. Nu se va reconecta.');
                    process.exit(0);
                }
            }
        });
        
        // Solicită codul de asociere
        console.log('Vrei să folosești cod de asociere pentru conectare?');
        rl.question('Introdu numărul tău de telefon (sau apasă Enter pentru a folosi doar QR): ', async (phoneNumber) => {
            if (phoneNumber && phoneNumber.trim() !== '') {
                try {
                    if (!validatePhoneNumber(phoneNumber)) {
                        console.error('Număr de telefon invalid! Te rog folosește formatul internațional (ex: 40712345678)');
                        console.log('Poți scana codul QR în schimb.');
                        return;
                    }
                    
                    const formattedNumber = formatPhoneNumber(phoneNumber);
                    console.log(`Solicit cod de asociere pentru ${formattedNumber}...`);
                    
                    const code = await sock.requestPairingCode(formattedNumber);
                    console.log(`
Cod de asociere: ${code}`);
                    console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău:');
                    console.log('Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
                } catch (error) {
                    console.error('Eroare la solicitarea codului de asociere:', error.message);
                    
                    if (error.message.includes('scan the QR code first') || 
                        error.message.includes('Precondition Required')) {
                        console.log('⚠️ WhatsApp cere scanarea codului QR pentru prima autentificare.');
                        console.log('▶️ Te rog să scanezi codul QR afișat anterior cu telefonul.');
                    }
                }
            } else {
                console.log('Scanează codul QR afișat pentru a te conecta.');
            }
        });
    } catch (error) {
        console.error('Eroare generală:', error);
        process.exit(1);
    }
}

// Pornește aplicația
startWhatsApp().catch(console.error);