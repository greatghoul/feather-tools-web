import { render, h } from 'preact';
import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';

setup(h);

const QRCodeDecode = () => {
    const [images, setImages] = useState([]);
    const [results, setResults] = useState({});

    const handleImagesChange = (newImages) => {
        setImages(newImages);
    };

    const handleAppendImages = (newImages) => {
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleResult = (id, result) => {
        setResults((prev) => ({ ...prev, [id]: result }));
    };

    return html`
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <${InputCard} images=${images} onImagesChange=${handleImagesChange} onAppendImages=${handleAppendImages} />
            </div>
            <div class="col-md-6 col-lg-8">
                <${ResultCard}
                    images=${images}
                    results=${results}
                    onResult=${handleResult}
                />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${QRCodeDecode} />`, document.getElementById('app'));
});
