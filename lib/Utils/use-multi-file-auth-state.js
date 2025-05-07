/**
 * Wailey-library Multi-File Auth State
 * 
 * Implementare îmbunătățită a funcției useMultiFileAuthState pentru Wailey
 * Rezolvă problema "useMultiFileAuthState is not a function" în Termux
 */

const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

// Utility to ensure directory exists
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    return directory;
}

// Utility to read a file
function readJSONFile(filename, defaultValue = {}) {
    if (!fs.existsSync(filename)) {
        return defaultValue;
    }
    try {
        const content = fs.readFileSync(filename, { encoding: 'utf8' });
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading file ${filename}:`, error);
        return defaultValue;
    }
}

// Utility to write a file
function writeJSONFile(filename, data) {
    const directory = path.dirname(filename);
    ensureDirectoryExists(directory);
    
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), { encoding: 'utf8' });
    } catch (error) {
        console.error(`Error writing file ${filename}:`, error);
    }
}

/**
 * Implementare pentru stocarea și gestionarea stării de autentificare în mai multe fișiere
 * @param {string} folder - Directorul în care se va stoca starea de autentificare
 * @returns {Promise<{state: any, saveCreds: function}>}
 */
async function useMultiFileAuthState(folder) {
    // Ensure the auth directory exists
    folder = ensureDirectoryExists(folder);
    
    // Define file paths
    const credsPath = path.join(folder, 'creds.json');
    const keysPath = path.join(folder, 'keys');
    const noiseKeyPath = path.join(keysPath, 'noise_key.json');
    const signedIdentityKeyPath = path.join(keysPath, 'signed_identity_key.json');
    const signedPreKeyPath = path.join(keysPath, 'signed_pre_key.json');
    const registrationPath = path.join(keysPath, 'registration.json');
    const preKeysPath = path.join(keysPath, 'pre_keys');
    const senderKeysPath = path.join(keysPath, 'sender_keys');
    const appStateKeysPath = path.join(keysPath, 'app_state_keys');
    const appSessionsPath = path.join(keysPath, 'app_sessions');
    
    // Ensure all directories exist
    ensureDirectoryExists(keysPath);
    ensureDirectoryExists(preKeysPath);
    ensureDirectoryExists(senderKeysPath);
    ensureDirectoryExists(appStateKeysPath);
    ensureDirectoryExists(appSessionsPath);
    
    // Read the credentials
    let creds = readJSONFile(credsPath, {
        me: { id: randomBytes(4).toString('hex'), name: 'Wailey User' },
        noiseKey: null,
        signedIdentityKey: null,
        signedPreKey: null,
        registrationId: 0,
        advSecretKey: null,
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        serverHasPreKeys: false,
        account: {
            details: "Wailey",
            accountSignatureKey: null,
            accountSignature: null,
            deviceSignature: null
        },
        me: { id: "", name: "Wailey User" },
        platform: "Wailey",
        phoneId: randomBytes(4).toString('hex'),
        phoneNumber: null,
        registered: false
    });
    
    // Read keys
    let keys = {
        noiseKey: readJSONFile(noiseKeyPath),
        signedIdentityKey: readJSONFile(signedIdentityKeyPath),
        signedPreKey: readJSONFile(signedPreKeyPath),
        registration: readJSONFile(registrationPath),
        preKeys: {},
        senderKeys: {},
        appStateKeys: {},
        appSessions: {}
    };
    
    // Read pre-keys
    if (fs.existsSync(preKeysPath)) {
        const preKeyFiles = fs.readdirSync(preKeysPath);
        for (const file of preKeyFiles) {
            const id = file.replace('.json', '');
            keys.preKeys[id] = readJSONFile(path.join(preKeysPath, file));
        }
    }
    
    // Read sender keys
    if (fs.existsSync(senderKeysPath)) {
        const senderKeyFiles = fs.readdirSync(senderKeysPath);
        for (const file of senderKeyFiles) {
            const id = file.replace('.json', '');
            keys.senderKeys[id] = readJSONFile(path.join(senderKeysPath, file));
        }
    }
    
    // Read app state keys
    if (fs.existsSync(appStateKeysPath)) {
        const appStateKeyFiles = fs.readdirSync(appStateKeysPath);
        for (const file of appStateKeyFiles) {
            const id = file.replace('.json', '');
            keys.appStateKeys[id] = readJSONFile(path.join(appStateKeysPath, file));
        }
    }
    
    // Read app sessions
    if (fs.existsSync(appSessionsPath)) {
        const appSessionFiles = fs.readdirSync(appSessionsPath);
        for (const file of appSessionFiles) {
            const id = file.replace('.json', '');
            keys.appSessions[id] = readJSONFile(path.join(appSessionsPath, file));
        }
    }
    
    // Function to save credentials
    const saveCreds = () => {
        // Save credentials
        writeJSONFile(credsPath, creds);
        
        // Save keys
        if (keys.noiseKey) {
            writeJSONFile(noiseKeyPath, keys.noiseKey);
        }
        
        if (keys.signedIdentityKey) {
            writeJSONFile(signedIdentityKeyPath, keys.signedIdentityKey);
        }
        
        if (keys.signedPreKey) {
            writeJSONFile(signedPreKeyPath, keys.signedPreKey);
        }
        
        if (keys.registration) {
            writeJSONFile(registrationPath, keys.registration);
        }
        
        // Save pre-keys
        for (const [id, key] of Object.entries(keys.preKeys)) {
            writeJSONFile(path.join(preKeysPath, `${id}.json`), key);
        }
        
        // Save sender keys
        for (const [id, key] of Object.entries(keys.senderKeys)) {
            writeJSONFile(path.join(senderKeysPath, `${id}.json`), key);
        }
        
        // Save app state keys
        for (const [id, key] of Object.entries(keys.appStateKeys)) {
            writeJSONFile(path.join(appStateKeysPath, `${id}.json`), key);
        }
        
        // Save app sessions
        for (const [id, session] of Object.entries(keys.appSessions)) {
            writeJSONFile(path.join(appSessionsPath, `${id}.json`), session);
        }
    };
    
    return {
        state: {
            creds,
            keys
        },
        saveCreds
    };
}

module.exports = {
    useMultiFileAuthState
};