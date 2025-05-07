/**
 * BORUTO VPN BOT cu Wailey pentru Termux
 * 
 * Versiune optimizată pentru Termux care rezolvă probleme de compatibilitate
 * Rezolvă erorile:
 * - ERR_MODULE_NOT_FOUND
 * - useMultiFileAuthState is not a function
 * - require is not defined in ES module scope
 */

const { makeWASocket, DisconnectReason } = require('../lib');
const { useMultiFileAuthState } = require('../lib/Utils/use-multi-file-auth-state');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Pino = require('pino');
const dns = require('dns');

try {
    var chalk = require('chalk');
} catch (e) {
    // Implementare simplă dacă chalk nu e instalat
    chalk = {
        red: (text) => `\x1b[31m${text}\x1b[0m`
    };
}

// Helper pentru delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Funcție de normalizare pentru JID-uri (toLowerCase, elimină spațiile suplimentare)
function normalizeJid(jid) {
  return jid ? jid.trim().toLowerCase() : "";
}

// Interfață pentru input în terminal – toate întrebările apar în roșu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru întrebări în terminal
const askQuestion = (query) =>
  new Promise((resolve) => {
    rl.question(chalk.red(query), (answer) => resolve(answer.trim()));
  });

// Funcție de verificare a conexiunii la internet
async function waitForInternet() {
  console.log(chalk.red("⚠️ Conexiunea a fost pierdută. Aștept conexiunea la internet..."));
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      dns.resolve("google.com", (err) => {
        if (!err) {
          console.log(chalk.red("✅ Conexiunea a revenit, reluăm trimiterea de unde a rămas."));
          clearInterval(interval);
          resolve(true);
        }
      });
    }, 5000);
  });
}

// Banner – afișat exclusiv în roșu
console.log(chalk.red(`===================================
        BORUTO VPN BOT
===================================`));

// Configurație globală pentru bot (setările de trimitere)
const botConfig = {};
// Obiectul pentru sesiunile active: cheia este chatId, iar valoarea este { running, currentIndex, delay, mentionJids }
let activeSessions = {};

// Variabilă globală pentru owner (setată la pairing); doar owner-ul poate emite comenzi
let ownerJid = null;

// Gestionarea comenzii /start – creează sau actualizează sesiunea de trimitere pentru chat-ul respectiv
function handleStartCommand(chatId, delayValue, mentionJids, sock) {
  if (activeSessions[chatId]) {
    activeSessions[chatId].delay = delayValue;
    activeSessions[chatId].mentionJids = mentionJids;
    console.log(chalk.red(`Sesiunea pentru ${chatId} a fost actualizată.`));
    return;
  }
  activeSessions[chatId] = {
    running: true,
    currentIndex: 0,
    delay: delayValue,
    mentionJids: mentionJids
  };
  sendLoop(chatId, sock);
}

// Gestionarea comenzii /stop – oprește trimiterea pentru chat-ul respectiv
function handleStopCommand(chatId) {
  if (activeSessions[chatId]) {
    activeSessions[chatId].running = false;
    console.log(chalk.red(`Sesiunea pentru ${chatId} a fost oprită.`));
  }
}

