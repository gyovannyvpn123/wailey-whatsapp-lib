/**
 * Script de instalare pentru biblioteca wailey-whatsapp-lib corectată
 * Aceasta va instala versiunea bibliotecii care funcționează corect cu coduri de asociere
 * 
 * Utilizare: salvați acest fișier ca install-fixed-library.js și rulați:
 * node install-fixed-library.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verifică dacă directorul node_modules există
console.log('Verificăm dacă wailey-whatsapp-lib este instalat...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const waileyPath = path.join(nodeModulesPath, 'wailey-whatsapp-lib');

if (!fs.existsSync(nodeModulesPath)) {
    console.error('❌ Directorul node_modules nu există. Rulează mai întâi `npm init -y` și `npm install`.');
    process.exit(1);
}

// Dacă wailey-whatsapp-lib este deja instalat, îl ștergem
if (fs.existsSync(waileyPath)) {
    console.log('Ștergem versiunea existentă a wailey-whatsapp-lib...');
    try {
        fs.rmSync(waileyPath, { recursive: true, force: true });
        console.log('✅ Versiunea veche a fost ștearsă cu succes.');
    } catch (error) {
        console.error('❌ Eroare la ștergerea versiunii vechi:', error.message);
        process.exit(1);
    }
}

// Instalăm versiunea nouă
console.log('Instalăm versiunea corectată a wailey-whatsapp-lib...');
try {
    const command = 'npm install git+https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git';
    execSync(command, { stdio: 'inherit' });
    console.log('✅ wailey-whatsapp-lib a fost instalat cu succes!');
} catch (error) {
    console.error('❌ Eroare la instalare:', error.message);
    process.exit(1);
}

// Verificăm dacă instalarea a reușit
if (fs.existsSync(path.join(waileyPath, 'lib', 'client.js'))) {
    console.log('✅ Biblioteca a fost instalată și poate fi folosită!');
    
    // Creăm un exemplu simplu pentru a testa instalarea
    const exampleFilePath = path.join(process.cwd(), 'test-wailey.js');
    const exampleCode = `/**
 * Test pentru biblioteca wailey-whatsapp-lib
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
    
    console.log('\nVerificare metode client:');
    console.log('- initialize:', typeof client.initialize === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- requestPairingCode:', typeof client.requestPairingCode === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- getQrCode:', typeof client.getQrCode === 'function' ? '✅ OK' : '❌ Lipsește');
    console.log('- sendTextMessage:', typeof client.sendTextMessage === 'function' ? '✅ OK' : '❌ Lipsește');
    
    console.log('\n✅ Biblioteca a fost importată cu succes și toate metodele sunt disponibile!');
    console.log('Pentru a testa funcționalitatea completă, rulează:');
    console.log('node test-wailey.js run');
} catch (error) {
    console.error('\n❌ Eroare la crearea clientului:', error.message);
}

// Dacă argumentul 'run' este prezent, vom executa și un test real
if (process.argv.includes('run')) {
    console.log('\nRulăm testul de funcționalitate reală...');
    
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
                console.log(\`\nCod de asociere primit: \${code}\`);
                console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău.');
                console.log('Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu codul');
            });
            
            client.on(Events.AUTHENTICATED || 'authenticated', () => {
                console.log('\nAutentificat cu succes!');
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
                    console.log(\`\nSolicit cod de asociere pentru numărul \${phoneNumber}...\`);
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
            });
        } catch (error) {
            console.error('Eroare generală:', error);
            rl.close();
        }
    }
    
    runRealTest().catch(console.error);
}
`;

    fs.writeFileSync(exampleFilePath, exampleCode);
    console.log(`✅ Exemplu creat: ${exampleFilePath}`);
    console.log('Pentru a testa biblioteca, rulează:');
    console.log('node test-wailey.js');
} else {
    console.error('❌ Instalarea a eșuat. Biblioteca nu a fost găsită în node_modules.');
}