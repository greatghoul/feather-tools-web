import { render, h } from 'preact';
import { useState, useEffect } from "preact/hooks";
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';
import { DEFAULT_COMPRESS_SETTING } from '@/components/CompressSetting.js';

setup(h);

const ImageCompress = () => {
    const [images, setImages] = useState([]);
    const [setting, setSetting] = useState(DEFAULT_COMPRESS_SETTING);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        if (images.length > 0) {
            setProcessingKey(prev => prev + 1);
        }
    }, [images]);

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
    render(html`<${ImageCompress} />`, document.getElementById('app'));
});
