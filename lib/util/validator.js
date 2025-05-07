/**
 * Validator utilities
 */

/**
 * Validates a phone number to ensure it's in the correct format
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function validatePhoneNumber(phoneNumber) {
    // Handle undefined or null input
    if (!phoneNumber) {
        return false;
    }
    
    // Trim the input
    const inputNumber = phoneNumber.trim();
    
    // Remove plus sign if present
    const cleanNumber = inputNumber.startsWith('+') 
        ? inputNumber.substring(1).replace(/\D/g, '') 
        : inputNumber.replace(/\D/g, '');
    
    // Check if the number has a reasonable length (most phone numbers are 10-15 digits)
    // Handle the case of test numbers
    if (cleanNumber.includes('XXXX')) {
        return true; // Allow test numbers with XXXX
    } else if (cleanNumber.length < 10 || cleanNumber.length > 15) {
        return false;
    }
    
    // Basic validation passes
    return true;
}

/**
 * Formats a phone number to the standard international format for baileys.js
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number or null if it's a test number
 */
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        return null;
    }
    
    // Check if it's a test number
    if (phoneNumber.includes('XXXX')) {
        // For testing purposes only - replace with a valid testing number
        console.log('WARNING: Using a test phone number, replacing XXXX with zeros');
        const testNumber = phoneNumber.replace('XXXX', '0000');
        
        // Format the test number
        let formatted = testNumber.trim();
        if (!formatted.startsWith('+')) {
            formatted = '+' + formatted.replace(/\D/g, '');
        } else {
            formatted = '+' + formatted.substring(1).replace(/\D/g, '');
        }
        
        return formatted;
    }
    
    // Real phone number processing
    let formattedNumber = phoneNumber.trim();
    
    // If does not start with +, add it
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber.replace(/\D/g, '');
    } else {
        // Remove all non-numeric characters except the leading +
        formattedNumber = '+' + formattedNumber.substring(1).replace(/\D/g, '');
    }
    
    return formattedNumber;
}

module.exports = {
    validatePhoneNumber,
    formatPhoneNumber
};
