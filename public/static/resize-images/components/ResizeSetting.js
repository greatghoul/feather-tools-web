import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

// unit
const ResizeBy = {
    PERCENT: '%',
    PIXEL: 'px',
};

// file format
const Format = {
    PNG: 'png',
    JPG: 'jpg',
    WEBP: 'webp',
    ORIGINAL: 'original',
};

const DefaultHeightBy = {
    [ResizeBy.PERCENT]: 200,
    [ResizeBy.PIXEL]: 600,
}

// default resize setting
export const DEFAULT_RESIZE_SETTING = {
    resizeBy: ResizeBy.PERCENT,
    width: '',
    height: DefaultHeightBy[ResizeBy.PERCENT],
    format: Format.ORIGINAL,
};

const ResizeSetting = ({ setting, index, onChange, onRemove, canRemove }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting])

    const handleRemove = () => {
        onRemove(index);
    };

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting, index);
    };

    const ResizeByField = () => {
        const handleResizeByChange = (e) => {
            if (e.target.value === ResizeBy.PERCENT) {
                handleSettingChange({
                    resizeBy: ResizeBy.PERCENT,
                    height: DefaultHeightBy[ResizeBy.PERCENT] });
            } else if (e.target.value === ResizeBy.PIXEL) {
                handleSettingChange({
                    resizeBy: ResizeBy.PIXEL,
                    height: DefaultHeightBy[ResizeBy.PIXEL],
                    width: ''
                });
            }
        }

        return html`
            <div class="btn-group w-100" role="group">
                <input 
                    type="radio" 
                    class="btn-check" 
                    name="resizeBy${index}" 
                    id="resizeByPercent${index}" 
                    value="%" 
                    checked=${formSetting.resizeBy === ResizeBy.PERCENT}
                    onChange=${handleResizeByChange}
                />
                <label class="btn btn-outline-primary btn-sm" for="resizeByPercent${index}">${getText('resize-images/setting/by_percent')}</label>
                
                <input 
                    type="radio" 
                    class="btn-check" 
                    name="resizeBy${index}"
                    id="resizeByPixel${index}" 
                    value="px" 
                    checked=${formSetting.resizeBy === ResizeBy.PIXEL}
                    onChange=${handleResizeByChange}
                />
                <label class="btn btn-outline-primary btn-sm" for="resizeByPixel${index}">${getText('resize-images/setting/by_pixel')}</label>
            </div>
        `;
    }

    const ScaleField = () => {
        const scaleOptions = [
            { label: getText('resize-images/setting/scale_25_smaller'), value: 25 },
            { label: getText('resize-images/setting/scale_50_smaller'), value: 50 },
            { label: getText('resize-images/setting/scale_75_smaller'), value: 75 },
            { label: getText('resize-images/setting/scale_2x_larger'), value: 200 },
            { label: getText('resize-images/setting/scale_3x_larger'), value: 300 }
        ];

        const renderScaleOption = (opt) => html`
            <li>
                <a 
                    class="dropdown-item" 
                    href="#" 
                    onClick=${(e) => {
                        e.preventDefault();
                        handleSettingChange({ height: opt.value, width: '' });
                    }}
                >
                    ${opt.label}
                </a>
            </li>
        `;
        
        return html`
            <div class="row align-items-center justify-content-between">
                <div class="col-4">
                    <label for="height" class="text-secondary-emphasis">${getText('resize-images/setting/scale')}</label>   
                </div>
                <div class="col-8">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">%</span>
                        <input 
                            type="number" 
                            class="form-control"
                            value=${formSetting.height}
                            onChange=${(e) => handleSettingChange({ height: e.target.value })}
                            step="1"
                            min="1"
                        />
                        <button type="button" class="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            ${scaleOptions.map(renderScaleOption)}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    };

    const FileFormatField = () => {
        const fileFormatOptions = [
            { label: getText('resize-images/setting/format_png'), value: Format.PNG },
            { label: getText('resize-images/setting/format_jpg'), value: Format.JPG },
            { label: getText('resize-images/setting/format_webp'), value: Format.WEBP },
            { label: getText('resize-images/setting/format_original'), value: Format.ORIGINAL },
        ];

        return html`
            <div class="row align-items-center justify-content-between">
                <div class="col-4">
                    <label for="fileFormat" class="text-secondary-emphasis">${getText('resize-images/setting/format')}</label>
                </div>
                <div class="col-8">
                    <select 
                        id="fileFormat" 
                        class="form-select form-select-sm col-sm-8" 
                        value=${formSetting.format}
                        onChange=${(e) => handleSettingChange({ format: e.target.value })}
                    >
                        ${fileFormatOptions.map((opt) => html`
                            <option value=${opt.value}>${opt.label}</option>
                        `)}
                    </select>
                </div>
            </div>
        `;
    };

    const PixelField = ({ field, label }) => {
        return html`
            <div class="row align-items-center justify-content-between">
                <div class="col-4">
                    <label for="width" class="text-secondary-emphasis">${label}</label>
                </div>
                <div class="col-8">
                    <div class="input-group input-group-sm">
                        <input 
                            type="number" 
                            class="form-control"
                            value=${formSetting[field]}
                            onChange=${(e) => handleSettingChange({ [field]: parseInt(e.target.value) || '' })}
                            step="1"
                            min="1"
                        />
                        <button
                            class="btn btn-outline-secondary btn-sm ${formSetting[field] ? '' : 'active'}"
                            tabIndex="-1"
                            type="button"
                            onClick=${() => handleSettingChange({ [field]: '' })}
                        >${getText('resize-images/setting/auto')}</button>
                    </div>
                </div>
            </div>
        `;
    };

    return html`
        <div class="list-group-item py-3">                
            <div class="mb-3 d-flex justify-content-between align-items-center">
                <${ResizeByField} />
                <button
                    type="button"
                    class="btn btn-outline-danger btn-sm ms-2"
                    onClick=${handleRemove}
                    disabled=${!canRemove}
                >
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            ${formSetting.resizeBy === 'px' ? html`
                <div class="mb-3">
                    <${PixelField} field=${'width'} label=${getText('resize-images/setting/width')} />
                </div>
                <div class="mb-3">
                    <${PixelField} field=${'height'} label=${getText('resize-images/setting/height')} />
                </div>
            ` : html`
                <div class="mb-3">
                    <${ScaleField} />
                </div>
            `}
            <div>
                <${FileFormatField} />
            </div>
        </div>
    `;
};

export default ResizeSetting;
