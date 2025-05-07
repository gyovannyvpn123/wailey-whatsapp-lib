/**
 * Exemplu de utilizare a codului de pairing din Wailey-library
 * 
 * Acest exemplu demonstrează cum să obții un cod de pairing de 8 cifre
 * pentru a conecta WhatsApp fără a scana un cod QR.
 */

const { makeWASocket, DisconnectReason } = require('../lib');
const { useMultiFileAuthState } = require('../lib/Utils/use-multi-file-auth-state');
const readline = require('readline');
const fs = require('fs');
const pino = require('pino');

// Creăm o interfață readline pentru input în terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru a adresa o întrebare în terminal
const întreabă = (întrebare) =>
  new Promise((resolve) => {
    rl.question(întrebare, (răspuns) => resolve(răspuns.trim()));
  });

// Funcție de așteptare
const așteaptă = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Funcție pentru obținerea codului de pairing
 * @param {string} numărTelefon - Numărul de telefon cu prefix de țară (ex: 40711111111)
 */
async function obțineCodul(numărTelefon) {
  console.log("====================================");
  console.log("Demonstrație Cod Pairing Wailey-library");
  console.log("====================================");
  
  // Creăm directorul pentru autentificare dacă nu există
  const DIRECTOR_AUTH = './auth_info_pairing';
  if (!fs.existsSync(DIRECTOR_AUTH)) {
    fs.mkdirSync(DIRECTOR_AUTH, { recursive: true });
  }
  
  // Încărcăm starea de autentificare
  console.log("Încărcăm starea de autentificare...");
  const { state, saveCreds } = await useMultiFileAuthState(DIRECTOR_AUTH);
  
  // Creăm socketul WhatsApp
  console.log("Inițializăm conexiunea...");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ['Wailey Library', 'Chrome', '103.0.5060.114']
  });
  
  // Verificăm dacă funcționalitatea pentru cod de pairing există
  if (typeof sock.requestPairingCode !== 'function') {
    console.log("❌ Funcția pentru cod de pairing nu este disponibilă în această versiune");
    process.exit(1);
  }
  
  // Verificăm dacă dispozitivul este deja înregistrat
  if (state.creds?.registered) {
    console.log("✅ Dispozitivul este deja înregistrat!");
    console.log("Poți utiliza acest client pentru a trimite și primi mesaje.");
    process.exit(0);
  }
  
  try {
    // Solicităm numărul de telefon dacă nu a fost furnizat
    if (!numărTelefon) {
      numărTelefon = await întreabă("Introduceți numărul de telefon cu prefixul țării (ex: 40711111111): ");
    }
    
    console.log(`\nSolicităm codul de pairing pentru ${numărTelefon}...`);
    console.log("Vă rugăm să așteptați, acest proces poate dura câteva secunde...");
    
    // Așteptăm puțin pentru a se stabili conexiunea
    await așteaptă(5000);
    
    // Solicităm codul de pairing
    const cod = await sock.requestPairingCode(numărTelefon);
    
    console.log("\n====================================");
    console.log(`🔑 CODUL TĂU DE PAIRING ESTE: ${cod}`);
    console.log("====================================\n");
    console.log("Introdu acest cod în aplicația WhatsApp:");
    console.log("1. Deschide WhatsApp pe telefonul tău");
    console.log("2. Accesează Setări > Dispozitive conectate > Conectează un dispozitiv");
    console.log("3. Introdu codul de 8 cifre afișat mai sus");
    console.log("\nAșteptăm autentificarea... Acest proces poate dura câteva momente.");
    
  } catch (eroare) {
    console.error("❌ Eroare la solicitarea codului de pairing:", eroare);
    console.log("\nSoluții posibile:");
    console.log("1. Asigură-te că ai o conexiune stabilă la internet");
    console.log("2. Verifică dacă numărul de telefon este în formatul corect (cu prefix de țară)");
    console.log("3. Încearcă din nou în câteva minute");
    process.exit(1);
  }
  
  // Gestionăm actualizările de conexiune
  if (sock.ev && typeof sock.ev.on === 'function') {
    sock.ev.on('connection.update', async (update) => {
      if (!update) return;
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const arTrebuiSăReconectăm = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Conexiunea s-a închis din cauza", lastDisconnect?.error?.message || "un motiv necunoscut");
        
        if (arTrebuiSăReconectăm) {
          console.log("Reconectare...");
          await așteaptă(3000);
          obțineCodul(numărTelefon);
        } else {
          console.log("Conexiunea s-a închis permanent");
          process.exit(0);
        }
      } else if (connection === 'open') {
        console.log("\n✅ Conectat cu succes la WhatsApp!");
        console.log("Poți utiliza acum biblioteca pentru a trimite și primi mesaje.");
      }
    });
    
    // Salvăm credențialele când sunt actualizate
    sock.ev.on('creds.update', saveCreds);
  } else {
    console.log("⚠️ Gestionarea evenimentelor nu este disponibilă în această versiune");
  }
}

// Verificăm dacă este furnizat un număr de telefon ca argument
const numărTelefon = process.argv[2];

// Pornim procesul
obțineCodul(numărTelefon);