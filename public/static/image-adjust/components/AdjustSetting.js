import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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

    return html`
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label small text-secondary-emphasis mb-0">${labelText}</label>
                <span class="badge bg-light text-dark">${value > 0 ? '+' : ''}${value}${unit}</span>
            </div>
            <input
                type="range"
                class="form-range"
                min=${min}
                max=${max}
                step=${step}
                value=${value}
                onInput=${(e) => onChange(parseInt(e.target.value))}
            />
        </div>
    `;
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

    return html`
        <div class="card-body">
            <div class="mb-3">
                <div class="form-check form-switch">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="grayscaleSwitch"
                        checked=${formSetting.grayscale}
                        onChange=${(e) => handleSettingChange({ grayscale: e.target.checked })}
                    />
                    <label class="form-check-label" for="grayscaleSwitch">
                        ${getText('image-adjust/setting/grayscale')}
                    </label>
                </div>
            </div>

            <${RangeSlider}
                label=${getText('image-adjust/setting/brightness')}
                value=${formSetting.brightness}
                onChange=${(v) => handleSettingChange({ brightness: v })}
            />
            <${RangeSlider}
                label=${getText('image-adjust/setting/contrast')}
                value=${formSetting.contrast}
                onChange=${(v) => handleSettingChange({ contrast: v })}
            />
            <${RangeSlider}
                label=${getText('image-adjust/setting/saturation')}
                value=${formSetting.saturation}
                onChange=${(v) => handleSettingChange({ saturation: v })}
            />

            <hr class="my-3" />
            <p class="small text-secondary-emphasis mb-2">${getText('image-adjust/input/settings')}</p>

            <${RangeSlider}
                label="R"
                value=${formSetting.red}
                onChange=${(v) => handleSettingChange({ red: v })}
            />
            <${RangeSlider}
                label="G"
                value=${formSetting.green}
                onChange=${(v) => handleSettingChange({ green: v })}
            />
            <${RangeSlider}
                label="B"
                value=${formSetting.blue}
                onChange=${(v) => handleSettingChange({ blue: v })}
            />

            ${hasChanges && html`
                <div class="mt-3">
                    <button
                        class="btn btn-outline-secondary btn-sm w-100"
                        onClick=${handleReset}
                    >
                        <i class="bi bi-arrow-counterclockwise me-1"></i>
                        ${getText('image-adjust/setting/reset')}
                    </button>
                </div>
            `}
        </div>
    `;
};

export default AdjustSetting;
