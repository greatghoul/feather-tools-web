import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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
    const [watermarkImagePreview, setWatermarkImagePreview] = useState(null);

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
                const dataUrl = event.target.result;
                setWatermarkImagePreview(dataUrl);
                handleChange('watermarkImage', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const positions = [
        { value: 'top_left', label: getText('image-watermark/settings/position_top_left') },
        { value: 'top_center', label: getText('image-watermark/settings/position_top_center') },
        { value: 'top_right', label: getText('image-watermark/settings/position_top_right') },
        { value: 'middle_left', label: getText('image-watermark/settings/position_middle_left') },
        { value: 'middle_center', label: getText('image-watermark/settings/position_middle_center') },
        { value: 'middle_right', label: getText('image-watermark/settings/position_middle_right') },
        { value: 'bottom_left', label: getText('image-watermark/settings/position_bottom_left') },
        { value: 'bottom_center', label: getText('image-watermark/settings/position_bottom_center') },
        { value: 'bottom_right', label: getText('image-watermark/settings/position_bottom_right') }
    ];

    return html`
        <div>
            <div class="mb-3">
                <label class="form-label">${getText('image-watermark/settings/watermark_type')}</label>
                <div class="form-check mb-2">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="watermarkType"
                        id="textWatermark"
                        value="text"
                        checked=${localSettings.watermarkType === 'text'}
                        onChange=${(e) => handleChange('watermarkType', e.target.value)}
                        disabled=${disabled}
                    />
                    <label class="form-check-label" for="textWatermark">
                        ${getText('image-watermark/settings/type_text')}
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="watermarkType"
                        id="imageWatermark"
                        value="image"
                        checked=${localSettings.watermarkType === 'image'}
                        onChange=${(e) => handleChange('watermarkType', e.target.value)}
                        disabled=${disabled}
                    />
                    <label class="form-check-label" for="imageWatermark">
                        ${getText('image-watermark/settings/type_image')}
                    </label>
                </div>
            </div>

            ${localSettings.watermarkType === 'text' ? html`
                <div class="mb-3">
                    <label class="form-label">${getText('image-watermark/settings/text_content')}</label>
                    <input
                        type="text"
                        class="form-control"
                        value=${localSettings.text}
                        onInput=${(e) => handleChange('text', e.target.value)}
                        placeholder=${getText('image-watermark/settings/text_placeholder')}
                        disabled=${disabled}
                    />
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">${getText('image-watermark/settings/font_size')}</label>
                        <input
                            type="number"
                            class="form-control"
                            min="8"
                            max="200"
                            value=${localSettings.fontSize}
                            onInput=${(e) => handleChange('fontSize', parseInt(e.target.value) || 48)}
                            disabled=${disabled}
                        />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">${getText('image-watermark/settings/font_color')}</label>
                        <input
                            type="color"
                            class="form-control form-control-color"
                            value=${localSettings.fontColor}
                            onInput=${(e) => handleChange('fontColor', e.target.value)}
                            disabled=${disabled}
                        />
                    </div>
                </div>
            ` : html`
                <div class="mb-3">
                    <label class="form-label">${getText('image-watermark/settings/watermark_image')}</label>
                    <input
                        type="file"
                        class="form-control"
                        accept="image/*"
                        onChange=${handleWatermarkImageChange}
                        disabled=${disabled}
                    />
                    ${watermarkImagePreview ? html`
                        <div class="mt-2">
                            <img 
                                src=${watermarkImagePreview} 
                                class="img-fluid rounded border" 
                                style="max-height: 100px;"
                                alt="Watermark preview"
                            />
                        </div>
                    ` : ''}
                </div>
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label mb-0">
                            ${getText('image-watermark/settings/watermark_scale')}
                            <small class="text-muted d-block">${getText('image-watermark/settings/watermark_scale_hint')}</small>
                        </label>
                        <span class="badge bg-light text-dark">${Math.round(localSettings.watermarkScale * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        class="form-range"
                        min="0.05"
                        max="0.5"
                        step="0.05"
                        value=${localSettings.watermarkScale}
                        onInput=${(e) => handleChange('watermarkScale', parseFloat(e.target.value))}
                        disabled=${disabled}
                    />
                </div>
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label mb-0">
                            ${getText('image-watermark/settings/watermark_rotation')}
                            <small class="text-muted d-block">${getText('image-watermark/settings/watermark_rotation_hint')}</small>
                        </label>
                        <span class="badge bg-light text-dark">${localSettings.watermarkRotation}°</span>
                    </div>
                    <input
                        type="range"
                        class="form-range"
                        min="0"
                        max="360"
                        step="1"
                        value=${localSettings.watermarkRotation}
                        onInput=${(e) => handleChange('watermarkRotation', parseInt(e.target.value))}
                        disabled=${disabled}
                    />
                </div>
            `}

            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0">${getText('image-watermark/settings/opacity')}</label>
                    <span class="badge bg-light text-dark">${Math.round(localSettings.opacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    class="form-range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value=${localSettings.opacity}
                    onInput=${(e) => handleChange('opacity', parseFloat(e.target.value))}
                    disabled=${disabled}
                />
            </div>

            <div class="mb-3">
                <label class="form-label">${getText('image-watermark/settings/position')}</label>
                <select
                    class="form-select"
                    value=${localSettings.position}
                    onChange=${(e) => handleChange('position', e.target.value)}
                    disabled=${disabled}
                >
                    ${positions.map(pos => html`
                        <option value=${pos.value}>${pos.label}</option>
                    `)}
                </select>
            </div>
        </div>
    `;
};

export default SettingForm;