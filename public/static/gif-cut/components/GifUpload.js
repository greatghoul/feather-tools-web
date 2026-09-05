import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const GifUpload = ({ onFileLoad }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileLoad(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onFileLoad(file);
    };

    const handleClick = () => {
        document.getElementById('gif-input').click();
    };

    return html`
        <div
            class="gif-upload-zone d-flex flex-column align-items-center justify-content-center p-5"
            onDragOver=${handleDragOver}
            onDrop=${handleDrop}
            onClick=${handleClick}
        >
            <p class="mb-3">
                <i class="bi bi-file-image" style="font-size: 3rem;"></i>
            </p>
            <p class="text-muted mb-3">${getText('gif-cut/upload/hint')}</p>
            <p class="text-muted small mb-3">${getText('gif-cut/upload/formats')}</p>
            <input
                type="file"
                accept=".gif,image/gif"
                style="display: none;"
                id="gif-input"
                onChange=${handleFileChange}
            />
            <button class="btn btn-primary" onClick=${(e) => { e.stopPropagation(); handleClick(); }}>
                ${getText('gif-cut/button/load')}
            </button>
        </div>
    `;
};

export default GifUpload;
