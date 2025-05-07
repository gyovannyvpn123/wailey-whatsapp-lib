/**
 * Wailey-library Event Handler Definitions
 * (Renamed from Baileys while maintaining identical functionality)
 */

interface WAEventEmitter {
    on(event: string, listener: (...args: any[]) => void): () => void;
    off(event: string, listener: (...args: any[]) => void): WAEventEmitter;
    once(event: string, listener: (...args: any[]) => void): WAEventEmitter;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): WAEventEmitter;
    removeAllEvents(): void;
    
    // Processing methods
    processIncomingMessage(message: any): void;
    processMessageUpdate(update: any): void;
    processChatUpdate(chat: any, type?: string): void;
    processContactUpdate(contact: any, type?: string): void;
    processGroupUpdate(group: any, type?: string): void;
    processPresenceUpdate(presence: any): void;
    processQR(qr: string): void;
    processPairingCode(code: string, phoneNumber: string): void;
    processCall(call: any): void;
    processCredentialUpdate(update: any): void;
    updateConnectionState(state: string, error?: Error): void;
}

export declare function createEventHandler(): WAEventEmitter;