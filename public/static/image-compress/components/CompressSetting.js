import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

export const DEFAULT_COMPRESS_SETTING = {
    quality: 80,
    outputFormat: 'original',
};

const CompressSetting = ({ setting, onChange }) => {
    const handleChange = (changes) => {
        onChange({ ...setting, ...changes });
    };

    return html`
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-compress/setting/quality')}: ${setting.quality}%
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
            </div>

            <div class="mb-3">
                <label class="form-label small text-secondary-emphasis">
                    ${getText('image-compress/setting/output_format')}
                </label>
                <select
                    class="form-select"
                    value=${setting.outputFormat}
                    onChange=${(e) => handleChange({ outputFormat: e.target.value })}
                >
                    <option value="original">${getText('image-compress/setting/format_original')}</option>
                    <option value="jpeg">${getText('image-compress/setting/format_jpeg')}</option>
                    <option value="png">${getText('image-compress/setting/format_png')}</option>
                    <option value="webp">${getText('image-compress/setting/format_webp')}</option>
                </select>
            </div>
        </div>
    `;
};

export default CompressSetting;
