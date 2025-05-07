/**
 * Wailey-library WABinary Standard Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
import { WABinaryNode } from './index';
/**
 * Standard tag dictionary for protocol v2
 */
export declare const StandardDictionary: string[];
/**
 * Legacy encoder implementation for WhatsApp binary protocol
 */
export declare const encodeBinaryNodeLegacy: (node: WABinaryNode) => Buffer;
/**
 * Legacy decoder implementation for WhatsApp binary protocol
 */
export declare const decodeBinaryNodeLegacy: (buffer: Buffer) => WABinaryNode;
