import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

export const DEFAULT_ADJUST_SETTING = {
    grayscale: false,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    red: 0,
    green: 0,
    blue: 0,
};

const RangeSlider = ({ label, value, onChange, min = -100, max = 100, step = 1, unit = '' }) => {
    const labelText = unit ? `${label} (${unit})` : label;

    return (
<>

        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small text-secondary-emphasis mb-0">{labelText}</label>
                <span className="badge bg-light text-dark">{value > 0 ? '+' : ''}{value}{unit}</span>
            </div>
            <input type="range" className="form-range" min={min} max={max} step={step} value={value} onInput={(e) => onChange(parseInt((e.target as HTMLInputElement).value))} />
        </div>
    
</>
);
};

const AdjustSetting = ({ setting, onChange }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting]);

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting);
    };

    const handleReset = () => {
        handleSettingChange(DEFAULT_ADJUST_SETTING);
    };

    const hasChanges = Object.keys(DEFAULT_ADJUST_SETTING).some(
        key => formSetting[key] !== DEFAULT_ADJUST_SETTING[key]
    );

    return (
<>

        <div className="card-body">
            <div className="mb-3">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="grayscaleSwitch" checked={formSetting.grayscale} onChange={(e) => handleSettingChange({ grayscale: e.target.checked })} />
                    <label className="form-check-label" htmlFor="grayscaleSwitch">
                        {t('image-adjust/setting/grayscale')}
                    </label>
                </div>
            </div>

            <RangeSlider label={t('image-adjust/setting/brightness')} value={formSetting.brightness} onChange={(v) => handleSettingChange({ brightness: v })} />
            <RangeSlider label={t('image-adjust/setting/contrast')} value={formSetting.contrast} onChange={(v) => handleSettingChange({ contrast: v })} />
            <RangeSlider label={t('image-adjust/setting/saturation')} value={formSetting.saturation} onChange={(v) => handleSettingChange({ saturation: v })} />

            <hr className="my-3" />
            <p className="small text-secondary-emphasis mb-2">{t('image-adjust/input/settings')}</p>

            <RangeSlider label="R" value={formSetting.red} onChange={(v) => handleSettingChange({ red: v })} />
            <RangeSlider label="G" value={formSetting.green} onChange={(v) => handleSettingChange({ green: v })} />
            <RangeSlider label="B" value={formSetting.blue} onChange={(v) => handleSettingChange({ blue: v })} />

            {hasChanges && (
<>

                <div className="mt-3">
                    <button className="btn btn-outline-secondary btn-sm w-100" onClick={handleReset}>
                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                        {t('image-adjust/setting/reset')}
                    </button>
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default AdjustSetting;
