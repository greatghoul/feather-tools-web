import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import ResizeSetting, { DEFAULT_RESIZE_SETTING } from '@/components/ResizeSetting.js';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ images, settings, onImagesChange, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState('images');
    const [formSettings, setFormSettings] = useState(settings);
    const isSingleSetting = formSettings.length === 1;

    const handleAddSetting = () => {
        const newFormSetting = { ...DEFAULT_RESIZE_SETTING };
        setFormSettings([...formSettings, newFormSetting]);
    };

    const handleUpdateSetting = (setting, index) => {
        const newFormSettings = [...formSettings];
        newFormSettings[index] = setting;
        setFormSettings(newFormSettings);
        onSettingsChange(newFormSettings);
    };

    const handleRemoveSetting = (index) => {
        const newFormSettings = [...formSettings];
        newFormSettings.splice(index, 1);
        setFormSettings(newFormSettings);
        onSettingsChange(newFormSettings);
    }
    
    const renderNavItem = (tab, label, icon) => {
        return html`
            <li class="nav-item">
                <a 
                    class="nav-link ${activeTab === tab ? 'active' : ''}" 
                    href="#" 
                    onClick=${() => setActiveTab(tab)}
                >
                    <i class="bi bi-${icon} me-1"></i>
                    ${label}
                </a>
            </li>
        `;
    };

    const renderResizeSetting = (setting, index) => html`
        <${ResizeSetting}
            setting=${setting}
            index=${index}
            onChange=${handleUpdateSetting}
            onRemove=${handleRemoveSetting}
            canRemove=${!isSingleSetting}
        />
    `;

    const renderTabContent = () => {
        if (activeTab === 'images') {
            return html`
                <div class="card-body">
                    <${ImageUploadZone} onChange=${onImagesChange} />
                </div>        
                <${ImageList} images=${images} disabled=${false} onChange=${onImagesChange} />
            `;
        } else {
            return html`
                <ul class="list-group list-group-flush">
                    ${formSettings.map(renderResizeSetting)}
                </ul>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <span>
                        ${getText('resize-images/input/sizes')} (${formSettings.length})
                    </span>
                    <button class="btn btn-outline-success btn-sm" onClick=${handleAddSetting}>
                        ${getText('resize-images/input/add_setting')}
                    </button>
                </div>
            `;
        }
    };

    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    ${renderNavItem('images', getText('resize-images/input/images'), 'images')}
                    ${renderNavItem('settings', getText('resize-images/input/settings'), 'gear')}
                </ul>
            </div>
            ${renderTabContent()}
        </div>
    `;
};

export default InputCard;