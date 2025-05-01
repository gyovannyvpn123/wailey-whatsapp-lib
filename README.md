<<<<<<< HEAD
# 🚀 Wailey WhatsApp Library v4.4.1

![GitHub stars](https://img.shields.io/github/stars/gyovannyvpn123/wailey-whatsapp-lib?style=social)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-4.4.0-blue)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Platform](https://img.shields.io/badge/platform-Node.js%20%7C%20Termux-orange)

**Cea mai puternică și flexibilă bibliotecă WhatsApp pentru Node.js, cu suport dual pentru autentificare (cod QR și cod de asociere)**

## 📋 Cuprins

- [🌟 Noutăți](#-noutăți)
- [✨ Caracteristici principale](#-caracteristici-principale)
- [🔧 Instalare](#-instalare)
- [🚀 Utilizare rapidă](#-utilizare-rapidă)
- [📱 Metode de autentificare](#-metode-de-autentificare)
  - [🔄 Autentificare cu cod QR](#-autentificare-cu-cod-qr)
  - [📲 Autentificare cu cod de asociere](#-autentificare-cu-cod-de-asociere)
- [💡 Exemple complete](#-exemple-complete)
- [🔌 Funcționalități avansate](#-funcționalități-avansate)
- [🛠️ API Reference](#️-api-reference)
- [📦 Gestionarea sesiunilor](#-gestionarea-sesiunilor)
- [⚠️ Soluționarea problemelor](#️-soluționarea-problemelor)
- [📚 Referințe și resurse utile](#-referințe-și-resurse-utile)
- [🤝 Contribuții](#-contribuții)
- [📄 Licență](#-licență)

## 🌟 Noutăți

**Versiunea 4.4.0 aduce îmbunătățiri semnificative:**

- ✅ **Suport pentru autentificare cu cod de asociere** - Conectează-te fără a scana codul QR, direct cu numărul de telefon
- ✅ **Fix pentru eroarea "waconnector is not a constructor"** - Rezolvare pentru problema raportată frecvent
- ✅ **Îmbunătățiri majore de stabilitate** - Conexiuni mai robuste și mai puțin întreruperi
- ✅ **Emulare browser îmbunătățită** - Acum biblioteca se prezintă ca Chrome pe Linux pentru o compatibilitate maximă
- ✅ **Mod demo/test** - Testează funcționalitățile fără a necesita un număr real de telefon
- ✅ **Validare avansată a numerelor de telefon** - Suport pentru diverse formate internaționale

## ✨ Caracteristici principale

- **🔐 Metode duale de autentificare:**
  - Scanare tradițională cod QR
  - Cod de asociere cu număr de telefon (nou!)

- **📊 Gestionare avansată a conexiunilor:**
  - Reconectare automată
  - Management sesiuni persistente
  - Detecție stare conexiune

- **🔄 Compatibilitate maximizată:**
  - WhatsApp Web versiuni noi
  - Multi-device 2.0 support
  - Funcționează pe servere, VPS-uri și Termux

- **📦 Design modular și flexibil:**
  - API curat și intuitiv
  - Suport pentru middlewares
  - Gestionare avansată a evenimentelor

## 🔧 Instalare

### Cerințe preliminare:
- Node.js (v14+)
- npm sau yarn

#
## Cod de Asociere (Pairing Code)

Această versiune a bibliotecii suportă autentificarea prin cod de asociere numeric, fără a necesita scanarea codului QR.

### Cum funcționează:

1. Inițializați clientul cu opțiunile dorite
2. Apelați metoda `requestPairingCode` cu numărul de telefon în format internațional
3. Primiți un cod de asociere format din 8 caractere
4. Introduceți acest cod în aplicația WhatsApp de pe telefon

### Exemplu de cod:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

async function main() {
    // Creați și inițializați clientul
    const client = whatsapp.create({
        sessionPath: './session',
        printQRInTerminal: false
    });
    
    await client.initialize();
    
    // Solicitați codul de asociere (număr în format internațional)
    const pairingCode = await client.requestPairingCode('40712345678');
    
    console.log('Codul de asociere:', pairingCode);
    console.log('Introduceți acest cod în aplicația WhatsApp pe telefonul dvs.');
    
    // Așteptați autentificarea
    client.on('authenticated', (user) => {
        console.log('Autentificat ca:', user.name);
    });
}

main().catch(console.error);
```

### Instrucțiuni pentru utilizator:

1. Deschideți WhatsApp pe telefonul mobil
2. Mergeți la Setări > Dispozitive conectate > Conectează un dispozitiv
3. La ecranul cu codul QR, apăsați pe "Conectează cu număr"
4. Introduceți codul afișat de script


## Instalare via npm:
=======
<<<<<<< HEAD
# Wailey WhatsApp Library

O biblioteca WhatsApp Web API modificată care suportă atât autentificarea prin cod QR, cât și prin coduri de asociere pentru numere de telefon.

## Caracteristici

- ✅ Autentificare prin Cod QR (scanare)
- ✅ Autentificare prin Cod de Asociere (pairing code)
- ✅ Mod Demo pentru testare fără numere reale
- ✅ Optimizat pentru conexiuni stabile


## Cod de Asociere (Pairing Code)

Această versiune a bibliotecii suportă autentificarea prin cod de asociere numeric, fără a necesita scanarea codului QR.

### Cum funcționează:

1. Inițializați clientul cu opțiunile dorite
2. Apelați metoda `requestPairingCode` cu numărul de telefon în format internațional
3. Primiți un cod de asociere format din 8 caractere
4. Introduceți acest cod în aplicația WhatsApp de pe telefon

### Exemplu de cod:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

async function main() {
    // Creați și inițializați clientul
    const client = whatsapp.create({
        sessionPath: './session',
        printQRInTerminal: false
    });
    
    await client.initialize();
    
    // Solicitați codul de asociere (număr în format internațional)
    const pairingCode = await client.requestPairingCode('40712345678');
    
    console.log('Codul de asociere:', pairingCode);
    console.log('Introduceți acest cod în aplicația WhatsApp pe telefonul dvs.');
    
    // Așteptați autentificarea
    client.on('authenticated', (user) => {
        console.log('Autentificat ca:', user.name);
    });
}

main().catch(console.error);
```

### Instrucțiuni pentru utilizator:

1. Deschideți WhatsApp pe telefonul mobil
2. Mergeți la Setări > Dispozitive conectate > Conectează un dispozitiv
3. La ecranul cu codul QR, apăsați pe "Conectează cu număr"
4. Introduceți codul afișat de script


## Instalare
=======
# Wailey WhatsApp Library v4.4.0

A robust WhatsApp library for Node.js with support for QR code and pairing code authentication

## Overview

Wailey WhatsApp library is a reliable Node.js library for WhatsApp integration that allows you to connect to WhatsApp Web API. This library supports both QR code authentication and pairing code authentication methods.

**Version 4.4.0 Important Updates:**
- ✅ Fixed QR code generation and display
- ✅ Fixed pairing code authentication
- ✅ Improved AuthState management for stable sessions
- ✅ Enhanced connection stability with automatic reconnection 
- ✅ Resolved module compatibility issues (ESM vs CommonJS)

## Installation
>>>>>>> a86b85ca9bd6630c8e744870cecbbfc908021c99
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)

```bash
npm install wailey-whatsapp-lib
```

<<<<<<< HEAD

## Generare Cod de Asociere pentru WhatsApp

Biblioteca suportă generarea codurilor de asociere pentru autentificare prin număr de telefon, fără a necesita scanarea unui cod QR în prealabil.

```javascript
const { create } = require('wailey-whatsapp-lib');

async function example() {
  const client = create({
    printQRInTerminal: false,
    sessionPath: './session'
  });
  
  client.on('pairing_code', (code) => {
    console.log(`Cod de asociere: ${code}`);
    console.log('Introdu acest cod în aplicația WhatsApp pe telefonul tău');
  });
  
  await client.initialize();
  
  // Solicită cod de asociere pentru numărul tău
  await client.requestPairingCode('40712345678');
}

example();
```

Vezi `examples/pairing-code-example.js` pentru un exemplu complet.


#
## Cod de Asociere (Pairing Code)

Această versiune a bibliotecii suportă autentificarea prin cod de asociere numeric, fără a necesita scanarea codului QR.

### Cum funcționează:

1. Inițializați clientul cu opțiunile dorite
2. Apelați metoda `requestPairingCode` cu numărul de telefon în format internațional
3. Primiți un cod de asociere format din 8 caractere
4. Introduceți acest cod în aplicația WhatsApp de pe telefon

### Exemplu de cod:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

async function main() {
    // Creați și inițializați clientul
    const client = whatsapp.create({
        sessionPath: './session',
        printQRInTerminal: false
    });
    
    await client.initialize();
    
    // Solicitați codul de asociere (număr în format internațional)
    const pairingCode = await client.requestPairingCode('40712345678');
    
    console.log('Codul de asociere:', pairingCode);
    console.log('Introduceți acest cod în aplicația WhatsApp pe telefonul dvs.');
    
    // Așteptați autentificarea
    client.on('authenticated', (user) => {
        console.log('Autentificat ca:', user.name);
    });
}

main().catch(console.error);
```

### Instrucțiuni pentru utilizator:

1. Deschideți WhatsApp pe telefonul mobil
2. Mergeți la Setări > Dispozitive conectate > Conectează un dispozitiv
3. La ecranul cu codul QR, apăsați pe "Conectează cu număr"
4. Introduceți codul afișat de script


## Instalare via yarn:

```bash
yarn add wailey-whatsapp-lib
```

#
## Cod de Asociere (Pairing Code)

Această versiune a bibliotecii suportă autentificarea prin cod de asociere numeric, fără a necesita scanarea codului QR.

### Cum funcționează:

1. Inițializați clientul cu opțiunile dorite
2. Apelați metoda `requestPairingCode` cu numărul de telefon în format internațional
3. Primiți un cod de asociere format din 8 caractere
4. Introduceți acest cod în aplicația WhatsApp de pe telefon

### Exemplu de cod:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

async function main() {
    // Creați și inițializați clientul
    const client = whatsapp.create({
        sessionPath: './session',
        printQRInTerminal: false
    });
    
    await client.initialize();
    
    // Solicitați codul de asociere (număr în format internațional)
    const pairingCode = await client.requestPairingCode('40712345678');
    
    console.log('Codul de asociere:', pairingCode);
    console.log('Introduceți acest cod în aplicația WhatsApp pe telefonul dvs.');
    
    // Așteptați autentificarea
    client.on('authenticated', (user) => {
        console.log('Autentificat ca:', user.name);
    });
}

main().catch(console.error);
```

### Instrucțiuni pentru utilizator:

1. Deschideți WhatsApp pe telefonul mobil
2. Mergeți la Setări > Dispozitive conectate > Conectează un dispozitiv
3. La ecranul cu codul QR, apăsați pe "Conectează cu număr"
4. Introduceți codul afișat de script


## Instalare directă din GitHub:

```bash
npm install git+https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git
```

## 🚀 Utilizare rapidă

Iată un exemplu simplu pentru a porni rapid:
=======
<<<<<<< HEAD
## Utilizare

### Inițializare
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)

```javascript
const whatsapp = require('wailey-whatsapp-lib');

<<<<<<< HEAD
// Creare instanță client
const client = whatsapp.create({
  puppeteer: {
    headless: 'new', // Recomandat pentru servere
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Gestionare evenimente
client.on(whatsapp.Events.QR_CODE, (qr) => {
  console.log('Scanează acest cod QR în WhatsApp: ', qr);
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
  console.log('Cod de asociere primit: ' + code);
  console.log('Folosește acest cod pentru a conecta telefonul tău!');
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
  console.log('Autentificat cu succes!');
});

client.on(whatsapp.Events.READY, () => {
  console.log('Client pregătit pentru utilizare!');
});

// Inițializare client
client.initialize();

// Opțional: solicită un cod de asociere pentru autentificare
// cu număr de telefon (fără + la început, doar cifre)
setTimeout(async () => {
  try {
    await client.requestPairingCode('4075646XXXX'); // Înlocuiește cu numărul tău real
  } catch (err) {
    console.error('Eroare la solicitarea codului de asociere:', err.message);
  }
}, 2000);
```

## 📱 Metode de autentificare

### 🔄 Autentificare cu cod QR

Metoda tradițională de autentificare utilizând un cod QR:

```javascript
const whatsapp = require('wailey-whatsapp-lib');
const qrcode = require('qrcode-terminal'); // Optional pentru afișarea în terminal

const client = whatsapp.create();

client.on(whatsapp.Events.QR_CODE, (qr) => {
  // Afișează codul QR în terminal (opțional)
  qrcode.generate(qr, {small: true});
  console.log('Scanează acest cod QR cu aplicația WhatsApp de pe telefon');
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
  console.log('Autentificat cu succes!');
});

client.initialize();
```

### 📲 Autentificare cu cod de asociere

Metoda nouă de autentificare utilizând un cod de asociere și număr de telefon:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

const client = whatsapp.create();

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
  console.log('=============COD DE ASOCIERE=============');
  console.log('Utilizează acest cod pentru a asocia telefonul: ' + code);
  console.log('Deschide WhatsApp > Setări > Dispozitive conectate > Conectează un dispozitiv');
  console.log('=========================================');
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
  console.log('Autentificat cu succes!');
});

client.initialize();

// Solicită un cod de asociere pentru autentificare
// Notă: așteaptă puțin timp după initialize() înainte de a solicita codul
setTimeout(async () => {
  try {
    // Numărul în format internațional fără "+" (exemplu: 4075646XXXX)
    await client.requestPairingCode('4075646XXXX'); 
  } catch (err) {
    console.error('Eroare la solicitarea codului de asociere:', err.message);
  }
}, 2000);
```

## 💡 Exemple complete

### Script demo complet pentru testare rapidă:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

// Funcție pentru afișare ASCII art
function printBanner() {
  console.log('');
  console.log('╭──────────────────────────────────────────────────╮');
  console.log('│ 🚀 WAILEY WHATSAPP LIBRARY v4.4.0                │');
  console.log('│ ✨ Demo pentru autentificare QR și cod asociere  │');
  console.log('╰──────────────────────────────────────────────────╯');
  console.log('');
}

// Afișare banner
printBanner();

// Creare client WhatsApp
const client = whatsapp.create({
  puppeteer: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Gestionare evenimente
console.log('🔄 Inițializare client WhatsApp...');

client.on(whatsapp.Events.QR_CODE, (qr) => {
  console.log('╭─────────────────────────────────────────────╮');
  console.log('│ 📱 COD QR PRIMIT                            │');
  console.log('│ Scanează acest cod în WhatsApp pentru login │');
  console.log('╰─────────────────────────────────────────────╯');
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
  console.log('╭─────────────────────────────────────────────╮');
  console.log('│ 🔐 COD DE ASOCIERE PRIMIT                   │');
  console.log(`│ Cod: ${code}                                │`);
  console.log('│ Instrucțiuni:                               │');
  console.log('│ 1. Deschide WhatsApp pe telefonul tău       │');
  console.log('│ 2. Accesează Setări > Dispozitive conectate │');
  console.log('│ 3. Selectează "Conectează un dispozitiv"    │');
  console.log('│ 4. Introdu codul afișat mai sus             │');
  console.log('╰─────────────────────────────────────────────╯');
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
  console.log('✅ AUTENTIFICAT CU SUCCES!');
});

client.on(whatsapp.Events.READY, () => {
  console.log('🚀 Client pregătit pentru utilizare!');
});

client.on(whatsapp.Events.ERROR, (err) => {
  console.error('❌ EROARE:', err);
});

// Inițializare client
console.log('🔄 Inițializare...');
client.initialize().then(() => {
  console.log('✅ Inițializare completă');
  
  // Solicită un cod de asociere după 2 secunde
  setTimeout(async () => {
    try {
      console.log('🔄 Solicitare cod de asociere...');
      await client.requestPairingCode('4075646XXXX'); // Folosește un număr de test
    } catch (err) {
      console.error('❌ Eroare la solicitarea codului de asociere:', err.message);
    }
  }, 2000);
});

// Oprește clientul după 30 secunde (doar pentru demo)
setTimeout(async () => {
  console.log('⏱️ Demo finalizat, închidere client...');
  await client.destroy();
  process.exit(0);
}, 30000);
```

### Exemplu pentru aplicație web (Express):

```javascript
const express = require('express');
const whatsapp = require('wailey-whatsapp-lib');
const qrcode = require('qrcode');

const app = express();
const port = 3000;

// Setare middleware și configurări Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Variabile globale
let whatsappClient;
let currentQR = '';
let currentPairingCode = '';
let connectionStatus = 'Deconectat';

// Creare client WhatsApp
function initializeWhatsAppClient() {
  whatsappClient = whatsapp.create({
    puppeteer: {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on(whatsapp.Events.QR_CODE, (qr) => {
    currentQR = qr;
    connectionStatus = 'Așteptare scanare cod QR';
    console.log('Cod QR nou generat');
  });

  whatsappClient.on(whatsapp.Events.PAIRING_CODE, (code) => {
    currentPairingCode = code;
    connectionStatus = 'Așteptare introducere cod de asociere';
    console.log(`Cod de asociere generat: ${code}`);
  });

  whatsappClient.on(whatsapp.Events.AUTHENTICATED, () => {
    connectionStatus = 'Autentificat';
    console.log('Autentificat cu succes!');
  });

  whatsappClient.on(whatsapp.Events.READY, () => {
    connectionStatus = 'Pregătit';
    console.log('Client WhatsApp pregătit');
  });

  whatsappClient.on(whatsapp.Events.ERROR, (err) => {
    connectionStatus = `Eroare: ${err.message}`;
    console.error('Eroare client WhatsApp:', err);
  });

  // Inițializare client
  whatsappClient.initialize().catch(error => {
    console.error('Eroare la inițializarea clientului WhatsApp:', error);
    connectionStatus = `Eroare la inițializare: ${error.message}`;
  });
}

// Rute
app.get('/', (req, res) => {
  res.render('index', { 
    status: connectionStatus,
    hasPairingCode: currentPairingCode !== ''
  });
});

app.get('/qr', async (req, res) => {
  if (!currentQR) {
    return res.status(404).send('Niciun cod QR disponibil');
  }
  
  try {
    const qrImage = await qrcode.toDataURL(currentQR);
    res.send(`<img src="${qrImage}" alt="WhatsApp QR Code">`);
  } catch (err) {
    res.status(500).send('Eroare la generarea imaginii QR');
  }
});

app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    hasPairingCode: currentPairingCode !== '',
    pairingCode: currentPairingCode
  });
});

app.post('/request-pairing-code', async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Numărul de telefon este obligatoriu' });
  }
  
  try {
    await whatsappClient.requestPairingCode(phoneNumber);
    res.json({ success: true, message: 'Cod de asociere solicitat cu succes' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/logout', async (req, res) => {
  if (whatsappClient) {
    try {
      await whatsappClient.logout();
      await whatsappClient.destroy();
      
      // Resetare variabile
      currentQR = '';
      currentPairingCode = '';
      connectionStatus = 'Deconectat';
      
      // Reinițializare client
      initializeWhatsAppClient();
      
      res.json({ success: true, message: 'Deconectat cu succes' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.json({ success: true, message: 'Niciun client activ' });
  }
});

// Inițializare client WhatsApp și pornire server
initializeWhatsAppClient();

app.listen(port, () => {
  console.log(`Server pornit la adresa http://localhost:${port}`);
});
```

## 🔌 Funcționalități avansate

### Gestionarea evenimentelor:

```javascript
// Evenimentele disponibile
const events = {
  QR_CODE: 'qrCode',           // Cod QR generat
  PAIRING_CODE: 'pairingCode', // Cod de asociere generat
  AUTHENTICATED: 'authenticated', // Autentificare reușită
  READY: 'ready',              // Client pregătit
  DISCONNECTED: 'disconnected', // Deconectat
  ERROR: 'error'               // Eroare
};

// Exemplu de gestionare a evenimentelor
client.on(events.QR_CODE, (qr) => {
  // Manipulare cod QR
});

client.on(events.PAIRING_CODE, (code) => {
  // Manipulare cod de asociere
});

client.on(events.AUTHENTICATED, () => {
  // Manipulare autentificare reușită
});

client.on(events.READY, () => {
  // Client pregătit pentru utilizare
});

client.on(events.DISCONNECTED, () => {
  // Manipulare deconectare
});

client.on(events.ERROR, (error) => {
  // Manipulare eroare
});
```

### Configurații avansate:

```javascript
const client = whatsapp.create({
  // Opțiuni Puppeteer
  puppeteer: {
    headless: 'new',           // 'new' pentru modul headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ],
    defaultViewport: null,
    executablePath: '/path/to/chrome' // Opțional: cale către executabil Chrome
  },
  
  // Opțiuni conexiune
  connectionOptions: {
    maxRetries: 5,             // Număr maxim de încercări de reconectare
    retryDelay: 3000,          // Întârziere între încercări (ms)
    maxQrAttempts: 3           // Număr maxim de încercări de generare QR
  },
  
  // Gestionare sesiune
  session: {
    storePath: './whatsapp-session', // Director pentru stocarea sesiunii
    saveCredentials: true,     // Salvare automată credențiale
    restoreSessions: true      // Restaurare automată sesiuni
  },
  
  // Opțiuni utilizator
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', // User agent custom
  browserName: 'Chrome',       // Nume browser
  browserVersion: '123.0.0.0', // Versiune browser
  platformName: 'Linux'        // Platformă
});
```

## 🛠️ API Reference

### Metode principale:

| Metodă | Descriere | Parametri | Răspuns |
|--------|-----------|-----------|---------|
| `create(options)` | Crează o nouă instanță client | `options`: Obiect configurare | `Client` |
| `initialize()` | Inițializează clientul și conexiunea | - | `Promise<void>` |
| `requestPairingCode(phoneNumber)` | Solicită un cod de asociere | `phoneNumber`: String | `Promise<string>` |
| `getQrCode()` | Obține codul QR curent | - | `Promise<string>` |
| `isAuthenticated()` | Verifică dacă clientul este autentificat | - | `boolean` |
| `logout()` | Deconectare de la WhatsApp Web | - | `Promise<boolean>` |
| `destroy()` | Închide conexiunea și browser-ul | - | `Promise<void>` |

### Evenimente importante:

| Eveniment | Descriere | Callback Parametri |
|-----------|-----------|-------------------|
| `QR_CODE` | Emis când se generează un cod QR | `(qrString)` |
| `PAIRING_CODE` | Emis când se generează un cod de asociere | `(pairingCode)` |
| `AUTHENTICATED` | Emis la autentificare reușită | - |
| `READY` | Emis când clientul e pregătit pentru utilizare | - |
| `DISCONNECTED` | Emis la deconectare | - |
| `ERROR` | Emis când apare o eroare | `(errorObject)` |

## 📦 Gestionarea sesiunilor

Biblioteca suportă gestionarea sesiunilor pentru a evita re-autentificarea constantă:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

// Configurare client cu gestionare de sesiune
const client = whatsapp.create({
  session: {
    storePath: './whatsapp-session', // Directorul unde va fi stocată sesiunea
    saveCredentials: true,           // Salvează automat credențialele
    restoreSessions: true            // Încearcă automat restaurarea sesiunilor salvate
  }
});

// Restul codului...
client.initialize();
```

## ⚠️ Soluționarea problemelor

### Problema: Eroarea "waconnector is not a constructor"

**Soluție:** Utilizează corect metoda `create()` pentru instanțierea clientului:

```javascript
const whatsapp = require('wailey-whatsapp-lib');

// Corect:
const client = whatsapp.create();

// Incorect:
// const client = new whatsapp.waconnector();
```

### Problema: Conexiune închisă după solicitarea codului de asociere

**Soluție:** Asigură-te că folosești un număr de telefon valid și formatul corect:

```javascript
// Format corect: fără "+" sau alte caractere, doar cifrele
await client.requestPairingCode('4075646XXXX');

// Format incorect:
// await client.requestPairingCode('+4075646XXXX');
// await client.requestPairingCode('0075646XXXX');
```

### Problema: Erori de browser/Puppeteer

**Soluție:** Asigură-te că folosești configurațiile corecte pentru environment-ul tău:

```javascript
const client = whatsapp.create({
  puppeteer: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});
```

### Problema: Probleme pe Termux/Android

**Soluție:** Folosește scriptul de instalare specific pentru Termux:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/gyovannyvpn123/wailey-whatsapp-lib/main/fix-termux.sh)"
```

## 📚 Referințe și resurse utile

- [Documentație oficială WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/api/reference)
- [Ghid multidevice WhatsApp](https://faq.whatsapp.com/general/download-and-installation/about-multi-device-beta/)
- [Puppeteer API](https://pptr.dev/)

## 🤝 Contribuții

Contribuțiile sunt întotdeauna binevenite! Dacă ai îmbunătățiri sau corecții:

1. Fork la repository
2. Creează branch-ul tău (`git checkout -b feature/amazing-feature`)
3. Commit schimbările (`git commit -m 'Add some amazing feature'`)
4. Push la branch (`git push origin feature/amazing-feature`)
5. Deschide un Pull Request

## 📄 Licență

Acest proiect este licențiat sub [Licența MIT](LICENSE).

---

## Autor

🧑‍💻 **gyovannyvpn123**

🙏 Dezvoltat pe baza proiectului original wailey-whatsapp-lib, cu modificări și îmbunătățiri semnificative.

---

**⭐ Nu uita să apreciezi acest proiect cu un star pe GitHub! ⭐**
=======
const client = whatsapp.create({
    // Opțional: Folder pentru stocarea sesiunii
    sessionPath: './whatsapp-session'
});

// Ascultă evenimente
client.on(whatsapp.Events.QR_CODE, (qr) => {
    console.log('Cod QR primit:', qr);
});

client.on(whatsapp.Events.PAIRING_CODE, (code) => {
    console.log('Cod de asociere primit:', code);
});

client.on(whatsapp.Events.AUTHENTICATED, () => {
    console.log('Autentificat cu succes!');
});

client.on(whatsapp.Events.READY, () => {
    console.log('Client pregătit!');
});

// Inițializare
client.initialize();
```

### Autentificare prin Cod QR

Codul QR va fi generat automat la inițializare și emis prin evenimentul `QR_CODE`. Poți afișa acest cod pentru ca utilizatorul să-l scaneze.

```javascript
const qrcode = require('qrcode-terminal');

client.on(whatsapp.Events.QR_CODE, (qr) => {
    // Afișează codul QR în terminal
    qrcode.generate(qr, { small: true });
    console.log('Scanează acest cod QR în aplicația WhatsApp');
});
```

### Autentificare prin Cod de Asociere

```javascript
// Solicită un cod de asociere pentru un număr de telefon
async function requestPairingCode(phoneNumber) {
    try {
        await client.requestPairingCode(phoneNumber);
        // Codul de asociere va fi emis prin evenimentul PAIRING_CODE
    } catch (error) {
        console.error('Eroare:', error.message);
    }
}

// Procesează codul de asociere primit
client.on(whatsapp.Events.PAIRING_CODE, (code) => {
    console.log('Folosește acest cod în aplicația WhatsApp:', code);
    console.log('1. Deschide WhatsApp pe telefon');
    console.log('2. Mergi la Setări > Dispozitive conectate');
    console.log('3. Apasă pe "Conectează un dispozitiv"');
    console.log('4. Când apare scanarea codului QR, apasă "CONECTARE CU NUMĂR DE TELEFON"');
    console.log('5. Introdu numărul de telefon și codul de 8 cifre de mai sus');
});
```

## Note Importante

1. **Autentificarea cu cod de asociere în mediul real**:
   - WhatsApp necesită o sesiune activă pentru a genera coduri de asociere reale.
   - În unele cazuri, este necesar să scanezi întâi un cod QR pentru a stabili conexiunea inițială.
   - După autentificarea inițială, codul de asociere va funcționa corect.

2. **Mod Demo**:
   - Pentru a testa biblioteca fără un număr real, folosește un număr cu "XXXX" în el (ex: "+4075646XXXX").
   - Biblioteca va detecta automat modul demo și va genera un cod de asociere de test.

3. **Format Numere de Telefon**:
   - Folosește formatul internațional cu prefix "+" (exemplu: "+40748123456").

## Exemple

Vezi fișierul `demo.js` pentru un exemplu complet care arată ambele metode de autentificare.

## Licență
=======
## Features

- Multiple authentication methods:
  - QR Code authentication (scan with your phone)
  - Pairing Code authentication (enter a code on your phone)
- Persistent session management
- Message handling (sending/receiving text and media)
- Event-based architecture 
- Automatic reconnection
- Comprehensive error handling

## Quick Start

### Authentication with QR Code

```javascript
const { WAConnection } = require('wailey-whatsapp-lib');

// Create a new instance
const client = new WAConnection({
  authStateDir: './auth_info',
  debug: true,
  printQRInTerminal: true,
  session: 'my-session'
});

// Connect with QR code
async function start() {
  try {
    await client.connectWithQR();
    
    // Register event handlers
    client.on('message', (message) => {
      console.log('New message:', message);
    });
    
    // Send a message after connected
    client.on('ready', async () => {
      console.log('Client is ready!');
      
      // Send a message
      await client.sendTextMessage('1234567890@s.whatsapp.net', 'Hello from Wailey WhatsApp Library!');
    });
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

start();
```

### Authentication with Pairing Code

```javascript
const { WAConnection } = require('wailey-whatsapp-lib');

// Create a new instance
const client = new WAConnection({
  authStateDir: './auth_info',
  debug: true,
  session: 'my-session'
});

// Connect with pairing code
async function start() {
  try {
    // The phone number should be without any formatting (no +, spaces, etc.)
    const phoneNumber = '1234567890'; // Replace with your phone number
    
    const result = await client.connectWithPairingCode(phoneNumber);
    console.log('Pairing code:', result.code);
    
    // Register event handlers
    client.on('ready', () => {
      console.log('Client is ready!');
    });
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

start();
```

## API Reference

### WAConnection Class

The main class for WhatsApp connection.

#### Constructor Options

```javascript
const client = new WAConnection({
  // Required options
  authStateDir: './auth_info',  // Directory to store auth data
  session: 'my-session',        // Session name
  
  // Optional options
  debug: true,                  // Enable debugging
  printQRInTerminal: true,      // Print QR code in terminal
  reconnect: true,              // Auto reconnect on disconnect
  maxReconnectAttempts: 5,      // Maximum reconnection attempts
  connectTimeout: 60000,        // Connection timeout in ms
  qrTimeout: 60000,             // QR code timeout in ms
  logLevel: 'info'              // Log level: debug, info, warn, error
});
```

#### Methods

- **connectWithQR()**: Connect to WhatsApp using QR code authentication
- **connectWithPairingCode(phoneNumber)**: Connect to WhatsApp using pairing code authentication
- **sendTextMessage(to, text, options)**: Send a text message
- **sendMediaMessage(to, media, options)**: Send a media message (image, video, document)
- **getStatus()**: Get connection status
- **logout()**: Logout and clear session data
- **disconnect()**: Disconnect from WhatsApp
- **on(event, listener)**: Register event listener
- **off(event, listener)**: Remove event listener
- **once(event, listener)**: Register one-time event listener

#### Events

- **qr**: Emitted when QR code is received
- **pairing_code**: Emitted when pairing code is received
- **ready**: Emitted when connection is ready
- **message**: Emitted when new message is received
- **message.new**: Emitted when a new message is received
- **message.update**: Emitted when a message is updated
- **disconnected**: Emitted when disconnected
- **connecting**: Emitted when connecting
- **connection.update**: Emitted when connection status changes
- **error**: Emitted when an error occurs

## License
>>>>>>> a86b85ca9bd6630c8e744870cecbbfc908021c99

MIT
>>>>>>> 3a1140c (Rezolvat eroarea WAConnection is not a constructor și optimizat biblioteca)
