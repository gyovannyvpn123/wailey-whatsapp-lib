# Ghid pentru Codurile de Asociere WhatsApp

Acest ghid explică cum să folosești codurile de asociere (pairing codes) pentru autentificarea WhatsApp Web fără a scana codul QR.

## Ce sunt codurile de asociere?

Codurile de asociere sunt o metodă alternativă de autentificare WhatsApp Web, introdusă în versiunile recente. În loc să scanezi un cod QR, poți introduce un cod numeric de 8 caractere în aplicația WhatsApp de pe telefonul tău.

## Avantaje ale codurilor de asociere

1. **Securitate îmbunătățită** - Elimină riscurile asociate cu scanarea codurilor QR
2. **Ușurință în utilizare** - Ideal pentru dispozitive fără cameră sau pentru utilizare în terminal
3. **Automatizare** - Perfect pentru scenarii în care scanarea QR nu este practică

## Cum să folosești codurile de asociere cu această bibliotecă

### 1. Instalarea bibliotecii

```bash
# Clonează repo-ul
git clone https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git

# Intră în director
cd wailey-whatsapp-lib

# Instalează dependențele
npm install
```

Sau instalează direct cu npm:

```bash
npm install git+https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git
```

### 2. Folosirea codurilor de asociere

Exemplu de cod pentru a obține un cod de asociere:

```javascript
const { create, Events } = require('wailey-whatsapp-lib');

async function connectWithPairingCode() {
  const client = create({
    // Calea pentru stocarea sesiunii
    sessionPath: './auth_session',
    
    // Arată codul QR în terminal (opțional, pentru backup)
    printQRInTerminal: true,
    
    // Setează browser-ul (important pentru compatibilitate)
    browser: ['Ubuntu', 'Chrome', '114.0.0']
  });

  // Ascultă evenimente
  client.on(Events.PAIRING_CODE, (code) => {
    console.log('Cod de asociere primit:', code);
    console.log('Introdu acest cod în aplicația WhatsApp de pe telefonul tău:');
    console.log('Setări > Dispozitive conectate > Conectează un dispozitiv > Introdu cod');
  });

  client.on(Events.QR_RECEIVED, () => {
    console.log('Cod QR generat. Scanează-l sau așteaptă codul de asociere.');
  });

  client.on(Events.AUTHENTICATED, () => {
    console.log('Autentificare reușită!');
  });

  // Inițializează clientul
  await client.initialize();

  // Solicită codul de asociere (înlocuiește cu numărul tău real)
  // Număr format internațional fără + (ex: 40712345678)
  const phoneNumber = '40712345678';
  try {
    await client.requestPairingCode(phoneNumber);
  } catch (error) {
    console.error('Eroare la solicitarea codului de asociere:', error.message);
    if (error.message.includes('Precondition Required')) {
      console.log('Este posibil să fie nevoie să scanezi un cod QR prima dată.');
    }
  }
}

connectWithPairingCode().catch(console.error);
```

### 3. Procesul de utilizare

1. Rulează scriptul tău
2. Vei primi un cod de asociere de 8 caractere (ex: `ABCD-1234`)
3. Deschide WhatsApp pe telefonul tău
4. Mergi la Setări > Dispozitive conectate > Conectează un dispozitiv
5. Selectează "Introdu cod" în loc de scanare QR
6. Introdu codul de asociere primit

## Rezolvarea problemelor

### Eroarea "Precondition Required"

Dacă primești această eroare, înseamnă că WhatsApp solicită să scanezi un cod QR cel puțin o dată pentru prima autentificare. După ce ai scanat un cod QR o dată, vei putea folosi codurile de asociere pentru autentificările ulterioare.

### Soluții:

1. Scanează codul QR pentru prima autentificare (este afișat în terminal dacă ai setat `printQRInTerminal: true`)
2. După ce ești autentificat, deconectează-te și reconnectează-te folosind codul de asociere
3. Alternativ, folosește un telefon fizic pentru a scana codul QR o singură dată

## Limitări cunoscute

1. Prima autentificare necesită de obicei scanarea unui cod QR
2. Solicitările prea frecvente de coduri de asociere pot duce la limitarea temporară a ratei
3. Codurile de asociere expiră în aproximativ 60 de secunde

## Exemplu complet

Un exemplu complet este disponibil în directorul `examples/pairing_code_bot.js` din acest repo.

## Note importante

- Folosește formatul internațional pentru numere de telefon (de ex. `40712345678` pentru România)
- Asigură-te că telefonul are o conexiune la internet activă
- WhatsApp nu trimite notificări pentru codurile de asociere, trebuie să urmărești manual ecranul de conectare a dispozitivului
