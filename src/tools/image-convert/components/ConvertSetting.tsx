import { t } from '~/helpers/i18n';
import ColorPicker from '~/components/ColorPicker';

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

    return (
<>

        <div className="card-body">
            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-convert/setting/output_format')}
                </label>
                <select className="form-select" value={setting.outputFormat} onChange={(e) => handleChange({ outputFormat: (e.target as HTMLSelectElement).value })}>
                    {FORMATS.map(f => (
<>

                        <option value={f.value}>{t(f.key)}</option>
                    
</>
))}
                </select>
            </div>

            {showQuality && (
<>

                <div className="mb-3">
                    <label className="form-label small text-secondary-emphasis">
                        {t('image-convert/setting/quality')}: {setting.quality}%
                    </label>
                    <input type="range" className="form-range" min="1" max="100" step="1" value={setting.quality} onInput={(e) => handleChange({ quality: parseInt((e.target as HTMLInputElement).value) })} />
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">1%</small>
                        <small className="text-muted">100%</small>
                    </div>
                    <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        {t('image-convert/setting/quality_hint')}
                    </small>
                </div>
            
</>
)}

            {showBgColor && (
<>

                <div className="mb-3">
                    <label className="form-label small text-secondary-emphasis">
                        {t('image-convert/setting/background_color')}
                    </label>
                    <ColorPicker value={setting.backgroundColor} onChange={(color) => handleChange({ backgroundColor: color })} presets={BG_COLOR_PRESETS as any} />
                    <small className="text-muted mt-1 d-block">
                        <i className="bi bi-info-circle me-1"></i>
                        {t('image-convert/setting/background_color_hint')}
                    </small>
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default ConvertSetting;
