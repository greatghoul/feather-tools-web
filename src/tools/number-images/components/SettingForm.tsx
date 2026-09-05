import { useState, useEffect, Fragment } from 'react';
import SequenceNumber from '../services/SequenceNumber';
import { t } from '~/helpers/i18n';

const sequenceService = new SequenceNumber();

const getNumberTypes = () => {
    return {
        number: {
            value: 'number',
            label: t('number-images/settings/number_type_number'),
            id: 'numberTypeNumber'
        },
        letter: {
            value: 'letter',
            label: t('number-images/settings/number_type_letter'),
            id: 'numberTypeLetter'
        }
    };
};

const getPositionTypes = () => {
    return {
        'top-left': {
            value: 'top-left',
            label: '↖',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_top_left')
        },
        'top-center': {
            value: 'top-center',
            label: '↑',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_top_center')
        },
        'top-right': {
            value: 'top-right',
            label: '↗',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_top_right')
        },
        'middle-left': {
            value: 'middle-left',
            label: '←',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_middle_left')
        },
        'middle-center': {
            value: 'middle-center',
            label: '●',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_middle_center')
        },
        'middle-right': {
            value: 'middle-right',
            label: '→',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_middle_right')
        },
        'bottom-left': {
            value: 'bottom-left',
            label: '↙',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_bottom_left')
        },
        'bottom-center': {
            value: 'bottom-center',
            label: '↓',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_bottom_center')
        },
        'bottom-right': {
            value: 'bottom-right',
            label: '↘',
            title: t('number-images/settings/position') + ' - ' + t('number-images/settings/position_bottom_right')
        }
    };
};

// Default settings
export const DEFAULT_SETTINGS = {
    numberType: 'number', // 'number' | 'letter'
    numberStart: 1,
    position: 'bottom-right', // 'top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'
    borderColor: '#e71414',
    backgroundColor: '#f9d20f',
    fontColor: '#e71414',
    fontSize: 16
};

// SettingForm 组件
const SettingForm = ({ settings, onChange }) => {
    const [formSettings, setFormSettings] = useState(settings);

    useEffect(() => {
        setFormSettings(settings);
    }, [settings]);

    const updateSetting = (key, value) => {
        const newSettings = { ...formSettings, [key]: value };
        setFormSettings(newSettings);
        onChange && onChange(newSettings);
    };

    const handleFontSizeChange = (e) => {
        const inputValue = e.target.value;
        let fontSize = parseInt(inputValue);
        
        // Validate input: must be integer between 8-60
        if (isNaN(fontSize) || fontSize < 8 || fontSize > 60) {
            fontSize = DEFAULT_SETTINGS.fontSize; // Fallback to default value
        }
        
        updateSetting('fontSize', fontSize);
    };
    
    const handleNumberStartChange = (e) => {
        const inputValue = e.target.value;
        let numberStart = parseInt(inputValue);
        
        // Validate input: must be integer > 0
        if (isNaN(numberStart) || numberStart < 1) {
            numberStart = DEFAULT_SETTINGS.numberStart;
        }
        
        updateSetting('numberStart', numberStart);
    };

    // Render radio button
    const renderRadioOption = (type) => (
<>

        <div className="form-check">
            <input className="form-check-input" type="radio" name="numberType" id={type.id} value={type.value} checked={formSettings.numberType === type.value} onChange={(e) => updateSetting('numberType', e.target.value)} />
            <label className="form-check-label" htmlFor={type.id}>
                {type.label}
            </label>
        </div>
    
</>
);

    // Render position radio button (3x3 grid)
    const renderPositionOption = (position) => (
<>

        <div className="col-4 p-1">
            <input className="btn-check" type="radio" name="position" id={`position-${position.value}`} value={position.value} checked={formSettings.position === position.value} onChange={(e) => updateSetting('position', e.target.value)} />
            <label className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center" htmlFor={`position-${position.value}`} title={position.title} style={{ height: '40px', fontSize: '18px' }}>
                {position.label}
            </label>
        </div>
    
</>
);

    return (
<>

        {/* Number type */}
        <div className="mb-3">
            <label className="form-label">{t('number-images/settings/number_type')}</label>
            {Object.values(getNumberTypes()).map((type, i) => <Fragment key={i}>{renderRadioOption(type)}</Fragment>)}
        </div>
        
        {/* Number start */}
        <div className="mb-3">
            <label className="form-label">{t('number-images/settings/number_start')}</label>
            <div className="row">
                <div className="col-6">
                    <input type="number" className="form-control" min="1" value={formSettings.numberStart} onChange={handleNumberStartChange} />
                </div>
                <div className="col-6">
                    {formSettings.numberType === 'letter' ? 
                        (
<>
<div className="form-control-plaintext">
                            {sequenceService.numberToLetter(formSettings.numberStart)}
                        </div>
</>
) : 
                        ''
                    }
                </div>
            </div>
            <div className="form-text">
                <small className="text-muted">{t('number-images/settings/number_start_hint')}</small>
            </div>
        </div>

        {/* Position settings */}
        <div className="mb-3">
            <label className="form-label">{t('number-images/settings/position')}</label>
            <div className="row g-1">
                {Object.values(getPositionTypes()).map((position, i) => <Fragment key={i}>{renderPositionOption(position)}</Fragment>)}
            </div>
        </div>

        {/* Circle color settings */}
        <div className="row mb-3">
            <div className="col-6">
                <label className="form-label">{t('number-images/settings/circle_border')}</label>
                <input type="color" className="form-control form-control-color form-control-sm" value={formSettings.borderColor} onChange={(e) => updateSetting('borderColor', e.target.value)} />
            </div>
            <div className="col-6">
                <label className="form-label">{t('number-images/settings/circle_background')}</label>
                <input type="color" className="form-control form-control-color form-control-sm" value={formSettings.backgroundColor} onChange={(e) => updateSetting('backgroundColor', e.target.value)} />
            </div>
        </div>

        {/* Font settings */}
        <div className="row mb-3">
            <div className="col-6">
                <label className="form-label">{t('number-images/settings/font_color')}</label>
                <input type="color" className="form-control form-control-color form-control-sm" value={formSettings.fontColor} onChange={(e) => updateSetting('fontColor', e.target.value)} />
            </div>
            <div className="col-6">
                <label className="form-label">{t('number-images/settings/font_size')}</label>
                <input type="number" className="form-control" min="8" max="60" value={formSettings.fontSize} onChange={handleFontSizeChange} />
                <div className="form-text">
                    <small className="text-muted">{t('number-images/settings/font_size_hint')}</small>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingForm;
