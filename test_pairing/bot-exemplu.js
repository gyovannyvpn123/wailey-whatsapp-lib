/**
 * Bot Exemplu Wailey-library
 * 
 * Un exemplu simplu de bot WhatsApp care utilizează Wailey-library
 * cu suport pentru conectare prin cod de pairing
 */

const { makeWASocket, DisconnectReason } = require('../lib');
const { useMultiFileAuthState } = require('../lib/Utils/use-multi-file-auth-state');
const fs = require('fs');
const readline = require('readline');
const pino = require('pino');

// Creăm interfața readline pentru terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru a pune întrebări în terminal
const întreabă = (întrebare) =>
  new Promise((resolve) => {
    rl.question(întrebare, (răspuns) => resolve(răspuns.trim()));
  });

// Helper pentru delay
const așteaptă = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configurație global pentru bot
const comenziDisponibile = {
  'help': 'Afișează lista de comenzi disponibile',
  'ping': 'Verifică dacă botul funcționează',
  'echo': 'Repetă mesajul tău (ex: !echo Salut)',
  'info': 'Afișează informații despre bot',
  'time': 'Afișează data și ora curentă'
};

// Funcție pentru a procesa comenzile
async function procesareComandă(sock, msg) {
  if (!msg.message) return;
  
  // Extragem textul mesajului
  const text = msg.message.conversation || 
               (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';
  
  // Verificăm dacă este o comandă (începe cu !)
  if (!text.startsWith('!')) return;
  
  // Extragem comanda și argumentele
  const [comandă, ...argumente] = text.slice(1).split(' ');
  const chatId = msg.key.remoteJid;
  
  switch (comandă.toLowerCase()) {
    case 'help':
      let mesajAjutor = '*Comenzi disponibile:*\n\n';
      for (const [cmd, descriere] of Object.entries(comenziDisponibile)) {
        mesajAjutor += `!${cmd} - ${descriere}\n`;
      }
      await sock.sendMessage(chatId, { text: mesajAjutor });
      break;
      
    case 'ping':
      await sock.sendMessage(chatId, { text: 'Pong! 🏓' });
      break;
      
    case 'echo':
      const mesajEcho = argumente.join(' ');
      if (mesajEcho) {
        await sock.sendMessage(chatId, { text: mesajEcho });
      } else {
        await sock.sendMessage(chatId, { text: 'Te rog să furnizezi un mesaj pentru echo.\nExemplu: !echo Salut lume!' });
      }
      break;
      
    case 'info':
      const infoMesaj = `*Informații Bot*\n\n` +
                        `Nume: Bot Wailey\n` +
                        `Versiune: 1.0.0\n` +
                        `Bibliotecă: Wailey-library\n` +
                        `Timp de funcționare: ${Math.floor(process.uptime())} secunde`;
      await sock.sendMessage(chatId, { text: infoMesaj });
      break;
      
    case 'time':
      const data = new Date();
      const dataMesaj = `Data și ora curentă:\n${data.toLocaleString()}`;
      await sock.sendMessage(chatId, { text: dataMesaj });
      break;
      
    default:
      await sock.sendMessage(chatId, { 
        text: `Comandă necunoscută: ${comandă}\nFolosește !help pentru a vedea lista de comenzi disponibile.` 
      });
      break;
  }
}

// Funcție principală pentru bot
async function startBot() {
  console.log("====================================");
  console.log("Bot Exemplu Wailey-library");
  console.log("====================================");
  
  // Creăm directorul pentru starea de autentificare
  const DIRECTOR_AUTH = './auth_info_bot';
  if (!fs.existsSync(DIRECTOR_AUTH)) {
    fs.mkdirSync(DIRECTOR_AUTH, { recursive: true });
  }
  
  // Încărcăm starea de autentificare
  console.log("Încărcăm starea de autentificare...");
  const { state, saveCreds } = await useMultiFileAuthState(DIRECTOR_AUTH);
  
  // Creăm socketul WhatsApp
  console.log("Inițializăm conexiunea WhatsApp...");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ['Wailey Bot', 'Chrome', '103.0.5060.114']
  });
  
  // Verificăm dacă este nevoie de pairing
  if (!state.creds?.registered) {
    console.log("Acest dispozitiv nu este conectat la WhatsApp.");
    console.log("Alegeți metoda de conectare:");
    console.log("1. Cod QR (scanează codul QR care va apărea)");
    console.log("2. Cod de pairing (introdu codul pe telefon)");
    
    const alegere = await întreabă("Alegeți opțiunea (1 sau 2): ");
    
    if (alegere === "2") {
      // Dacă avem funcția de pairing
      if (typeof sock.requestPairingCode === 'function') {
        const numărTelefon = await întreabă("Introduceți numărul de telefon cu prefixul țării (ex: 40711111111): ");
        
        console.log("Solicităm codul de pairing...");
        await așteaptă(5000); // Delay pentru a se inițializa conexiunea
        
        try {
          const cod = await sock.requestPairingCode(numărTelefon);
          console.log("\n====================================");
          console.log(`🔑 CODUL TĂU DE PAIRING ESTE: ${cod}`);
          console.log("====================================\n");
          console.log("Introdu acest cod în aplicația WhatsApp:");
          console.log("1. Deschide WhatsApp pe telefonul tău");
          console.log("2. Accesează Setări > Dispozitive conectate > Conectează un dispozitiv");
          console.log("3. Introdu codul de 8 cifre afișat mai sus");
        } catch (eroare) {
          console.error("❌ Eroare la solicitarea codului de pairing:", eroare);
          console.log("Te rugăm să încerci metoda cu cod QR sau să repornești aplicația.");
        }
      } else {
        console.log("❌ Funcția pentru cod de pairing nu este disponibilă în această versiune.");
        console.log("Te rugăm să utilizezi metoda cu cod QR.");
      }
    } else {
      console.log("Scanează codul QR afișat în terminal pentru a te conecta.");
    }
    
    console.log("Așteptăm conectarea la WhatsApp...");
  } else {
    console.log("✅ Dispozitiv deja conectat la WhatsApp!");
  }
  
  // Gestionăm actualizările de conexiune
  if (sock.ev && typeof sock.ev.on === 'function') {
    sock.ev.on('connection.update', async (update) => {
      if (!update) return;
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log("Conexiune închisă din cauza:", lastDisconnect?.error?.message || "motiv necunoscut");
        
        if (shouldReconnect) {
          console.log("Reconectare...");
          await așteaptă(5000);
          startBot();
        } else {
          console.log("Deconectat definitiv. Te rugăm să repornești botul manual.");
          process.exit(0);
        }
      } else if (connection === 'open') {
        console.log("\n✅ Bot conectat cu succes la WhatsApp!");
        console.log("Botul este acum activ și ascultă comenzi.");
        console.log("Comenzi disponibile: !help, !ping, !echo, !info, !time");
      }
    });
    
    // Salvăm credențialele când se actualizează
    sock.ev.on('creds.update', saveCreds);
    
    // Ascultăm pentru mesaje noi
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        // Procesăm doar mesajele primite (nu cele trimise de noi)
        if (!msg.key.fromMe) {
          try {
            await procesareComandă(sock, msg);
          } catch (eroare) {
            console.error("Eroare la procesarea comenzii:", eroare);
          }
        }
      }
    });
  } else {
    console.log("⚠️ Event handling is not available in this version");
  }
}

// Pornim botul
startBot();