import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

export const DEFAULT_SETTINGS = {
    watermarkType: 'text',
    text: 'Watermark',
    fontSize: 48,
    fontColor: '#FFFFFF',
    opacity: 0.7,
    position: 'bottom_right',
    watermarkImage: null,
    watermarkScale: 0.2,
    watermarkRotation: 0
};

const SettingForm = ({ settings, onChange, disabled }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [watermarkImagePreview, setWatermarkImagePreview] = useState<any>(null);

    const handleChange = (key, value) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onChange(newSettings);
    };

    const handleWatermarkImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target!.result;
                setWatermarkImagePreview(dataUrl);
                handleChange('watermarkImage', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const positions = [
        { value: 'top_left', label: t('image-watermark/settings/position_top_left') },
        { value: 'top_center', label: t('image-watermark/settings/position_top_center') },
        { value: 'top_right', label: t('image-watermark/settings/position_top_right') },
        { value: 'middle_left', label: t('image-watermark/settings/position_middle_left') },
        { value: 'middle_center', label: t('image-watermark/settings/position_middle_center') },
        { value: 'middle_right', label: t('image-watermark/settings/position_middle_right') },
        { value: 'bottom_left', label: t('image-watermark/settings/position_bottom_left') },
        { value: 'bottom_center', label: t('image-watermark/settings/position_bottom_center') },
        { value: 'bottom_right', label: t('image-watermark/settings/position_bottom_right') }
    ];

    return (
<>

        <div>
            <div className="mb-3">
                <label className="form-label">{t('image-watermark/settings/watermark_type')}</label>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="watermarkType" id="textWatermark" value="text" checked={localSettings.watermarkType === 'text'} onChange={(e) => handleChange('watermarkType', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    <label className="form-check-label" htmlFor="textWatermark">
                        {t('image-watermark/settings/type_text')}
                    </label>
                </div>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="watermarkType" id="imageWatermark" value="image" checked={localSettings.watermarkType === 'image'} onChange={(e) => handleChange('watermarkType', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    <label className="form-check-label" htmlFor="imageWatermark">
                        {t('image-watermark/settings/type_image')}
                    </label>
                </div>
            </div>

            {localSettings.watermarkType === 'text' ? (
<>

                <div className="mb-3">
                    <label className="form-label">{t('image-watermark/settings/text_content')}</label>
                    <input type="text" className="form-control" value={localSettings.text} onInput={(e) => handleChange('text', (e.target as HTMLInputElement).value)} placeholder={t('image-watermark/settings/text_placeholder')} disabled={disabled} />
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">{t('image-watermark/settings/font_size')}</label>
                        <input type="number" className="form-control" min="8" max="200" value={localSettings.fontSize} onInput={(e) => handleChange('fontSize', parseInt((e.target as HTMLInputElement).value) || 48)} disabled={disabled} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">{t('image-watermark/settings/font_color')}</label>
                        <input type="color" className="form-control form-control-color" value={localSettings.fontColor} onInput={(e) => handleChange('fontColor', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    </div>
                </div>
            
</>
) : (
<>

                <div className="mb-3">
                    <label className="form-label">{t('image-watermark/settings/watermark_image')}</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleWatermarkImageChange} disabled={disabled} />
                    {watermarkImagePreview ? (
<>

                        <div className="mt-2">
                            <img src={watermarkImagePreview} className="img-fluid rounded border" style={{ maxHeight: '100px' }} alt="Watermark preview" />
                        </div>
                    
</>
) : ''}
                </div>
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">
                            {t('image-watermark/settings/watermark_scale')}
                            <small className="text-muted d-block">{t('image-watermark/settings/watermark_scale_hint')}</small>
                        </label>
                        <span className="badge bg-light text-dark">{Math.round(localSettings.watermarkScale * 100)}%</span>
                    </div>
                    <input type="range" className="form-range" min="0.05" max="0.5" step="0.05" value={localSettings.watermarkScale} onInput={(e) => handleChange('watermarkScale', parseFloat((e.target as HTMLInputElement).value))} disabled={disabled} />
                </div>
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">
                            {t('image-watermark/settings/watermark_rotation')}
                            <small className="text-muted d-block">{t('image-watermark/settings/watermark_rotation_hint')}</small>
                        </label>
                        <span className="badge bg-light text-dark">{localSettings.watermarkRotation}°</span>
                    </div>
                    <input type="range" className="form-range" min="0" max="360" step="1" value={localSettings.watermarkRotation} onInput={(e) => handleChange('watermarkRotation', parseInt((e.target as HTMLInputElement).value))} disabled={disabled} />
                </div>
            
</>
)}

            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">{t('image-watermark/settings/opacity')}</label>
                    <span className="badge bg-light text-dark">{Math.round(localSettings.opacity * 100)}%</span>
                </div>
                <input type="range" className="form-range" min="0.1" max="1" step="0.1" value={localSettings.opacity} onInput={(e) => handleChange('opacity', parseFloat((e.target as HTMLInputElement).value))} disabled={disabled} />
            </div>

            <div className="mb-3">
                <label className="form-label">{t('image-watermark/settings/position')}</label>
                <select className="form-select" value={localSettings.position} onChange={(e) => handleChange('position', (e.target as HTMLSelectElement).value)} disabled={disabled}>
                    {positions.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
))}
                </select>
            </div>
        </div>
    
</>
);
};

export default SettingForm;
