import { render, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';
import { DEFAULT_PALETTE_SETTING } from '@/components/PaletteSetting.js';

setup(h);

const PALETTE_SETTING_STORAGE_KEY = 'image-palette:setting';

const readStoredSetting = () => {
    try {
        const raw = window.localStorage.getItem(PALETTE_SETTING_STORAGE_KEY);
        if (!raw) return DEFAULT_PALETTE_SETTING;
        const parsed = JSON.parse(raw);
        return {
            colorCount: Number.isFinite(parsed?.colorCount) ? parsed.colorCount : DEFAULT_PALETTE_SETTING.colorCount,
            sortBy: parsed?.sortBy || DEFAULT_PALETTE_SETTING.sortBy
        };
    } catch (error) {
        return DEFAULT_PALETTE_SETTING;
    }
};

const ImagePalette = () => {
    const [images, setImages] = useState([]);
    const [setting, setSetting] = useState(readStoredSetting);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        window.localStorage.setItem(PALETTE_SETTING_STORAGE_KEY, JSON.stringify(setting));
        if (images.length > 0) {
            setProcessingKey(prev => prev + 1);
        }
    }, [images]);

    useEffect(() => {
        window.localStorage.setItem(PALETTE_SETTING_STORAGE_KEY, JSON.stringify(setting));
    }, [setting]);

    return html`
        <div class="row mb-3">
            <div class="col-md-6 col-lg-4">
                <${InputCard}
                    images=${images}
                    setting=${setting}
                    onImagesChange=${setImages}
                    onSettingChange=${setSetting}
                />
            </div>
            <div class="col-md-6 col-lg-8">
                <${ResultCard}
                    images=${images}
                    setting=${setting}
                    processingKey=${processingKey}
                />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${ImagePalette} />`, document.getElementById('app'));
});
