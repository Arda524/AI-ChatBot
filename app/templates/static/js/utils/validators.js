// Input Validation Utilities
export const MAX_MESSAGE_LENGTH = 500;

export const isValidMessage = (text) => {
    return text && text.trim().length > 0 && text.length <= MAX_MESSAGE_LENGTH;
};

export const sanitizeInput = (text) => {
    return text.trim().replace(/<[^>]*>/g, '');
};