// src/main.js
import { cryptoCore } from './cryptoCore.js';
import { aiEngine } from './aiCore.js';

document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convertBtn');
    const inputField = document.getElementById('mainInputField');
    const outputBox = document.getElementById('genericTextArea');
    const outputContainer = document.getElementById('genericTextBox');

    if (convertBtn) {
        convertBtn.addEventListener('click', async () => {
            const text = inputField ? inputField.value : '';
            if (!text) return;

            if (outputContainer) outputContainer.classList.remove('hidden');
            
            // Örnek PII Maskeleme İşlemi
            const result = await aiEngine.maskPII(text);
            if (outputBox) outputBox.value = result;
        });
    }
});
