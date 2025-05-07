/**
 * Wailey-library Image Utilities
 * (Renamed from Baileys while maintaining identical functionality)
 */
/**
 * Extracts thumbnail from an image buffer
 * In a real implementation, this would use image processing libraries
 * This is a simplified placeholder implementation
 */
export declare const extractImageThumb: (buffer: Buffer) => Promise<Buffer>;
/**
 * Gets metadata from an image buffer
 * In a real implementation, this would extract width, height, etc.
 * This is a simplified placeholder implementation
 */
export declare const getImageMetadata: (buffer: Buffer) => {
    type: string;
    width: number;
    height: number;
};
/**
 * Crops and resizes an image
 * This is a simplified placeholder implementation
 */
export declare const cropAndResizeImage: (buffer: Buffer, width: number, height: number) => Promise<Buffer>;
