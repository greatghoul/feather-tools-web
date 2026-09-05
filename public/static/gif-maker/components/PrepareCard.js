import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import ImageUploadZone from '~/components/ImageUploadZone.js';
import ImageList from '~/components/ImageList.js';
import GifSettings from '@/components/GifSettings.js';

const PrepareCard = ({ images, settings, maxWidth, isGenerating, onImagesAdd, onImagesReorder, onSettingsChange }) => {
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
                        disabled=${isGenerating}
                        onChange=${onImagesAdd}
                    />
                </div>
                <${ImageList}
                    images=${images}
                    disabled=${isGenerating}
                    onChange=${onImagesReorder}
                />
            `;
        }

        return html`
            <${GifSettings}
                settings=${settings}
                maxWidth=${maxWidth}
                isGenerating=${isGenerating}
                onSettingsChange=${onSettingsChange}
            />
        `;
    };

    return html`
        <div class="card mb-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                    ${renderNavItem('images', getText('gif-maker/tab/images'), 'images')}
                    ${renderNavItem('settings', getText('gif-maker/tab/settings'), 'gear')}
                </ul>
            </div>
            ${renderTabContent()}
        </div>
    `;
};

export default PrepareCard;
