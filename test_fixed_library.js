/**
 * Test pentru biblioteca wailey-whatsapp-lib reparată
 * Acest script verifică dacă funcția requestPairingCode este acum expusă corect
 */

const { create, Events } = require('./index.js');

function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
}

function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return !cleaned.startsWith('+') ? '+' + cleaned : cleaned;
}

async function main() {
    // Citim numărul de telefon din linia de comandă sau folosim unul de test
    const phoneNumber = process.argv[2] || '40712345678';
    
    if (!validatePhoneNumber(phoneNumber)) {
        console.error('Număr de telefon invalid. Te rog să folosești formatul internațional fără +.');
        process.exit(1);
    }
    
    console.log(`\nTest pentru numărul: ${phoneNumber}`);
    
    // Creăm clientul
    const client = create({
        sessionPath: './test_session',
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '114.0.0'] // Crucial pentru codurile de asociere
    });
    
    // Verificăm existența funcției requestPairingCode
    console.log('Verificare metodă requestPairingCode:', typeof client.requestPairingCode === 'function' ? 'EXISTĂ ✅' : 'LIPSEȘTE ❌');
    
    // Verificăm existența evenimentului PAIRING_CODE
    console.log('Verificare eveniment PAIRING_CODE:', Events.PAIRING_CODE ? 'EXISTĂ ✅' : 'LIPSEȘTE ❌');
    
    // Adăugăm handlere de evenimente
    client.on(Events.ERROR, (error) => {
        console.error('Eroare:', error.message);
    });
    
    client.on(Events.QR_RECEIVED, (qr) => {
        console.log('Cod QR primit. Scanează-l cu telefonul sau așteaptă pentru cod de asociere.');
    });
    
    client.on(Events.PAIRING_CODE, (code) => {
        console.log(`\nCod de asociere primit: ${code}`);
        console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
        console.log('Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
    });
    
    client.on(Events.AUTHENTICATED, () => {
        console.log('\n✅ Autentificat cu succes în WhatsApp!');
        process.exit(0);
    });
    
    // Inițializăm clientul
    console.log('Inițializare client WhatsApp...');
    await client.initialize();
    
    // Solicităm codul de asociere după o mică întârziere
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
}

main().catch(console.error);
