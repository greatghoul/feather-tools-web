import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

export const DEFAULT_SETTINGS = {
    splitMode: 'grid',
    rows: 2,
    columns: 2
};

const SettingForm = ({ settings, onChange, disabled }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (key, value) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onChange(newSettings);
    };

    return html`
        <div>
            <div class="mb-3">
                <label class="form-label">${getText('image-split/settings/split_mode')}</label>
                <div class="form-check mb-2">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="splitMode"
                        id="gridSplit"
                        value="grid"
                        checked=${localSettings.splitMode === 'grid'}
                        onChange=${(e) => handleChange('splitMode', e.target.value)}
                        disabled=${disabled}
                    />
                    <label class="form-check-label" for="gridSplit">
                        ${getText('image-split/settings/grid_split')}
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="splitMode"
                        id="verticalSplit"
                        value="vertical"
                        checked=${localSettings.splitMode === 'vertical'}
                        onChange=${(e) => handleChange('splitMode', e.target.value)}
                        disabled=${disabled}
                    />
                    <label class="form-check-label" for="verticalSplit">
                        ${getText('image-split/settings/vertical_split')}
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="splitMode"
                        id="horizontalSplit"
                        value="horizontal"
                        checked=${localSettings.splitMode === 'horizontal'}
                        onChange=${(e) => handleChange('splitMode', e.target.value)}
                        disabled=${disabled}
                    />
                    <label class="form-check-label" for="horizontalSplit">
                        ${getText('image-split/settings/horizontal_split')}
                    </label>
                </div>
            </div>

            ${localSettings.splitMode === 'grid' || localSettings.splitMode === 'horizontal' ? html`
                <div class="mb-3">
                    <label class="form-label">${getText('image-split/settings/rows')}</label>
                    <input
                        type="number"
                        class="form-control"
                        min="2"
                        max="20"
                        value=${localSettings.rows}
                        onInput=${(e) => handleChange('rows', Math.max(2, parseInt(e.target.value) || 2))}
                        disabled=${disabled}
                    />
                </div>
            ` : ''}

            ${localSettings.splitMode === 'grid' || localSettings.splitMode === 'vertical' ? html`
                <div class="mb-3">
                    <label class="form-label">${getText('image-split/settings/columns')}</label>
                    <input
                        type="number"
                        class="form-control"
                        min="2"
                        max="20"
                        value=${localSettings.columns}
                        onInput=${(e) => handleChange('columns', Math.max(2, parseInt(e.target.value) || 2))}
                        disabled=${disabled}
                    />
                </div>
            ` : ''}
        </div>
    `;
};

export default SettingForm;