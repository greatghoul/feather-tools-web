import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import SettingsForm from '@/components/SettingsForm.js';

const PrepareCard = ({ images, settings, sizes, onImagesAdd, onImagesReorder, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState('images');

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
                    <${ImageUploadZone}
                        disabled=${false}
                        onChange=${onImagesAdd}
                    />
                </div>
                <${ImageList}
                    images=${images}
                    disabled=${false}
                    onChange=${onImagesReorder}
                />
            `;
        } else {
            return html`
                <div class="card-body">
                    <${SettingsForm}
                        settings=${settings}
                        sizes=${sizes}
                        disabled=${false}
                        onSettingsChange=${onSettingsChange}
                    />
                </div>
            `;
        }
    };

    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    ${renderNavItem('images', getText('merge-images/tab/images'), 'images')}
                    ${renderNavItem('settings', getText('merge-images/tab/settings'), 'gear')}
                </ul>
            </div>
            ${renderTabContent()}
        </div>
    `;
};

export default PrepareCard;