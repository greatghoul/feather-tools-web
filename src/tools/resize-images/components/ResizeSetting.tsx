import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

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

        return (
<>

            <div className="btn-group w-100" role="group">
                <input type="radio" className="btn-check" name={`resizeBy${index}`} id={`resizeByPercent${index}`} value="%" checked={formSetting.resizeBy === ResizeBy.PERCENT} onChange={handleResizeByChange} />
                <label className="btn btn-outline-primary btn-sm" htmlFor={`resizeByPercent${index}`}>{t('resize-images/setting/by_percent')}</label>
                
                <input type="radio" className="btn-check" name={`resizeBy${index}`} id={`resizeByPixel${index}`} value="px" checked={formSetting.resizeBy === ResizeBy.PIXEL} onChange={handleResizeByChange} />
                <label className="btn btn-outline-primary btn-sm" htmlFor={`resizeByPixel${index}`}>{t('resize-images/setting/by_pixel')}</label>
            </div>
        
</>
);
    }

    const ScaleField = () => {
        const scaleOptions = [
            { label: t('resize-images/setting/scale_25_smaller'), value: 25 },
            { label: t('resize-images/setting/scale_50_smaller'), value: 50 },
            { label: t('resize-images/setting/scale_75_smaller'), value: 75 },
            { label: t('resize-images/setting/scale_2x_larger'), value: 200 },
            { label: t('resize-images/setting/scale_3x_larger'), value: 300 }
        ];

        const renderScaleOption = (opt) => (
            <li key={opt.value}>
                <a className="dropdown-item" href="#" onClick={(e) => {
                        e.preventDefault();
                        handleSettingChange({ height: opt.value, width: '' });
                    }}>
                    {opt.label}
                </a>
            </li>
);
        
        return (
<>

            <div className="row align-items-center justify-content-between">
                <div className="col-4">
                    <label htmlFor="height" className="text-secondary-emphasis">{t('resize-images/setting/scale')}</label>   
                </div>
                <div className="col-8">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">%</span>
                        <input type="number" className="form-control" value={formSetting.height} onChange={(e) => handleSettingChange({ height: e.target.value })} step="1" min="1" />
                        <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                            <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            {scaleOptions.map(renderScaleOption)}
                        </ul>
                    </div>
                </div>
            </div>
        
</>
);
    };

    const FileFormatField = () => {
        const fileFormatOptions = [
            { label: t('resize-images/setting/format_png'), value: Format.PNG },
            { label: t('resize-images/setting/format_jpg'), value: Format.JPG },
            { label: t('resize-images/setting/format_webp'), value: Format.WEBP },
            { label: t('resize-images/setting/format_original'), value: Format.ORIGINAL },
        ];

        return (
<>

            <div className="row align-items-center justify-content-between">
                <div className="col-4">
                    <label htmlFor="fileFormat" className="text-secondary-emphasis">{t('resize-images/setting/format')}</label>
                </div>
                <div className="col-8">
                    <select id="fileFormat" className="form-select form-select-sm col-sm-8" value={formSetting.format} onChange={(e) => handleSettingChange({ format: e.target.value })}>
                        {fileFormatOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
                    </select>
                </div>
            </div>
        
</>
);
    };

    const PixelField = ({ field, label }) => {
        return (
<>

            <div className="row align-items-center justify-content-between">
                <div className="col-4">
                    <label htmlFor="width" className="text-secondary-emphasis">{label}</label>
                </div>
                <div className="col-8">
                    <div className="input-group input-group-sm">
                        <input type="number" className="form-control" value={formSetting[field]} onChange={(e) => handleSettingChange({ [field]: parseInt(e.target.value) || '' })} step="1" min="1" />
                        <button className={`btn btn-outline-secondary btn-sm ${formSetting[field] ? '' : 'active'}`} tabIndex={-1} type="button" onClick={() => handleSettingChange({ [field]: '' })}>{t('resize-images/setting/auto')}</button>
                    </div>
                </div>
            </div>
        
</>
);
    };

    return (
<>

        <div className="list-group-item py-3">                
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <ResizeByField />
                <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={handleRemove} disabled={!canRemove}>
                    <i className="bi bi-trash"></i>
                </button>
            </div>
            {formSetting.resizeBy === 'px' ? (
<>

                <div className="mb-3">
                    <PixelField field={'width'} label={t('resize-images/setting/width')} />
                </div>
                <div className="mb-3">
                    <PixelField field={'height'} label={t('resize-images/setting/height')} />
                </div>
            
</>
) : (
<>

                <div className="mb-3">
                    <ScaleField />
                </div>
            
</>
)}
            <div>
                <FileFormatField />
            </div>
        </div>
    
</>
);
};

export default ResizeSetting;
