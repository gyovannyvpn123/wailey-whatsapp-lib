/**
 * Exemplu de utilizare a codului de asociere
 * Acest script demonstrează cum să obțineți și să utilizați un cod de asociere
 * pentru autentificare în WhatsApp Web
 */

const { create, Events } = require('wailey-whatsapp-lib');
const readline = require('readline');

// Creează interfața readline pentru input de la utilizator
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Funcție pentru a citi input de la utilizator
const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
    try {
        // Solicită numărul de telefon
        const phoneNumber = await question('Introdu numărul tău de telefon (ex: 40712345678): ');
        console.log(`\nUtilizare număr: ${phoneNumber}`);
        
        // Crează clientul
        const client = create({
            sessionPath: './session_' + phoneNumber,
            printQRInTerminal: false
        });
        
        // Ascultă pentru evenimente
        client.on(Events.ERROR, (error) => {
            console.error('Eroare:', error.message);
        });
        
        client.on(Events.AUTHENTICATED, (user) => {
            console.log(`\nAutentificat cu succes ca: ${user.name} (${user.phone})`);
            rl.close();
            process.exit(0);
        });
        
        // Inițializează clientul
        console.log('Inițializare client WhatsApp...\n');
        await client.initialize();
        
        // Solicită codul de asociere
        console.log('Solicit cod de asociere pentru numărul ' + phoneNumber);
        const pairingCode = await client.requestPairingCode(phoneNumber);
        
        console.log('\nAceasta este codul tău de asociere: ' + pairingCode);
        console.log('Deschide WhatsApp și introdu acest cod în dispozitivul conectat');
        
        // Așteaptă ca utilizatorul să introducă codul
        console.log('\nAștept autentificarea... (apasă Ctrl+C pentru a anula)');
        
    } catch (error) {
        console.error('Eroare generală:', error.message);
        rl.close();
        process.exit(1);
    }
}

// Pornește aplicația
main().catch(console.error);
