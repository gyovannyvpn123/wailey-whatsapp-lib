/**
 * Authentication handler for WhatsApp Web
 */

class Auth {
    /**
     * Create a new Auth instance
     * @param {Client} client - The WhatsApp client
     */
    constructor(client) {
        this.client = client;
    }
    
    /**
     * Handle authentication with QR code
     * @param {Function} qrCallback - Callback for QR code
     * @returns {Promise<boolean>} - Whether authentication was successful
     */
    async authenticateWithQr(qrCallback) {
        return new Promise((resolve, reject) => {
            let timeout;
            
            // Set authentication timeout
            if (this.client.options.authTimeout > 0) {
                timeout = setTimeout(() => {
                    reject(new Error('Authentication timed out'));
                }, this.client.options.authTimeout);
            }
            
            const authSuccessListener = (session) => {
                if (timeout) clearTimeout(timeout);
                this.client.removeListener('qr', qrListener);
                this.client.removeListener('auth_failure', authFailureListener);
                resolve(true);
            };
            
            const authFailureListener = (error) => {
                if (timeout) clearTimeout(timeout);
                this.client.removeListener('authenticated', authSuccessListener);
                this.client.removeListener('qr', qrListener);
                reject(error);
            };
            
            const qrListener = (qr) => {
                qrCallback(qr);
            };
            
            this.client.on('authenticated', authSuccessListener);
            this.client.on('auth_failure', authFailureListener);
            this.client.on('qr', qrListener);
        });
    }
    
    /**
     * Handle authentication with pairing code
     * @param {string} phoneNumber - Phone number to authenticate
     * @param {Function} pairingCodeCallback - Callback for pairing code
     * @returns {Promise<boolean>} - Whether authentication was successful
     */
    async authenticateWithPairingCode(phoneNumber, pairingCodeCallback) {
        return new Promise(async (resolve, reject) => {
            let timeout;
            
            // Set authentication timeout
            if (this.client.options.authTimeout > 0) {
                timeout = setTimeout(() => {
                    reject(new Error('Authentication timed out'));
                }, this.client.options.authTimeout);
            }
            
            const authSuccessListener = (session) => {
                if (timeout) clearTimeout(timeout);
                this.client.removeListener('auth_failure', authFailureListener);
                this.client.removeListener('pairing_code', pairingCodeListener);
                resolve(true);
            };
            
            const authFailureListener = (error) => {
                if (timeout) clearTimeout(timeout);
                this.client.removeListener('authenticated', authSuccessListener);
                this.client.removeListener('pairing_code', pairingCodeListener);
                reject(error);
            };
            
            const pairingCodeListener = (code) => {
                pairingCodeCallback(code);
            };
            
            this.client.on('authenticated', authSuccessListener);
            this.client.on('auth_failure', authFailureListener);
            this.client.on('pairing_code', pairingCodeListener);
            
            try {
                await this.client.requestPairingCode(phoneNumber);
            } catch (error) {
                if (timeout) clearTimeout(timeout);
                this.client.removeListener('authenticated', authSuccessListener);
                this.client.removeListener('auth_failure', authFailureListener);
                this.client.removeListener('pairing_code', pairingCodeListener);
                reject(error);
            }
        });
    }
}

module.exports = Auth;
