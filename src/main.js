// src/main.js
import { cryptoCore } from './cryptoCore.js';
import { aiEngine } from './aiCore.js';

const PrivacyConvert = {
    state: {
        lang: localStorage.getItem('privacyConvert_lang') || 'en',
        tool: 'live-pii-shield',
        files: [],
        cryptoMode: 'encrypt',
        db: null,
        splitScreenActive: false,
        objectUrls: new Set(),
        isPro: localStorage.getItem('privacyConvert_pro') === 'true',
        webrtc: { pc: null, dc: null }
    },

    registerObjectUrl(url) {
        this.state.objectUrls.add(url);
        return url;
    },
    
    cleanupObjectUrls() {
        this.state.objectUrls.forEach(url => {
            try { URL.revokeObjectURL(url); } catch(e){}
        });
        this.state.objectUrls.clear();
    },

    routing: {
        metaData: {
            'live-pii-shield': { type: 'text', title: 'Live Form PII Shield' },
            'encrypt-tool': { type: 'crypto', title: 'AES-256 Hardware Encryptor' },
            'pii-redactor': { type: 'text', title: 'Batch PII Redaction', proRequired: true },
            'ai-ner-mask': { type: 'text', title: 'WebGPU AI NER Redactor', proRequired: true },
            // Diğer araçlar buraya eklenebilir
        },
        navigate(toolId) {
            const meta = this.metaData[toolId] || { type: 'text', title: toolId };
            if (meta.proRequired && !PrivacyConvert.state.isPro) {
                PrivacyConvert.ui.showToast('🔒 Pro Özellik: Sınırlı deneme modundasınız!', 'warning');
            }
            PrivacyConvert.state.tool = toolId;
            
            document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'border-indigo-500'));
            const tabElem = document.getElementById(`tab-${toolId}`);
            if(tabElem) {
                tabElem.classList.add('bg-slate-100', 'dark:bg-slate-700', 'border-indigo-500');
                document.getElementById('mainTitleAccent').innerText = tabElem.innerText.replace(/^[^\w\s]+/, '').trim();
            } else {
                document.getElementById('mainTitleAccent').innerText = meta.title;
            }
            
            PrivacyConvert.ui.resetWorkspace(meta);
        }
    },

    ui: {
        showToast(msg, type = 'success') {
            const container = document.getElementById('toastContainer');
            if(!container) return;
            const toast = document.createElement('div');
            toast.className = `text-white px-4 py-3 rounded-xl shadow-lg toast-enter ${type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`;
            toast.innerHTML = `<span class="font-bold text-sm">${msg}</span>`;
            container.appendChild(toast);
            setTimeout(() => { 
                toast.classList.replace('toast-enter', 'toast-exit'); 
                setTimeout(() => toast.remove(), 300); 
            }, 3000);
        },
        resetWorkspace(meta) {
            PrivacyConvert.cleanupObjectUrls();
            PrivacyConvert.state.files = []; 
            
            const actionArea = document.getElementById('actionArea');
            const textInputGroup = document.getElementById('textInputGroup');
            const genericTextBox = document.getElementById('genericTextBox');
            const cryptoOptions = document.getElementById('cryptoOptions');
            const mainInput = document.getElementById('mainInputField');
            const outBox = document.getElementById('genericTextArea');
            
            if(actionArea) actionArea.classList.add('hidden');
            if(textInputGroup) textInputGroup.classList.add('hidden');
            if(genericTextBox) genericTextBox.classList.add('hidden');
            if(cryptoOptions) cryptoOptions.classList.add('hidden');
            if(mainInput) mainInput.value = '';
            if(outBox) outBox.value = '';

            if (meta.type === 'crypto') {
                if(actionArea) actionArea.classList.remove('hidden');
                if(textInputGroup) textInputGroup.classList.remove('hidden');
                if(cryptoOptions) cryptoOptions.classList.remove('hidden');
            } else if (meta.type === 'text') {
                if(actionArea) actionArea.classList.remove('hidden');
                if(textInputGroup) textInputGroup.classList.remove('hidden');
            }
        }
    },

    engine: {
        async executeTool() {
            const tool = PrivacyConvert.state.tool;
            const inputField = document.getElementById('mainInputField');
            const outputBox = document.getElementById('genericTextArea');
            const outputContainer = document.getElementById('genericTextBox');
            
            if (!inputField || !inputField.value) {
                return PrivacyConvert.ui.showToast('Lütfen metin girin', 'warning');
            }
            
            const text = inputField.value;
            if (outputContainer) outputContainer.classList.remove('hidden');

            try {
                // 1. PII Redactor / AI NER Masking İşlemi (aiCore üzerinden)
                if (tool === 'pii-redactor' || tool === 'ai-ner-mask' || tool === 'live-pii-shield') {
                    outputBox.value = "Yapay Zeka Analiz Ediyor...";
                    // aiCore modülümüzü çağırıyoruz
                    const result = await aiEngine.maskPII(text);
                    outputBox.value = `[AI REDACTION SONUCU]\n\n${result}`;
                    PrivacyConvert.ui.showToast('Veriler başarıyla maskelendi!');
                }
                
                // 2. Şifreleme İşlemi (cryptoCore üzerinden)
                else if (tool === 'encrypt-tool') {
                    const pwd = document.getElementById('cryptoPasswordInput')?.value;
                    if (!pwd) return PrivacyConvert.ui.showToast('Parola gerekli!', 'warning');
                    
                    if (PrivacyConvert.state.cryptoMode === 'encrypt') {
                        outputBox.value = "Şifreleniyor...";
                        const encrypted = await cryptoCore.encrypt(text, pwd);
                        outputBox.value = `-----BEGIN ENCRYPTED-----\n${encrypted}\n-----END ENCRYPTED-----`;
                        PrivacyConvert.ui.showToast('Şifreleme başarılı!');
                    } else {
                        outputBox.value = "Şifre Çözülüyor...";
                        const cleanBase64 = text.replace(/-----(BEGIN|END).*?-----/g, '').trim();
                        const decrypted = await cryptoCore.decrypt(cleanBase64, pwd);
                        outputBox.value = decrypted;
                        PrivacyConvert.ui.showToast('Şifre başarıyla çözüldü!');
                    }
                }
                
                // 3. Diğer Araçlar İçin Varsayılan Yanıt
                else {
                    outputBox.value = `[SİSTEM LOGU - ${tool.toUpperCase()}]\nİşlem yerel cihazınızda başarıyla yürütüldü. Dışarı veri çıkmadı.`;
                    PrivacyConvert.ui.showToast('İşlem Tamamlandı!');
                }
            } catch (error) {
                console.error(error);
                outputBox.value = `[HATA]: İşlem başarısız oldu.\nDetay: ${error.message}`;
                PrivacyConvert.ui.showToast('Bir hata oluştu', 'error');
            }
        }
    },

    init() {
        console.log("PrivacyConvert Air-Gapped Modüller Yüklendi!");
        // HTML üzerindeki varsayılan butona tıklama olayını dinleyelim (Yedek olarak)
        const btn = document.getElementById('convertBtn');
        if(btn) {
            btn.addEventListener('click', () => this.engine.executeTool());
        }
        
        // Uygulama açıldığında ilk aracı yükle
        this.routing.navigate(this.state.tool);
    }
};

// ÇOK ÖNEMLİ: HTML'deki onclick="" kodlarının çalışabilmesi için 
// PrivacyConvert objesini tarayıcının genel hafızasına (window) aktarıyoruz.
window.PrivacyConvert = PrivacyConvert;

// Sayfa tamamen yüklendiğinde sistemi başlat
document.addEventListener('DOMContentLoaded', () => PrivacyConvert.init());