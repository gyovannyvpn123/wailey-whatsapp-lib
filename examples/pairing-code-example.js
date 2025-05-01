/**
 * Exemplu de generare cod de asociere pentru WhatsApp
 * Folosind wailey-whatsapp-lib cu implementarea reparată pentru coduri de asociere
 */

const { create } = require('../index');
const readline = require('readline');

// Funcție pentru a formata numărul de telefon
function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Adaugă prefixul pentru România dacă nu există
  if (cleaned.startsWith('0')) {
    return '40' + cleaned.substring(1);
  }
  
  return cleaned;
}

async function main() {
  // Creare interfață readline pentru input interactiv
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('Exemplu de generare cod de asociere pentru WhatsApp\n');
  
  rl.question('Introdu numărul tău de telefon (ex: 0712345678): ', async (phoneNumber) => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    console.log(`\nUtilizare număr: ${formattedPhone}`);
    console.log('Inițializare client WhatsApp...');
    
    try {
      // Creare client WhatsApp
      const client = create({
        printQRInTerminal: false,  // Dezactivăm afișarea codului QR
        sessionPath: './session',
      });
      
      // Listener pentru cod de asociere
      client.on('pairing_code', (code) => {
        console.log(`\nCod de asociere primit: ${code}`);
        console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
      });
      
      // Listener pentru autentificare
      client.on('authenticated', () => {
        console.log('\nAutentificare reușită!');
      });
      
      // Listener pentru client gata
      client.on('ready', () => {
        console.log('\nClient WhatsApp gata de utilizare!');
        // Acum puteți trimite mesaje, etc.
        
        setTimeout(() => {
          client.destroy().then(() => {
            console.log('Client închis.');
            rl.close();
            process.exit(0);
          });
        }, 3000);
      });
      
      // Inițializare client
      await client.initialize();
      
      // Solicită cod de asociere
      console.log(`\nSolicit cod de asociere pentru: ${formattedPhone}`);
      await client.requestPairingCode(formattedPhone);
      
    } catch (error) {
      console.error('Eroare:', error.message);
      rl.close();
    }
  });
}

main().catch(err => {
  console.error('Eroare neașteptată:', err);
});
