import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { setup } from 'goober';

setup(h);

// Local Components
import InputCard from '@/components/InputCard.js';
import EditorCard from '@/components/EditorCard.js';

const App = () => {
    const [images, setImages] = useState([]);
    const settings = { blockSize: 20 };

    const handleDownload = useCallback((dataURL, imageName) => {
        const a = document.createElement('a');
        a.href = dataURL;
        const filename = imageName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        a.download = `pixelated-${filename}`;
        document.body.appendChild(a);
        document.body.removeChild(a);
    }, []);

    return html`
        <div class="pixelate-images-container">
            <${InputCard} 
                onImagesChange=${setImages}
            />
            ${images.length > 0 && html`
                ${images.map(image => html`
                    <${EditorCard}
                        key=${image.id}
                        image=${image}
                        settings=${settings}
                        onDownload=${handleDownload}
                    />
                `)}
            `}
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
