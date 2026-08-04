const AppUI = {
    activeTool: null,
    
    init() {
        this.bindEvents();
        this.registerServiceWorker();
    },

    bindEvents() {
        // Tema Değiştirici
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });

        // Araç Sekmeleri Geçişleri
        document.getElementById('tab-opfs-vault')?.addEventListener('click', () => this.switchTool('opfs'));
        document.getElementById('tab-encrypt-tool')?.addEventListener('click', () => this.switchTool('encrypt'));

        // Dosya Sürükle Bırak İşlemleri
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        if(dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-indigo-500'); });
            dropZone.addEventListener('dragleave', (e) => { dropZone.classList.remove('border-indigo-500'); });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-indigo-500');
                this.handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        }

        // Aksiyon Butonu
        document.getElementById('convertBtn')?.addEventListener('click', () => this.executeTool());
    },

    switchTool(toolId) {
        this.activeTool = toolId;
        console.log(`Araç değiştirildi: ${toolId}`);
        document.getElementById('dropZone').style.display = 'block';
        document.getElementById('actionArea').classList.add('hidden');
    },

    handleFiles(files) {
        console.log(`${files.length} dosya yüklendi.`);
        document.getElementById('dropZone').style.display = 'none';
        document.getElementById('actionArea').classList.remove('hidden');
        document.getElementById('actionArea').classList.add('flex');
    },

    executeTool() {
        if (this.activeTool === 'encrypt') {
            console.log("Şifreleme başlatılıyor (CryptoEngine devrede)...");
            // CryptoEngine.processLargeFile(...) çağrılır
        } else if (this.activeTool === 'opfs') {
            console.log("OPFS Kasasına kaydediliyor (OPFSEngine devrede)...");
            // OPFSEngine.saveEncryptedFile(...) çağrılır
        }
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('Sovereign OS: Air-Gapped Service Worker Aktif!'))
                .catch(err => console.error('Service Worker hatası:', err));
        }
    }
};

// Sayfa yüklendiğinde uygulamayı başlat (Inline script kullanmamak için zorunludur)
document.addEventListener('DOMContentLoaded', () => {
    AppUI.init();
});
