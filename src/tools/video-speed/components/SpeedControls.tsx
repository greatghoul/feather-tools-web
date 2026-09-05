import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

const SPEED_PRESETS = [
    { value: 0.25, labelKey: 'video-speed/speed/0_25' },
    { value: 0.5, labelKey: 'video-speed/speed/0_5' },
    { value: 0.75, labelKey: 'video-speed/speed/0_75' },
    { value: 1, labelKey: 'video-speed/speed/1' },
    { value: 1.5, labelKey: 'video-speed/speed/1_5' },
    { value: 2, labelKey: 'video-speed/speed/2' },
    { value: 3, labelKey: 'video-speed/speed/3' },
    { value: 4, labelKey: 'video-speed/speed/4' },
];

const SpeedControls = ({ speed, preservePitch, onSpeedChange, onPreservePitchChange, disabled }) => {
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');

    useEffect(() => {
        const isPreset = SPEED_PRESETS.some((p) => p.value === speed);
        if (!isPreset) {
            setIsCustom(true);
            setCustomValue(String(speed));
        } else {
            setIsCustom(false);
            setCustomValue('');
        }
    }, [speed]);

    const handlePresetClick = (value) => {
        setIsCustom(false);
        setCustomValue('');
        onSpeedChange(value);
    };

    const handleCustomFocus = () => {
        setIsCustom(true);
        if (!customValue) {
            setCustomValue(String(speed));
        }
    };

    const handleCustomChange = (e) => {
        setCustomValue(e.target.value);
    };

    const handleCustomBlur = () => {
        const value = parseFloat(customValue);
        if (isNaN(value) || value < 0.25 || value > 4) {
            setCustomValue(String(speed));
            return;
        }
        const rounded = Math.round(value * 100) / 100;
        onSpeedChange(rounded);
        setCustomValue(String(rounded));
    };

    const handleCustomKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
<>

        <div className="speed-controls">
            <label className="form-label fw-bold mb-2">{t('video-speed/settings/speed')}</label>
            <div className="d-flex flex-wrap gap-1 mb-3">
                {SPEED_PRESETS.map((preset) => (
                    <button key={preset.value} type="button" className={`btn btn-sm ${!isCustom && speed === preset.value ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handlePresetClick(preset.value)} disabled={disabled}>
                        {t(preset.labelKey)}
                    </button>
                ))}
            </div>
            <div className="d-flex align-items-center gap-2 mb-3">
                <label className="form-label small text-muted mb-0 text-nowrap">
                    {t('video-speed/settings/custom')}:
                </label>
                <input type="number" className="form-control form-control-sm" style={{ maxWidth: '100px' }} min="0.25" max="4" step="0.05" value={isCustom ? customValue : ''} placeholder={String(speed)} onInput={handleCustomChange} onFocus={handleCustomFocus} onBlur={handleCustomBlur} onKeyDown={handleCustomKeyDown} disabled={disabled} />
                <small className="text-muted">{t('video-speed/settings/custom_hint')}</small>
            </div>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="preserve-pitch" checked={preservePitch} onChange={(e) => onPreservePitchChange(e.target.checked)} disabled={disabled} />
                <label className="form-check-label" htmlFor="preserve-pitch">
                    {t('video-speed/settings/preserve_pitch')}
                </label>
            </div>
            <small className="text-muted d-block mt-1">{t('video-speed/settings/preserve_pitch_hint')}</small>
        </div>
    
</>
);
};

export default SpeedControls;
