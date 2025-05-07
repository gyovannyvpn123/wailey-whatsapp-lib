"use strict";
/**
 * Wailey-library Protocol Buffer Wrapper
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.proto = void 0;
// Simplifying the protobuf implementation for this example
// In a real implementation, we would define message schemas here
exports.proto = {
    WebMessageInfo: {
        fromObject: (obj) => {
            return {
                key: obj.key,
                message: obj.message,
                messageTimestamp: obj.messageTimestamp,
                status: obj.status,
                participant: obj.participant
            };
        },
        toObject: (msg) => {
            return {
                key: msg.key,
                message: msg.message,
                messageTimestamp: msg.messageTimestamp,
                status: msg.status,
                participant: msg.participant
            };
        }
    },
    Message: {
        fromObject: (obj) => {
            return obj;
        },
        toObject: (msg) => {
            return msg;
        }
    },
    MessageKey: {
        fromObject: (obj) => {
            return {
                remoteJid: obj.remoteJid,
                fromMe: obj.fromMe,
                id: obj.id,
                participant: obj.participant
            };
        }
    }
};
