// lib/Utils/wailey.js
"use strict";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

/**
 * Initializează socket-ul real WhatsApp Web,
 * obține versiunea curentă și printează QR-ul.
 */
async function initSocket(opts = {}) {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    ...opts
  });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}

module.exports = {
  makeWASocket: initSocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
};
