import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import RoundCornerSetting, { DEFAULT_ROUND_CORNER_SETTING } from '../components/RoundCornerSetting';
import { t } from '~/helpers/i18n';

const InputCard = ({ images, setting, onImagesChange, onSettingChange }) => {
    const [activeTab, setActiveTab] = useState('images');
    const [formSetting, setFormSetting] = useState(setting);

    const handleSettingChange = (newSetting) => {
        setFormSetting(newSetting);
        onSettingChange(newSetting);
    };

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
                    <ImageUploadZone disabled={undefined} onChange={onImagesChange} />
                </div>        
                <ImageList images={images} disabled={false} onChange={onImagesChange} itemBadge={undefined} />
            
</>
);
        } else {
            return (
<>

                <RoundCornerSetting setting={formSetting} onChange={handleSettingChange} />
            
</>
);
        }
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    {renderNavItem('images', t('image-round-corner/input/images'), 'images')}
                    {renderNavItem('settings', t('image-round-corner/input/settings'), 'gear')}
                </ul>
            </div>
            {renderTabContent()}
        </div>
    
</>
);
};

export default InputCard;
