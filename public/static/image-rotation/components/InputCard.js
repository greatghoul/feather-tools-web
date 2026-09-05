import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ images, onImagesChange }) => {
    return html`
        <div class="card mb-3">
            <div class="card-header">
                <i class="bi bi-images me-1"></i>
                ${getText('image-rotation/input/images')}
            </div>
            <div class="card-body">
                <${ImageUploadZone} onChange=${onImagesChange} />
            </div>        
            <${ImageList} images=${images} disabled=${false} onChange=${onImagesChange} />
        </div>
    `;
};

export default InputCard;
