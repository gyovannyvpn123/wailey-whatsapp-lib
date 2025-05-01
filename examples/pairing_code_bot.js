/**
 * Exemplu complet de utilizare a codurilor de asociere în WhatsApp
 * Acest script demonstrează autentificarea atât prin cod QR cât și prin cod de asociere
 * și permite trimiterea de mesaje individuale sau în lot din fișiere text
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

// Funcții utilitate
function readTextFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8').trim();
        }
    } catch (error) {
        console.error(`Eroare la citirea fișierului ${filePath}:`, error.message);
    }
    return null;
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
        
        // Creăm directorul de sesiune dacă nu există
        const sessionFolder = `./session_${phoneNumber}`;
        if (!fs.existsSync(sessionFolder)) {
            fs.mkdirSync(sessionFolder, { recursive: true });
        }
        
        // Obținem starea de autentificare
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        
        // Creăm socket-ul WhatsApp direct, fără a folosi wailey-whatsapp-lib
        console.log('Inițializare client WhatsApp...');
        
        // Creăm socketul cu configurațiile optime
        const sock = makeWASocket({
            browser: ['Ubuntu', 'Chrome', '114.0.0'], // Această configurație este CRUCIALĂ pentru codurile de asociere
            printQRInTerminal: true, // Afișăm codul QR în terminal pentru a permite autentificarea prin scanare
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            logger: pino({ level: 'warn' })
        });
        
        // Ascultăm pentru actualizări de credențiale
        sock.ev.on('creds.update', saveCreds);
        
        // Handler pentru actualizări de conexiune
        let qrDisplayed = false;
        let pairingRequested = false;
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr && !qrDisplayed) {
                qrDisplayed = true;
                console.log('\n▶️ COD QR disponibil pentru scanare!');
                console.log('Ai două opțiuni:');
                console.log('1️⃣ Scanează codul QR de mai sus cu aplicația WhatsApp (camera)');
                console.log('2️⃣ Așteaptă 10 secunde pentru a solicita un cod de asociere text');
                
                // Solicităm codul de asociere după o scurtă perioadă
                if (!pairingRequested) {
                    pairingRequested = true;
                    
                    // Așteptăm puțin pentru a permite scanarea QR dacă utilizatorul preferă
                    await sleep(10);
                    
                    try {
                        const formattedNumber = formatPhoneNumber(phoneNumber);
                        console.log(`\nSolicit cod de asociere pentru: ${formattedNumber}`);
                        
                        // Solicităm codul de asociere
                        const code = await sock.requestPairingCode(formattedNumber);
                        
                        console.log('\n📱 COD DE ASOCIERE PRIMIT:', code);
                        console.log('Deschide WhatsApp pe telefonul tău:');
                        console.log('1️⃣ Setări > Dispozitive conectate > Conectează un dispozitiv');
                        console.log('2️⃣ La ecranul cu codul QR, apasă "Conectează cu număr"');
                        console.log(`3️⃣ Introdu codul: ${code}`);
                    } catch (pairingError) {
                        console.error('\n❌ Eroare la solicitarea codului de asociere:', pairingError.message);
                        
                        if (pairingError.message.includes('Precondition Required') || 
                            pairingError.message.includes('Connection Closed')) {
                            console.log('\n⚠️ WhatsApp cere scanarea codului QR pentru prima autentificare.');
                            console.log('▶️ Te rog să scanezi codul QR de mai sus cu telefonul.');
                        }
                    }
                }
            }
            
            if (connection === 'open') {
                console.log('\n✅ Conectat cu succes la WhatsApp!');
                console.log('📱 Informații cont:', sock.user.name || 'Cont WhatsApp');
                
                // Funcția pentru trimiterea de mesaje
                async function promptForMessageSending() {
                    try {
                        console.log('\n📝 Opțiuni pentru trimiterea mesajelor:');
                        console.log('1. Trimite un mesaj text');
                        console.log('2. Trimite mesaje din fișier text');
                        console.log('3. Ieșire');
                        
                        const choice = await question('\nAlege o opțiune (1-3): ');
                        
                        if (choice === '1') {
                            const recipient = await question('Introdu numărul destinatarului (ex: 40712345678): ');
                            
                            if (!validatePhoneNumber(recipient)) {
                                console.error('Număr de telefon invalid. Te rog să folosești formatul internațional fără +.');
                                return promptForMessageSending();
                            }
                            
                            const message = await question('Introdu mesajul: ');
                            const formattedRecipient = formatPhoneNumber(recipient);
                            
                            await sock.sendMessage(formattedRecipient, { text: message });
                            console.log(`✅ Mesaj trimis către ${formattedRecipient}`);
                            
                            return promptForMessageSending();
                        } else if (choice === '2') {
                            const filePath = await question('Introdu calea către fișierul text cu mesaje: ');
                            const messageContent = readTextFile(filePath);
                            
                            if (!messageContent) {
                                console.error('Fișierul specificat nu există sau nu poate fi citit.');
                                return promptForMessageSending();
                            }
                            
                            const recipient = await question('Introdu numărul destinatarului (ex: 40712345678): ');
                            
                            if (!validatePhoneNumber(recipient)) {
                                console.error('Număr de telefon invalid. Te rog să folosești formatul internațional fără +.');
                                return promptForMessageSending();
                            }
                            
                            const formattedRecipient = formatPhoneNumber(recipient);
                            
                            // Divizam mesajul în linii și trimitem fiecare linie
                            const lines = messageContent.split('\n').filter(line => line.trim() !== '');
                            
                            const delay = parseInt(await question('Introdu întârzierea între mesaje (secunde): '));
                            
                            console.log(`\nSe trimit ${lines.length} mesaje către ${formattedRecipient} cu o întârziere de ${delay} secunde...`);
                            
                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i];
                                await sock.sendMessage(formattedRecipient, { text: line });
                                console.log(`✅ Mesaj ${i+1}/${lines.length} trimis: "${line.substring(0, 30)}${line.length > 30 ? '...' : ''}"`);
                                
                                if (i < lines.length - 1) {
                                    console.log(`⏱️ Așteptare ${delay} secunde...`);
                                    await sleep(delay);
                                }
                            }
                            
                            console.log('✅ Toate mesajele au fost trimise!');
                            return promptForMessageSending();
                        } else if (choice === '3') {
                            console.log('La revedere!');
                            sock.end();
                            rl.close();
                            process.exit(0);
                        } else {
                            console.log('Opțiune invalidă. Te rog să alegi 1, 2 sau 3.');
                            return promptForMessageSending();
                        }
                    } catch (error) {
                        console.error('Eroare la trimiterea mesajului:', error);
                        return promptForMessageSending();
                    }
                }
                
                // Pornim procesul de trimitere mesaje
                await promptForMessageSending();
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
        
        // Afișăm instrucțiuni pentru utilizator
        console.log('\nAștept conexiunea... poate dura până la 30 de secunde.');
        console.log('Vei vedea fie un cod QR pentru scanare, fie un cod de asociere pentru introducere manuală.');
        console.log('Apasă Ctrl+C pentru a anula oricând.');
        
    } catch (error) {
        console.error('Eroare generală:', error);
        rl.close();
    }
}

// Rulăm funcția principală
main().catch(console.error);
