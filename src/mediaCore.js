// src/mediaCore.js
export const mediaCore = {
    hideStegaText(imgElement, secretText) {
        const canvas = document.createElement('canvas'); 
        canvas.width = imgElement.width; 
        canvas.height = imgElement.height;
        const ctx = canvas.getContext('2d'); 
        ctx.drawImage(imgElement, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
        const data = imgData.data; 
        const textBytes = new TextEncoder().encode(secretText + "\0");
        if (textBytes.length * 8 > data.length) throw new Error("Image too small for this secret text!");
        let byteIndex = 0, bitIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (byteIndex < textBytes.length) {
                let bit = (textBytes[byteIndex] >> (7 - bitIndex)) & 1; 
                data[i] = (data[i] & ~1) | bit; 
                bitIndex++;
                if (bitIndex === 8) { bitIndex = 0; byteIndex++; }
            } else { break; }
        }
        ctx.putImageData(imgData, 0, 0); 
        return canvas.toDataURL('image/png');
    },
    extractStegaText(imgElement) {
        const canvas = document.createElement('canvas'); 
        canvas.width = imgElement.width; 
        canvas.height = imgElement.height;
        const ctx = canvas.getContext('2d'); 
        ctx.drawImage(imgElement, 0, 0); 
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let bytes = [], currentByte = 0, bitIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
            currentByte = (currentByte << 1) | (data[i] & 1); 
            bitIndex++;
            if (bitIndex === 8) { 
                if (currentByte === 0) break; 
                bytes.push(currentByte); 
                currentByte = 0; 
                bitIndex = 0; 
            }
        }
        return new TextDecoder().decode(new Uint8Array(bytes));
    },
    async scrubExif(file, registerUrlCallback) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
            img.onload = resolve; img.onerror = reject; img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const cleanBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        return registerUrlCallback(URL.createObjectURL(cleanBlob));
    }
};
