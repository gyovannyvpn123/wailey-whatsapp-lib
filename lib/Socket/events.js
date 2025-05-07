/**
 * Wailey-library Event Handler Implementation
 * (Implementare reală a gestiunii evenimentelor pentru WhatsApp Web)
 */

const { EventEmitter } = require('events');

/**
 * Creates an event handler for the WhatsApp socket
 * Manages events like 'connection', 'message', etc.
 */
function createEventHandler() {
    // Event categories
    const events = new Map();
    
    // Core event types
    const eventTypes = {
        CONNECTION_UPDATE: 'connection.update',
        CREDS_UPDATE: 'creds.update',
        MESSAGES_UPSERT: 'messages.upsert',
        MESSAGES_UPDATE: 'messages.update',
        PRESENCE_UPDATE: 'presence.update',
        CHATS_UPDATE: 'chats.update',
        CONTACTS_UPDATE: 'contacts.update',
        GROUPS_UPSERT: 'groups.upsert',
        GROUPS_UPDATE: 'groups.update',
        GROUP_PARTICIPANTS_UPDATE: 'group-participants.update',
        QR_GENERATE: 'qr',
        AUTH_CODE: 'auth.code',
        CALL: 'call',
        LINK_PREVIEW: 'link-preview',
        BLOCKLIST_UPDATE: 'blocklist.update',
        RECEIVED_PONG: 'received-pong'
    };
    
    // Create a new EventEmitter for each event type
    for (const type of Object.values(eventTypes)) {
        events.set(type, new EventEmitter());
    }

    // Create a wrapper object with event management methods
    const ev = {
        /**
         * Register a listener for an event
         */
        on(event, listener) {
            const emitter = events.get(event);
            if (!emitter) {
                events.set(event, new EventEmitter());
            }
            events.get(event).on('event', listener);
            return () => {
                this.off(event, listener);
            };
        },
        
        /**
         * Remove a listener for an event
         */
        off(event, listener) {
            const emitter = events.get(event);
            if (emitter) {
                emitter.off('event', listener);
            }
            return this;
        },
        
        /**
         * Register a one-time listener for an event
         */
        once(event, listener) {
            const emitter = events.get(event);
            if (!emitter) {
                events.set(event, new EventEmitter());
            }
            events.get(event).once('event', listener);
            return this;
        },
        
        /**
         * Emit an event (internal use)
         */
        emit(event, ...args) {
            const emitter = events.get(event);
            if (emitter) {
                return emitter.emit('event', ...args);
            }
            return false;
        },
        
        /**
         * Remove all listeners for an event
         */
        removeAllListeners(event) {
            const emitter = events.get(event);
            if (emitter) {
                emitter.removeAllListeners('event');
            }
            return this;
        },
        
        /**
         * Update connection state and emit event
         */
        updateConnectionState(state, error) {
            this.emit(eventTypes.CONNECTION_UPDATE, {
                connection: state,
                lastDisconnect: error ? {
                    error,
                    date: new Date()
                } : undefined
            });
        },
        
        /**
         * Process and emit a new message event
         */
        processIncomingMessage(message) {
            this.emit(eventTypes.MESSAGES_UPSERT, {
                messages: [message],
                type: 'notify'
            });
        },
        
        /**
         * Process and emit a message update event
         */
        processMessageUpdate(update) {
            this.emit(eventTypes.MESSAGES_UPDATE, [update]);
        },
        
        /**
         * Process and emit a chat update event
         */
        processChatUpdate(chat, type = 'update') {
            this.emit(eventTypes.CHATS_UPDATE, [{
                id: chat.id,
                ...chat
            }]);
        },
        
        /**
         * Process and emit a contact update event
         */
        processContactUpdate(contact, type = 'update') {
            this.emit(eventTypes.CONTACTS_UPDATE, [{
                id: contact.id,
                ...contact
            }]);
        },
        
        /**
         * Process and emit a group update event
         */
        processGroupUpdate(group, type = 'update') {
            if (type === 'create') {
                this.emit(eventTypes.GROUPS_UPSERT, [group]);
            } else {
                this.emit(eventTypes.GROUPS_UPDATE, [{
                    id: group.id,
                    ...group
                }]);
            }
        },
        
        /**
         * Process and emit a presence update event
         */
        processPresenceUpdate(presence) {
            this.emit(eventTypes.PRESENCE_UPDATE, presence);
        },
        
        /**
         * Process and emit a QR code for authentication
         */
        processQR(qr) {
            this.emit(eventTypes.CONNECTION_UPDATE, {
                qr
            });
        },
        
        /**
         * Process and emit a pairing code event
         */
        processPairingCode(code, phoneNumber) {
            this.emit(eventTypes.AUTH_CODE, {
                code,
                phoneNumber
            });
        },
        
        /**
         * Process and emit a call event
         */
        processCall(call) {
            this.emit(eventTypes.CALL, call);
        },
        
        /**
         * Process and emit a credential update event
         */
        processCredentialUpdate(update) {
            this.emit(eventTypes.CREDS_UPDATE, update);
        },
        
        /**
         * Clean up all event listeners
         */
        removeAllEvents() {
            for (const emitter of events.values()) {
                emitter.removeAllListeners();
            }
            events.clear();
        }
    };
    
    return ev;
}

module.exports = {
    createEventHandler
};