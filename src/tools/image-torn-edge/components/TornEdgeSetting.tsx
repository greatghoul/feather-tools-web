import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

export const DEFAULT_TORN_SETTING = {
    intensity: 5,
    roughness: 5,
    edges: 'all',
    shadowEnabled: true,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowTransparency: 0.3,
    shadowBlur: 8,
};

const EDGE_OPTIONS = [
    { value: 'all', key: 'image-torn-edge/setting/edge_all', icon: 'square' },
    { value: 'top', key: 'image-torn-edge/setting/edge_top', icon: 'arrow-up' },
    { value: 'bottom', key: 'image-torn-edge/setting/edge_bottom', icon: 'arrow-down' },
    { value: 'left', key: 'image-torn-edge/setting/edge_left', icon: 'arrow-left' },
    { value: 'right', key: 'image-torn-edge/setting/edge_right', icon: 'arrow-right' },
];

const TornEdgeSetting = ({ setting, onChange }) => {
    const [formSetting, setFormSetting] = useState(setting);

    useEffect(() => {
        setFormSetting(setting);
    }, [setting])

    const handleSettingChange = (changes) => {
        const newFormSetting = { ...formSetting, ...changes };
        setFormSetting(newFormSetting);
        onChange(newFormSetting);
    };

    const getEdgeLabel = (edge) => {
        if (edge.key) return t(edge.key);
        return edge.label;
    };

    return (
<>

        <div className="card-body">
            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-torn-edge/setting/intensity')}
                </label>
                <div className="d-flex align-items-center gap-2">
                    <input type="range" className="form-range flex-grow-1" value={formSetting.intensity} min="1" max="10" step="1" onChange={(e) => handleSettingChange({ intensity: parseInt(e.target.value) })} />
                    <span className="badge bg-secondary" style={{ minWidth: '28px' }}>{formSetting.intensity}</span>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-torn-edge/setting/roughness')}
                </label>
                <div className="d-flex align-items-center gap-2">
                    <input type="range" className="form-range flex-grow-1" value={formSetting.roughness} min="1" max="10" step="1" onChange={(e) => handleSettingChange({ roughness: parseInt(e.target.value) })} />
                    <span className="badge bg-secondary" style={{ minWidth: '28px' }}>{formSetting.roughness}</span>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label small text-secondary-emphasis">
                    {t('image-torn-edge/setting/edges')}
                </label>
                <div>
                    <div className="btn-group btn-group-sm d-flex flex-wrap" role="group">
                        {EDGE_OPTIONS.map(edge => (
<>

                            <button type="button" className={`btn btn-outline-secondary ${formSetting.edges === edge.value ? 'active' : ''}`} onClick={() => handleSettingChange({ edges: edge.value })}>
                                {edge.icon ? (
<>
<i className={`bi bi-${edge.icon} me-1`}></i>
</>
) : ''}
                                {getEdgeLabel(edge)}
                            </button>
                        
</>
))}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="shadowEnabled" checked={formSetting.shadowEnabled} onChange={(e) => handleSettingChange({ shadowEnabled: e.target.checked })} />
                    <label className="form-check-label" htmlFor="shadowEnabled">
                        {t('image-torn-edge/setting/shadow_enabled')}
                    </label>
                </div>
            </div>

            {formSetting.shadowEnabled && (
<>

                <div className="mb-3">
                    <label className="form-label small text-secondary-emphasis">
                        {t('image-torn-edge/setting/shadow_offset')}
                    </label>
                    <div className="row g-2">
                        <div className="col-6">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text">X</span>
                                <input type="number" className="form-control" value={formSetting.shadowOffsetX} onChange={(e) => handleSettingChange({ shadowOffsetX: parseInt(e.target.value) || 0 })} step="1" min="-50" max="50" />
                                <span className="input-group-text">px</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text">Y</span>
                                <input type="number" className="form-control" value={formSetting.shadowOffsetY} onChange={(e) => handleSettingChange({ shadowOffsetY: parseInt(e.target.value) || 0 })} step="1" min="-50" max="50" />
                                <span className="input-group-text">px</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label small text-secondary-emphasis">
                        {t('image-torn-edge/setting/shadow_transparency')}
                    </label>
                    <div className="d-flex align-items-center gap-2">
                        <input type="range" className="form-range flex-grow-1" value={Math.round(formSetting.shadowTransparency * 100)} min="0" max="100" step="1" onChange={(e) => handleSettingChange({ shadowTransparency: parseInt(e.target.value) / 100 })} />
                        <span className="badge bg-secondary" style={{ minWidth: '40px' }}>{Math.round(formSetting.shadowTransparency * 100)}%</span>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label small text-secondary-emphasis">
                        {t('image-torn-edge/setting/shadow_blur')}
                    </label>
                    <div className="input-group input-group-sm">
                        <input type="number" className="form-control" value={formSetting.shadowBlur} onChange={(e) => handleSettingChange({ shadowBlur: parseInt(e.target.value) || 0 })} step="1" min="0" max="50" />
                        <span className="input-group-text">px</span>
                    </div>
                </div>
            
</>
)}
        </div>
    
</>
);
};

export default TornEdgeSetting;
