import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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
        return html`
            <button type="button" class="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                ${QuickValues.map(val => html`
                    <a 
                        class="dropdown-item" 
                        href="#" 
                        onClick=${(e) => {
                            e.preventDefault();
                            onChange(val);
                        }}
                    >
                        ${val === 0 ? '0' : `${val}px`}
                    </a>
                `)}
            </ul>
        `;
    };

    const shadowAlpha = getAlpha(formSetting.shadowColor);
    const shadowHex = rgbaToHex(formSetting.shadowColor);

    return html`
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">${getText('image-shadow/setting/offset')}</label>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">X</span>
                            <input 
                                type="number" 
                                class="form-control"
                                value=${formSetting.offsetX}
                                onChange=${(e) => handleSettingChange({ offsetX: parseInt(e.target.value) || 0 })}
                                step="1"
                                min="-100"
                                max="100"
                            />
                            <span class="input-group-text">px</span>
                            ${renderQuickOptions(formSetting.offsetX, (v) => handleSettingChange({ offsetX: v }))}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">Y</span>
                            <input 
                                type="number" 
                                class="form-control"
                                value=${formSetting.offsetY}
                                onChange=${(e) => handleSettingChange({ offsetY: parseInt(e.target.value) || 0 })}
                                step="1"
                                min="-100"
                                max="100"
                            />
                            <span class="input-group-text">px</span>
                            ${renderQuickOptions(formSetting.offsetY, (v) => handleSettingChange({ offsetY: v }))}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">${getText('image-shadow/setting/blur_radius')}</label>
                <div class="input-group input-group-sm">
                    <input 
                        type="number" 
                        class="form-control"
                        value=${formSetting.blurRadius}
                        onChange=${(e) => handleSettingChange({ blurRadius: parseInt(e.target.value) || 0 })}
                        step="1"
                        min="0"
                        max="100"
                    />
                    <span class="input-group-text">px</span>
                    ${renderQuickOptions(formSetting.blurRadius, (v) => handleSettingChange({ blurRadius: v }))}
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">${getText('image-shadow/setting/spread_radius')}</label>
                <div class="input-group input-group-sm">
                    <input 
                        type="number" 
                        class="form-control"
                        value=${formSetting.spreadRadius}
                        onChange=${(e) => handleSettingChange({ spreadRadius: parseInt(e.target.value) || 0 })}
                        step="1"
                        min="-50"
                        max="50"
                    />
                    <span class="input-group-text">px</span>
                    ${renderQuickOptions(Math.abs(formSetting.spreadRadius), (v) => handleSettingChange({ spreadRadius: v }))}
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">${getText('image-shadow/setting/shadow_color')}</label>
                <div class="input-group input-group-sm">
                    <input 
                        type="color" 
                        class="form-control form-control-color"
                        value=${shadowHex}
                        style="width: 50px;"
                        onChange=${(e) => {
                            const rgb = hexToRgb(e.target.value);
                            handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowAlpha})` });
                        }}
                    />
                    <input 
                        type="number" 
                        class="form-control"
                        value=${Math.round(shadowAlpha * 100)}
                        onChange=${(e) => {
                            const rgb = hexToRgb(shadowHex);
                            handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${e.target.value / 100})` });
                        }}
                        step="1"
                        min="0"
                        max="100"
                    />
                    <span class="input-group-text">%</span>
                    <button type="button" class="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        ${[0, 25, 50, 75, 100].map(val => html`
                            <a 
                                class="dropdown-item" 
                                href="#" 
                                onClick=${(e) => {
                                    e.preventDefault();
                                    const rgb = hexToRgb(shadowHex);
                                    handleSettingChange({ shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${val / 100})` });
                                }}
                            >
                                ${val}%
                            </a>
                        `)}
                    </ul>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">${getText('image-shadow/setting/padding')}</label>
                <div class="input-group input-group-sm">
                    <input 
                        type="number" 
                        class="form-control"
                        value=${formSetting.padding}
                        onChange=${(e) => handleSettingChange({ padding: parseInt(e.target.value) || 0 })}
                        step="1"
                        min="0"
                        max="100"
                    />
                    <span class="input-group-text">px</span>
                    ${renderQuickOptions(formSetting.padding, (v) => handleSettingChange({ padding: v }))}
                </div>
            </div>
        </div>
    `;
};

export default ShadowSetting;
