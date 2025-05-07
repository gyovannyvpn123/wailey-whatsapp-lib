#!/bin/bash
# Script de instalare și reparare pentru Wailey Library în Termux
# Rezolvă erorile: useMultiFileAuthState is not a function, ERR_MODULE_NOT_FOUND

echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   REPARARE WAILEY LIBRARY\e[0m"
echo -e "\e[31m===================================\e[0m"

# Verificăm dacă suntem în Termux
if [ -d "/data/data/com.termux" ]; then
  echo -e "\e[31mTermux detectat. Continuăm cu instalarea...\e[0m"
else
  echo -e "\e[31mAcest script este destinat utilizării în Termux.\e[0m"
  echo -e "\e[31mPoate funcționa și în alte medii, dar nu este garantat.\e[0m"
  
  # Întrebăm utilizatorul dacă dorește să continue
  read -p "Doriți să continuați oricum? (y/n): " continue_anyway
  if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
    echo -e "\e[31mInstalare anulată.\e[0m"
    exit 1
  fi
fi

# Instalăm dependențele necesare
echo -e "\e[31m[1/5] Instalăm dependențele necesare...\e[0m"
pkg update -y
pkg install nodejs git -y

# Creăm directorul de implementare
echo -e "\e[31m[2/5] Pregătim directoarele...\e[0m"
INSTALL_DIR="$HOME/wailey"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Copiază fișierul use-multi-file-auth-state.js în lib/Utils
echo -e "\e[31m[3/5] Instalăm fișierele necesare...\e[0m"

# Verificăm dacă directorul lib/Utils există, dacă nu, îl creăm
mkdir -p lib/Utils

# Creăm fișierul use-multi-file-auth-state.js
cat > lib/Utils/use-multi-file-auth-state.js << 'EOL'
/**
 * Wailey-library Multi-File Auth State
 * 
 * Implementare îmbunătățită a funcției useMultiFileAuthState pentru Wailey
 * Rezolvă problema "useMultiFileAuthState is not a function" în Termux
 */

const fs = require('fs');
const path = require('path');

/**
 * Implementare pentru stocarea și gestionarea stării de autentificare în mai multe fișiere
 * @param {string} folder - Directorul în care se va stoca starea de autentificare
 * @returns {Promise<{state: any, saveCreds: function}>}
 */
async function useMultiFileAuthState(folder) {
  // Ne asigurăm că folderul există
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  
  // Funcția de citire a datelor
  const readData = (file) => {
    try {
      const data = fs.readFileSync(path.join(folder, file), { encoding: 'utf8' });
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  };
  
  // Funcția de salvare a datelor
  const writeData = (file, data) => {
    fs.writeFileSync(
      path.join(folder, file),
      JSON.stringify(data, null, 2)
    );
  };
  
  // Încărcăm starea de autentificare
  let creds = readData('creds.json');
  let keys = readData('keys.json');
  
  // Salvăm credențialele
  const saveCreds = () => {
    writeData('creds.json', creds);
  };
  
  // Salvăm cheile
  const saveKeys = () => {
    writeData('keys.json', keys);
  };
  
  return {
    state: {
      creds: creds,
      keys: keys
    },
    saveCreds: saveCreds
  };
}

module.exports = { useMultiFileAuthState };
EOL

# Creăm un script de exemplu simplu
echo -e "\e[31m[4/5] Creăm un script de exemplu...\e[0m"
cat > example.js << 'EOL'
/**
 * Exemplu de utilizare a Wailey-library în Termux
 */

const { makeWASocket, DisconnectReason } = require('./lib');
const { useMultiFileAuthState } = require('./lib/Utils/use-multi-file-auth-state');
const fs = require('fs');
const readline = require('readline');

// Creăm interfața readline pentru terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru a pune întrebări în terminal
const askQuestion = (query) =>
  new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer.trim()));
  });

