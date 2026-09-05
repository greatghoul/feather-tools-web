import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import SequenceNumber from '@/services/SequenceNumber.js';
import { getText } from '~/helpers/utils.js';

const sequenceService = new SequenceNumber();

const getNumberTypes = () => {
    return {
        number: {
            value: 'number',
            label: getText('number-images/settings/number_type_number'),
            id: 'numberTypeNumber'
        },
        letter: {
            value: 'letter',
            label: getText('number-images/settings/number_type_letter'),
            id: 'numberTypeLetter'
        }
    };
};

const getPositionTypes = () => {
    return {
        'top-left': {
            value: 'top-left',
            label: '↖',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_top_left')
        },
        'top-center': {
            value: 'top-center',
            label: '↑',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_top_center')
        },
        'top-right': {
            value: 'top-right',
            label: '↗',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_top_right')
        },
        'middle-left': {
            value: 'middle-left',
            label: '←',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_middle_left')
        },
        'middle-center': {
            value: 'middle-center',
            label: '●',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_middle_center')
        },
        'middle-right': {
            value: 'middle-right',
            label: '→',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_middle_right')
        },
        'bottom-left': {
            value: 'bottom-left',
            label: '↙',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_bottom_left')
        },
        'bottom-center': {
            value: 'bottom-center',
            label: '↓',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_bottom_center')
        },
        'bottom-right': {
            value: 'bottom-right',
            label: '↘',
            title: getText('number-images/settings/position') + ' - ' + getText('number-images/settings/position_bottom_right')
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
    const renderRadioOption = (type) => html`
        <div class="form-check">
            <input 
                class="form-check-input" 
                type="radio" 
                name="numberType" 
                id=${type.id}
                value=${type.value}
                checked=${formSettings.numberType === type.value}
                onChange=${(e) => updateSetting('numberType', e.target.value)}
            />
            <label class="form-check-label" for=${type.id}>
                ${type.label}
            </label>
        </div>
    `;

    // Render position radio button (3x3 grid)
    const renderPositionOption = (position) => html`
        <div class="col-4 p-1">
            <input 
                class="btn-check" 
                type="radio" 
                name="position" 
                id="position-${position.value}"
                value=${position.value}
                checked=${formSettings.position === position.value}
                onChange=${(e) => updateSetting('position', e.target.value)}
            />
            <label 
                class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center" 
                for="position-${position.value}"
                title=${position.title}
                style="height: 40px; font-size: 18px;"
            >
                ${position.label}
            </label>
        </div>
    `;

    return html`
        <!-- Number type -->
        <div class="mb-3">
            <label class="form-label">${getText('number-images/settings/number_type')}</label>
            ${Object.values(getNumberTypes()).map(renderRadioOption)}
        </div>
        
        <!-- Number start -->
        <div class="mb-3">
            <label class="form-label">${getText('number-images/settings/number_start')}</label>
            <div class="row">
                <div class="col-6">
                    <input 
                        type="number"
                        class="form-control"
                        min="1"
                        value=${formSettings.numberStart}
                        onChange=${handleNumberStartChange}
                    />
                </div>
                <div class="col-6">
                    ${formSettings.numberType === 'letter' ? 
                        html`<div class="form-control-plaintext">
                            ${sequenceService.numberToLetter(formSettings.numberStart)}
                        </div>` : 
                        ''
                    }
                </div>
            </div>
            <div class="form-text">
                <small class="text-muted">${getText('number-images/settings/number_start_hint')}</small>
            </div>
        </div>

        <!-- Position settings -->
        <div class="mb-3">
            <label class="form-label">${getText('number-images/settings/position')}</label>
            <div class="row g-1">
                ${Object.values(getPositionTypes()).map(renderPositionOption)}
            </div>
        </div>

        <!-- Circle color settings -->
        <div class="row mb-3">
            <div class="col-6">
                <label class="form-label">${getText('number-images/settings/circle_border')}</label>
                <input 
                    type="color"
                    class="form-control form-control-color form-control-sm"
                    value=${formSettings.borderColor}
                    onChange=${(e) => updateSetting('borderColor', e.target.value)}
                />
            </div>
            <div class="col-6">
                <label class="form-label">${getText('number-images/settings/circle_background')}</label>
                <input 
                    type="color"
                    class="form-control form-control-color form-control-sm"
                    value=${formSettings.backgroundColor}
                    onChange=${(e) => updateSetting('backgroundColor', e.target.value)}
                />
            </div>
        </div>

        <!-- Font settings -->
        <div class="row mb-3">
            <div class="col-6">
                <label class="form-label">${getText('number-images/settings/font_color')}</label>
                <input 
                    type="color"
                    class="form-control form-control-color form-control-sm"
                    value=${formSettings.fontColor}
                    onChange=${(e) => updateSetting('fontColor', e.target.value)}
                />
            </div>
            <div class="col-6">
                <label class="form-label">${getText('number-images/settings/font_size')}</label>
                <input 
                    type="number"
                    class="form-control"
                    min="8"
                    max="60"
                    value=${formSettings.fontSize}
                    onChange=${handleFontSizeChange}
                />
                <div class="form-text">
                    <small class="text-muted">${getText('number-images/settings/font_size_hint')}</small>
                </div>
            </div>
        </div>
    `;
};

export default SettingForm;