// Bucla de trimitere
async function sendLoop(chatId, sock) {
  let session = activeSessions[chatId];
  while (session && session.running) {
    try {
      if (botConfig.sendType === "mesaje") {
        const baseText = botConfig.messages[session.currentIndex];
        let textToSend = baseText;
        // Dacă există mențiuni, le adaugă la finalul mesajului
        if (session.mentionJids && session.mentionJids.length > 0) {
          const mentionsText = session.mentionJids
            .map((jid) => "@" + normalizeJid(jid).split("@")[0])
            .join(" ");
          textToSend = `${baseText} ${mentionsText}`;
        }
        await sock.sendMessage(chatId, {
          text: textToSend,
          contextInfo: { mentionedJid: session.mentionJids || [] }
        });
        console.log(chalk.red(`📤 Mesaj trimis către ${chatId}: "${textToSend}"`));
        session.currentIndex = (session.currentIndex + 1) % botConfig.messages.length;
      } else if (botConfig.sendType === "poze") {
        await sock.sendMessage(chatId, {
          image: botConfig.photoBuffer,
          caption: botConfig.photoCaption,
          contextInfo: { mentionedJid: session.mentionJids || [] }
        });
        console.log(chalk.red(`📤 Poză trimisă către ${chatId}.`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Eroare la trimiterea către ${chatId}:`), error);
      console.log(chalk.red("⚠️ Aștept revenirea internetului..."));
      await waitForInternet();
      console.log(chalk.red("Reinitializing connection..."));
      return;
    }
    await delay(session.delay);
    session = activeSessions[chatId];
  }
  if (activeSessions[chatId]) {
    delete activeSessions[chatId];
    console.log(chalk.red(`Sesiunea pentru ${chatId} s-a încheiat.`));
  }
}

// Reluarea tuturor sesiunilor active după reconectare
function resumeActiveSessions(sock) {
  for (const chatId in activeSessions) {
    if (activeSessions[chatId].running) {
      console.log(chalk.red(`Reluăm trimiterea în conversația ${chatId}...`));
      sendLoop(chatId, sock);
    }
  }
}

// Setăm ascultătorul pentru mesajele primite
function setupCommands(sock) {
  sock.ev.on("messages.upsert", async (up) => {
    if (!up.messages) return;
    for (const msg of up.messages) {
      if (!msg.message) continue;
      // Procesează doar mesajele trimise de tine.
      if (!msg.key.fromMe) continue;
      const chatId = msg.key.remoteJid;
      let text = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text);
      if (!text) continue;
      text = text.trim();
      if (!text.startsWith("/")) continue;
      
      // Comanda /stop
      if (text.toLowerCase() === "/stop") {
        handleStopCommand(chatId);
      }
      // Comanda /start, de ex. "/start10 @nume1 @nume2"
      else if (text.toLowerCase().startsWith("/start")) {
        const regex = /^\/start(\d*)\s*(.*)$/i;
        const match = text.match(regex);
        if (match) {
          const delayDigits = match[1];
          const remainder = match[2].trim();
          const delayValue = delayDigits ? parseInt(delayDigits, 10) * 1000 : botConfig.defaultDelay;
          let mentionJids = [];
          if (remainder) {
            const tokens = remainder.split(/\s+/);
            tokens.forEach((token) => {
              if (token.startsWith("@")) {
                let jid = token.substring(1);
                if (!jid.includes("@")) {
                  jid = jid + "@s.whatsapp.net";
                }
                mentionJids.push(jid);
              }
            });
          }
          handleStartCommand(chatId, delayValue, mentionJids, sock);
        }
      }
    }
  });
}

// Configurarea inițială
async function initializeBotConfig(sock) {
  if (!botConfig.sendType) {
    let sendType = await askQuestion("Ce vrei să trimiți? (mesaje/poze): ");
    sendType = sendType.toLowerCase();
    if (sendType !== "mesaje" && sendType !== "poze") {
      console.log(chalk.red("Opțiune invalidă!"));
      process.exit(1);
    }
    botConfig.sendType = sendType;
    if (sendType === "mesaje") {
      const filePath = await askQuestion("Enter file path for text messages (ex. spam.txt): ");
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red("❌ Fișier inexistent. Ieșire..."));
        process.exit(1);
      }
      const messages = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
      botConfig.messages = messages;
    } else if (sendType === "poze") {
      const photoPath = await askQuestion("Enter file path for photo: ");
      if (!fs.existsSync(photoPath)) {
        console.error(chalk.red("❌ Fișierul foto nu există!"));
        process.exit(1);
      }
      botConfig.photoBuffer = fs.readFileSync(photoPath);
      botConfig.photoCaption = await askQuestion("Enter caption (optional): ");
    }
    // Delay-ul implicit se setează la 5000 ms (5 secunde)
    botConfig.defaultDelay = 5000;
    console.log(chalk.red("\n✅ Configurare finalizată. Așteptăm comenzile tale (/start, /stop) în orice chat."));
  }
  setupCommands(sock);
  resumeActiveSessions(sock);
}

// Inițializarea conexiunii și configurarea botului
async function startBot() {
  console.log(chalk.red("🔥 Pornire bot WhatsApp..."));
  
  // Ne asigurăm că folderul pentru autentificare există
  const AUTH_FOLDER = './auth_info';
  if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
  }
  
  // Încărcăm starea de autentificare
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  
  console.log(chalk.red("🔄 Creăm conexiunea WhatsApp..."));
  try {
    // Creăm socket-ul WhatsApp
    const sock = makeWASocket({
      auth: state,
      logger: Pino({ level: "silent" }),
      connectTimeoutMs: 60000,
      printQRInTerminal: false,
      browser: ['Wailey Bot', 'Chrome', '1.0.0']
    });
    
    // Gestionăm pairing code
    if (!state.creds.registered) {
      const phoneNumber = await askQuestion("Enter your Phone number for pairing (ex. 40748427351): ");
      ownerJid = normalizeJid(phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`);
      
      try {
        console.log(chalk.red("🔄 Solicit cod de împerechere... (poate dura câteva secunde)"));
        console.log(chalk.red("⏳ Te rog așteaptă..."));
        
        // Așteaptă puțin pentru a se inițializa conexiunea
        await delay(3000);
        
        // Obține codul de împerechere
        const pairingCode = await sock.requestPairingCode(phoneNumber);
        
        console.log(chalk.red(`\n=============================================`));
        console.log(chalk.red(`🔑 CODUL TĂU DE ÎMPERECHERE ESTE: ${pairingCode}`));
        console.log(chalk.red(`=============================================\n`));
        console.log(chalk.red("📱 Deschide WhatsApp pe telefon și introdu acest cod în secțiunea Dispozitive conectate."));
        
      } catch (error) {
        console.error(chalk.red("❌ Eroare la obținerea codului de împerechere:"), error.message);
        console.log(chalk.red("\n🔄 SOLUȚIE ALTERNATIVĂ: Verifică următoarele:\n"));
        console.log(chalk.red("1️⃣ Asigură-te că ai instalat corect toate dependențele:"));
        console.log(chalk.red("   pkg install nodejs git"));
        console.log(chalk.red("   npm install chalk pino\n"));
        
        console.log(chalk.red("2️⃣ Asigură-te că biblioteca Wailey este instalată corect:"));
        console.log(chalk.red("   git clone https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git\n"));
        
        console.log(chalk.red("3️⃣ Verifică conexiunea la internet:"));
        console.log(chalk.red("   ping google.com\n"));
        
        console.log(chalk.red("4️⃣ Încearcă să restartezi Termux și să rulezi din nou scriptul\n"));
        process.exit(1);
      }
    } else {
      if (!ownerJid) {
        ownerJid = sock.user && sock.user.id ? normalizeJid(sock.user.id) : "unknown";
        console.log(chalk.red(`Owner is already set to: ${ownerJid}`));
      }
      console.log(chalk.red("✅ Already connected!"));
    }

    // Gestionăm evenimentele de conexiune
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log(chalk.red("✅ Conectat la WhatsApp!"));
        if (botConfig.sendType) {
          setupCommands(sock);
          resumeActiveSessions(sock);
        } else {
          await initializeBotConfig(sock);
        }
      } else if (connection === "close") {
        console.log(chalk.red("⚠️ Conexiunea a fost pierdută."));
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
          await waitForInternet();
          await startBot();
        } else {
          console.log(chalk.red("❌ Deconectare definitivă. Restart manual necesar."));
          process.exit(1);
        }
      }
    });

    // Salvăm credențialele când se actualizează
    sock.ev.on("creds.update", saveCreds);
    
  } catch (error) {
    console.error(chalk.red("❌ Eroare la inițializarea socketului:"), error);
    console.log(chalk.red("🔄 Încearcă să restartezi scriptul..."));
    process.exit(1);
  }
}

// Prevenim oprirea scriptului la erori neprevăzute
process.on("uncaughtException", (error) => {
  console.error(chalk.red("❌ Eroare neașteptată:"), error.message);
});

process.on("unhandledRejection", (error) => {
  console.error(chalk.red("❌ Promisiune nerezolvată:"), error.message);
});

// Pornirea botului
console.log(chalk.red("📱 Bot WhatsApp cu Wailey Library - VERSIUNE PENTRU TERMUX"));
console.log(chalk.red("ℹ️ Soluție pentru erorile din Termux"));
console.log(chalk.red("--------------------------------------------"));
startBot();