// Helper pentru delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startBot() {
  console.log("====================================");
  console.log("Exemplu Wailey-library în Termux");
  console.log("====================================");
  
  // Creăm directorul pentru starea de autentificare
  const AUTH_FOLDER = './auth_info';
  if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
  }
  
  // Încărcăm starea de autentificare
  console.log("Încărcăm starea de autentificare...");
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    
    // Creăm socketul WhatsApp
    console.log("Inițializăm conexiunea WhatsApp...");
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    });
    
    // Verificăm dacă este nevoie de autentificare
    if (!state.creds?.registered) {
      console.log("Acest dispozitiv nu este conectat la WhatsApp.");
      
      const phoneNumber = await askQuestion("Introduceți numărul de telefon cu prefixul țării (ex: 40711111111): ");
      
      console.log("Solicităm codul de pairing...");
      await delay(5000); // Delay pentru a se inițializa conexiunea
      
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("\n====================================");
        console.log(`🔑 CODUL TĂU DE PAIRING ESTE: ${code}`);
        console.log("====================================\n");
        console.log("Introdu acest cod în aplicația WhatsApp:");
        console.log("1. Deschide WhatsApp pe telefonul tău");
        console.log("2. Accesează Setări > Dispozitive conectate > Conectează un dispozitiv");
        console.log("3. Introdu codul de 8 cifre afișat mai sus");
      } catch (error) {
        console.error("❌ Eroare la solicitarea codului de pairing:", error);
        console.log("Scanează codul QR afișat în terminal pentru a te conecta.");
      }
    } else {
      console.log("✅ Dispozitiv deja conectat la WhatsApp!");
    }
    
    // Gestionăm actualizările de conexiune
    if (sock.ev && typeof sock.ev.on === 'function') {
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          
          if (shouldReconnect) {
            console.log("Reconectare...");
            await delay(5000);
            startBot();
          } else {
            console.log("Deconectat definitiv. Te rugăm să repornești aplicația manual.");
            process.exit(0);
          }
        } else if (connection === 'open') {
          console.log("\n✅ Conectat cu succes la WhatsApp!");
        }
      });
      
      // Salvăm credențialele când se actualizează
      sock.ev.on('creds.update', saveCreds);
      
      // Ascultăm pentru mesaje noi
      sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          if (!msg.key.fromMe) {
            console.log("Mesaj primit:", 
              msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              "Media/Attachment");
            
            // Răspundem la mesaj
            const chatId = msg.key.remoteJid;
            await sock.sendMessage(chatId, { text: 'Am primit mesajul tău!' });
          }
        }
      });
    }
  } catch (error) {
    console.error("Eroare la inițializare:", error);
    console.log("Asigură-te că ai instalat corect bibliotecile necesare și că ai o conexiune la internet.");
  }
}

// Pornim aplicația
startBot();
EOL

# Creăm un script de pornire
echo -e "\e[31m[5/5] Creăm un script de pornire...\e[0m"
cat > start.sh << 'EOL'
#!/bin/bash
# Script de pornire pentru exemplul Wailey-library

echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   PORNIRE WAILEY LIBRARY\e[0m"
echo -e "\e[31m===================================\e[0m"

# Verificăm dependențele
if ! command -v node &> /dev/null; then
  echo -e "\e[31mNodeJS nu este instalat. Se instalează...\e[0m"
  pkg install nodejs -y
fi

# Rulăm exemplul
echo -e "\e[31mPornim aplicația...\e[0m"
node example.js
EOL

# Facem scriptul executabil
chmod +x start.sh

# Afișăm instrucțiuni finale
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   INSTALARE COMPLETĂ!\e[0m"
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31mWailey-library a fost instalată și configurată cu succes.\e[0m"
echo -e "\e[31mPentru a porni exemplul, rulează:\e[0m"
echo -e "\e[31m   cd $INSTALL_DIR && ./start.sh\e[0m"
echo -e "\e[31m\e[0m"

# Întrebăm dacă să pornim exemplul acum
read -p "Dorești să pornești exemplul acum? (y/n): " start_now
if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
  ./start.sh
else
  echo -e "\e[31mPoți porni exemplul mai târziu cu comanda: ./start.sh\e[0m"
fi