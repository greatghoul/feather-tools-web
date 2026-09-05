import { render, h } from 'preact';
import { useState } from "preact/hooks";
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';
import { DEFAULT_RESIZE_SETTING } from '@/components/ResizeSetting.js';

setup(h);

const ResizeImages = () => {
    const [images, setImages] = useState([]);
    const [settings, setSettings] = useState([DEFAULT_RESIZE_SETTING]);

    return html`
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <${InputCard}
                    images=${images}
                    settings=${settings}
                    onImagesChange=${setImages}
                    onSettingsChange=${setSettings}
                />
            </div>
            <div class="col-md-6 col-lg-8">
              <${ResultCard} images=${images} settings=${settings} />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${ResizeImages} />`, document.getElementById('app'));
});