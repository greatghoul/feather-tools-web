import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import CompressSettingCard from './CompressSetting';
import { DEFAULT_COMPRESS_SETTING, type CompressSetting, type UploadedImage } from '../types';
import { t } from '~/helpers/i18n';

interface InputCardProps {
    images: UploadedImage[];
    setting: CompressSetting;
    onImagesChange: (images: UploadedImage[]) => void;
    onSettingChange: (setting: CompressSetting) => void;
}

const InputCard = ({ images, setting, onImagesChange, onSettingChange }: InputCardProps) => {
    const [activeTab, setActiveTab] = useState<'images' | 'settings'>('images');

    const renderNavItem = (tab: 'images' | 'settings', label: string, icon: string) => (
        <li className="nav-item">
            <a
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab);
                }}
            >
                <i className={`bi bi-${icon} me-1`} />
                {label}
            </a>
        </li>
    );

    return (
        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    {renderNavItem('images', t('image-compress/input/images'), 'images')}
                    {renderNavItem('settings', t('image-compress/input/settings'), 'sliders')}
                </ul>
            </div>
            {activeTab === 'images' ? (
                <>
                    <div className="card-body">
                        <ImageUploadZone disabled={undefined} onChange={onImagesChange} />
                    </div>
                    <ImageList images={images} disabled={false} onChange={onImagesChange} itemBadge={undefined} />
                </>
            ) : (
                <CompressSettingCard setting={setting} onChange={onSettingChange} />
            )}
        </div>
    );
};

export default InputCard;
