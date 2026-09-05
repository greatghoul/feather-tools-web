import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import ResizeSetting, { DEFAULT_RESIZE_SETTING } from '../components/ResizeSetting';
import { t } from '~/helpers/i18n';

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

    const renderResizeSetting = (setting, index) => (
<>

        <ResizeSetting setting={setting} index={index} onChange={handleUpdateSetting} onRemove={handleRemoveSetting} canRemove={!isSingleSetting} />
    
</>
);

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

                <ul className="list-group list-group-flush">
                    {formSettings.map(renderResizeSetting)}
                </ul>
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <span>
                        {t('resize-images/input/sizes')} ({formSettings.length})
                    </span>
                    <button className="btn btn-outline-success btn-sm" onClick={handleAddSetting}>
                        {t('resize-images/input/add_setting')}
                    </button>
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
                    {renderNavItem('images', t('resize-images/input/images'), 'images')}
                    {renderNavItem('settings', t('resize-images/input/settings'), 'gear')}
                </ul>
            </div>
            {renderTabContent()}
        </div>
    
</>
);
};

export default InputCard;
