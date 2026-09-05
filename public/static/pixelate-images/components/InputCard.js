import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

import ImageUploadZone from '~/components/ImageUploadZone.js';

const InputCard = ({ onImagesChange }) => {
    return html`
        <div class="card mb-3">
            <div class="card-header">
                <h5 class="mb-0">${getText('pixelate-images/button/upload_images')}</h5>
            </div>
            <div class="card-body">
                <${ImageUploadZone} onChange=${onImagesChange} multiple=${true} />
            </div>
        </div>
    `;
};

export default InputCard;