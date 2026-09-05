import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import SettingForm from '../components/SettingForm';
import { useStore } from '~/contexts/StoreContext';
import SequenceNumber from '../services/SequenceNumber';
import { t } from '~/helpers/i18n';

const sequenceService = new SequenceNumber();

const InputCard = ({ 
    onImagesAdd,
    onImagesChange,
    onSettingsChange,
    images,
    settings,
}) => {
    const [activeTab, setActiveTab] = useState('upload');
    const { isProcessing } = useStore() as any;

    const renderBadge = (image, index) => {
        return sequenceService.generateNumber(settings.numberType, index + settings.numberStart);
    };

    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')} title={t('number-images/input/upload')}>
                            <i className="bi bi-upload"></i>
                            <span className="ms-1">{t('number-images/input/upload')}</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={t('number-images/input/settings')}>
                            <i className="bi bi-gear"></i>
                            <span className="ms-1">{t('number-images/input/settings')}</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            {activeTab === 'upload' ? (
<>

                <div className="card-body">
                    <ImageUploadZone disabled={undefined} onChange={onImagesAdd} />
                </div>
                <ImageList images={images} disabled={isProcessing} onChange={onImagesChange} itemBadge={renderBadge} />
            
</>
) : (
<>

                <div className="card-body">
                    <SettingForm settings={settings} onChange={onSettingsChange} />
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default InputCard;
