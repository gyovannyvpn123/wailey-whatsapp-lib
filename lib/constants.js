/**
 * Constante pentru biblioteca wailey-whatsapp-lib
 */

/**
 * Evenimente emise de client
 */
const Events = {
    QR_RECEIVED: 'qr',
    AUTHENTICATED: 'authenticated',
    READY: 'ready',
    MESSAGE: 'message',
    MESSAGE_CREATE: 'message_create',
    PAIRING_CODE: 'pairing_code',
    DISCONNECTED: 'disconnected',
    STATE_CHANGED: 'state_changed',
    ERROR: 'error'
};

/**
 * Stări de conexiune
 */
const ConnectionState = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    AUTHENTICATED: 'authenticated',
    LOGGED_OUT: 'logged_out'
};

/**
 * Tipuri de mesaje
 */
const MessageType = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    STICKER: 'sticker',
    CONTACT: 'contact',
    LOCATION: 'location'
};

/**
 * Browser-e compatibile
 */
const Browsers = {
    UBUNTU_CHROME: ['Ubuntu', 'Chrome', '114.0.0'],
    WINDOWS_CHROME: ['Windows', 'Chrome', '114.0.0'],
    ANDROID_CHROME: ['Android', 'Chrome', '114.0.0'],
    IOS_SAFARI: ['iPhone', 'Safari', '604.1'],
    MACOS_FIREFOX: ['Macintosh', 'Firefox', '113.0']
};

module.exports = {
    Events,
    ConnectionState,
    MessageType,
    Browsers
};