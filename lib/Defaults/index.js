/**
 * Wailey-library Default Configurations
 * (Renamed from Baileys while maintaining identical functionality)
 */

Object.defineProperty(exports, "__esModule", { value: true });
exports.PROCESSABLE_HISTORY_TYPES = exports.WAILEY_CONFIG = exports.MEDIA_KEYS = exports.MEDIA_HKDF_KEY_MAPPING = exports.MEDIA_PATH_MAP = exports.DEFAULT_CONNECTION_CONFIG = exports.MIN_PREKEY_COUNT = exports.INITIAL_PREKEY_COUNT = exports.NOISE_WA_HEADER = exports.KEY_BUNDLE_TYPE = exports.DICT_VERSION = exports.NOISE_MODE = exports.WA_DEFAULT_EPHEMERAL = exports.PHONE_CONNECTION_CB = exports.DEF_TAG_PREFIX = exports.DEF_CALLBACK_PREFIX = exports.DEFAULT_ORIGIN = exports.UNAUTHORIZED_CODES = void 0;
const generics_1 = require("../Utils/generics");

exports.UNAUTHORIZED_CODES = [401, 403, 419];
exports.DEFAULT_ORIGIN = 'https://web.whatsapp.com';
exports.DEF_CALLBACK_PREFIX = 'CB:';
exports.DEF_TAG_PREFIX = 'TAG:';
exports.PHONE_CONNECTION_CB = 'CB:Pong';
exports.WA_DEFAULT_EPHEMERAL = 7 * 24 * 60 * 60;
exports.NOISE_MODE = 'Noise_XX_25519_AESGCM_SHA256';
exports.DICT_VERSION = 2;
exports.KEY_BUNDLE_TYPE = Buffer.from([5]);
exports.NOISE_WA_HEADER = Buffer.from([87, 65, 6, exports.DICT_VERSION]); // WA 6
exports.INITIAL_PREKEY_COUNT = 30;
exports.MIN_PREKEY_COUNT = 5;
exports.DEFAULT_CONNECTION_CONFIG = {
  waWebSocketUrl: 'wss://web.whatsapp.com/ws',
  connectTimeoutMs: 20000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 25000,
  logger: {
    ...console,
    level: 'info',
    fatal: console.error,
    silent: () => { }
  },
  // Folosim browserul real: Google Chrome
  browser: generics_1.Browsers.googleChrome(),
  version: [2, 2323, 4],
  printQRInTerminal: false,
  emitOwnEvents: true,
  customUploadHosts: [],
  retryRequestDelayMs: 250
};
exports.MEDIA_PATH_MAP = {
  image: '/mms/image',
  video: '/mms/video',
  document: '/mms/document',
  audio: '/mms/audio',
  sticker: '/mms/image',
  'md-app-state': ''
};
exports.MEDIA_HKDF_KEY_MAPPING = {
  audio: 'Audio',
  document: 'Document',
  gif: 'Video',
  image: 'Image',
  ppic: '',
  product: 'Image',
  ptt: 'Audio',
  sticker: 'Image',
  video: 'Video',
  'thumbnail-document': 'Document Thumbnail',
  'thumbnail-image': 'Image Thumbnail',
  'thumbnail-video': 'Video Thumbnail',
  'thumbnail-link': 'Link Thumbnail',
  'thumbnail-ppic': '',
  'md-msg-hist': 'History',
  'md-app-state': 'App State',
  'product-catalog-image': 'Catalog Image',
  'payment-bg-image': 'Payment Background'
};
exports.MEDIA_KEYS = {
  IMAGE_KEY: 'IMAGE_KEY',
  DOCUMENT_KEY: 'DOCUMENT_KEY',
  AUDIO_KEY: 'AUDIO_KEY',
  VIDEO_KEY: 'VIDEO_KEY',
  LINK_KEY: 'LINK_KEY'
};
exports.WAILEY_CONFIG = {
  ...exports.DEFAULT_CONNECTION_CONFIG,
  printQRInTerminal: true,
};
exports.PROCESSABLE_HISTORY_TYPES = new Set([
  'chat',
  'message',
  'revoked'
]);
