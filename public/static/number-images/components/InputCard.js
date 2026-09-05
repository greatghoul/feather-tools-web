import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import SettingForm from '@/components/SettingForm.js';
import { useStore } from '~/contexts/StoreContext.js';
import SequenceNumber from '@/services/SequenceNumber.js';
import { getText } from '~/helpers/utils.js';

const sequenceService = new SequenceNumber();

const InputCard = ({ 
    onImagesAdd,
    onImagesChange,
    onSettingsChange,
    images,
    settings,
}) => {
    const [activeTab, setActiveTab] = useState('upload');
    const { isProcessing } = useStore();

    const renderBadge = (image, index) => {
        return sequenceService.generateNumber(settings.numberType, index + settings.numberStart);
    };

    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a 
                            class="nav-link ${activeTab === 'upload' ? 'active' : ''}"
                            onClick=${() => setActiveTab('upload')}
                            title=${getText('number-images/input/upload')}
                        >
                            <i class="bi bi-upload"></i>
                            <span class="ms-1">${getText('number-images/input/upload')}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a 
                            class="nav-link ${activeTab === 'settings' ? 'active' : ''}"
                            onClick=${() => setActiveTab('settings')}
                            title=${getText('number-images/input/settings')}
                        >
                            <i class="bi bi-gear"></i>
                            <span class="ms-1">${getText('number-images/input/settings')}</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            ${activeTab === 'upload' ? html`
                <div class="card-body">
                    <${ImageUploadZone} onChange=${onImagesAdd} />
                </div>
                <${ImageList} images=${images} disabled=${isProcessing} onChange=${onImagesChange} itemBadge=${renderBadge} />
            ` : html`
                <div class="card-body">
                    <${SettingForm} settings=${settings} onChange=${onSettingsChange} />
                </div>
            `}
        </div>
    `;
};

export default InputCard;