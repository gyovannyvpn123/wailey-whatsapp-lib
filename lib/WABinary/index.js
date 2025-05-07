"use strict";
/**
 * Wailey-library WABinary Implementation
 * (Renamed from Baileys while maintaining identical functionality)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBinaryNode = exports.hasNodeWithTag = exports.getNodeChildData = exports.getBinaryNodeChild = exports.getBinaryNodeChildren = exports.decodeBinaryNode = exports.encodeBinaryNode = void 0;
const Standard_1 = require("./Standard");
/**
 * Encode a node into binary format for WhatsApp protocol
 * @param node - the node to encode
 */
const encodeBinaryNode = (node) => {
    // Use legacy encoding for compatibility
    return (0, Standard_1.encodeBinaryNodeLegacy)(node);
};
exports.encodeBinaryNode = encodeBinaryNode;
/**
 * Decode binary data into a node for WhatsApp protocol
 * @param data - the binary data to decode
 */
const decodeBinaryNode = (data) => {
    // Use legacy decoding for compatibility
    return (0, Standard_1.decodeBinaryNodeLegacy)(data);
};
exports.decodeBinaryNode = decodeBinaryNode;
/**
 * Get all children with a specific tag from a node
 * @param node - the parent node
 * @param tag - the tag to filter by
 */
const getBinaryNodeChildren = (node, tag) => {
    const content = Array.isArray(node.content) ? node.content : [];
    return content.filter(item => item.tag === tag);
};
exports.getBinaryNodeChildren = getBinaryNodeChildren;
/**
 * Get the first child with a specific tag from a node
 * @param node - the parent node
 * @param tag - the tag to find
 */
const getBinaryNodeChild = (node, tag) => {
    const children = (0, exports.getBinaryNodeChildren)(node, tag);
    return children[0];
};
exports.getBinaryNodeChild = getBinaryNodeChild;
/**
 * Gets child node data with a specific tag from a node
 * @param node - the parent node
 * @param childTag - the child tag to find
 * @param valueTag - the tag containing the value
 */
const getNodeChildData = (node, childTag, valueTag) => {
    const child = (0, exports.getBinaryNodeChild)(node, childTag);
    if (!child)
        return undefined;
    if (!valueTag) {
        // If no value tag is specified, return content
        return child.content;
    }
    // Get the value with the specified tag
    const valueNode = Array.isArray(child.content)
        ? (0, exports.getBinaryNodeChild)(child, valueTag)
        : undefined;
    return valueNode === null || valueNode === void 0 ? void 0 : valueNode.content;
};
exports.getNodeChildData = getNodeChildData;
/**
 * Check if a node has a child with a specific tag
 * @param node - the parent node
 * @param childTag - the child tag to check for
 */
const hasNodeWithTag = (node, childTag) => {
    if (!Array.isArray(node.content))
        return false;
    return node.content.some(child => child.tag === childTag);
};
exports.hasNodeWithTag = hasNodeWithTag;
/**
 * Creates a binary message node
 * @param tag - the tag for the node
 * @param attrs - attributes for the node
 * @param content - content of the node
 */
const createBinaryNode = (tag, attrs = {}, content) => {
    return {
        tag,
        attrs,
        content: content || []
    };
};
exports.createBinaryNode = createBinaryNode;
