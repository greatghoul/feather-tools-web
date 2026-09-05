import { useState } from 'react';
import { t } from '~/helpers/i18n';
import styles from './SettingCard.module.css';

const TABS = [
    { key: 'image', labelKey: 'image-placeholder/settings/section_image' },
    { key: 'text', labelKey: 'image-placeholder/settings/section_text' },
    { key: 'border', labelKey: 'image-placeholder/settings/section_border' },
];

const SettingCard = ({ settings, onChange }) => {
    const [activeTab, setActiveTab] = useState('image');

    const handleNumChange = (key) => (e) => {
        onChange(key, parseInt(e.target.value, 10) || 0);
    };

    const handleStrChange = (key) => (e) => {
        onChange(key, e.target.value);
    };

    return (
<>

        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">{t('image-placeholder/settings/title')}</h5>
            </div>
            <div className={`card-body ${styles.bodyClass}`}>
                <ul className={`nav nav-pills ${styles.navPillsClass}`} role="tablist">
                    {TABS.map((tab) => (
<>

                        <li className="nav-item" role="presentation">
                            <button className={`nav-link ${activeTab === tab.key && 'active'} ${styles.navLinkClass}`} onClick={() => setActiveTab(tab.key)} role="tab">
                                {t(tab.labelKey)}
                            </button>
                        </li>
                    
</>
))}
                </ul>

                <div className={`tab-content ${styles.tabContentClass}`}>
                    {/* Image */}
                    <div className={`tab-pane ${activeTab === 'image' && 'active'}`} role="tabpanel">
                        <div className="row">
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="width" className="form-label">
                                        {t('image-placeholder/settings/width')}
                                    </label>
                                    <input type="number" className="form-control" id="width" min="1" max="4096" value={settings.width} onInput={handleNumChange('width')} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="height" className="form-label">
                                        {t('image-placeholder/settings/height')}
                                    </label>
                                    <input type="number" className="form-control" id="height" min="1" max="4096" value={settings.height} onInput={handleNumChange('height')} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="bgColor" className="form-label">
                                        {t('image-placeholder/settings/bg_color')}
                                    </label>
                                    <input type="color" className="form-control form-control-color" id="bgColor" value={settings.bgColor} onInput={handleStrChange('bgColor')} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="format" className="form-label">
                                        {t('image-placeholder/settings/format')}
                                    </label>
                                    <select className="form-select" id="format" value={settings.format} onChange={handleStrChange('format')}>
                                        <option value="png">PNG</option>
                                        <option value="jpeg">JPEG</option>
                                        <option value="webp">WebP</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className={`tab-pane ${activeTab === 'text' && 'active'}`} role="tabpanel">
                        <div className={styles.formGroupClass}>
                            <label htmlFor="text" className="form-label">
                                {t('image-placeholder/settings/text')}
                            </label>
                            <input type="text" className="form-control" id="text" placeholder={t('image-placeholder/settings/text_placeholder')} value={settings.text} onInput={handleStrChange('text')} />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="textColor" className="form-label">
                                        {t('image-placeholder/settings/text_color')}
                                    </label>
                                    <input type="color" className="form-control form-control-color" id="textColor" value={settings.textColor} onInput={handleStrChange('textColor')} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="fontSize" className="form-label">
                                        {t('image-placeholder/settings/font_size')}
                                    </label>
                                    <input type="number" className="form-control" id="fontSize" min="0" max="500" placeholder={t('image-placeholder/settings/auto_font_size')} value={settings.fontSize} onInput={handleNumChange('fontSize')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Border */}
                    <div className={`tab-pane ${activeTab === 'border' && 'active'}`} role="tabpanel">
                        <div className="row">
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="borderWidth" className="form-label">
                                        {t('image-placeholder/settings/border_width')}
                                    </label>
                                    <input type="number" className="form-control" id="borderWidth" min="0" max="200" value={settings.borderWidth} onInput={handleNumChange('borderWidth')} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="borderRadius" className="form-label">
                                        {t('image-placeholder/settings/border_radius')}
                                    </label>
                                    <input type="number" className="form-control" id="borderRadius" min="0" max="999" value={settings.borderRadius} onInput={handleNumChange('borderRadius')} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="borderColor" className="form-label">
                                        {t('image-placeholder/settings/border_color')}
                                    </label>
                                    <input type="color" className="form-control form-control-color" id="borderColor" value={settings.borderColor} onInput={handleStrChange('borderColor')} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={styles.formGroupClass}>
                                    <label htmlFor="borderStyle" className="form-label">
                                        {t('image-placeholder/settings/border_style')}
                                    </label>
                                    <select className="form-select" id="borderStyle" value={settings.borderStyle} onChange={handleStrChange('borderStyle')}>
                                        <option value="solid">{t('image-placeholder/settings/border_style_solid')}</option>
                                        <option value="dashed">{t('image-placeholder/settings/border_style_dashed')}</option>
                                        <option value="dotted">{t('image-placeholder/settings/border_style_dotted')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingCard;
