/**
 * Test pentru verificarea funcționalității codului de asociere
 * Acest script va încerca să solicite un cod de asociere real de la serverele WhatsApp
 */

// Importă biblioteca
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

// Configurează logger-ul pentru a afișa informații utile
const logger = pino({ 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Funcție pentru a valida formatul numărului de telefon
function validatePhoneNumber(phoneNumber) {
  // Verifică formatul de bază al numărului (cel puțin 8 cifre, fără caractere speciale)
  return /^\d{8,15}$/.test(phoneNumber.replace(/\D/g, ''));
}

// Funcție pentru a formata numărul de telefon în formatul internațional
function formatPhoneNumber(phoneNumber) {
  // Elimină toate caracterele care nu sunt cifre
  let formatted = phoneNumber.replace(/\D/g, '');
  
  // Dacă începe cu 0, presupunem că e un număr local și-l înlocuim cu prefixul României (40)
  if (formatted.startsWith('0')) {
    formatted = '40' + formatted.substring(1);
  }
  
  // Verifică dacă numărul are formatul corect acum
  if (!validatePhoneNumber(formatted)) {
    return null;
  }
  
  return formatted;
}

// Funcție principală pentru testarea codului de asociere
async function testRealPairingCode() {
  console.log('Testare funcționalitate cod de asociere real...');
  
  try {
    // Crează director pentru sesiune
    const { state, saveCreds } = await useMultiFileAuthState('./test_session_real');
    
    // Creează clientul WhatsApp
    const socket = makeWASocket({
      printQRInTerminal: true, // Afișează și codul QR pentru comparație
      auth: state,
      logger,
      browser: ['Chrome (Linux)', '', ''], // Folosim aceeași configurație ca în wailey-whatsapp-lib
    });
    
    // Setează un handler pentru când credențialele se actualizează
    socket.ev.on('creds.update', saveCreds);
    
    // Setează un handler pentru actualizări de conexiune
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        console.log('Conexiune deschisă - autentificat cu succes!');
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          console.log('Conexiune închisă, se încearcă reconectarea...');
          // Aici ai putea reporni procesul de conectare
        } else {
          console.log('Deconectat și delogat.');
        }
      }
    });
    
    // Funcție pentru a solicita codul de asociere
    async function requestPairingCode() {
      // Solicită numărul de telefon de la utilizator
      const phoneNumber = process.argv[2]; // Ia numărul din argumentele de comandă
      
      if (!phoneNumber) {
        console.error('Trebuie să furnizezi un număr de telefon ca argument!');
        console.error('Exemplu: node test_pairing_code.js 40712345678');
        process.exit(1);
      }
      
      // Formatează numărul de telefon
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      if (!formattedNumber) {
        console.error('Numărul de telefon nu este valid!');
        console.error('Asigură-te că folosești formatul: 40712345678 (fără +, spații sau alte caractere)');
        process.exit(1);
      }
      
      console.log(`Solicit cod de asociere pentru numărul: ${formattedNumber}`);
      
      try {
        // Solicită codul de asociere direct de la socket
        const code = await socket.requestPairingCode(formattedNumber);
        
        console.log('==================================================');
        console.log(`COD DE ASOCIERE PRIMIT: ${code}`);
        console.log('==================================================');
        console.log('Dacă codul primit nu este "12345678", atunci funcționalitatea este reparată!');
        console.log('Introdu acest cod în aplicația WhatsApp de pe telefonul tău pentru a conecta dispozitivul.');
        
        // Așteaptă autentificarea sau ieșire după un timp
        setTimeout(() => {
          console.log('Testul s-a încheiat. Poți întrerupe programul sau aștepta autentificarea.');
        }, 60000);
      } catch (error) {
        console.error('Eroare la solicitarea codului de asociere:');
        console.error(error);
      }
    }
    
    // Așteaptă puțin ca socketul să se inițializeze, apoi solicită codul
    setTimeout(requestPairingCode, 3000);
    
  } catch (error) {
    console.error('Eroare generală:');
    console.error(error);
  }
}

// Execută testul
testRealPairingCode();
