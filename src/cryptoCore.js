// src/cryptoCore.js
export const cryptoCore = {
    async deriveKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
        );
    },
    async encrypt(text, password) {
        const enc = new TextEncoder(); 
        const salt = window.crypto.getRandomValues(new Uint8Array(16)); 
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password, salt); 
        const encryptedContent = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));
        
        const encryptedBytes = new Uint8Array(encryptedContent); 
        const bundle = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
        bundle.set(salt, 0); bundle.set(iv, salt.length); bundle.set(encryptedBytes, salt.length + iv.length);
        return btoa(String.fromCharCode.apply(null, bundle));
    },
    async decrypt(base64Bundle, password) {
        const bundle = new Uint8Array(atob(base64Bundle).split("").map(c => c.charCodeAt(0))); 
        const salt = bundle.slice(0, 16); 
        const iv = bundle.slice(16, 28); 
        const data = bundle.slice(28);
        const key = await this.deriveKey(password, salt); 
        const decryptedContent = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
        return new TextDecoder().decode(decryptedContent);
    }
};
