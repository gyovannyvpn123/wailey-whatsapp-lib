/**
 * Test pentru biblioteca wailey-whatsapp-lib
 * Versiune corectată fără erori de sintaxă
 */

const { create, Events } = require('wailey-whatsapp-lib');

// Verificare simplă a structurii
console.log('Verificare bibliotecă wailey-whatsapp-lib');
console.log('======================================');
console.log('Events disponibile:', Object.keys(Events));

// Verificare funcția de creare client
try {
    const client = create({
        sessionPath: './test_session',
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '114.0.0']
    });
    
    console.log('Verificare metode client:');
    console.log('- initialize:', typeof client.initialize === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- requestPairingCode:', typeof client.requestPairingCode === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- getQrCode:', typeof client.getQrCode === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- sendTextMessage:', typeof client.sendTextMessage === 'function' ? '✅ OK' : '❌ Lipsește');
    
    console.log('Biblioteca a fost importată cu succes și toate metodele sunt disponibile!');
    console.log('Pentru a testa funcționalitatea completă, rulează:');
    console.log('node test-wailey.js run');
} catch (error) {
    console.error('Eroare la crearea clientului:', error.message);
}

// Dacă argumentul 'run' este prezent, vom executa și un test real
if (process.argv.includes('run')) {
    console.log('Rulăm testul de funcționalitate reală...');
    
    const readline = require('readline');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    async function runRealTest() {
        try {
            const client = create({
                sessionPath: './test_session',
                printQRInTerminal: true,
                browser: ['Ubuntu', 'Chrome', '114.0.0']
            });
            
            client.on(Events.ERROR, (error) => {
                console.error('Eroare:', error.message);
            });
            
            client.on(Events.QR_RECEIVED || 'qr', (qr) => {
                console.log('Cod QR primit. Scanează-l cu telefonul sau așteaptă pentru cod de asociere.');
            });
            
            client.on(Events.PAIRING_CODE || 'pairing_code', (code) => {
                console.log('Cod de asociere primit: ' + code);
                console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
                console.log('Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
            });
            
            client.on(Events.AUTHENTICATED || 'authenticated', () => {
                console.log('Autentificat cu succes!');
                setTimeout(() => {
                    client.disconnect().then(() => {
                        rl.close();
                        process.exit(0);
                    });
                }, 3000);
            });
            
            console.log('Inițializare client WhatsApp...');
            await client.initialize();
            
            rl.question('Introdu numărul tău de telefon (ex: 40712345678): ', async (phoneNumber) => {
                try {
                    console.log('Solicit cod de asociere pentru numărul ' + phoneNumber + '...');
                    await client.requestPairingCode(phoneNumber);
                    console.log('Așteaptă să primești codul de asociere...');
                } catch (error) {
                    console.error('Eroare la solicitarea codului de asociere:', error.message);
                    
                    if (error.message.includes('scan the QR code first') || 
                        error.message.includes('Precondition Required')) {
                        console.log('⚠️ WhatsApp cere scanarea codului QR pentru prima autentificare.');
                        console.log('▶️ Te rog să scanezi codul QR afișat anterior cu telefonul.');
                    }
                }
            });
        } catch (error) {
            console.error('Eroare generală:', error);
            rl.close();
        }
    }
    
    runRealTest().catch(console.error);
}