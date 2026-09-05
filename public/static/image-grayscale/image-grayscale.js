import { render, h } from 'preact';
import { useState } from "preact/hooks";
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';

setup(h);

const ImageGrayscale = () => {
    const [images, setImages] = useState([]);

    return html`
        <div class="row mb-3">
            <div class="col-md-6 col-lg-4">
                <${InputCard}
                    images=${images}
                    onImagesChange=${setImages}
                />
            </div>
            <div class="col-md-6 col-lg-8">
              <${ResultCard}
                  images=${images}
              />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${ImageGrayscale} />`, document.getElementById('app'));
});
