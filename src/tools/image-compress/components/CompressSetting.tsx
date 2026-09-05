import type { CompressSetting } from '../types';
import { t } from '~/helpers/i18n';

interface CompressSettingProps {
    setting: CompressSetting;
    onChange: (setting: CompressSetting) => void;
}

const CompressSettingCard = ({ setting, onChange }: CompressSettingProps) => {
    const handleChange = (changes: Partial<CompressSetting>) => {
        onChange({ ...setting, ...changes });
    };

    return (
        <div className="card-body">
            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-compress/setting/quality')}: {setting.quality}%
                </label>
                <input
                    type="range"
                    className="form-range"
                    min={1}
                    max={100}
                    step={1}
                    value={setting.quality}
                    onChange={(e) => handleChange({ quality: parseInt(e.target.value) })}
                />
                <div className="d-flex justify-content-between">
                    <small className="text-muted">1%</small>
                    <small className="text-muted">100%</small>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-compress/setting/output_format')}
                </label>
                <select
                    className="form-select"
                    value={setting.outputFormat}
                    onChange={(e) => handleChange({ outputFormat: e.target.value })}
                >
                    <option value="original">{t('image-compress/setting/format_original')}</option>
                    <option value="jpeg">{t('image-compress/setting/format_jpeg')}</option>
                    <option value="png">{t('image-compress/setting/format_png')}</option>
                    <option value="webp">{t('image-compress/setting/format_webp')}</option>
                </select>
            </div>
        </div>
    );
};

export default CompressSettingCard;
