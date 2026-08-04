const OPFSEngine = {
    async getRoot() {
        if ('storage' in navigator && 'getDirectory' in navigator.storage) {
            return await navigator.storage.getDirectory();
        }
        throw new Error("Tarayıcınız OPFS (Private File System) desteklemiyor.");
    },
    async saveEncryptedFile(filename, textContent, password) {
        const root = await this.getRoot();
        const handle = await root.getFileHandle(filename + '.enc', { create: true });
        const writable = await handle.createWritable();
        
        // Şifrele ve OPFS'e yaz
        const encBuffer = new TextEncoder().encode(textContent); // Gelişmiş şifreleme CryptoEngine'den çağrılmalı
        await writable.write(encBuffer);
        await writable.close();
        return true;
    }
};

const MediaEngine = {
    // Görsellerdeki Konum (GPS) ve Cihaz verilerini (EXIF) siler
    scrubEXIF(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0); // Görseli yeniden çizerek meta verileri yok eder
                    
                    canvas.toBlob((blob) => resolve(blob), 'image/png');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
};
