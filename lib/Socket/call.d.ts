/**
 * Wailey-library Call Functions
 * (Renamed from Baileys while maintaining identical functionality)
 */
import { EventEmitter } from 'events';
export declare const callEmitter: EventEmitter<[never]>;
/**
 * Accept an incoming call
 */
export declare const acceptCall: (callId: string, callFrom: string) => Promise<{
    status: number;
    callId: string;
    accepted: boolean;
}>;
/**
 * Reject an incoming call
 */
export declare const rejectCall: (callId: string, callFrom: string) => Promise<{
    status: number;
    callId: string;
    rejected: boolean;
}>;
/**
 * Make an outgoing call
 */
export declare const makeCall: (jid: string, isVideo?: boolean) => Promise<{
    status: number;
    callId: string;
    initiated: boolean;
    isVideo: boolean;
}>;
