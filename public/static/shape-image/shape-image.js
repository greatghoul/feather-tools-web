import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState } from 'preact/hooks';
import { setup } from 'goober';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ResultCard from '@/components/ResultCard.js';

setup(h);

const App = () => {
    const [image, setImage] = useState(null);

    const handleImageChange = (images) => {
        if (images.length > 0) {
            setImage(images[0]);
        }
    };

    return html`
        <div class="shape-image-app mb-3">
            ${image ? html`
                <${ResultCard} image=${image} onClear=${() => setImage(null)} />
            ` : html`
                <${ImageUploadZone} onChange=${handleImageChange} />
            `}
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
