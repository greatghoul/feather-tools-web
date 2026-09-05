import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import SettingForm from '../components/SettingForm';
import { useStore } from '~/contexts/StoreContext';
import { t } from '~/helpers/i18n';

const InputCard = ({ 
    onImagesAdd,
    onImagesChange,
    onSettingsChange,
    images,
    settings,
}) => {
    const [activeTab, setActiveTab] = useState('upload');
    const { isProcessing } = useStore() as any;

    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')} title={t('image-watermark/input/images')}>
                            <i className="bi bi-upload"></i>
                            <span className="ms-1">{t('image-watermark/input/images')}</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={t('image-watermark/input/settings')}>
                            <i className="bi bi-gear"></i>
                            <span className="ms-1">{t('image-watermark/input/settings')}</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            {activeTab === 'upload' ? (
<>

                <div className="card-body">
                    <ImageUploadZone disabled={undefined} onChange={onImagesAdd} />
                </div>
                <ImageList images={images} onChange={onImagesChange} disabled={false} itemBadge={undefined} />
            
</>
) : (
<>

                <div className="card-body">
                    <SettingForm settings={settings} onChange={onSettingsChange} disabled={isProcessing} />
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default InputCard;
