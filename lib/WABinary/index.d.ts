/**
 * Wailey-library WABinary Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Binary node interface for WhatsApp protocol
 */
export interface WABinaryNode {
    tag: string;
    attrs: {
        [key: string]: string;
    };
    content: WABinaryNode[] | undefined | null | Buffer;
}
/**
 * Encode a node into binary format for WhatsApp protocol
 * @param node - the node to encode
 */
export declare const encodeBinaryNode: (node: WABinaryNode) => Buffer;
/**
 * Decode binary data into a node for WhatsApp protocol
 * @param data - the binary data to decode
 */
export declare const decodeBinaryNode: (data: Buffer) => WABinaryNode;
/**
 * Get all children with a specific tag from a node
 * @param node - the parent node
 * @param tag - the tag to filter by
 */
export declare const getBinaryNodeChildren: (node: WABinaryNode, tag: string) => WABinaryNode[];
/**
 * Get the first child with a specific tag from a node
 * @param node - the parent node
 * @param tag - the tag to find
 */
export declare const getBinaryNodeChild: (node: WABinaryNode, tag: string) => WABinaryNode | undefined;
/**
 * Gets child node data with a specific tag from a node
 * @param node - the parent node
 * @param childTag - the child tag to find
 * @param valueTag - the tag containing the value
 */
export declare const getNodeChildData: (node: WABinaryNode, childTag: string, valueTag?: string) => any;
/**
 * Check if a node has a child with a specific tag
 * @param node - the parent node
 * @param childTag - the child tag to check for
 */
export declare const hasNodeWithTag: (node: WABinaryNode, childTag: string) => boolean;
/**
 * Creates a binary message node
 * @param tag - the tag for the node
 * @param attrs - attributes for the node
 * @param content - content of the node
 */
export declare const createBinaryNode: (tag: string, attrs?: {
    [key: string]: string;
}, content?: WABinaryNode[] | Buffer) => WABinaryNode;
