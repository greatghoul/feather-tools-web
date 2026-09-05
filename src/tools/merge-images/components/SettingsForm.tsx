import { t } from '~/helpers/i18n';
import styles from './SettingsForm.module.css';

export const DEFAULT_SETTINGS = {
    direction: 'vertical', // 'horizontal' or 'vertical'
    width: 'max',          // 'max', 'min', or number value
    height: 'auto',        // 'auto', 'max', 'min', or number value
    bgColor: '#cccadb',    // background color
    margin: 10,             // margin in pixels
    padding: 10            // padding between images in pixels
};

const SettingsForm = ({ settings, sizes, disabled, onSettingsChange }) => {
    const handleDirectionChange = (direction) => {
        // 当切换合并方向时，自动设置对应的width和height值
        const newSettings = {
            ...settings,
            direction: direction
        };
        
        // 垂直模式下：width可选值为max/min/数值，height设为auto
        if (direction === 'vertical') {
            newSettings.width = 'max';
            newSettings.height = 'auto';
        }
        // 水平模式下：width设为auto，height可选值为max/min/数值
        else if (direction === 'horizontal') {
            newSettings.width = 'auto';
            newSettings.height = 'max';
        }
        
        onSettingsChange(newSettings);
    };

    const handleWidthChange = (value) => {
        onSettingsChange({
            ...settings,
            width: value
        });
    };

    const handleHeightChange = (value) => {
        onSettingsChange({
            ...settings,
            height: value
        });
    };

    const handleFixedWidthInputChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            width: value
        });
    };

    const handleFixedHeightInputChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            height: value
        });
    };

    const handleMarginChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            margin: value
        });
    };

    const handlePaddingChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        onSettingsChange({
            ...settings,
            padding: value
        });
    };

    const handleBgColorChange = (e) => {
        onSettingsChange({
            ...settings,
            bgColor: e.target.value
        });
    };

    const isVertical = settings.direction === 'vertical';

    return (
<>

        <div className={`settings-form ${styles.settingsCardStyle}`}>
            {/* Merge Direction */}
            <div className="mb-4">
                <label className="form-label mb-2">{t('merge-images/setting/merge_direction')}</label>
                <div className={styles.directionRadioStyle}>
                    <div className="form-check form-check-inline">
                        <input type="radio" id="direction-vertical" name="direction" value="vertical" className="form-check-input" checked={settings.direction === 'vertical'} onChange={() => handleDirectionChange('vertical')} disabled={disabled} />
                        <label htmlFor="direction-vertical">{t('merge-images/direction/vertical')}</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input type="radio" id="direction-horizontal" name="direction" value="horizontal" className="form-check-input" checked={settings.direction === 'horizontal'} onChange={() => handleDirectionChange('horizontal')} disabled={disabled} />
                        <label htmlFor="direction-horizontal">{t('merge-images/direction/horizontal')}</label>
                    </div>
                </div>
            </div>

            {/* Image Width Settings (Visible only in vertical mode) */}
            {isVertical && (
<>

                <div className="mb-4">
                    <label className="form-label mb-2">{t('merge-images/setting/image_width')}</label>
                    <div className="mb-2">
                        <div className="form-check">
                            <input type="radio" id="width-max" name="width" value="max" checked={settings.width === 'max'} onChange={() => handleWidthChange('max')} disabled={disabled} className="form-check-input" />
                            <label htmlFor="width-max" className="form-check-label">{t('merge-images/setting/use_max_width')} ({sizes.maxWidth}px)</label>
                        </div>
                        <div className="form-check">
                            <input type="radio" id="width-min" name="width" value="min" checked={settings.width === 'min'} onChange={() => handleWidthChange('min')} disabled={disabled} className="form-check-input" />
                            <label htmlFor="width-min" className="form-check-label">{t('merge-images/setting/use_min_width')} ({sizes.minWidth}px)</label>
                        </div>
                        <div className="form-check">
                            <input type="radio" id="width-fixed" name="width" value="fixed" checked={typeof settings.width === 'number'} onChange={() => handleWidthChange(sizes.maxWidth)} disabled={disabled} className="form-check-input" />
                            <label htmlFor="width-fixed" className="form-check-label">{t('merge-images/setting/use_fixed_width')}</label>
                        </div>
                        {typeof settings.width === 'number' && (
<>

                            <div className="ms-4 mt-1">
                                <input type="number" className="form-control" placeholder={`${t('merge-images/placeholder/fixed_width')}`} value={settings.width || ''} onChange={handleFixedWidthInputChange} disabled={disabled} min="1" />
                            </div>
                        
</>
)}
                    </div>
                </div>
            
</>
)}

            {/* Image Height Settings (Visible only in horizontal mode) */}
            {!isVertical && (
<>

                <div className="mb-4">
                    <label className="form-label mb-2">{t('merge-images/setting/image_height')}</label>
                    <div className="mb-2">
                        <div className="form-check">
                            <input type="radio" id="height-max" name="height" value="max" checked={settings.height === 'max'} onChange={() => handleHeightChange('max')} disabled={disabled} className="form-check-input" />
                            <label htmlFor="height-max" className="form-check-label">{t('merge-images/setting/use_max_height')} ({sizes.maxHeight}px)</label>
                        </div>
                        <div className="form-check">
                            <input type="radio" id="height-min" name="height" value="min" checked={settings.height === 'min'} onChange={() => handleHeightChange('min')} disabled={disabled} className="form-check-input" />
                            <label htmlFor="height-min" className="form-check-label">{t('merge-images/setting/use_min_height')} ({sizes.minHeight}px)</label>
                        </div>
                        <div className="form-check">
                            <input type="radio" id="height-fixed" name="height" value="fixed" checked={typeof settings.height === 'number'} onChange={() => handleHeightChange(sizes.maxHeight)} disabled={disabled} className="form-check-input" />
                            <label htmlFor="height-fixed" className="form-check-label">{t('merge-images/setting/use_fixed_height')}</label>
                        </div>
                        {typeof settings.height === 'number' && (
<>

                            <div className="ms-4 mt-1">
                                <input type="number" className="form-control" placeholder={`${t('merge-images/placeholder/fixed_height')}`} value={settings.height || ''} onChange={handleFixedHeightInputChange} disabled={disabled} min="1" />
                            </div>
                        
</>
)}
                    </div>
                </div>
            
</>
)}

            {/* Margin */}
            <div className="mb-4">
                <label className="form-label mb-2">{t('merge-images/setting/margin')}</label>
                <input type="number" className="form-control" placeholder={`${t('merge-images/placeholder/margin')}`} value={settings.margin} onChange={handleMarginChange} disabled={disabled} min="0" />
                <small className="form-text text-muted">{t('merge-images/setting/margin_hint')}</small>
            </div>

            {/* Padding */}
            <div className="mb-4">
                <label className="form-label mb-2">{t('merge-images/setting/padding')}</label>
                <input type="number" className="form-control" placeholder={`${t('merge-images/placeholder/padding')}`} value={settings.padding} onChange={handlePaddingChange} disabled={disabled} min="0" />
                <small className="form-text text-muted">{t('merge-images/setting/padding_hint')}</small>
            </div>

            {/* Background Color */}
            <div className="mb-4">
                <label className="form-label mb-2">{t('merge-images/setting/background_color')}</label>
                <input type="color" className="form-control form-control-color" value={settings.bgColor} onChange={handleBgColorChange} disabled={disabled} />
                <small className="form-text text-muted">{t('merge-images/setting/background_color_hint')}</small>
            </div>
        </div>
    
</>
);
};

export default SettingsForm;
