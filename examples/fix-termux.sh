#!/bin/bash
# Script de instalare și reparare pentru Wailey Bot în Termux
# Soluționează erorile: Module not found, useMultiFileAuthState not a function

echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   REPARARE BORUTO VPN BOT\e[0m"
echo -e "\e[31m===================================\e[0m"

# Verificăm și instalăm dependențele necesare
echo -e "\e[31m[1/5] Actualizăm și instalăm dependențele...\e[0m"
pkg update -y && pkg upgrade -y && pkg install nodejs git curl -y

# Creăm directorul pentru script
mkdir -p ~/wailey-bot
cd ~/wailey-bot

# Clonăm Wailey Library
echo -e "\e[31m[2/5] Clonăm biblioteca Wailey...\e[0m"
if [ ! -d "wailey-whatsapp-lib" ]; then
    git clone https://github.com/gyovannyvpn123/wailey-whatsapp-lib.git
    cd wailey-whatsapp-lib
    npm install
    cd ..
else
    echo -e "\e[31mBiblioteca Wailey deja există. Actualizăm...\e[0m"
    cd wailey-whatsapp-lib
    git pull
    npm install
    cd ..
fi

# Descărcăm scriptul bot pentru Termux
echo -e "\e[31m[3/5] Descărcăm scriptul bot pentru Termux...\e[0m"
cp wailey-whatsapp-lib/examples/termux-bot.js ./bot.js

# Instalăm dependențele necesare
echo -e "\e[31m[4/5] Instalăm dependențele necesare...\e[0m"
npm install chalk pino

# Creăm directorul pentru autentificare
echo -e "\e[31m[5/5] Creăm directorul pentru autentificare...\e[0m"
mkdir -p auth_info

# Afișăm instrucțiuni finale
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31m   INSTALARE COMPLETĂ!\e[0m"
echo -e "\e[31m===================================\e[0m"
echo -e "\e[31mPoți porni botul acum cu comanda:\e[0m"
echo -e "\e[31m   node bot.js\e[0m"
echo -e "\e[31m\e[0m"

# Întrebăm dacă să pornim botul acum
read -p "Dorești să pornești botul acum? (y/n): " start_now
if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
    node bot.js
else
    echo -e "\e[31mPoți porni botul mai târziu cu comanda: node bot.js\e[0m"
fi