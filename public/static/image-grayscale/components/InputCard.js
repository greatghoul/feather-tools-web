import { html } from 'htm/preact';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ images, onImagesChange }) => {
    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-images me-1"></i>
                            ${getText('image-grayscale/input/images')}
                        </a>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <${ImageUploadZone} onChange=${onImagesChange} />
            </div>
            <${ImageList} images=${images} sortable=${false} onChange=${onImagesChange} />
        </div>
    `;
};

export default InputCard;
