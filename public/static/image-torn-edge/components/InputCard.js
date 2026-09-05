import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import TornEdgeSetting, { DEFAULT_TORN_SETTING } from '@/components/TornEdgeSetting.js';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ images, setting, onImagesChange, onSettingChange }) => {
    const [activeTab, setActiveTab] = useState('images');
    const [formSetting, setFormSetting] = useState(setting);

    const handleSettingChange = (newSetting) => {
        setFormSetting(newSetting);
        onSettingChange(newSetting);
    };

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
                <${TornEdgeSetting}
                    setting=${formSetting}
                    onChange=${handleSettingChange}
                />
            `;
        }
    };

    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    ${renderNavItem('images', getText('image-torn-edge/input/images'), 'images')}
                    ${renderNavItem('settings', getText('image-torn-edge/input/settings'), 'gear')}
                </ul>
            </div>
            ${renderTabContent()}
        </div>
    `;
};

export default InputCard;
