import { useState } from 'react';
import { t } from '~/helpers/i18n';

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

    return (
<>

        <div>
            <div className="mb-3">
                <label className="form-label">{t('image-split/settings/split_mode')}</label>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="splitMode" id="gridSplit" value="grid" checked={localSettings.splitMode === 'grid'} onChange={(e) => handleChange('splitMode', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    <label className="form-check-label" htmlFor="gridSplit">
                        {t('image-split/settings/grid_split')}
                    </label>
                </div>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="splitMode" id="verticalSplit" value="vertical" checked={localSettings.splitMode === 'vertical'} onChange={(e) => handleChange('splitMode', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    <label className="form-check-label" htmlFor="verticalSplit">
                        {t('image-split/settings/vertical_split')}
                    </label>
                </div>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="splitMode" id="horizontalSplit" value="horizontal" checked={localSettings.splitMode === 'horizontal'} onChange={(e) => handleChange('splitMode', (e.target as HTMLInputElement).value)} disabled={disabled} />
                    <label className="form-check-label" htmlFor="horizontalSplit">
                        {t('image-split/settings/horizontal_split')}
                    </label>
                </div>
            </div>

            {localSettings.splitMode === 'grid' || localSettings.splitMode === 'horizontal' ? (
<>

                <div className="mb-3">
                    <label className="form-label">{t('image-split/settings/rows')}</label>
                    <input type="number" className="form-control" min="2" max="20" value={localSettings.rows} onInput={(e) => handleChange('rows', Math.max(2, parseInt((e.target as HTMLInputElement).value) || 2))} disabled={disabled} />
                </div>
            
</>
) : ''}

            {localSettings.splitMode === 'grid' || localSettings.splitMode === 'vertical' ? (
<>

                <div className="mb-3">
                    <label className="form-label">{t('image-split/settings/columns')}</label>
                    <input type="number" className="form-control" min="2" max="20" value={localSettings.columns} onInput={(e) => handleChange('columns', Math.max(2, parseInt((e.target as HTMLInputElement).value) || 2))} disabled={disabled} />
                </div>
            
</>
) : ''}
        </div>
    
</>
);
};

export default SettingForm;
