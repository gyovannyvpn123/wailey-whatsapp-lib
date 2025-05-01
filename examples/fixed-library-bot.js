/**
 * Exemplu de utilizare a bibliotecii wailey-whatsapp-lib reparată
 * Acest script demonstrează că funcția requestPairingCode funcționează corect
 */

// Importăm biblioteca folosind o cale corectă
const { create, Events } = require('../index.js');
const readline = require('readline');

// Creăm interfața readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Funcție pentru a citi input de la utilizator
const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
    try {
        // Solicităm numărul de telefon
        const phoneNumber = await question('Introdu numărul tău de telefon (ex: 40712345678): ');
        
        console.log(`\nUtilizare număr: ${phoneNumber}`);
        
        // Creăm și inițializăm clientul WhatsApp
        console.log('Inițializare client WhatsApp...');
        const client = create({
            sessionPath: `./session_${phoneNumber}`,
            printQRInTerminal: true,
            browser: ['Ubuntu', 'Chrome', '114.0.0'] // Crucial pentru codurile de asociere
        });
        
        // Ascultăm pentru evenimente
        client.on(Events.ERROR, (error) => {
            console.error('Eroare:', error.message);
        });
        
        client.on(Events.QR_RECEIVED || 'qr', (qr) => {
            console.log('Cod QR primit. Scanează-l cu telefonul sau așteaptă pentru cod de asociere.');
        });
        
        client.on(Events.PAIRING_CODE || 'pairing_code', (code) => {
            console.log(`\nCod de asociere primit: ${code}`);
            console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
            console.log('Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
        });
        
        client.on(Events.AUTHENTICATED || 'authenticated', (user) => {
            console.log(`\nAutentificat cu succes ca: ${user?.name || 'utilizator WhatsApp'}`);
            console.log('Poți începe să trimiți mesaje!');
            
            // Închide clientul după autentificare în acest exemplu
            setTimeout(() => {
                client.disconnect().then(() => {
                    rl.close();
                    process.exit(0);
                }).catch(err => {
                    console.error('Eroare la deconectare:', err);
                    rl.close();
                    process.exit(1);
                });
            }, 3000);
        });
        
        // Inițializăm clientul
        await client.initialize();
        
        // Solicităm codul de asociere după inițializare
        setTimeout(async () => {
            try {
                console.log(`\nSolicit cod de asociere pentru numărul ${phoneNumber}...`);
                await client.requestPairingCode(phoneNumber);
                console.log('Așteaptă să primești codul de asociere...');
            } catch (error) {
                console.error('Eroare la solicitarea codului de asociere:', error.message);
                
                if (error.message.includes('scan the QR code first') || 
                    error.message.includes('Precondition Required')) {
                    console.log('\n⚠️ WhatsApp cere scanarea codului QR pentru prima autentificare.');
                    console.log('▶️ Te rog să scanezi codul QR afișat anterior cu telefonul.');
                }
            }
        }, 5000);
        
    } catch (error) {
        console.error('Eroare generală:', error);
        rl.close();
    }
}

// Rulăm funcția principală
main().catch(console.error);
