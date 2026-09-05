import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState } from 'preact/hooks';
import { setup } from 'goober';
import { getText } from '~/helpers/utils.js';

setup(h);

import ImageUploadZone from '~/components/ImageUploadZone.js';
import AnnotationCanvas from '@/components/AnnotationCanvas.js';

const App = () => {
    const [images, setImages] = useState([]);

    return html`
        <div class="image-annotation-container">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">${getText('image-annotation/upload/title')}</h5>
                </div>
                <div class="card-body">
                    <${ImageUploadZone} onChange=${setImages} />
                </div>
            </div>
            ${images.length > 0 && images.map((image) => html`
                <${AnnotationCanvas}
                    key=${image.id}
                    image=${image}
                />
            `)}
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
