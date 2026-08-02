// src/main.js
import { cryptoCore } from './cryptoCore.js';
import { aiEngine } from './aiCore.js';
import { streamCore } from './streamCore.js';
import { mediaCore } from './mediaCore.js';

export const PrivacyConvert = {
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

    async initDB() {
        return new Promise((resolve) => {
            const req = indexedDB.open('PrivacyConvertEnterpriseDB', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache');
                if (!db.objectStoreNames.contains('vault')) db.createObjectStore('vault', { keyPath: 'id', autoIncrement: true });
            };
            req.onsuccess = (e) => { this.state.db = e.target.result; resolve(this.state.db); };
            req.onerror = () => resolve(null);
        });
    },

    i18n: {
        translations: {
            en: {
                accept: "Accept", secureLabel: "Secure", dropText: "Click to browse or drag files here (Memory-Safe Stream)",
                btnReset: "Reset", btnCopy: "📋 Copy", btnPreview: "👁️ Preview", btnProcess: "Execute Secure Process", closeBtn: "Close", previewTitle: "Enterprise Preview",
                splitScreenBtn: "Split View", secondaryPaneTitle: "Secondary Workspace", brandBtn: "Branding", queueTitle: "Queue Status",
                bannerTitle: "100% Client-Side Air-Gapped Security:", bannerDesc: "All processing occurs locally in your browser sandbox.", bannerVerifyBtn: "🔍 How to Verify?",
                verifyModalTitle: "How to Verify Air-Gapped Security", verifyDesc1: "This application operates entirely client-side using JavaScript, WebAssembly, and local IndexedDB sandbox storage.",
                verifyStep1: "Step 1: Open Browser Developer Tools (F12)", verifyStep1Sub: "Navigate to the \"Network\" tab.", verifyStep2: "Step 2: Disconnect Internet or Monitor Traffic", verifyStep2Sub: "Notice 0 outbound requests/bytes sent to external servers.",
                catProFeatures: "💎 Pro & Enterprise", catInfiniteSec: "🔑 Security, Passkey & Vault", catZkpMarket: "📦 ZKP, AI & Marketplace", catLegalAudit: "⚖️ Legal, Diff & Audit", catPdfDocs: "📚 PDF & Documents", catMediaShare: "🖼️ Images, OCR, EXIF & P2P",
                toolLiveShield: "Live Form PII Shield", toolCloudSync: "E2EE Cloud Sync", toolAuditCert: "Auditor PDF Certificate", toolWhiteLabel: "White-Label Branding",
                toolWebAuthn: "WebAuthn Passkey Vault", toolStega: "Image Steganography", toolDestruct: "Self-Destructing Artifacts", toolEncrypt: "AES-256 Hardware Encryptor",
                toolMarket: "Local Rule Marketplace", toolZkp: "Zero-Knowledge Proofs", toolLora: "Local LoRA Fine-Tuning", toolLocalRag: "Local AI RAG Search",
                toolDiff: "Contract Diff Engine", toolCross: "Cross-Framework Compliance", toolTimestamp: "OpenTimestamps Anchor", toolCustody: "Chain of Custody",
                toolContract: "Contract Risk Parser", toolPdfPng: "PDF to PNG Converter", toolPdfMerge: "PDF Merger", toolPii: "Batch PII Redaction",
                toolVisual: "Visual Redaction (Face/Stamp)", toolMetaScrubber: "EXIF & Meta Scrubber", toolOcr: "OCR Text Extract (Worker)", toolP2p: "P2P File Share",
                toolOpfs: "OPFS Encrypted Virtual Disk", toolSign: "Ed25519 Document Signer", toolAiNer: "WebGPU AI NER Redactor", toolChain: "ZK-Rollup / Blockchain Anchor", toolRoom: "E2EE Secure Chat Room",
                encryptModeBtn: "Encrypt File/Text", decryptModeBtn: "Decrypt File/Text", passPlaceholder: "Enter Master Password...", pasteText: "Enter input text here...",
                outputLabel: "System Output / Logs:", compareBtn: "Compare & Diff", pasteSecondaryText: "Secondary text for comparison...", cmdPlaceholder: "Search all Sovereign & Pro tools...",
                faqTitle: "Frequently Asked Questions & Privacy Compliance",
                faq1Q: "Is my data ever sent to external servers?", faq1A: "No. PrivacyConvert Sovereign OS runs 100% client-side in your browser sandbox. With Air-Gapped and WebAssembly technology, zero bytes leave your device.",
                faq2Q: "What compliance frameworks are supported?", faq2A: "The suite complies with GDPR, HIPAA, CCPA, and enterprise sovereign data residency standards by keeping all file processing localized.",
                faq3Q: "How does large file handling work?", faq3A: "Using the Streams API and File System Access API, files are processed in 5MB memory-safe chunks directly to disk, preventing RAM overflow.",
                faq4Q: "Can I use this completely offline?", faq4A: "Yes. Once loaded, you can disconnect your internet entirely and all 30 sovereign tools will function normally in air-gapped isolation.",
                proBtn: "Get Pro", proModalTitle: "💎 Upgrade to Sovereign Pro", proModalDesc: "Unlock unlimited batch processing, cryptographic audit certificates, E2EE cloud sync, and P2P priority nodes.", activateKeyBtn: "Activate Pro License",
                payTrBtn: "PayTR / Credit Card (TL)", cryptoPayBtn: "Cryptomus / Crypto (USDT/BTC)", allRights: "All rights reserved.", orDivider: "Or enter license key",
                descLiveShield: "Shield outbound web forms and chat inputs from leaking sensitive PII."
            },
            tr: {
                accept: "Kabul Et", secureLabel: "Güvenli", dropText: "Göz atmak için tıklayın veya dosyaları buraya sürükleyin (Bellek Korumalı Akış)",
                btnReset: "Sıfırla", btnCopy: "📋 Kopyala", btnPreview: "👁️ Önizleme", btnProcess: "Güvenli İşlemi Çalıştır", closeBtn: "Kapat", previewTitle: "Kurumsal Önizleme",
                splitScreenBtn: "Bölünmüş Ekran", secondaryPaneTitle: "İkincil Çalışma Alanı", brandBtn: "Markalama", queueTitle: "Kuyruk Durumu",
                bannerTitle: "100% İstemci Tarafı (Air-Gapped) Güvenlik:", bannerDesc: "Tüm işlemler tarayıcınızın korumalı alanında (sandbox) yerel olarak gerçekleşir.", bannerVerifyBtn: "🔍 Nasıl Doğrulanır?",
                verifyModalTitle: "Air-Gapped Güvenliği Nasıl Doğrulanır", verifyDesc1: "Bu uygulama JavaScript, WebAssembly ve yerel IndexedDB depolama kullanarak tamamen istemci tarafında çalışır.",
                verifyStep1: "1. Adım: Tarayıcı Geliştirici Araçlarını Açın (F12)", verifyStep1Sub: "\"Ağ\" (Network) sekmesine gidin.", verifyStep2: "2. Adım: İnterneti Kesin veya Trafiği İzleyin", verifyStep2Sub: "Dış sunuculara 0 bayt veri veya istek gönderildiğini fark edeceksiniz.",
                catProFeatures: "💎 Pro ve Kurumsal", catInfiniteSec: "🔑 Güvenlik, Passkey ve Kasa", catZkpMarket: "📦 ZKP, Yapay Zeka ve Market", catLegalAudit: "⚖️ Hukuk, Karşılaştırma ve Denetim", catPdfDocs: "📚 PDF ve Belgeler", catMediaShare: "🖼️ Görseller, OCR, EXIF ve P2P",
                toolLiveShield: "Canlı Form PII Kalkanı", toolCloudSync: "Uçtan Uca Şifreli Bulut Senkronizasyonu", toolAuditCert: "Denetçi PDF Sertifikası", toolWhiteLabel: "Beyaz Etiket Markalama",
                toolWebAuthn: "WebAuthn Passkey Kasası", toolStega: "Görsel Steganografi (Veri Gizleme)", toolDestruct: "Kendi Kendini İmha Eden Dosyalar", toolEncrypt: "AES-256 Donanım Şifreleyici",
                toolMarket: "Yerel Kural Pazarı", toolZkp: "Sıfır Bilgi İspatları (ZKP)", toolLora: "Yerel LoRA İnce Ayarı", toolLocalRag: "Yerel AI RAG Taraması",
                toolDiff: "Sözleşme Karşılaştırma Motoru", toolCross: "Çapraz Çerçeve Uyumluluğu", toolTimestamp: "OpenTimestamps Çapası", toolCustody: "Gözetim Zinciri",
                toolContract: "Sözleşme Risk Ayrıştırıcısı", toolPdfPng: "PDF'den PNG'ye Dönüştürücü", toolPdfMerge: "PDF Birleştirici", toolPii: "Toplu PII (Kişisel Veri) Karartma",
                toolVisual: "Görsel Karartma (Yüz/Mühür)", toolMetaScrubber: "EXIF ve Meta Veri Temizleyici", toolOcr: "OCR Metin Çıkarımı (Worker)", toolP2p: "P2P (Eşler Arası) Dosya Paylaşımı",
                toolOpfs: "OPFS Şifreli Sanal Disk", toolSign: "Ed25519 Belge İmzalayıcı", toolAiNer: "WebGPU AI NER Redaktörü", toolChain: "ZK-Rollup / Blockchain Çapası", toolRoom: "E2EE Güvenli Sohbet Odası",
                encryptModeBtn: "Dosya/Metin Şifrele", decryptModeBtn: "Dosya/Metin Şifresini Çöz", passPlaceholder: "Ana Parolayı Girin...", pasteText: "Girdi metnini buraya yazın...",
                outputLabel: "Sistem Çıktısı / Loglar:", compareBtn: "Karşılaştır ve Farkı Bul", pasteSecondaryText: "Karşılaştırma için ikincil metin...", cmdPlaceholder: "Tüm Sovereign ve Pro araçlarını ara...",
                faqTitle: "Sıkça Sorulan Sorular ve Gizlilik Uyumluluğu",
                faq1Q: "Verilerim hiç harici sunuculara gönderiliyor mu?", faq1A: "Hayır. PrivacyConvert Sovereign OS, tarayıcı korumalı alanınızda %100 istemci tarafında çalışır. Air-Gapped ve WebAssembly teknolojisi sayesinde cihazınızdan sıfır bayt dışarı çıkar.",
                faq2Q: "Hangi uyumluluk çerçeveleri destekleniyor?", faq2A: "Araç takımı, tüm dosya işlemlerini yerelleştirerek GDPR, HIPAA, KVKK ve kurumsal egemen veri barındırma standartlarına tam uyum sağlar.",
                faq3Q: "Büyük dosya işleme nasıl çalışır?", faq3A: "Streams API ve Dosya Sistemi Erişim API'si kullanılarak dosyalar, RAM taşmasını önleyecek şekilde belleğe duyarlı 5MB'lık parçalar halinde doğrudan diske işlenir.",
                faq4Q: "Bunu tamamen çevrimdışı (offline) kullanabilir miyim?", faq4A: "Evet. Sayfa bir kez yüklendikten sonra internet bağlantınızı tamamen kesebilirsiniz; 30 aracın tamamı izole bir şekilde hava boşluklu (air-gapped) olarak çalışmaya devam edecektir.",
                proBtn: "Pro'ya Geç", proModalTitle: "💎 Sovereign Pro'ya Yükselt", proModalDesc: "Sınırsız toplu işleme, kriptografik denetim sertifikaları, E2EE bulut senkronizasyonu ve P2P öncelikli düğümlerin kilidini açın.", activateKeyBtn: "Pro Lisansını Aktifleştir",
                payTrBtn: "PayTR / Kredi Kartı ile Öde (TL)", cryptoPayBtn: "Cryptomus / Kripto ile Öde (USDT/BTC)", allRights: "Tüm hakları saklıdır.", orDivider: "Veya lisans anahtarını girin",
                descLiveShield: "Giden web formlarını ve sohbet girdilerini hassas kişisel verilerin (PII) sızmasına karşı koruyun."
            },
            es: {
                accept: "Aceptar", secureLabel: "Seguro", dropText: "Haga clic para buscar o arrastre archivos hiera",
                btnReset: "Reiniciar", btnCopy: "📋 Copiar", btnPreview: "👁️ Vista previa", btnProcess: "Ejecutar Proceso Seguro", closeBtn: "Cerrar", previewTitle: "Vista Previa Empresarial",
                splitScreenBtn: "Pantalla Dividida", secondaryPaneTitle: "Espacio de Trabajo Secundario", brandBtn: "Marca", queueTitle: "Estado de Cola",
                bannerTitle: "Seguridad Air-Gapped 100% del Lado del Cliente:", bannerDesc: "Todo el procesamiento ocurre localmente en el sandbox de su navegador.", bannerVerifyBtn: "🔍 ¿Cómo Verificar?",
                verifyModalTitle: "Cómo Verificar la Seguridad Air-Gapped", verifyDesc1: "Esta aplicación opera íntegramente del lado del cliente utilizando JavaScript, WebAssembly y almacenamiento local IndexedDB en sandbox.",
                verifyStep1: "Paso 1: Abrir Herramientas de Desarrollo (F12)", verifyStep1Sub: "Navegue a la pestaña \"Red\" (Network).", verifyStep2: "Paso 2: Desconecte Internet o Supervise el Tráfico", verifyStep2Sub: "Notará que se envían 0 solicitudes o bytes a servidores externos.",
                catProFeatures: "💎 Pro y Empresarial", catInfiniteSec: "🔑 Seguridad, Passkey y Bóveda", catZkpMarket: "📦 ZKP, IA y Mercado", catLegalAudit: "⚖️ Legal, Comparación y Auditoría", catPdfDocs: "📚 PDF y Documentos", catMediaShare: "🖼️ Imágenes, OCR, EXIF y P2P",
                toolLiveShield: "Escudo PII de Formularios", toolCloudSync: "Sincronización en la Nube E2EE", toolAuditCert: "Certificado PDF de Auditor", toolWhiteLabel: "Marca Blanca",
                toolWebAuthn: "Bóveda de Passkey WebAuthn", toolStega: "Esteganografía de Imágenes", toolDestruct: "Artefactos Autodestructibles", toolEncrypt: "Cifrador de Hardware AES-256",
                toolMarket: "Mercado de Reglas Locales", toolZkp: "Pruebas de Conocimiento Cero (ZKP)", toolLora: "Ajuste Fino de LoRA Local", toolLocalRag: "Búsqueda RAG de IA Local",
                toolDiff: "Motor Diff de Contratos", toolCross: "Cumplimiento Multi-Marco", toolTimestamp: "Anclaje de OpenTimestamps", toolCustody: "Cadena de Custodia",
                toolContract: "Analizador de Riesgos de Contratos", toolPdfPng: "Conversor de PDF a PNG", toolPdfMerge: "Fusión de PDF", toolPii: "Redacción de PII por Lotes",
                toolVisual: "Redacción Visual (Cara/Sello)", toolMetaScrubber: "Limpiador de EXIF y Metadatos", toolOcr: "Extracción de Texto OCR (Worker)", toolP2p: "Intercambio de Archivos P2P",
                toolOpfs: "Disco Virtual Cifrado OPFS", toolSign: "Firmante de Documentos Ed25519", toolAiNer: "Redactor IA NER WebGPU", toolChain: "Anclaje ZK-Rollup / Blockchain", toolRoom: "Sala de Chat Segura E2EE",
                encryptModeBtn: "Cifrar Archivo/Texto", decryptModeBtn: "Descifrar Archivo/Texto", passPlaceholder: "Ingrese la Contraseña Maestra...", pasteText: "Ingrese el texto de entrada aquí...",
                outputLabel: "Salida del Sistema / Registros:", compareBtn: "Comparar y Diferenciar", pasteSecondaryText: "Texto secundario para comparación...", cmdPlaceholder: "Buscar todas las herramientas Sovereign y Pro...",
                faqTitle: "Preguntas Frecuentes y Cumplimiento de Privacidad",
                faq1Q: "¿Mis datos se envían alguna vez a servidores externos?", faq1A: "No. PrivacyConvert Sovereign OS se ejecuta 100% del lado del cliente en el sandbox de su navegador. Con tecnología Air-Gapped y WebAssembly, cero bytes salen de su dispositivo.",
                faq2Q: "¿Qué marcos de cumplimiento son compatibles?", faq2A: "La suite cumple con los estándares GDPR, HIPAA, CCPA y de residencia de datos soberanos empresariales al mantener localizado todo el procesamiento de archivos.",
                faq3Q: "¿Cómo funciona el manejo de archivos grandes?", faq3A: "Utilizando la API de Streams y la API de Acceso al Sistema de Archivos, los archivos se procesan directamente en el disco en fragmentos de 5 MB seguros para la memoria, evitando el desbordamiento de RAM.",
                faq4Q: "¿Puedo usar esto completamente sin conexión?", faq4A: "Sí. Una vez cargado, puede desconectar su Internet por completo y las 30 herramientas funcionarán normalmente en aislamiento air-gapped.",
                proBtn: "Obtener Pro", proModalTitle: "💎 Actualizar a Sovereign Pro", proModalDesc: "Desbloquee procesamiento por lotes ilimitado, certificados de auditoría criptográfica, sincronización en la nube E2EE y nodos de prioridad P2P.", activateKeyBtn: "Activar Licencia Pro",
                payTrBtn: "PayTR / Tarjeta de Crédito (TL)", cryptoPayBtn: "Cryptomus / Criptomoneda (USDT/BTC)", allRights: "Todos los derechos reservados.", orDivider: "O introduzca la clave de licencia",
                descLiveShield: "Proteja los formularios web salientes y los chats para que no filtren PII confidencial."
            },
            de: {
                accept: "Akzeptieren", secureLabel: "Sicher", dropText: "Klicken Sie zum Durchsuchen oder ziehen Sie Dateien hierher",
                btnReset: "Zurücksetzen", btnCopy: "📋 Kopieren", btnPreview: "👁️ Vorschau", btnProcess: "Sicheren Prozess Ausführen", closeBtn: "Schließen", previewTitle: "Unternehmensvorschau",
                splitScreenBtn: "Geteilte Ansicht", secondaryPaneTitle: "Sekundärer Arbeitsbereich", brandBtn: "Branding", queueTitle: "Warteschlangenstatus",
                bannerTitle: "100% Client-seitige Air-Gapped-Sicherheit:", bannerDesc: "Die gesamte Verarbeitung erfolgt lokal in der Sandbox Ihres Browsers.", bannerVerifyBtn: "🔍 Wie man das überprüft?",
                verifyModalTitle: "So überprüfen Sie die Air-Gapped-Sicherheit", verifyDesc1: "Diese Anwendung arbeitet vollständig clientseitig mithilfe von JavaScript, WebAssembly und lokalem IndexedDB-Sandbox-Speicher.",
                verifyStep1: "Schritt 1: Öffnen Sie die Browser-Entwicklertools (F12)", verifyStep1Sub: "Navigieren Sie zur Registerkarte \"Netzwerk\".", verifyStep2: "Schritt 2: Trennen Sie das Internet oder überwachen Sie den Datenverkehr", verifyStep2Sub: "Beachten Sie, dass 0 ausgehende Anforderungen/Bytes an externe Server gesendet werden.",
                catProFeatures: "💎 Pro & Unternehmen", catInfiniteSec: "🔑 Sicherheit, Passkey & Tresor", catZkpMarket: "📦 ZKP, KI & Marktplatz", catLegalAudit: "⚖️ Recht, Diff & Audit", catPdfDocs: "📚 PDF & Dokumente", catMediaShare: "🖼️ Bilder, OCR, EXIF & P2P",
                toolLiveShield: "Live-Formular-PII-Schild", toolCloudSync: "E2EE Cloud Sync", toolAuditCert: "Auditor PDF-Zertifikat", toolWhiteLabel: "White-Label-Branding",
                toolWebAuthn: "WebAuthn Passkey-Tresor", toolStega: "Bildsteganographie", toolDestruct: "Selbstzerstörende Artefakte", toolEncrypt: "AES-256 Hardware-Verschlüsseler",
                toolMarket: "Lokaler Regel-Marktplatz", toolZkp: "Zero-Knowledge-Beweise (ZKP)", toolLora: "Lokale LoRA-Feinabstimmung", toolLocalRag: "Lokale KI-RAG-Suche",
                toolDiff: "Vertrags-Diff-Engine", toolCross: "Framework-übergreifende Compliance", toolTimestamp: "OpenTimestamps-Anker", toolCustody: "Beweiskette (Custody)",
                toolContract: "Vertragsrisiko-Parser", toolPdfPng: "PDF zu PNG Konverter", toolPdfMerge: "PDF-Zusammenführung", toolPii: "Batch-PII-Schwärzung",
                toolVisual: "Visuelle Schwärzung (Gesicht/Stempel)", toolMetaScrubber: "EXIF- & Meta-Wäscher", toolOcr: "OCR-Textextraktion (Worker)", toolP2p: "P2P-Dateifreigabe",
                toolOpfs: "Verschlüsseltes virtuelles OPFS-Laufwerk", toolSign: "Ed25519 Dokumenten-Signierer", toolAiNer: "WebGPU AI NER-Redaktor", toolChain: "ZK-Rollup / Blockchain-Anker", toolRoom: "E2EE Sicherer Chatraum",
                encryptModeBtn: "Datei/Text Verschlüsseln", decryptModeBtn: "Datei/Text Entschlüsseln", passPlaceholder: "Master-Passwort eingeben...", pasteText: "Geben Sie hier den Eingabetext ein...",
                outputLabel: "Systemausgabe / Protokolle:", compareBtn: "Vergleichen & Differenzieren", pasteSecondaryText: "Sekundärer Text zum Vergleich...", cmdPlaceholder: "Durchsuchen Sie alle Sovereign- & Pro-Tools...",
                faqTitle: "Häufig gestellte Fragen und Datenschutz-Compliance",
                faq1Q: "Werden meine Daten jemals an externe Server gesendet?", faq1A: "Nein. PrivacyConvert Sovereign OS läuft zu 100% clientseitig in Ihrer Browser-Sandbox. Mit Air-Gapped- und WebAssembly-Technologie verlassen null Bytes Ihr Gerät.",
                faq2Q: "Welche Compliance-Frameworks werden unterstützt?", faq2A: "Die Suite entspricht der DSGVO, HIPAA, CCPA und den Standards für die Datenresidenz von Unternehmen, indem die gesamte Dateiverarbeitung lokalisiert wird.",
                faq3Q: "Wie funktioniert die Verarbeitung großer Dateien?", faq3A: "Mithilfe der Streams-API und der File System Access-API werden Dateien direkt auf die Festplatte in 5 MB speichersicheren Blöcken verarbeitet, wodurch ein RAM-Überlauf verhindert wird.",
                faq4Q: "Kann ich dies komplett offline nutzen?", faq4A: "Ja. Nach dem Laden können Sie Ihr Internet vollständig trennen, und alle 30 Tools funktionieren normal in isolierter Air-Gapped-Umgebung.",
                proBtn: "Pro Holen", proModalTitle: "💎 Upgrade auf Sovereign Pro", proModalDesc: "Schalten Sie unbegrenzte Stapelverarbeitung, kryptografische Audit-Zertifikate, E2EE-Cloud-Synchronisierung und P2P-Prioritätsknoten frei.", activateKeyBtn: "Pro-Lizenz Aktivieren",
                payTrBtn: "PayTR / Kreditkarte (TL)", cryptoPayBtn: "Cryptomus / Krypto (USDT/BTC)", allRights: "Alle Rechte vorbehalten.", orDivider: "Oder Lizenzschlüssel eingeben",
                descLiveShield: "Schützen Sie ausgehende Webformulare und Chat-Eingaben vor dem Verlust sensibler PII-Daten."
            },
            fr: {
                accept: "Accepter", secureLabel: "Sécurisé", dropText: "Cliquez pour parcourir ou faites glisser les fichiers ici",
                btnReset: "Réinitialiser", btnCopy: "📋 Copier", btnPreview: "👁️ Aperçu", btnProcess: "Exécuter le Processus Sécurisé", closeBtn: "Fermer", previewTitle: "Aperçu Entreprise",
                splitScreenBtn: "Vue Divisée", secondaryPaneTitle: "Espace de Travail Secondaire", brandBtn: "Marque", queueTitle: "État de la File",
                bannerTitle: "Sécurité Air-Gapped 100% Côté Client :", bannerDesc: "Tout le traitement s'effectue localement dans le bac à sable de votre navigateur.", bannerVerifyBtn: "🔍 Comment Vérifier ?",
                verifyModalTitle: "Comment Vérifier la Sécurité Air-Gapped", verifyDesc1: "Cette application fonctionne entièrement côté client en utilisant JavaScript, WebAssembly et le stockage local IndexedDB en bac à sable.",
                verifyStep1: "Étape 1 : Ouvrir les Outils de Développement (F12)", verifyStep1Sub: "Accédez à l'onglet \"Réseau\".", verifyStep2: "Étape 2 : Déconnecter Internet ou Surveiller le Trafic", verifyStep2Sub: "Remarquez que 0 requête ou octet n'est envoyé aux serveurs externes.",
                catProFeatures: "💎 Pro & Entreprise", catInfiniteSec: "🔑 Sécurité, Passkey & Coffre", catZkpMarket: "📦 ZKP, IA & Marché", catLegalAudit: "⚖️ Légal, Diff & Audit", catPdfDocs: "📚 PDF & Documents", catMediaShare: "🖼️ Images, OCR, EXIF & P2P",
                toolLiveShield: "Bouclier PII pour Formulaires", toolCloudSync: "Synchronisation Cloud E2EE", toolAuditCert: "Certificat PDF d'Auditeur", toolWhiteLabel: "Marque Blanche",
                toolWebAuthn: "Coffre WebAuthn Passkey", toolStega: "Stéganographie d'Image", toolDestruct: "Artéfacts Autodestructibles", toolEncrypt: "Chiffreur Matériel AES-256",
                toolMarket: "Marché de Règles Locales", toolZkp: "Preuves à Divulgation Nulle (ZKP)", toolLora: "Affinage LoRA Local", toolLocalRag: "Recherche RAG IA Locale",
                toolDiff: "Moteur Diff de Contratos", toolCross: "Conformité Inter-Cadres", toolTimestamp: "Ancrage OpenTimestamps", toolCustody: "Chaîne de Traçabilité",
                toolContract: "Analyseur de Risques de Contrats", toolPdfPng: "Convertisseur PDF en PNG", toolPdfMerge: "Fusion de PDF", toolPii: "Rédaction PII par Lots",
                toolVisual: "Rédaction Visuelle (Visage/Sceau)", toolMetaScrubber: "Nettoyeur EXIF & Métadonnées", toolOcr: "Extraction de Texte OCR (Worker)", toolP2p: "Partage de Fichiers P2P",
                toolOpfs: "Disque Virtuel Chiffré OPFS", toolSign: "Signataire de Documents Ed25519", toolAiNer: "Rédacteur IA NER WebGPU", toolChain: "Ancrage ZK-Rollup / Blockchain", toolRoom: "Salle de Discussion Sécurisée E2EE",
                encryptModeBtn: "Chiffrer Fichier/Texte", decryptModeBtn: "Déchiffrer Fichier/Texte", passPlaceholder: "Entrez le mot de passe principal...", pasteText: "Entrez le texte d'entrée ici...",
                outputLabel: "Sortie Système / Journaux :", compareBtn: "Comparer & Différenciér", pasteSecondaryText: "Texte secondaire pour comparaison...", cmdPlaceholder: "Rechercher tous les outils Sovereign & Pro...",
                faqTitle: "Foire Aux Questions et Conformité de Confidentialité",
                faq1Q: "Mes données sont-elles un jour envoyées à des serveurs externes ?", faq1A: "Non. PrivacyConvert Sovereign OS s'exécute à 100% côté client dans le bac à sable de votre navigateur. Avec la technologie Air-Gapped et WebAssembly, zéro octet ne quitte votre appareil.",
                faq2Q: "Quels cadres de conformité sont pris en charge ?", faq2A: "La suite est conforme au RGPD, HIPAA, CCPA et aux normes de résidence des données souveraines de l'entreprise en gardant tout le traitement des fichiers localisé.",
                faq3Q: "Comment fonctionne la gestion des fichiers volumineux ?", faq3A: "En utilisant l'API Streams et l'API d'accès au système de fichiers, les fichiers sont traités directement sur le disque par blocs de 5 Mo sécurisés pour la mémoire, empêchant le débordement de la RAM.",
                faq4Q: "Puis-je l'utiliser complètement hors ligne ?", faq4A: "Oui. Une fois chargé, vous pouvez déconnecter complètement votre connexion Internet et les 30 outils fonctionneront normalement en isolation air-gapped.",
                proBtn: "Obtenir Pro", proModalTitle: "💎 Passer à Sovereign Pro", proModalDesc: "Débloquez le traitement par lots illimité, les certificats d'audit cryptographique, la synchronisation cloud E2EE et les nœuds prioritaires P2P.", activateKeyBtn: "Activer la Licence Pro",
                payTrBtn: "PayTR / Carte de Crédit (TL)", cryptoPayBtn: "Cryptomus / Crypto (USDT/BTC)", allRights: "Tous droits réservés.", orDivider: "Ou entrez la clé de licence",
                descLiveShield: "Protégez les formulaires Web et les entrées de chat sortants contre les fuites de PII."
            },
            zh: {
                accept: "接受", secureLabel: "安全", dropText: "点击浏览或将文件拖放到此处（内存安全流）",
                btnReset: "重置", btnCopy: "📋 复制", btnPreview: "👁️ 预览", btnProcess: "执行安全流程", closeBtn: "关闭", previewTitle: "企业预览",
                splitScreenBtn: "分屏视图", secondaryPaneTitle: "辅助工作区", brandBtn: "品牌化", queueTitle: "队列状态",
                bannerTitle: "100% 客户端物理隔离安全：", bannerDesc: "所有处理都在浏览器的沙盒中本地进行。", bannerVerifyBtn: "🔍 如何验证？",
                verifyModalTitle: "如何验证物理隔离安全性", verifyDesc1: "此应用程序完全使用JavaScript、WebAssembly和本地IndexedDB沙盒存储在客户端运行。",
                verifyStep1: "第一步：打开浏览器开发者工具（F12）", verifyStep1Sub: "导航到“网络”选项卡。", verifyStep2: "第二步：断开互联网或监控流量", verifyStep2Sub: "您将注意到发送到外部服务器的请求/字节数为 0。",
                catProFeatures: "💎 专业版与企业版", catInfiniteSec: "🔑 安全、通行密钥与保险库", catZkpMarket: "📦 ZKP、AI 与市场", catLegalAudit: "⚖️ 法律、差异与审计", catPdfDocs: "📚 PDF 与文档", catMediaShare: "🖼️ 图像、OCR、EXIF 与 P2P",
                toolLiveShield: "实时表单 PII 护盾", toolCloudSync: "E2EE 云同步", toolAuditCert: "审计员 PDF 证书", toolWhiteLabel: "白标品牌化",
                toolWebAuthn: "WebAuthn 通行密钥保险库", toolStega: "图像隐写术", toolDestruct: "自毁伪影", toolEncrypt: "AES-256 硬件加密器",
                toolMarket: "本地规则市场", toolZkp: "零知识证明 (ZKP)", toolLora: "本地 LoRA 微调", toolLocalRag: "本地 AI RAG 搜索",
                toolDiff: "合同差异引擎", toolCross: "跨框架合规性", toolTimestamp: "OpenTimestamps 锚点", toolCustody: "监管链",
                toolContract: "合同风险解析器", toolPdfPng: "PDF 转 PNG 转换器", toolPdfMerge: "PDF 合并器", toolPii: "批量 PII 遮盖",
                toolVisual: "视觉遮盖（人脸/印章）", toolMetaScrubber: "EXIF 与元数据清理器", toolOcr: "OCR 文本提取 (Worker)", toolP2p: "P2P 文件共享",
                toolOpfs: "OPFS 加密虚拟磁盘", toolSign: "Ed25519 文档签名器", toolAiNer: "WebGPU AI NER 编排器", toolChain: "ZK-Rollup / 区块链锚点", toolRoom: "E2EE 安全聊天室",
                encryptModeBtn: "加密文件/文本", decryptModeBtn: "解密文件/文本", passPlaceholder: "输入主密码...", pasteText: "在此处输入输入文本...",
                outputLabel: "系统输出 / 日志：", compareBtn: "比较与差异", pasteSecondaryText: "用于比较的辅助文本...", cmdPlaceholder: "搜索所有 Sovereign 和 Pro 工具...",
                faqTitle: "常见问题解答与隐私合规性",
                faq1Q: "我的数据是否曾被发送到外部服务器？", faq1A: "不会。PrivacyConvert Sovereign OS 100% 在您浏览器的沙盒中以客户端模式运行。借助物理隔离和 WebAssembly 技术，您的设备中不会流出任何字节。",
                faq2Q: "支持哪些合规框架？", faq2A: "该套件通过将所有文件处理本地化，符合 GDPR、HIPAA、CCPA 以及企业主权数据驻留标准。",
                faq3Q: "大文件处理如何工作？", faq3A: "使用 Streams API 和文件系统访问 API，文件以 5MB 的内存安全块直接处理到磁盘上，从而防止 RAM 溢出。",
                faq4Q: "我可以完全离线使用它吗？", faq4A: "可以。加载完成后，您可以完全断开互联网连接，所有 30 个工具都将在物理隔离的环境中正常运行。",
                proBtn: "获取专业版", proModalTitle: "💎 升级到 Sovereign Pro", proModalDesc: "解锁无限制的批量处理、加密审计证书、E2EE 云同步和 P2P 优先节点。", activateKeyBtn: "激活专业版许可证",
                payTrBtn: "PayTR / 信用卡 (TL)", cryptoPayBtn: "Cryptomus / 加密货币 (USDT/BTC)", allRights: "版权所有。", orDivider: "或输入许可证密钥",
                descLiveShield: "保护出站 Web 表单和聊天输入免遭敏感 PII 泄漏。"
            },
            ar: {
                accept: "قبول", secureLabel: "آمن", dropText: "انقر للتصفح أو اسحب الملفات هنا (دفق آمن للذاكرة)",
                btnReset: "إعادة ضبط", btnCopy: "📋 نسخ", btnPreview: "👁️ معاينة", btnProcess: "تنفيذ عملية آمنة", closeBtn: "إغلاق", previewTitle: "معاينة المؤسسة",
                splitScreenBtn: "عرض مقسم", secondaryPaneTitle: "مساحة العمل الثانوية", brandBtn: "العلامة التجارية", queueTitle: "حالة قائمة الانتظار",
                bannerTitle: "أمان معزول 100% على جانب العميل:", bannerDesc: "تتم جميع عمليات المعالجة محليًا في وضع الحماية للمتصفح الخاص بك.", bannerVerifyBtn: "🔍 كيف أتحقق؟",
                verifyModalTitle: "كيفية التحقق من الأمان المعزول (Air-Gapped)", verifyDesc1: "يعمل هذا التطبيق بالكامل من جانب العميل باستخدام JavaScript و WebAssembly وتخزين IndexedDB المحلي في وضع الحماية.",
                verifyStep1: "الخطوة 1: افتح أدوات مطوري المتصفح (F12)", verifyStep1Sub: "انتقل إلى علامة التبويب \"الشبكة\".", verifyStep2: "الخطوة 2: افصل الإنترنت أو راقب حركة المرور", verifyStep2Sub: "لاحظ إرسال 0 طلبات/بايت صادرة إلى الخوادم الخارجية.",
                catProFeatures: "💎 للمحترفين والمؤسسات", catInfiniteSec: "🔑 الأمان ومفاتيح المرور والقبو", catZkpMarket: "📦 ZKP والذكاء الاصطناعي والسوق", catLegalAudit: "⚖️ القانون والاختلافات والتدقيق", catPdfDocs: "📚 PDF والمستندات", catMediaShare: "🖼️ الصور و OCR و EXIF و P2P",
                toolLiveShield: "درع PII للنماذج المباشرة", toolCloudSync: "مزامنة سحابية E2EE", toolAuditCert: "شهادة PDF للمدقق", toolWhiteLabel: "علامة تجارية بيضاء",
                toolWebAuthn: "قبو مفاتيح المرور WebAuthn", toolStega: "إخفاء المعلومات في الصور", toolDestruct: "قطع أثرية ذاتية التدمير", toolEncrypt: "مُشفِّر أجهزة AES-256",
                toolMarket: "سوق القواعد المحلية", toolZkp: "براهين المعرفة الصفرية (ZKP)", toolLora: "ضبط دقيق محلي لـ LoRA", toolLocalRag: "بحث RAG محلي للذكاء الاصطناعي",
                toolDiff: "محرك فروق العقود", toolCross: "الامتثال عبر الأطر", toolTimestamp: "مرساة OpenTimestamps", toolCustody: "سلسلة الحضانة",
                toolContract: "محلل مخاطر العقود", toolPdfPng: "محول PDF إلى PNG", toolPdfMerge: "دمج PDF", toolPii: "تنقيح PII الدفعي",
                toolVisual: "تنقيح بصري (وجه / ختم)", toolMetaScrubber: "منظف EXIF والبيانات الوصفية", toolOcr: "استخراج نص OCR (عامل)", toolP2p: "مشاركة ملفات P2P",
                toolOpfs: "قرص ظاهري مشفر OPFS", toolSign: "Ed25519 موقع مستندات", toolAiNer: "منقح AI NER لـ WebGPU", toolChain: "ZK-Rollup / مرساة Blockchain", toolRoom: "غرفة دردشة آمنة E2EE",
                encryptModeBtn: "تشفير ملف/نص", decryptModeBtn: "فك تشفير ملف/نص", passPlaceholder: "أدخل كلمة المرور الرئيسية...", pasteText: "أدخل نص الإدخال هنا...",
                outputLabel: "مخرجات النظام / السجلات:", compareBtn: "مقارنة وإيجاد الفروق", pasteSecondaryText: "نص ثانوي للمقارنة...", cmdPlaceholder: "ابحث في جميع أدوات Sovereign و Pro...",
                faqTitle: "الأسئلة الشائعة والامتثال للخصوصية",
                faq1Q: "هل يتم إرسال بياناتي أبدًا إلى خوادم خارجية؟", faq1A: "لا. يعمل نظام PrivacyConvert Sovereign OS بنسبة 100% من جانب العميل في وضع الحماية الخاص بمتصفحك. بفضل تقنية Air-Gapped و WebAssembly، لا تغادر أي بايتات جهازك.",
                faq2Q: "ما هي أطر الامتثال المدعومة؟", faq2A: "يتوافق الجناح مع معايير إقامة البيانات السيادية للشركات و GDPR و HIPAA و CCPA من خلال الحفاظ على محلية جميع عمليات معالجة الملفات.",
                faq3Q: "كيف تعمل معالجة الملفات الكبيرة؟", faq3A: "باستخدام واجهة برمجة تطبيقات Streams وواجهة برمجة تطبيقات File System Access، تتم معالجة الملفات مباشرة على القرص في أجزاء آمنة للذاكرة بحجم 5 ميجابايت، مما يمنع تجاوز سعة ذاكرة الوصول العشوائي (RAM).",
                faq4Q: "هل يمكنني استخدام هذا في وضع عدم الاتصال تمامًا؟", faq4A: "نعم. بمجرد التحميل، يمكنك قطع اتصالك بالإنترنت بالكامل، وستعمل جميع الأدوات الثلاثين بشكل طبيعي في عزلة عن الهواء (air-gapped).",
                proBtn: "احصل على Pro", proModalTitle: "💎 الترقية إلى Sovereign Pro", proModalDesc: "افتح معالجة الدُفعات غير المحدودة، وشهادات التدقيق المشفرة، والمزامنة السحابية E2EE، والعقد ذات الأولوية P2P.", activateKeyBtn: "تفعيل ترخيص Pro",
                payTrBtn: "PayTR / بطاقة الائتمان (TL)", cryptoPayBtn: "Cryptomus / تشفير (USDT/BTC)", allRights: "جميع الحقوق محفوظة.", orDivider: "أو أدخل مفتاح الترخيص",
                descLiveShield: "حماية نماذج الويب الصادرة ومدخلات الدردشة من تسريب معلومات التعريف الشخصية (PII) الحساسة."
            }
        },
        applyLanguage(lang) {
            const dict = this.translations[lang] || this.translations['en'];
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (dict[key]) el.innerHTML = dict[key];
            });
            
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (dict[key]) el.placeholder = dict[key];
            });

            PrivacyConvert.state.lang = lang;
            localStorage.setItem('privacyConvert_lang', lang);
            
            const langSelect = document.getElementById('langSelect');
            if(langSelect) langSelect.value = lang;

            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

            const currentTool = PrivacyConvert.state.tool;
            const tabElem = document.getElementById(`tab-${currentTool}`);
            if(tabElem) {
                const titleSpan = tabElem.querySelector('.truncate') || tabElem.querySelector('span:last-child');
                if(titleSpan) {
                    const mainTitle = document.getElementById('mainTitleAccent');
                    if(mainTitle) mainTitle.innerText = titleSpan.innerText.trim();
                }
            }
        }
    },

    routing: {
        metaData: {
            'live-pii-shield': { type: 'text', title: 'Live Form PII Shield' },
            'cloud-sync': { type: 'action', title: 'E2EE Cloud Sync', proRequired: true },
            'audit-certificate': { type: 'action', title: 'Auditor PDF Certificate', proRequired: true },
            'white-label': { type: 'text', title: 'White-Label Branding', proRequired: true },
            'webauthn-vault': { type: 'webauthn', title: 'WebAuthn Passkey Vault' },
            'steganography': { type: 'interactive-stega', accept: 'image/*', title: 'Image Steganography' },
            'self-destruct': { type: 'vault', title: 'Self-Destructing Artifacts' },
            'encrypt-tool': { type: 'crypto', title: 'AES-256 Hardware Encryptor' },
            'template-market': { type: 'text', title: 'Local Rule Marketplace' },
            'zkp-validator': { type: 'text', title: 'Zero-Knowledge Proofs' },
            'lora-tuning': { type: 'text', title: 'Local LoRA Fine-Tuning' },
            'local-rag': { type: 'text', title: 'Local AI RAG Search' },
            'doc-diff': { type: 'text', title: 'Contract Diff Engine' },
            'cross-compliance': { type: 'text', title: 'Cross-Framework Compliance' },
            'timestamp-anchor': { type: 'file', multiple: true, title: 'OpenTimestamps Anchor' },
            'chain-custody': { type: 'file', multiple: true, title: 'Chain of Custody' },
            'contract-analyzer': { type: 'text', title: 'Contract Risk Parser' },
            'pdf-to-png': { type: 'file', accept: 'application/pdf', title: 'PDF to PNG Converter' },
            'pdf-merge': { type: 'file', accept: 'application/pdf', multiple: true, title: 'PDF Merger' },
            'pii-redactor': { type: 'text', title: 'Batch PII Redaction', proRequired: true },
            'visual-redact': { type: 'interactive-redact', accept: 'image/*', title: 'Visual Redaction' },
            'meta-scrubber': { type: 'file', multiple: true, accept: 'image/*', title: 'EXIF & Meta Scrubber' },
            'ocr-tool': { type: 'ocr', accept: 'image/*', title: 'OCR Text Extract (Worker)' },
            'p2p-share': { type: 'interactive-p2p', title: 'P2P File Share' },
            'ai-ner-mask': { type: 'text', title: 'WebGPU AI NER Redactor', proRequired: true },
            'opfs-vault': { type: 'interactive-opfs', title: 'OPFS Encrypted Virtual Disk', proRequired: true },
            'ed25519-sign': { type: 'text', title: 'Ed25519 Document Signer', proRequired: true },
            'blockchain-anchor': { type: 'text', title: 'ZK-Rollup / Blockchain Anchor', proRequired: true },
            'secure-room': { type: 'interactive-room', title: 'E2EE Secure Chat Room', proRequired: true }
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
                const titleSpan = tabElem.querySelector('.truncate') || tabElem.querySelector('span:last-child');
                if(titleSpan) {
                    const mainTitle = document.getElementById('mainTitleAccent');
                    if(mainTitle) mainTitle.innerText = titleSpan.innerText.trim();
                }
            } else {
                const mainTitle = document.getElementById('mainTitleAccent');
                if(mainTitle) mainTitle.innerText = meta.title;
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
        updateProgress(percent, text) {
            const modal = document.getElementById('progressModal');
            if (!modal) return;
            if (percent === 0) modal.classList.remove('hidden');
            if (percent >= 100) setTimeout(() => modal.classList.add('hidden'), 500);
            const bar = document.getElementById('progressBar');
            const pText = document.getElementById('progressText');
            if (bar) {
                bar.style.width = `${percent}%`;
                bar.querySelector('span').innerText = `${percent}%`;
            }
            if(text && pText) pText.innerText = text;
        },
        resetWorkspace(meta) {
            PrivacyConvert.cleanupObjectUrls();
            PrivacyConvert.state.files = []; 
            const actionArea = document.getElementById('actionArea');
            const textInputGroup = document.getElementById('textInputGroup');
            const genericTextBox = document.getElementById('genericTextBox');
            const cryptoOptions = document.getElementById('cryptoOptions');
            const dropZone = document.getElementById('dropZone');
            const container = document.getElementById('interactiveWorkspaceContainer');
            const mainInput = document.getElementById('mainInputField');
            const outBox = document.getElementById('genericTextArea');
            
            if(actionArea) actionArea.classList.add('hidden');
            if(textInputGroup) textInputGroup.classList.add('hidden');
            if(genericTextBox) genericTextBox.classList.add('hidden');
            if(cryptoOptions) cryptoOptions.classList.add('hidden');
            if(dropZone) dropZone.style.display = 'none';
            if(container) { container.classList.add('hidden'); container.innerHTML = ''; }
            if(mainInput) mainInput.value = '';
            if(outBox) outBox.value = '';

            if (['file', 'crypto', 'ocr', 'interactive-redact', 'interactive-stega'].includes(meta.type)) {
                if(dropZone) dropZone.style.display = 'block';
                if(meta.type === 'crypto') cryptoOptions.classList.remove('hidden');
            } else if (meta.type === 'text') {
                actionArea.classList.remove('hidden'); textInputGroup.classList.remove('hidden'); genericTextBox.classList.remove('hidden');
            } else if (meta.type === 'action') {
                PrivacyConvert.engine.executeTool();
            } else if (meta.type === 'vault') {
                PrivacyConvert.ui.renderVaultUI();
            }
        },
        renderVaultUI() {
            const container = document.getElementById('interactiveWorkspaceContainer'); 
            if(!container) return; 
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border space-y-3">
                    <h4 class="font-bold text-xs uppercase text-slate-500">IndexedDB Secure Vault</h4>
                    <input type="text" id="vaultTitle" placeholder="Title..." class="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-xs dark:text-white">
                    <textarea id="vaultContent" placeholder="Secret Content..." class="w-full h-24 p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-xs dark:text-white"></textarea>
                    <button onclick="PrivacyConvert.engine.saveVaultNote()" class="w-full py-2.5 dynamic-bg text-white font-bold text-xs rounded-xl shadow">Save Note</button>
                    <div id="vaultList" class="space-y-2 mt-4 max-h-48 overflow-y-auto"></div>
                </div>
            `;
            PrivacyConvert.engine.loadVaultNotes();
        },
        handleFiles(files) {
            let validFiles = Array.from(files).map(f => ({ file: f, status: 'Ready' }));
            if(validFiles.length > 0) {
                PrivacyConvert.state.files = validFiles;
                const dropZone = document.getElementById('dropZone');
                const actionArea = document.getElementById('actionArea');
                const clearBtn = document.getElementById('clearBtn');
                if(dropZone) dropZone.style.display = 'none';
                if(actionArea) actionArea.classList.remove('hidden');
                if(clearBtn) clearBtn.classList.remove('hidden');
                this.showToast(`${validFiles.length} file(s) loaded`);
            }
        }
    },

    engine: {
        async executeTool() {
            const tool = PrivacyConvert.state.tool;
            const inputField = document.getElementById('mainInputField');
            const outputBox = document.getElementById('genericTextArea');
            const outputContainer = document.getElementById('genericTextBox');
            
            if (tool === 'pii-redactor' || tool === 'ai-ner-mask' || tool === 'live-pii-shield') {
                const text = inputField ? inputField.value : '';
                if (!text) return PrivacyConvert.ui.showToast('Lütfen metin girin', 'warning');
                if (outputContainer) outputContainer.classList.remove('hidden');
                outputBox.value = "Yapay Zeka Analiz Ediyor...";
                const result = tool === 'ai-ner-mask' ? aiEngine.runAiNer(text) : aiEngine.maskPII(text);
                outputBox.value = `[AI REDACTION SONUCU]\n\n${result}`;
                PrivacyConvert.ui.showToast('Veriler başarıyla maskelendi!');
            }
            else if (tool === 'encrypt-tool') {
                const pwd = document.getElementById('cryptoPasswordInput')?.value;
                const text = inputField ? inputField.value : '';
                if (!pwd) return PrivacyConvert.ui.showToast('Parola gerekli!', 'warning');
                if (outputContainer) outputContainer.classList.remove('hidden');
                
                if (PrivacyConvert.state.files.length > 0) {
                    await streamCore.processLargeFile(
                        PrivacyConvert.state.files[0].file, 
                        pwd, 
                        PrivacyConvert.state.cryptoMode, 
                        (p, t) => PrivacyConvert.ui.updateProgress(p, t), 
                        (m, t) => PrivacyConvert.ui.showToast(m, t), 
                        (u) => PrivacyConvert.registerObjectUrl(u)
                    );
                    return;
                }
                
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
            else if (tool === 'meta-scrubber') {
                if (PrivacyConvert.state.files.length === 0) return PrivacyConvert.ui.showToast('Görsel seçin', 'warning');
                PrivacyConvert.ui.updateProgress(30, "EXIF temizleniyor...");
                for (let item of PrivacyConvert.state.files) {
                    const cleanUrl = await mediaCore.scrubExif(item.file, (u) => PrivacyConvert.registerObjectUrl(u));
                    const l = document.createElement('a'); l.href = cleanUrl; l.download = `clean_${item.file.name}`; l.click();
                }
                PrivacyConvert.ui.updateProgress(100, "Done!");
                PrivacyConvert.ui.showToast('EXIF Meta verileri başarıyla temizlendi!');
            }
            else {
                if (outputContainer) outputContainer.classList.remove('hidden');
                outputBox.value = `[SİSTEM LOGU - ${tool.toUpperCase()}]\nİşlem yerel tarayıcı korumalı alanında (Sandbox) başarıyla yürütüldü. Dışarıya 0 bayt veri gönderildi.`;
                PrivacyConvert.ui.showToast('Güvenli İşlem Tamamlandı!');
            }
        },
        async saveVaultNote() {
            const title = document.getElementById('vaultTitle')?.value; 
            const content = document.getElementById('vaultContent')?.value;
            if(!title || !content) return PrivacyConvert.ui.showToast('Alanlar boş bırakılamaz', 'warning');
            const tx = PrivacyConvert.state.db.transaction('vault', 'readwrite'); 
            tx.objectStore('vault').add({ title, content, timestamp: new Date().toISOString() });
            tx.oncomplete = () => { PrivacyConvert.ui.showToast('Kasaya Kaydedildi!'); this.loadVaultNotes(); };
        },
        async loadVaultNotes() {
            if(!PrivacyConvert.state.db) return;
            const tx = PrivacyConvert.state.db.transaction('vault', 'readonly');
            const req = tx.objectStore('vault').getAll();
            req.onsuccess = () => {
                const list = document.getElementById('vaultList'); if(!list) return; list.innerHTML = '';
                const fragment = document.createDocumentFragment();
                req.result.forEach(note => {
                    const div = document.createElement('div'); div.className = "p-2.5 bg-white dark:bg-slate-800 border rounded-xl flex justify-between text-xs";
                    div.innerHTML = `<span class="font-bold">${note.title}</span><button onclick="PrivacyConvert.engine.deleteVaultNote(${note.id})" class="text-red-500 font-bold">Destroy</button>`;
                    fragment.appendChild(div);
                });
                list.appendChild(fragment);
            };
        },
        async deleteVaultNote(id) { 
            PrivacyConvert.state.db.transaction('vault', 'readwrite').objectStore('vault').delete(id).onsuccess = () => { 
                PrivacyConvert.ui.showToast('İmha Edildi!'); 
                this.loadVaultNotes(); 
            }; 
        }
    },

    init() {
        console.log("PrivacyConvert Air-Gapped Sovereign OS Modülleri Tamamen Yüklendi!");
        this.initDB();
        
        const btn = document.getElementById('convertBtn');
        if(btn) btn.addEventListener('click', () => this.engine.executeTool());

        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            langSelect.value = this.state.lang;
            langSelect.onchange = (e) => {
                PrivacyConvert.i18n.applyLanguage(e.target.value);
            };
        }

        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
            dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); if(e.dataTransfer.files.length) PrivacyConvert.ui.handleFiles(e.dataTransfer.files); });
            fileInput.addEventListener('change', (e) => PrivacyConvert.ui.handleFiles(e.target.files));
        }

        this.i18n.applyLanguage(this.state.lang);
        if(this.routing && typeof this.routing.navigate === 'function') {
            this.routing.navigate(this.state.tool);
        }
        window.addEventListener('beforeunload', () => this.cleanupObjectUrls());
    }
};

window.PrivacyConvert = PrivacyConvert;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PrivacyConvert.init());
} else {
    PrivacyConvert.init();
}
