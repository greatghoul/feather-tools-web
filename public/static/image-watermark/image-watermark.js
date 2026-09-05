import { html } from 'htm/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { StoreContext } from '~/contexts/StoreContext.js';
import InputCard from '@/components/InputCard.js';
import ResultCard from '@/components/ResultCard.js';
import { DEFAULT_SETTINGS } from '@/components/SettingForm.js';

const App = () => {
    const [images, setImages] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleImagesAdd = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
        setHasChanges(true);
    };

    const handleImagesChange = (changedImages) => {
        setImages(changedImages);
        setHasChanges(true);
    };

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
        setHasChanges(true);
    };

    const store = {
        isProcessing,
        setIsProcessing,
        hasChanges,
        setHasChanges
    };

    return html`
        <${StoreContext.Provider} value=${store}>
            <div class="row mb-4">
                <div class="col-md-6 col-lg-4">
                    <${InputCard}
                        images=${images}
                        settings=${settings}
                        onImagesAdd=${handleImagesAdd}
                        onImagesChange=${handleImagesChange}
                        onSettingsChange=${handleSettingsChange}
                    />
                </div>
                <div class="col-md-6 col-lg-8">
                    <${ResultCard} images=${images} settings=${settings} />
                </div>
            </div>
        </${StoreContext.Provider}>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});