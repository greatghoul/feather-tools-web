import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

const QuickValues = [0, 2, 5, 10, 14, 20, 28, 30, 50];

export const DEFAULT_SHADOW_SETTING = {
    offsetX: 12,
    offsetY: 12,
    blurRadius: 30,
    spreadRadius: 0,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    padding: 0,
};

const rgbaToHex = (rgba) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
};

const hexToRgb = (hex) => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
    };
};

const getAlpha = (rgba) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    return match && match[4] ? parseFloat(match[4]) : 1;
};

const ShadowSetting = ({ setting, onChange }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting])

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting);
    };

    const renderQuickOptions = (currentValue, onChange) => {
        return (
<>

            <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
                {QuickValues.map((val, i) => (
                    <a key={i} className="dropdown-item" href="#" onClick={(e) => {
                            e.preventDefault();
                            onChange(val);
                        }}>
                        {val === 0 ? '0' : `${val}px`}
                    </a>
))}
            </ul>
        
</>
);
    };

    const shadowAlpha = getAlpha(formSetting.shadowColor);
    const shadowHex = rgbaToHex(formSetting.shadowColor);

    return (
<>

        <div className="card-body">
            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">{t('image-shadow/setting/offset')}</label>
                <div className="row g-2">
                    <div className="col-6">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text">X</span>
                            <input type="number" className="form-control" value={formSetting.offsetX} onChange={(e) => handleSettingChange({ offsetX: parseInt(e.target.value) || 0 })} step="1" min="-100" max="100" />
                            <span className="input-group-text">px</span>
                            {renderQuickOptions(formSetting.offsetX, (v) => handleSettingChange({ offsetX: v }))}
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text">Y</span>
                            <input type="number" className="form-control" value={formSetting.offsetY} onChange={(e) => handleSettingChange({ offsetY: parseInt(e.target.value) || 0 })} step="1" min="-100" max="100" />
                            <span className="input-group-text">px</span>
                            {renderQuickOptions(formSetting.offsetY, (v) => handleSettingChange({ offsetY: v }))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">{t('image-shadow/setting/blur_radius')}</label>
                <div className="input-group input-group-sm">
                    <input type="number" className="form-control" value={formSetting.blurRadius} onChange={(e) => handleSettingChange({ blurRadius: parseInt(e.target.value) || 0 })} step="1" min="0" max="100" />
                    <span className="input-group-text">px</span>
                    {renderQuickOptions(formSetting.blurRadius, (v) => handleSettingChange({ blurRadius: v }))}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">{t('image-shadow/setting/spread_radius')}</label>
                <div className="input-group input-group-sm">
                    <input type="number" className="form-control" value={formSetting.spreadRadius} onChange={(e) => handleSettingChange({ spreadRadius: parseInt(e.target.value) || 0 })} step="1" min="-50" max="50" />
                    <span className="input-group-text">px</span>
                    {renderQuickOptions(Math.abs(formSetting.spreadRadius), (v) => handleSettingChange({ spreadRadius: v }))}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">{t('image-shadow/setting/shadow_color')}</label>
                <div className="input-group input-group-sm">
                    <input type="color" className="form-control form-control-color" value={shadowHex} style={{ width: '50px' }} onChange={(e) => {
                            const rgb = hexToRgb(e.target.value);
                            handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowAlpha})` });
                        }} />
                    <input type="number" className="form-control" value={Math.round(shadowAlpha * 100)} onChange={(e) => {
                            const rgb = hexToRgb(shadowHex);
                            handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(e.target.value) / 100})` });
                        }} step="1" min="0" max="100" />
                    <span className="input-group-text">%</span>
                    <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span className="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        {[0, 25, 50, 75, 100].map((val, i) => (
                            <a key={i} className="dropdown-item" href="#" onClick={(e) => {
                                    e.preventDefault();
                                    const rgb = hexToRgb(shadowHex);
                                    handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${val / 100})` });
                                }}>
                                {val}%
                            </a>
))}
                    </ul>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">{t('image-shadow/setting/padding')}</label>
                <div className="input-group input-group-sm">
                    <input type="number" className="form-control" value={formSetting.padding} onChange={(e) => handleSettingChange({ padding: parseInt(e.target.value) || 0 })} step="1" min="0" max="100" />
                    <span className="input-group-text">px</span>
                    {renderQuickOptions(formSetting.padding, (v) => handleSettingChange({ padding: v }))}
                </div>
            </div>
        </div>
    
</>
);
};

export default ShadowSetting;
