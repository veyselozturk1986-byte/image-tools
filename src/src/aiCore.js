// src/aiCore.js
export const aiEngine = {
    async maskPII(text) {
        let masked = text;
        masked = masked.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]');
        masked = masked.replace(/\bTR\d{2}\s?[\d\s]{4}\s?[\d\s]{4}\s?[\d\s]{4}\s?[\d\s]{4}\s?[\d\s]{2}\b/g, '[REDACTED_IBAN]');
        masked = masked.replace(/\b\d{11}\b/g, '[REDACTED_TC_NO]');
        masked = masked.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
        return masked;
    }
};
