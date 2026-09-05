import { render, h } from 'preact';
import { useState } from "preact/hooks";
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';

setup(h);

const ImageRotation = () => {
    const [images, setImages] = useState([]);

    return html`
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <${InputCard} images=${images} onImagesChange=${setImages} />
            </div>
            <div class="col-md-6 col-lg-8">
              <${ResultCard} images=${images} onImagesChange=${setImages} />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${ImageRotation} />`, document.getElementById('app'));
});
