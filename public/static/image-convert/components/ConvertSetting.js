import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import ColorPicker from '~/components/ColorPicker.js';

export const DEFAULT_CONVERT_SETTING = {
    outputFormat: 'png',
    quality: 90,
    backgroundColor: '#ffffff',
};

const FORMATS = [
    { value: 'jpeg', key: 'image-convert/setting/format_jpeg' },
    { value: 'png', key: 'image-convert/setting/format_png' },
    { value: 'webp', key: 'image-convert/setting/format_webp' },
    { value: 'gif', key: 'image-convert/setting/format_gif' },
    { value: 'bmp', key: 'image-convert/setting/format_bmp' },
];

const BG_COLOR_PRESETS = [
    { value: 'white', hex: '#ffffff', label: 'White' },
    { value: 'black', hex: '#000000', label: 'Black' },
    { value: 'gray', hex: '#808080', label: 'Gray' },
    { value: 'red', hex: '#ff0000', label: 'Red' },
    { value: 'blue', hex: '#0000ff', label: 'Blue' },
    { value: 'green', hex: '#00ff00', label: 'Green' },
];

const ConvertSetting = ({ setting, onChange }) => {
    const handleChange = (changes) => {
        onChange({ ...setting, ...changes });
    };

    const showQuality = setting.outputFormat === 'jpeg' || setting.outputFormat === 'webp';
    const showBgColor = setting.outputFormat === 'jpeg' || setting.outputFormat === 'bmp';

    return html`
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-convert/setting/output_format')}
                </label>
                <select
                    class="form-select"
                    value=${setting.outputFormat}
                    onChange=${(e) => handleChange({ outputFormat: e.target.value })}
                >
                    ${FORMATS.map(f => html`
                        <option value=${f.value}>${getText(f.key)}</option>
                    `)}
                </select>
            </div>

            ${showQuality && html`
                <div class="mb-3">
                    <label class="form-label small text-secondary-emphasis">
                        ${getText('image-convert/setting/quality')}: ${setting.quality}%
                    </label>
                    <input
                        type="range"
                        class="form-range"
                        min="1"
                        max="100"
                        step="1"
                        value=${setting.quality}
                        onInput=${(e) => handleChange({ quality: parseInt(e.target.value) })}
                    />
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">1%</small>
                        <small class="text-muted">100%</small>
                    </div>
                    <small class="text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        ${getText('image-convert/setting/quality_hint')}
                    </small>
                </div>
            `}

            ${showBgColor && html`
                <div class="mb-3">
                    <label class="form-label small text-secondary-emphasis">
                        ${getText('image-convert/setting/background_color')}
                    </label>
                    <${ColorPicker}
                        value=${setting.backgroundColor}
                        onChange=${(color) => handleChange({ backgroundColor: color })}
                        presets=${BG_COLOR_PRESETS}
                    />
                    <small class="text-muted mt-1 d-block">
                        <i class="bi bi-info-circle me-1"></i>
                        ${getText('image-convert/setting/background_color_hint')}
                    </small>
                </div>
            `}
        </div>
    `;
};

export default ConvertSetting;