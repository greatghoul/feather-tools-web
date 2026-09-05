import { useState } from 'react';
import { t } from '~/helpers/i18n';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import SettingsForm from '../components/SettingsForm';

const PrepareCard = ({ images, settings, sizes, onImagesAdd, onImagesReorder, onSettingsChange }) => {
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
                    <ImageUploadZone disabled={false} onChange={onImagesAdd} />
                </div>
                <ImageList images={images} disabled={false} onChange={onImagesReorder} itemBadge={undefined} />
            
</>
);
        } else {
            return (
<>

                <div className="card-body">
                    <SettingsForm settings={settings} sizes={sizes} disabled={false} onSettingsChange={onSettingsChange} />
                </div>
            
</>
);
        }
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    {renderNavItem('images', t('merge-images/tab/images'), 'images')}
                    {renderNavItem('settings', t('merge-images/tab/settings'), 'gear')}
                </ul>
            </div>
            {renderTabContent()}
        </div>
    
</>
);
};

export default PrepareCard;
