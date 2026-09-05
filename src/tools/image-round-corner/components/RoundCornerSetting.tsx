import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

const CornerMode = {
    ALL: 'all',
    SEPARATE: 'separate',
};

const QuickValues = [0, 5, 10, 15, 20, 30, 50, 80, 100, 150];

export const DEFAULT_ROUND_CORNER_SETTING = {
    mode: CornerMode.ALL,
    allRadius: 20,
    topLeft: 20,
    topRight: 20,
    bottomRight: 20,
    bottomLeft: 20,
};

const RoundCornerSetting = ({ setting, onChange }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting])

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting);
    };

    const handleAllRadiusChange = (value) => {
        handleSettingChange({
            allRadius: value,
            topLeft: value,
            topRight: value,
            bottomRight: value,
            bottomLeft: value
        });
    };

    const CornerRadiusInput = ({ label, value, onChange }) => {
        const renderQuickOption = (val) => (
<>

            <a className="dropdown-item" href="#" onClick={(e) => {
                    e.preventDefault();
                    onChange(val);
                }}>
                {val === 0 ? '0' : `${val}px`}
            </a>
        
</>
);

        return (
<>

            <div className="row align-items-center mb-2">
                <div className="col-4">
                    <label className="text-secondary-emphasis text-nowrap small mb-0">{label}</label>
                </div>
                <div className="col-8">
                    <div className="input-group input-group-sm">
                        <input type="number" className="form-control" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} step="1" min="0" />
                        <span className="input-group-text">px</span>
                        <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                            <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            {QuickValues.map(renderQuickOption)}
                        </ul>
                    </div>
                </div>
            </div>
        
</>
);
    };

    return (
<>

        <div className="card-body">
            <div className="mb-4">
                <label className="form-label small text-secondary-emphasis">{t('image-round-corner/setting/mode')}</label>
                <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="cornerMode" id="modeAll" value="all" checked={formSetting.mode === CornerMode.ALL} onChange={() => handleSettingChange({ mode: CornerMode.ALL })} />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="modeAll">{t('image-round-corner/setting/mode_all')}</label>
                    
                    <input type="radio" className="btn-check" name="cornerMode" id="modeSeparate" value="separate" checked={formSetting.mode === CornerMode.SEPARATE} onChange={() => handleSettingChange({ mode: CornerMode.SEPARATE })} />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="modeSeparate">{t('image-round-corner/setting/mode_separate')}</label>
                </div>
            </div>

            {formSetting.mode === CornerMode.ALL ? (
<>

                <CornerRadiusInput label={t('image-round-corner/setting/corner_radius')} value={formSetting.allRadius} onChange={handleAllRadiusChange} />
            
</>
) : (
<>

                <div className="text-center mb-3">
                    <small className="text-secondary-emphasis">{t('image-round-corner/setting/four_corners')}</small>
                </div>
                <div className="row g-2">
                    <div className="col-6">
                        <CornerRadiusInput label={`↖ ${t('image-round-corner/setting/top_left')}`} value={formSetting.topLeft} onChange={(v) => handleSettingChange({ topLeft: v })} />
                    </div>
                    <div className="col-6">
                        <CornerRadiusInput label={`↗ ${t('image-round-corner/setting/top_right')}`} value={formSetting.topRight} onChange={(v) => handleSettingChange({ topRight: v })} />
                    </div>
                    <div className="col-6">
                        <CornerRadiusInput label={`↙ ${t('image-round-corner/setting/bottom_left')}`} value={formSetting.bottomLeft} onChange={(v) => handleSettingChange({ bottomLeft: v })} />
                    </div>
                    <div className="col-6">
                        <CornerRadiusInput label={`↘ ${t('image-round-corner/setting/bottom_right')}`} value={formSetting.bottomRight} onChange={(v) => handleSettingChange({ bottomRight: v })} />
                    </div>
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default RoundCornerSetting;
