/**
 * Script pentru a verifica și repara problemele din wailey-whatsapp-lib
 * Testează dacă requestPairingCode funcționează corect
 */

// Importăm biblioteca direct
const { create, Events } = require('./index.js');
const fs = require('fs');

// Funcție pentru a testa biblioteca
async function testLibrary() {
    console.log('🔍 Verificare bibliotecă wailey-whatsapp-lib...');
    
    // Verifică dacă librăria se importă corect
    console.log('✅ Biblioteca a fost importată cu succes.');
    
    // Creăm un client
    const client = create({
        sessionPath: './test_session_fix',
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '114.0.0']
    });
    
    // Verificăm metodele și proprietățile importante
    console.log('\n🔍 Verificare metode și evenimente:');
    console.log(`- Metodă requestPairingCode: ${typeof client.requestPairingCode === 'function' ? '✅ EXISTĂ' : '❌ LIPSEȘTE'}`);
    console.log(`- Eveniment PAIRING_CODE: ${Events.PAIRING_CODE ? '✅ EXISTĂ' : '❌ LIPSEȘTE'}`);
    
    // Verificăm dacă requestPairingCode este declarată ca async
    const clientFile = fs.readFileSync('./lib/client.js', 'utf8');
    console.log(`- Declarația async pentru requestPairingCode: ${clientFile.includes('async requestPairingCode') ? '✅ CORECT' : '❌ LIPSEȘTE'}`);
    
    // Verificăm dacă Events include PAIRING_CODE
    console.log(`- Events.PAIRING_CODE în index.js: ${Events.PAIRING_CODE === 'pairing_code' ? '✅ CORECT' : '❌ INCORECT'}`);
    
    console.log('\n📋 Rezultate finale:');
    if (typeof client.requestPairingCode === 'function' && 
        Events.PAIRING_CODE && 
        clientFile.includes('async requestPairingCode')) {
        console.log('✅ Biblioteca wailey-whatsapp-lib a fost reparată cu succes!');
        console.log('\nPoți folosi acum biblioteca astfel:');
        console.log(`
const { create, Events } = require('wailey-whatsapp-lib');

// Creează clientul
const client = create({
    sessionPath: './session',
    printQRInTerminal: true, 
    browser: ['Ubuntu', 'Chrome', '114.0.0']
});

// Adaugă handlere pentru evenimente
client.on(Events.PAIRING_CODE, (code) => {
    console.log('Cod de asociere primit:', code);
});

// Inițializează clientul
await client.initialize();

// Solicită codul de asociere
await client.requestPairingCode('NUMAR_TELEFON');
`);
    } else {
        console.log('❌ Mai există probleme cu biblioteca. Verifică erorile de mai sus.');
    }
}

// Rulăm testul
testLibrary().catch(err => {
    console.error('❌ Eroare în timpul testării:', err);
});
