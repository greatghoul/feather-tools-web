import { useState } from 'react';
import { t } from '~/helpers/i18n';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import GifSettings from '../components/GifSettings';

const PrepareCard = ({ images, settings, maxWidth, isGenerating, onImagesAdd, onImagesReorder, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState('images');

    const renderNavItem = (tab, label, icon) => {
        return (
<>

            <li className="nav-item">
                <a className={`nav-link ${activeTab === tab ? 'active' : ''}`} href="#" onClick={() => setActiveTab(tab)}>
                    <i className={`bi bi-${icon} me-1`}></i>
                    {label}
                </a>
            </li>
        
</>
);
    };

    const renderTabContent = () => {
        if (activeTab === 'images') {
            return (
<>

                <div className="card-body">
                    <ImageUploadZone disabled={isGenerating} onChange={onImagesAdd} />
                </div>
                <ImageList images={images} disabled={isGenerating} onChange={onImagesReorder} itemBadge={undefined} />
            
</>
);
        }

        return (
<>

            <GifSettings settings={settings} maxWidth={maxWidth} isGenerating={isGenerating} onSettingsChange={onSettingsChange} />
        
</>
);
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    {renderNavItem('images', t('gif-maker/tab/images'), 'images')}
                    {renderNavItem('settings', t('gif-maker/tab/settings'), 'gear')}
                </ul>
            </div>
            {renderTabContent()}
        </div>
    
</>
);
};

export default PrepareCard;
