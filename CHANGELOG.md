# Changelog pentru Wailey WhatsApp Library

## Versiunea 1.1.0 (30 Aprilie 2025)

### Adăugat
- Suport pentru autentificare prin coduri de asociere (pairing codes)
- Mod demo pentru testare cu numere de telefon de test (conținând "XXXX")
- Configurări optimizate pentru conectivitate mai bună
- README.md detaliat cu exemple și instrucțiuni de utilizare
- Exemplu demo.js interactiv care arată ambele metode de autentificare
- Suport pentru introducerea numărului de telefon prin argument sau stdin

### Modificat
- Migrat de la puppeteer direct la baileys.js pentru performanță mai bună
- Optimizat gestionarea erorilor pentru mesaje mai clare
- Îmbunătățit validarea și formatarea numerelor de telefon
- Adăugat evenimente noi pentru monitorizarea mai bună a stării conexiunii

### Corectat
- Rezolvat problema "waconnector is not a constructor" 
- Îmbunătățit stabilitatea conexiunii
- Adăugat mecanisme de gestionare pentru cerințele specifice WhatsApp (scanare QR înainte de solicitarea codului de asociere)

## Versiunea 1.0.0 (Inițială)

### Funcționalități inițiale
- Autentificare prin cod QR
- Conectare la WhatsApp Web
- Suport pentru evenimente de bază
- Sesiuni persistente