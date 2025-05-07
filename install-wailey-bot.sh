#!/bin/bash
# Script de instalare pentru bot-ul Wailey în Termux
# Soluționează erorile: Module not found, useMultiFileAuthState not a function

echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   INSTALARE BORUTO VPN BOT\e[0m"
echo -e "\e[31m===================================\e[0m"

# Verificăm dacă suntem în Termux
if [ -d "/data/data/com.termux" ]; then
  echo -e "\e[31mTermux detectat. Continuăm cu instalarea...\e[0m"
else
  echo -e "\e[31mAcest script este destinat utilizării în Termux.\e[0m"
  
  # Întrebăm utilizatorul dacă dorește să continue
  read -p "Doriți să continuați oricum? (y/n): " continue_anyway
  if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
    echo -e "\e[31mInstalare anulată.\e[0m"
    exit 1
  fi
fi

# Actualizăm și instalăm dependențele necesare
echo -e "\e[31m[1/6] Actualizăm și instalăm dependențele necesare...\e[0m"
pkg update -y && pkg upgrade -y && pkg install nodejs git curl -y

# Creăm directorul pentru bot
echo -e "\e[31m[2/6] Creăm directorul pentru bot...\e[0m"
BOT_DIR="$HOME/boruto-vpn-bot"
mkdir -p "$BOT_DIR"
cd "$BOT_DIR"

# Clonăm biblioteca Wailey
echo -e "\e[31m[3/6] Clonăm biblioteca Wailey...\e[0m"
if [ ! -d "wailey-whatsapp-lib" ]; then
    git clone https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git
else
    echo -e "\e[31mBiblioteca Wailey deja există. Actualizăm...\e[0m"
    cd wailey-whatsapp-lib
    git pull
    cd ..
fi

# Copiem fișierul botwailey-termux.js din biblioteca
echo -e "\e[31m[4/6] Pregătim scriptul pentru botul WhatsApp...\e[0m"
cp wailey-whatsapp-lib/botwailey-termux.js ./bot.js

# Creăm directorul pentru auth și mesaje
echo -e "\e[31m[5/6] Creăm directoarele necesare...\e[0m"
mkdir -p auth_info

# Creăm fișierul use-multi-file-auth-state.js
echo -e "\e[31m[6/6] Adăugăm suport pentru autentificare...\e[0m"
mkdir -p wailey-whatsapp-lib/lib/Utils
cat > wailey-whatsapp-lib/lib/Utils/use-multi-file-auth-state.js << 'EOL'
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

# Instalăm dependențele pentru bot
echo -e "\e[31mInstalăm dependențele pentru bot...\e[0m"
npm install chalk pino

# Creăm un script de pornire pentru bot
cat > start-bot.sh << 'EOL'
#!/bin/bash
# Script de pornire pentru Boruto VPN Bot

echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   PORNIRE BORUTO VPN BOT\e[0m"
echo -e "\e[31m===================================\e[0m"

# Verificăm dacă există fișierul spam.txt
if [ ! -f "spam.txt" ]; then
  echo -e "\e[31mCreăm un fișier spam.txt cu mesaje de exemplu...\e[0m"
  cat > spam.txt << 'EOL_MESSAGES'
BORUTO VPN - Cel mai rapid VPN românesc!
Descarcă acum! Ofertă LIMITATĂ 🔥
Server rapid + Fără LAG Doar 50RON/lună!
VPN fără LAG pentru toate jocurile!
Premium VPN cu server premium!
EOL_MESSAGES
  echo -e "\e[31mFișierul spam.txt a fost creat cu succes.\e[0m"
  echo -e "\e[31mÎl poți edita pentru a adăuga propriile mesaje.\e[0m"
fi

# Pornirea botului
echo -e "\e[31mPornim botul WhatsApp...\e[0m"
node bot.js
EOL

# Facem scriptul executabil
chmod +x start-bot.sh

# Afișăm instrucțiuni finale
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   INSTALARE COMPLETĂ!\e[0m"
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31mBOTUL BORUTO VPN a fost instalat cu succes.\e[0m"
echo -e "\e[31mPentru a porni botul, rulează:\e[0m"
echo -e "\e[31m   cd $BOT_DIR && ./start-bot.sh\e[0m"
echo -e "\e[31m\e[0m"
echo -e "\e[31mInstrucțiuni de utilizare:\e[0m"
echo -e "\e[31m1. La prima pornire, îți va cere să introduci numărul de telefon pentru pairing\e[0m"
echo -e "\e[31m2. Introdu numărul în format internațional (ex: 40711111111)\e[0m"
echo -e "\e[31m3. Urmează instrucțiunile pentru a introduce codul de pairing în WhatsApp\e[0m"
echo -e "\e[31m4. După conectare, poți utiliza comenzile /start și /stop în orice chat\e[0m"
echo -e "\e[31m\e[0m"

# Întrebăm dacă să pornim botul acum
read -p "Dorești să pornești botul acum? (y/n): " start_now
if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
  ./start-bot.sh
else
  echo -e "\e[31mPoți porni botul mai târziu cu comanda: ./start-bot.sh\e[0m"
fi